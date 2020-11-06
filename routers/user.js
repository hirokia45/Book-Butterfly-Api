const express = require('express');

const userController = require('../controllers/user');
const imageController = require('../controllers/image');

const isAuth = require('../middleware/is-auth');
const avatarUpload = require('../services/avatarUpload');

const router = new express.Router();

router.get('/users/me', isAuth, userController.getOwnProfile);

router.patch('/users/me', isAuth, userController.updateProfile);

router.put('/users/me/avatar', isAuth, avatarUpload.single('file'), imageController.uploadAvatar);

router.delete('/users/me', isAuth, userController.deleteProfile);

module.exports = router;
