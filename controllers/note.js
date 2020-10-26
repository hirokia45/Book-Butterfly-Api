let inspect = require('util').inspect;
let Busboy = require('busboy');

const { validationResult } = require('express-validator');
const { request } = require('../app');
const Note = require('../models/note');

exports.getNotes = async (req, res, next) => {
  try {
    const notes = await Note.find()
    res.status(200).json({
      message: 'Fetched notes successfully',
      notes: notes,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getNote = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findById(noteId)
    if (!note) {
      const error = new Error('COuld not find note...');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: 'Note fetched.', note: note });
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
    owner: 'Hiroki',
    photo: null
  })

  try {
    await note.save()
    res.status(201).json({
      message: 'Note created successfully!',
      note: note,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.updateNote = (req, res, next) => {
  const noteId = req.params.noteId;
  let busboy = new Busboy({ headers: req.headers });

  let fields = {};

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    file.on('data', function(data) {
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });
    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
    });
  });

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val))
    fields[fieldname] = val;
  });

  busboy.on('finish', function () {
    const errors = validationResult(req)
    const updates = Object.keys(fields)
    const allowedUpdates = ["_id", "title", "author", "category", "pageFrom", "pageTo", "comment"]
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!errors.isEmpty() || !isValidOperation) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }

    Note.findById(noteId)
    .then(note => {
      if (!note) {
        const error = new Error('Could not find post.')
        error.statusCode = 404
        throw error
      }
      updates.forEach((update) => (note[update] = fields[update]))
      return note.save()
    })
    .then(result => {
      return res.status(200).json({
        message: 'Note updated!',
        note: result,
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    });

  });

  req.pipe(busboy);
}

exports.deleteNote = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findById(noteId)
    if (!note) {
      const error = new Error('Could not find note.');
      error.statusCode = 404;
      throw error;
    }
    await Note.findByIdAndRemove(noteId);

    res.status(200).json({ message: 'Deleted note.' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
