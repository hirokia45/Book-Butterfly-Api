const { validationResult } = require('express-validator');
const { request } = require('../app');
const aws = require('aws-sdk')
const Note = require('../models/note');

exports.getNotes = async (req, res, next) => {
  const currentPage = req.query.page || 1
  const perPage = req.query.per_page
  const sort = {}

  // Sort req.query.sortBy === /notes?sortBy=createdAt:desc
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    const totalItems = await Note.find({ owner: req.user._id }).countDocuments();
    const totalPages = Math.floor(totalItems / perPage) + 1
    await req.user.populate({
      path: 'notes',
      options: {
        skip: (currentPage - 1) * perPage,
        limit: perPage,
        sort
      }
    }).execPopulate()

    const notes = req.user.notes.map(note => ({
      ...note._doc,
      owner: req.user.name,
    }))

    res.status(200).json({
      message: 'Fetched notes successfully',
      notes,
      totalItems,
      totalPages
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getNote = async (req, res, next) => {
  const _id = req.params.noteId;

  try {
    // const note = await Note.findById(noteId)
    const noteFound = await Note.findOne({
      _id,
      owner: req.user._id
    })
    if (!noteFound) {
      const error = new Error('Could not find note...');
      error.statusCode = 404;
      throw error;
    }

    const note = {
      ...noteFound._doc, owner: req.user.name
    }

    res.status(200).json({ message: 'Note fetched.', note });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.createNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const note = new Note({
    ...req.body,
    owner: req.user._id,
    photo: null
  })

  try {
    const result = await note.save()
    const noteModified = {
      ...result._doc, owner: req.user.name,
    }
    console.log(noteModified);
    res.status(201).json({
      message: 'Note created successfully!',
      note: noteModified,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.updateNote = async (req, res, next) => {
  const _id = req.params.noteId;

  const errors = validationResult(req)
  const updates = Object.keys(req.body)
  const allowedUpdates = ["title", "author", "category", "pageFrom", "pageTo", "comment"]
  const updatingFields = updates.filter((field) => allowedUpdates.includes(field));
  const isValidOperation = updatingFields.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  try {
    const note = await Note.findOne({ _id, owner: req.user._id})

    if (!note) {
      const error = new Error('Could not find post.')
      error.statusCode = 404
      throw error
    }

    updatingFields.forEach((update) => (note[update] = req.body[update]))
    const result = await note.save()

    const noteModified = {
      ...result._doc, owner: req.user.name,
    }
    res.status(200).json({
      message: 'Note updated!',
      note: noteModified,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.deleteNote = async (req, res, next) => {
  const _id = req.params.noteId;

  try {
    const note = await Note.findOneAndDelete({ _id, owner: req.user._id })

    if (!note) {
      const error = new Error('Could not find note.');
      error.statusCode = 404;
      throw error;
    }

    if (note.photo) {
      const photoUrl = note.photo
      const photoKey = /[^/]*$/.exec(photoUrl)[0]
      note.photo = null

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
          console.log('Successfully deleted the image');
        }
        console.log(data);
      })
    }

    res.status(200).json({ message: 'Deleted note.'});
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
