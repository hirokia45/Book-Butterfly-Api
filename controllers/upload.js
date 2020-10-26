const upload = require("../services/imageUpload");
const { validationResult } = require('express-validator');
const Note = require('../models/note');
const { note } = require("../app");

const singleUpload = upload.single("file")

exports.uploadImage = (req, res, next) => {
  const noteId = req.params.noteId;

  singleUpload(req, res, (err) => {
    if (err) {
      return res.json({
        success: false,
        errors: {
          title: "Image Upload Error",
          detail: err.message,
          error: err
        },
      });
    }

    let update = req.file.location
    console.log('location', update);
    console.log('log', req.file);
    Note.findById(noteId)
      .then((note) => {
        if (!note) {
          const error = new Error('Could not find note.')
          error.statusCode = 404
          throw error
        }

        note.photo = update
        return note.save()
      })
      .then((result) => {
        res.status(200).json({ message: 'Note updated!', note: result })
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500
        }
        next(err)
      })


  })
}
