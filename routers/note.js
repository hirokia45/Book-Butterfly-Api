const express = require('express');

const noteController = require('../controllers/note');
const imageController = require('../controllers/image');

const isAuth = require('../middleware/is-auth')
const upload = require('../services/imageUpload')

const router = new express.Router();

router.get('/notes', isAuth, noteController.getNotes);
router.get('/notes/:noteId', isAuth, noteController.getNote);
router.get('/calendar', isAuth, noteController.getCalendarInfo);

router.post('/notes', isAuth, noteController.createNote);

router.patch('/notes/:noteId', isAuth, noteController.updateNote);
router.post('/notes/:noteId', isAuth, upload.single("file"), imageController.uploadImage);

router.delete('/notes/photo/:noteId', isAuth, imageController.deleteImage);
router.delete('/notes/:noteId', isAuth, noteController.deleteNote);

module.exports = router;
