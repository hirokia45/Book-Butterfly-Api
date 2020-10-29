const mongoose = require('mongoose');
const validator = require('validator');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: false,
      trim: true,
    },
    category: {
      type: String,
      required: false,
    },
    pageFrom: {
      type: Number,
      required: false,
    },
    pageTo: {
      type: Number,
      required: false,
    },
    chapter: {
      type: String,
      required: false
    },
    comment: {
      type: String,
      required: false,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    photo: {
      type: String,
      required: false
    },
  },
  {
    timestamps: true,
  }
)

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
