const mongoose = require('mongoose')

const subscriptionSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
      unique: false,
    },
    expirationTime: {
      type: String
    },
    keys: {
      p256dh: {
        type: String,
        required: true
      },
      auth: {
        type: String,
        required: true
      }
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  {
    timestamps: true,
  }
)

const Subscription = mongoose.model('Subscription', subscriptionSchema)

module.exports = Subscription
