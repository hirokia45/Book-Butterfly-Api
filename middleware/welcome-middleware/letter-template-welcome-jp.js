module.exports = async (req, res, next) => {
  if (req.lang === 'jp') {
    let letter = {
      title: 'Book Butterflyにようこそ！',
      message: '登録してくれてありがとうございます！アプリを楽しんで使っていただけるとうれしいです！',
      icon: 'eva-smiling-face-outline',
      color: 'pink-4',
      textColor: 'white',
    }
    req.letter = letter
    next()
  } else {
    console.log('skipped jp letter')
    next()
  }
}
