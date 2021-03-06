const { validationResult } = require('express-validator');
const aws = require('aws-sdk');
const Note = require('../models/note');
const Notification = require('../models/notification');
//const letters = require('../services/letters');

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
    const totalNotes = await Note.find({ owner: req.user._id }).countDocuments();
    const totalPages = Math.floor(totalNotes / perPage) + 1
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
      totalNotes,
      totalPages,
    })
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

  const letterTemplate = req.letter
  if (letterTemplate) {
    const letter = new Notification({
      ...letterTemplate,
      owner: req.user._id
    })
    var congratsLetter = await letter.save()
  }

  try {
    const result = await note.save()
    const noteModified = {
      ...result._doc, owner: req.user.name,
    }
    res.status(201).json({
      message: 'Note created successfully!',
      note: noteModified,
      congratsLetter
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

  const updates = Object.keys(req.body)
  const allowedUpdates = ["title", "author", "category", "pageFrom", "pageTo", "chapter", "comment"]
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
  if (!isValidOperation) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    next(error)
  }

  try {
    const note = await Note.findOne({ _id, owner: req.user._id})

    if (!note) {
      const error = new Error('Could not find post.')
      error.statusCode = 404
      throw error
    }

    updates.forEach((update) => (note[update] = req.body[update]))
    const result = await note.save()

    const noteModified = {
      ...result._doc, owner: req.user.name,
    }
    res.status(200).json({
      message: 'Note updated!',
      note: noteModified,
    })
  } catch (err) {
    console.log(err);
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

exports.getCalendarInfo = async (req, res, next) => {
  const currentPage = req.query.page || 1
  const perPage = req.query.per_page
  const sort = {}

  // Sort req.query.sortBy === /notes?sortBy=createdAt:desc
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    const totalNotes = await Note.find({ owner: req.user._id }).countDocuments()
    await req.user
      .populate({
        path: 'notes',
        options: {
          skip: (currentPage - 1) * perPage,
          limit: perPage,
          sort,
        },
      })
      .execPopulate()

    const info = req.user.notes.map((note) => ({
      _id: note._doc._id,
      title: note._doc.title,
      pageFrom: note._doc.pageFrom,
      pageTo: note._doc.pageTo,
      createdAt: note._doc.createdAt
    }))

    res.status(200).json({
      message: 'Fetched notes successfully',
      info,
      totalNotes
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
