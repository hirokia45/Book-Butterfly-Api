const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/note');
const Note = require('../../src/models/note');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
  _id: userOneId,
  name: 'Chris',
  email: 'chris@test.com',
  password: 'chrisistesting',
  tokens: [
    {
      token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
    },
  ],
}

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
  _id: userTwoId,
  name: 'Chris2',
  email: 'chris2@test.com',
  password: 'chrisistesting2',
  tokens: [
    {
      token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
    },
  ],
}

const noteOne = {
  _id: new mongoose.Types.ObjectId(),
  title: 'First test title',
  owner: userOneId
}

const noteTwo = {
  _id: new mongoose.Types.ObjectId(),
  title: 'Second test title',
  owner: userOneId
}

const noteThree = {
  _id: new mongoose.Types.ObjectId(),
  title: 'Third test title',
  owner: userTwoId
}

const configureDatabase = async () => {
  await User.deleteMany()
  await Note.deleteMany()
  await new User(userOne).save()
  await new User(userTwo).save()
  await new Note(noteOne).save()
  await new Note(noteTwo).save()
  await new Note(noteThree).save()
}

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  noteOne,
  noteTwo,
  noteThree,
  configureDatabase
}
