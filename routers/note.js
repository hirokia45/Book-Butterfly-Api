const express = require('express');

const noteController = require('../controllers/note');

const router = new express.Router();

// GET /notes
router.get('/notes', noteController.getNotes);

router.post('/notes', noteController.createNote);



module.exports = router;
