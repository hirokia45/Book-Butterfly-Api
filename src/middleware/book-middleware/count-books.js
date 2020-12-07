const Book = require('../../models/book')

module.exports = async (req, res, next) => {
  try {
    const totalBooksCompleted = await Book.find({
      completed: true,
      owner: req.user._id,
    }).countDocuments();

    req.totalBooksCompleted = totalBooksCompleted
    next()
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
