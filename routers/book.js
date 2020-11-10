const express = require('express');

const bookController = require('../controllers/book');

const isAuth = require('../middleware/is-auth');

const router = new express.Router();

router.get('/books/googlebooks/api', isAuth, bookController.getBookSearch);

router.get('/books/bookshelf', isAuth, bookController.getMyBooks);

router.post('/books/bookshelf', isAuth, bookController.addToBookshelf);



module.exports = router;
