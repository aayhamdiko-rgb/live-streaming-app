const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  roomImage: {
    type: String,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  currentMembers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  maxMembers: {
    type: Number,
    default: 8
  },
  category: {
    type: String,
    enum: ['Music', 'Gaming', 'Entertainment', 'Sports', 'Education', 'Other'],
    default: 'Entertainment'
  },
  roomType: {
    type: String,
    enum: ['streaming', 'voice-chat', 'text-chat'],
    default: 'voice-chat'
  },
  agoraChannelName: String,
  streamingUrl: String,
  totalViewers: {
    type: Number,
    default: 0
  },
  totalGiftsReceived: {
    type: Number,
    default: 0
  },
  giftHistory: [{
    sender: mongoose.Schema.Types.ObjectId,
    senderName: String,
    giftType: String,
    amount: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  bannedUsers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  startTime: Date,
  endTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
