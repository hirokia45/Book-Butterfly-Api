const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose')
const User = require('../models/user');

const userOne = {
  name: 'Chris',
  email: 'chris@test.com',
  password: 'chrisistesting'
}

beforeEach(async () => {
  await User.deleteMany()
  await new User(userOne).save()
})

test('Should signup a new user', async () => {
  await request(app).put('/auth/signup').send({
    name: 'Chris',
    email: 'chris@example.com',
    password: 'MyPass1234'
  }).expect(201)
})

test('Should login existing user', async () => {
  await request(app).post('/auth/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)
})

test('Should not login nonexistent user', async () => {
  await request(app).post('/auth/login').send({
    email: 'nonexisting@test.com',
    password: 'notindatabase'
  }).expect(401)
})

afterAll(() => mongoose.disconnect())
