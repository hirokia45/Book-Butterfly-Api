const express = require('express');
require('./db/mongoose');
const bodyParser = require('body-parser');

const noteRouter = require('./routers/note');

const app = express()

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

app.use(noteRouter);

module.exports = app;
