const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    bookId: {
      type: String,
      required: true,
      unique: false
    },
    industryIdentifiers: [
      {
        type: {
          type: String,
        },
        identifier: {
          type: String,
        },
      },
    ],
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
    },
    authors: [String],
    publisher: {
      type: String,
    },
    publishedDate: {
      type: String,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    completed: {
      type: Boolean,
      default: false
    },
    archive: {
      type: Boolean,
      default: false
    },
    myRate: {
      type: Number,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
