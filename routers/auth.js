const express = require('express');

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const router = new express.Router();

router.put('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/logout', isAuth, authController.logout);
router.post('/auth/logoutAll', isAuth, authController.logoutAll);

module.exports = router;
