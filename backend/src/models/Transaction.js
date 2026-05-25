const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['purchase', 'withdrawal', 'gift-receive', 'gift-send', 'bonus'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['coins', 'diamonds', 'usd'],
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['shaam-cash', 'sureaty-cash', 'binance', 'app-store', 'google-play'],
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  reference: {
    type: String,
    unique: true,
    sparse: true
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  giftId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gift',
    default: null
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    default: null
  },
  description: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
