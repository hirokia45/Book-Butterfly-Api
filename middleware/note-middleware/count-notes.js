const Note = require('../../models/note');

module.exports = async (req, res, next) => {
  try {
    const totalNotes = await Note.find({ owner: req.user._id }).countDocuments();

    req.totalNotes = totalNotes;
    next()
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}
