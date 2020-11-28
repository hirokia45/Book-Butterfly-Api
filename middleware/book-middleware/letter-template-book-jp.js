module.exports = async (req, res, next) => {
  console.log(req.lang)
  if (req.lang === 'jp') {
    console.log(req.totalBooksCompleted)
    const totalBooksCompleted = req.totalBooksCompleted + 1

    switch (totalBooksCompleted) {
      case 1:
        letter = {
          title: 'おめでとう！',
          message: '一冊目の本を読み切りました！もっと本を読んでいきましょう',
          icon: 'eva-star-outline',
          color: 'yellow',
          textColor: 'white',
        }
        break
      case 5:
        letter = {
          title: 'Congratulations! You earned a bronze trophie!!',
          message:
            'You have read 5 books! Check out your trophie in profile page!',
          icon: 'eva-award-outline',
          color: 'orange',
          textColor: 'white',
        }
        break
      case 10:
        letter = {
          title: '10 BOOKS!',
          message: 'You have read 10 books! Hope you are enjoying this app!',
          icon: 'eva-smiling-face-outline',
          color: 'orange',
          textColor: 'white',
        }
        break
      case 15:
        letter = {
          title: 'Congratulations! You earned a silver trophie!!',
          message:
            'You have read 15 books! Check out your trophie is profile page!',
          icon: 'eva-award-outline',
          color: 'grey-4',
          textColor: 'white',
        }
        break
      case 20:
        letter = {
          title: 'Keep Going!',
          message: "You have read 20 books! Let's read more books!",
          icon: 'eva-edit-2-outline',
          color: 'indigo',
          textColor: 'white',
        }
        break
      case 30:
        letter = {
          title: 'Congratulations! You earned a gold trophie!!',
          message:
            'You have read 30 books! Check out your trophie is profile page!',
          icon: 'eva-award-outline',
          color: 'yellow',
          textColor: 'white',
        }
        break
      default:
        letter = null
    }
    if (letter) {
      req.letter = letter
    }
    next()
  } else {
    console.log('skipped jp template')
    next()
  }
}
