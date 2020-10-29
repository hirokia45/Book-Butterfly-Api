const express = require('express');
require('./db/mongoose');
const cors = require("cors");

const authRouter = require('./routers/auth');
const userRouter = require('./routers/user');
const noteRouter = require('./routers/note');


const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

app.use(authRouter);
app.use(userRouter);
app.use(noteRouter);


app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
})

module.exports = app;
