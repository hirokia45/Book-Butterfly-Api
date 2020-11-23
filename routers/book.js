const express = require('express');

const bookController = require('../controllers/book');

const isAuth = require('../middleware/is-auth');
const bookCount = require('../middleware/book-middleware/count-book');
const letterTemplate = require('../middleware/book-middleware/letter-template-book')

const router = new express.Router();

router.get('/books/googlebooks/api', isAuth, bookController.getBookSearch);
router.get('/books/bookshelf', isAuth, bookController.getMyBooks);

router.post('/books/bookshelf', isAuth, bookController.addToBookshelf);
router.patch('/books/bookshelf', isAuth, bookCount, letterTemplate, bookController.updateBookInfo);

router.delete('/books/bookshelf/:myBookId', isAuth, bookController.removeMyBook)

module.exports = router;
