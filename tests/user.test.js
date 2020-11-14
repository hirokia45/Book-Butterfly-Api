const request = require('supertest');
const app = require('../app');

test('Should signup a new user', async () => {
  await request(app).put('/auth/signup').send({
    name: 'Chris',
    email: 'chris@example.com',
    password: 'MyPass1234'
  }).expect(201)
})
