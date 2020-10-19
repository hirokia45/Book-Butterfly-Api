
const { validationResult } = require('express-validator');
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

// app.get('/posts', (request, response) => {
//   response.set('Access-Control-Allow-Origin', '*')

//   let posts = []
//   db.collection('posts')
//     .orderBy('date', 'desc')
//     .get()
//     .then((snapshot) => {
//       snapshot.forEach((doc) => {
//         posts.push(doc.data())
//       })
//       response.send(posts)
//     })
// })
exports.createNote = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }

  const note = new Note({
    ...req.body,
    owner: 'Hiroki'
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
