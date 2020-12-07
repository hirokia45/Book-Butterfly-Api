const Notification = require('../models/notification')

exports.getNotifications = async (req, res, next) => {
  const sort = {}

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    await req.user.populate({
        path: 'notifications',
        options: {
          sort,
        },
      }).execPopulate()

    const notifications = req.user.notifications

    res.status(200).json({
      message: 'Fetched notifications successfully',
      notifications,
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.getTotalNotificationsUnconfirmed = async (req, res, next) => {
  try {
    const totalNotificationsUnconfirmed = await Notification.find({
      confirmed: false,
      owner: req.user._id,
    }).countDocuments();

    res.status(200).json({
      message: 'Fetched total unconfirmed notifications successfully',
      totalNotificationsUnconfirmed
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.sendNotification = async (req, res, next) => {
  const notification = new Notification({
    ...req.body,
    owner: req.user._id
  })
  try {
    const result = await notification.save();
    res.status(201).json({
      message: 'Notificaion was send!',
      result
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.changeConfirmationStatus = async (req, res, next) => {
  const _id = req.body._id;

  const updates = Object.keys(req.body);
  const allowUpdates = ["confirmed"];
  const updatingFields = updates.filter((field) =>
    allowUpdates.includes(field));
  const isValidOperation = updatingFields.every((update) =>
    allowUpdates.includes(update));

  if (!isValidOperation) {
    const error = new Error('Validation failed, entered data is incorrect.')
    error.statusCode = 422
    throw error
  }

  try {
    const notification = await Notification.findOne({ _id, owner: req.user._id });

    if (!notification) {
      const error = new Error('No such a notification exists in database');
      error.statusCode = 404;
      throw error;
    }

    updatingFields.forEach((update) => (notification[update] = req.body[update]));
    const result = await notification.save();
    res.status(200).json({
      message: 'Confirmation status changed.',
      result
    })
  } catch (err) {
    console.log(err)
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}

exports.removeNotification = async (req, res, next) => {
  const _id = req.params.notificationId;

  try {
    const notification = await Notification.findOneAndDelete({ _id, owner: req.user._id })

    if (!notification) {
      const error = new Error('Could not find the notification');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: 'Notifiication deleted.' })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500
    }
    next(err)
  }
}
