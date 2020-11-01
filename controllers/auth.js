const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('validation failed');
    error.statusCode = 442;
    error.data = errors.array();
    throw error;
  }

  const user = new User(req.body);

  try {
    await user.save()
    const token = await user.generateAuthToken()
    res.status(201).json({ message: 'User created!', token, user })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err);
  }
}

exports.login = async (req, res, next) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken()

    res.status(200).json({ token, user })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.logout = async (req, res, next) => {
  console.log('logoutReq: ', req.headers);
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.status(200).json({ message: 'Logged out!', user: req.user });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err);
  }
}

exports.logoutAll = async (req, res, next) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).json({ message: 'Logged out all!', user: req.user });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
