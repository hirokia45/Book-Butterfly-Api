module.exports = async (req, res, next) => {
  req.lang = req.body.lang
  next()
}
