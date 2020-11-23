const { validationResult } = require('express-validator');
const Book = require('../models/book');
const axios = require('axios');
const qs = require('querystring');

exports.getBookSearch = async (req, res, next) => {
  const search = decodeURIComponent(req.query.q);
  console.log(search);
  const url = "https://www.googleapis.com/books/v1/volumes?" + qs.stringify({
    q: search,
    filter: 'partial',
    key: process.env.GOOGLE_API_KEY,
    country: 'JP'
  })
  try {
    const response = await axios.get(url)
    const books = response.data
    res.status(200).json({
      message: 'Received request successfully',
      books
    })
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.getMyBooks = async (req, res, next) => {
  const sort = {}
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    const totalBooksCompleted = await Book.find({ completed: true, owner: req.user._id }).countDocuments();
    await req.user.populate({
      path: 'books',
      options: {
        sort
      }
    }).execPopulate();

    res.status(200).json({
      message: 'Fetched books successfully',
      myBooks: req.user.books,
      totalBooksCompleted
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.addToBookshelf = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, could not add the item');
    error.statusCode = 422;
    throw error;
  }

  const book = new Book({
    ...req.body,
    owner: req.user._id,
  })
  try {
    const bookScan = await Book.findOne({
      id: req.body.id,
      owner: req.user._id,
    })

    if (bookScan) {
      const error = new Error('This book is already in your bookshelf.')
      error.statusCode = 409
      throw error
    }

    const result = await book.save();
    res.status(201).json({
      message: 'Book was added to bookshelf!',
      book: result
    })
  } catch (err) {
    console.log(err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

exports.updateBookInfo = async (req, res, next) => {
  const _id = req.body._id;

  const updates = Object.keys(req.body);
  const allowUpdates = ["myRate", "archive", "completed"];
  const updatingFields = updates.filter((field) => allowUpdates.includes(field));
  const isValidOperation = updatingFields.every((update) => allowUpdates.includes(update));

  if (!isValidOperation) {
    const error = new Error('Validation failed, entered data is incorrect.')
    error.statusCode = 422
    throw error
  }
  try {
    const book = await Book.findOne({ _id, owner: req.user._id });

    if (!book) {
      const error = new Error('Could not find book.');
      error.statusCode = 404;
      throw error;
    }

    updatingFields.forEach((update) => (book[update] = req.body[update]))
    const result = await book.save();
    res.status(200).json({
      message: 'Book updated',
      result
    })
  } catch (err) {
    console.log(err)
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.removeMyBook = async (req, res, next) => {
  const _id = req.params.myBookId;

  try {
    const book = await Book.findOneAndDelete({ _id, owner: req.user._id })

    if (!book) {
      const error = new Error('Could not find the book record.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: 'Deleted book.'})
  } catch (err) {
    console.log(err)
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
