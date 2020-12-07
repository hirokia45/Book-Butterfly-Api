const express = require('express');

const User = require('../models/user');
const authController = require('../controllers/auth');
const isAuth = require('../middleware/is-auth');

const detectLang = require('../middleware/detect-locale-lang');
const welcomeLetterEng = require('../middleware/welcome-middleware/letter-template-welcome');
const welcomeLetterJp = require('../middleware/welcome-middleware/letter-template-welcome-jp');

const router = new express.Router();

router.put('/auth/signup', detectLang, welcomeLetterEng, welcomeLetterJp, authController.signup);
router.post('/auth/login', authController.login);
router.post('/auth/logout', isAuth, authController.logout);
router.post('/auth/logoutAll', isAuth, authController.logoutAll);
router.get('/auth/healthcheck', authController.healthCheck);

module.exports = router;
