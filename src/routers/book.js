const express = require('express');

const bookController = require('../controllers/book');

const isAuth = require('../middleware/is-auth');
const bookCount = require('../middleware/book-middleware/count-books');
const detectLang = require('../middleware/detect-locale-lang');
const letterEng = require('../middleware/book-middleware/letter-template-book');
const letterJp = require('../middleware/book-middleware/letter-template-book-jp');

const router = new express.Router();

router.get('/books/googlebooks/api', isAuth, bookController.getBookSearch);
router.get('/books/bookshelf', isAuth, bookController.getMyBooks);

router.post('/books/bookshelf', isAuth, bookController.addToBookshelf);
router.patch('/books/bookshelf', isAuth, bookCount, detectLang, letterEng, letterJp, bookController.updateBookInfo);

router.delete('/books/bookshelf/:myBookId', isAuth, bookController.removeMyBook)

module.exports = router;
