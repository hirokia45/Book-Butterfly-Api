const aws = require('aws-sdk');
const { validationResult } = require('express-validator');
const Note = require('../models/note');
const { note } = require("../app");


exports.uploadImage = async (req, res, next) => {
  const _id = req.params.noteId;

  // Think about this later...
  // singleUpload(req, res, (err) => {
    // if (err) {
    //   return res.json({
    //     success: false,
    //     errors: {
    //       title: "Image Upload Error",
    //       detail: err.message,
    //       error: err
    //     },
    //   });
    // }

  let update = req.file.location
  try {
    const note = await Note.findOne({ _id, owner: req.user._id })

    if (!note) {
      const error = new Error('Could not find note.')
      error.statusCode = 404
      throw error
    }

    note.photo = update;

    const result = await note.save();

    const modifiedResult = {
      ...result._doc, owner: req.user.name,
    }
    res.status(200).json({ message: 'Note updated!', note: modifiedResult })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
};

exports.deleteImage = async (req, res, next) => {
  const _id = req.params.noteId;

  try {
    const note = await Note.findOne({ _id, owner: req.user._id });
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
        console.log("Error: " + err);
      } else {
        console.log('Successfully deleted the image')
      }
    })

    const result = await note.save();

    const modifiedResult = {
      ...result._doc, owner: req.user.name,
    }
    res.status(200).json({ message: 'Image Deleted.', note: modifiedResult });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
