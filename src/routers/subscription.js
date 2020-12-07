const express = require('express');
const subscriptionController = require('../controllers/subscription');

const isAuth = require('../middleware/is-auth')

const router = new express.Router()

router.post('/subscriptions', isAuth, subscriptionController.createSubscription);

module.exports = router
