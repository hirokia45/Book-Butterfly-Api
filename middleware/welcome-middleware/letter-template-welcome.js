module.exports = async (req, res, next) => {
  if (req.lang === 'en-us') {
    let letter = {
      title: 'Welcome to Book Butterfly',
      message: 'Thank you for signing up! Enjoy this app!',
      icon: 'eva-smiling-face-outline',
      color: 'pink-4',
      textColor: 'white',
    }
    req.letter = letter
    next()
  } else {
    console.log('skipped en-us letter')
    next()
  }
}
