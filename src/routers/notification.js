const express = require('express')
const notificationController = require('../controllers/notification')

const isAuth = require('../middleware/is-auth')

const router = new express.Router()

router.get('/notifications', isAuth, notificationController.getNotifications);
router.get('/notifications/count', isAuth, notificationController.getTotalNotificationsUnconfirmed);

router.post('/notifications/test', isAuth, notificationController.sendNotification);
router.patch('/notifications/confirmation', isAuth, notificationController.changeConfirmationStatus);

router.delete('/notifications/:notificationId', isAuth, notificationController.removeNotification);

module.exports = router
