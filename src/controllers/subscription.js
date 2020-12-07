const { validationResult } = require('express-validator')
const Subscription = require('../models/subscription')

exports.createSubscription = async (req, res, next) => {
  const subscriptionData = req.query

  const subscription = new Subscription({
    ...subscriptionData,
    owner: req.user._id
  })

  try {
    const result = await subscription.save()
    res.status(201).json({
      message: 'Subscription added!!',
      result
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }


}
