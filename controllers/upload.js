const upload = require("../services/imageUpload");
const aws = require('aws-sdk')
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
};

exports.deleteImage = async (req, res, next) => {
  const noteId = req.params.noteId;

  try {
    const note = await Note.findById(noteId);
    if (!note) {
      const error = new Error('Could not find note.');
      error.statusCode = 404;
      throw error;
    }
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
        console.log(err)
      } else {
        return
      }
    })

    const result = await note.save();
    res.status(200).json({ message: 'Image Deleted.', note: result });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
