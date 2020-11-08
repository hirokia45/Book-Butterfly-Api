const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
const sharp = require('sharp')

const s3 = new aws.S3()

aws.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_ACCESS_SECRET,
  region: process.env.REGION,
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false)
  }
}

const avatarUpload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: process.env.BUCKET_NAME_AVATAR,
    metadata: function (req, file, cb) {
      cb(null, { fileName: file.originalname })
    },
    limits: { fileSize: 1000000 },
    shouldTransForm: function (req, file, cb) {
      cb(null, /^image/i.test(file.mimetype))
    },
    transforms: [
      {
        id: 'original',
        key: function (req, file, cb) {
          cb(null, Date.now() + file.originalname)
        },
        transform: function (req, file, cb) {
          cb(null, sharp(), resize(250, 250).png())
        }
      },
    ],
  }),
})

module.exports = avatarUpload
