const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const aws = require('aws-sdk');
const Note = require('./note');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    }
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 6,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("Password cannot contain 'password'");
      }
    }
  },
  avatar: {
    type: String,
    required: false
  },
  favoriteBook: {
    type: String,
    required: false,
    trim: true
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }]
}, {
  timestamps: true
});

userSchema.virtual('notes', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
}

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error('A user with this email could not be found...');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error('Wrong password!');
    error.statusCode = 401;
    throw error;
  }

  return user;
}

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

  user.tokens = user.tokens.concat({ token })
  await user.save();

  return token
}

userSchema.pre('save', async function (next) {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  next()
})

userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    const error = new Error('The email is already taken!')
    error.statusCode = 409
    throw error
  }

  next()
})

userSchema.pre('remove', async function (next) {
  const user = this

  const notes = await Note.find({ owner: user._id })

  for (note of notes) {
    Note.findOneAndDelete({ _id: note._id })
      .then(deletedNote => {
        if (deletedNote.photo) {
          const photoUrl = deletedNote.photo
          const photoKey = /[^/]*$/.exec(photoUrl)[0]
          deletedNote.photo = null

          const s3 = new aws.S3()

          aws.config.update({
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_ACCESS_SECRET,
            region: process.env.REGION,
          })

          let params = {
            Bucket: process.env.BUCKET_NAME,
            Key: photoKey,
          }

          s3.deleteObject(params, (err, data) => {
            if (err) {
              console.log("Error: " + err);
            } else {
              console.log('Successfully deleted the item');
            }
            console.log(data);
          })
        }
      })
  }

  next()
})

const User = mongoose.model('User', userSchema);

module.exports = User
