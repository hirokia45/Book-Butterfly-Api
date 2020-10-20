const express = require('express');

const noteController = require('../controllers/note');

const router = new express.Router();

// GET /notes
router.get('/notes', noteController.getNotes);
router.get('/notes/:noteId', noteController.getNote);

router.post('/notes', noteController.createNote);

router.patch('/notes/:noteId', noteController.updateNote)

router.delete('/notes/:noteId', noteController.deleteNote);



module.exports = router;
