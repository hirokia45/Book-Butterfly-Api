const { validationResult } = require('express-validator');
const Book = require('../models/book');
const axios = require('axios');

exports.getBookSearch = async (req, res, next) => {
  const search = req.query.q;
  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${search}&filter=partial&$key=${process.env.GOOGLE_API_KEY}&country=JP`
    )

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
  console.log('triggered');
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    await req.user.populate({
      path: 'books',
      options: {
        sort
      }
    }).execPopulate();

    res.status(200).json({
      message: 'Fetched books successfully',
      myBooks: req.user.books
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
      bookId: req.body.bookId,
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
