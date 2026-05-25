const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Room = require('../models/Room');
const Gift = require('../models/Gift');
const AdminSettings = require('../models/AdminSettings');

exports.getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalGifts = await Gift.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const totalEarnings = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'purchase' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentUsers = await User.find()
      .select('username email createdAt')
      .limit(10)
      .sort({ createdAt: -1 });

    const activeRooms = await Room.find({ isActive: true })
      .populate('owner', 'username')
      .limit(10);

    res.status(200).json({
      dashboard: {
        totalUsers,
        totalRooms,
        totalGifts,
        totalTransactions,
        totalEarnings: totalEarnings[0]?.total || 0,
        recentUsers,
        activeRooms
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get dashboard', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, isBanned } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users', error: error.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User banned successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to ban user', error: error.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBanned: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User unbanned successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unban user', error: error.message });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'streamer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User role updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to change user role', error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .populate('user', 'username email')
      .populate('relatedUser', 'username')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get transactions', error: error.message });
  }
};

exports.approveWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status: 'completed' },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    res.status(200).json({
      message: 'Withdrawal approved',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve withdrawal', error: error.message });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    transaction.status = 'failed';
    transaction.notes = reason || '';
    await transaction.save();

    // Refund the coins
    const user = await User.findById(transaction.user);
    user.wallet.coins += transaction.amount;
    await user.save();

    res.status(200).json({
      message: 'Withdrawal rejected and coins refunded',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject withdrawal', error: error.message });
  }
};

exports.getAdminSettings = async (req, res) => {
  try {
    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = new AdminSettings();
      await settings.save();
    }

    res.status(200).json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get settings', error: error.message });
  }
};

exports.updateAdminSettings = async (req, res) => {
  try {
    const updates = req.body;

    let settings = await AdminSettings.findOne();

    if (!settings) {
      settings = new AdminSettings(updates);
    } else {
      Object.assign(settings, updates);
    }

    await settings.save();

    res.status(200).json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings', error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const usersLastMonth = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const transactionsLastMonth = await Transaction.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const earningsLastMonth = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          type: 'purchase',
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const topStreamers = await Room.aggregate([
      { $group: { _id: '$owner', totalViewers: { $sum: '$totalViewers' }, roomCount: { $sum: 1 } } },
      { $sort: { totalViewers: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }
    ]);

    res.status(200).json({
      analytics: {
        usersLastMonth,
        transactionsLastMonth,
        earningsLastMonth: earningsLastMonth[0]?.total || 0,
        topStreamers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get analytics', error: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findByIdAndDelete(roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete room', error: error.message });
  }
};
