const express = require('express');

const userController = require('../controllers/user');
const isAuth = require('../middleware/is-auth');

const router = new express.Router();

router.get('/users/me', isAuth, userController.getOwnProfile);

router.patch('/users/me', isAuth, userController.updateProfile);

router.delete('/users/me', isAuth, userController.deleteProfile);

module.exports = router;
