const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, configureDatabase } = require('./fixtures/db');

beforeEach(configureDatabase);

test('Should signup a new user', async () => {
  const response = await request(app)
    .put('/auth/signup').send({
      name: 'Chris',
      email: 'chris@example.com',
      password: 'MyPass1234'
    })
    .expect(201)

  // Assert that the database was changed correctly
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // Assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'Chris',
      email: 'chris@example.com'
    },
    token: user.tokens[0].token
  })
  expect(user.password).not.toBe('MyPass1234')
})

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({
      email: userOne.email,
      password: userOne.password
    })
    .expect(200)

  const user = await User.findById(userOneId)
  expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async () => {
  await request(app)
    .post('/auth/login')
    .send({
      email: 'nonexisting@test.com',
      password: 'notindatabase'
  }).expect(401)
})

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
  await request(app)
    .put('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('file', 'tests/fixtures/avatar.png')
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(String))
})

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Tim'
    })
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.name).toEqual('Tim')
})

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      siblings: 'Tim'
    })
    .expect(422)
})

afterAll(() => mongoose.disconnect())
