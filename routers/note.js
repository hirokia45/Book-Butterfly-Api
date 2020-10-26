const express = require('express');

const noteController = require('../controllers/note');
const uploadController = require('../controllers/upload');

const router = new express.Router();

// GET /notes
router.get('/notes', noteController.getNotes);
router.get('/notes/:noteId', noteController.getNote);

router.post('/notes', noteController.createNote);

router.patch('/notes/:noteId', noteController.updateNote);
router.post('/notes/:noteId', uploadController.uploadImage);

router.delete('/notes/photo/:noteId', uploadController.deleteImage);
router.delete('/notes/:noteId', noteController.deleteNote);

module.exports = router;
