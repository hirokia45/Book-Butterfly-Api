module.exports = async (req, res, next) => {
  if (req.lang === 'jp') {
    const totalNotes = req.totalNotes + 1

    switch (totalNotes) {
      case 1:
        letter = {
          title: 'おめでとう！',
          message: '最初のノートを書きました！もっとノートを増やしていきましょう！',
          icon: 'eva-star-outline',
          color: 'yellow',
          textColor: 'white',
        }
        break
      case 5:
        letter = {
          title: 'Keep Going!',
          message: 'You have written 5 notes! Read more and write more!',
          icon: 'eva-edit-2-outline',
          color: 'indigo',
          textColor: 'white',
        }
        break
      case 10:
        letter = {
          title: '10 NOTES!',
          message: 'You have written 10 notes! Hope you are enjoying this app!',
          icon: 'eva-smiling-face-outline',
          color: 'orange',
          textColor: 'white',
        }
        break
      case 20:
        letter = {
          title: 'Congratulations! You earned a bronze trophie!!',
          message:
            'You have written 20 notes! Check out your trophie is profile page!',
          icon: 'eva-award-outline',
          color: 'orange',
          textColor: 'white',
        }
        break
      case 50:
        letter = {
          title: 'Congratulations! You earned a silver trophie!!',
          message:
            'You have written 50 notes! Check out your trophie is profile page!',
          icon: 'eva-award-outline',
          color: 'grey-4',
          textColor: 'white',
        }
        break
      case 100:
        letter = {
          title: 'Congratulations! You earned a gold trophie!!',
          message:
            'You have written 100 notes! Check out your trophie is profile page!',
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
    next()
  }
}
