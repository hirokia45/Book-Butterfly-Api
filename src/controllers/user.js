const { validationResult } = require('express-validator')

const Note = require('../models/note');
const User = require('../models/user');
const Book = require('../models/book');

exports.getOwnProfile = async (req, res) => {
  res
    .status(200)
    .json({
      message: 'Successfully fetched your profile!',
      user: req.user
    });
}

exports.updateProfile = async (req, res, next) => {
  console.log(req.body);
  const errors = validationResult(req)
  const updates = Object.keys(req.body)
  const allowedUpdates = [
    'name',
    'email',
    'password',
    'favoriteBook'
  ]
  const updatingFields = updates.filter((field) =>
    allowedUpdates.includes(field)
  )
  const isValidOperation = updatingFields.every((update) =>
    allowedUpdates.includes(update)
  )

  if (!isValidOperation || !errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.')
    error.statusCode = 422
    throw error
  }
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })

    updatingFields.forEach((update) => req.user[update] = req.body[update])
    await req.user.save()

    const token = await req.user.generateAuthToken()
    res.status(200).json({
      message: 'User profile updated!',
      token,
      user: req.user
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.deleteProfile = async (req, res, next) => {
  try {
    await req.user.remove();
    res.status(200).json({ message: 'Profile deleted.', user: req.user })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.countTotalItems = async (req, res, next) => {
  try {
    const totalNotes = await Note.find({ owner: req.user._id }).countDocuments();

    const totalBooksCompleted = await Book.find({ completed: true, owner: req.user._id }).countDocuments();

    res.status(200).json({
      message: 'Counted items successfully',
      totalNotes,
      totalBooksCompleted
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
