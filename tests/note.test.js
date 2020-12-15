const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Note = require('../src/models/note');
const { userOneId, userOne, userTwoId, userTwo, noteOne, noteTwo, noteThree, configureDatabase } = require('./fixtures/db')

beforeEach(configureDatabase);

test('Should create note for user', async () => {
  const response = await request(app).post('/notes')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      title: "Test title!"
    })
    .expect(201)
  const note = await Note.findById(response.body.note._id)
  expect(note).not.toBeNull()
  expect(note.photo).toEqual(null)
})

test('Should fetch notes for user one', async () => {
  const response = await request(app)
    .get('/notes')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.notes.length).toEqual(2)
})

test('Should not delete other users notes', async () => {
  await request(app)
    .delete(`/notes/${noteOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

  const note = await Note.findById(noteOne._id)
  expect(note).not.toBeNull()
})

afterAll(() => mongoose.disconnect())
