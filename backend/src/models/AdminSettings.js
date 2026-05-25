const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  adminFeePercentage: {
    type: Number,
    default: 30,
    min: 0,
    max: 100
  },
  paymentMethods: {
    shaamCash: {
      enabled: { type: Boolean, default: true },
      apiKey: String,
      minWithdrawal: { type: Number, default: 10 },
      fee: { type: Number, default: 1 }
    },
    suretyCash: {
      enabled: { type: Boolean, default: true },
      apiKey: String,
      minWithdrawal: { type: Number, default: 10 },
      fee: { type: Number, default: 1 }
    },
    binance: {
      enabled: { type: Boolean, default: true },
      apiKey: String,
      minWithdrawal: { type: Number, default: 50 },
      fee: { type: Number, default: 2 }
    }
  },
  coinPrices: {
    coin: {
      type: Number,
      default: 0.01
    },
    diamond: {
      type: Number,
      default: 1
    }
  },
  appName: {
    type: String,
    default: 'BroadcastHub'
  },
  appVersion: {
    type: String,
    default: '1.0.0'
  },
  maintenanceMode: {
    type: Boolean,
    default: false
  },
  maintenanceMessage: String,
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
