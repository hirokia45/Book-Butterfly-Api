const { validationResult } = require('express-validator')

const User = require('../models/user')

exports.getOwnProfile = async (req, res) => {
  res
    .status(200)
    .json({
      message: 'Successfully fetched your profile!',
      user: req.user
    });
}

exports.updateProfile = async (req, res, next) => {
  const errors = validationResult(req)
  const updates = Object.keys(req.body)
  const allowedUpdates = [
    'name',
    'email',
    'password'
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
    updatingFields.forEach((update) => req.user[update] = req.body[update])
    await req.user.save()
    res.status(200).json({
      message: 'User profile updated!',
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
