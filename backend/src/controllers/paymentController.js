const Transaction = require('../models/Transaction');
const User = require('../models/User');
const AdminSettings = require('../models/AdminSettings');

exports.purchaseCoins = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method are required' });
    }

    // Get admin settings for pricing
    const settings = await AdminSettings.findOne();
    const coinPrice = settings?.coinPrices?.coin || 0.01;
    const totalPrice = amount * coinPrice;

    // Create transaction
    const transaction = new Transaction({
      user: req.user.id,
      type: 'purchase',
      amount,
      currency: 'coins',
      paymentMethod,
      status: 'pending',
      reference: `coin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: `Purchase ${amount} coins`
    });

    await transaction.save();

    res.status(201).json({
      message: 'Coin purchase initiated',
      transaction,
      totalPrice
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to purchase coins', error: error.message });
  }
};

exports.purchaseDiamonds = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method are required' });
    }

    const settings = await AdminSettings.findOne();
    const diamondPrice = settings?.coinPrices?.diamond || 1;
    const totalPrice = amount * diamondPrice;

    const transaction = new Transaction({
      user: req.user.id,
      type: 'purchase',
      amount,
      currency: 'diamonds',
      paymentMethod,
      status: 'pending',
      reference: `diamond-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: `Purchase ${amount} diamonds`
    });

    await transaction.save();

    res.status(201).json({
      message: 'Diamond purchase initiated',
      transaction,
      totalPrice
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to purchase diamonds', error: error.message });
  }
};

exports.completePayment = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Update transaction status
    transaction.status = 'completed';
    await transaction.save();

    // Update user wallet
    const user = await User.findById(req.user.id);
    if (transaction.currency === 'coins') {
      user.wallet.coins += transaction.amount;
    } else if (transaction.currency === 'diamonds') {
      user.wallet.diamonds += transaction.amount;
    }
    user.wallet.totalSpent += transaction.amount;
    await user.save();

    res.status(200).json({
      message: 'Payment completed successfully',
      transaction,
      wallet: user.wallet
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to complete payment', error: error.message });
  }
};

exports.sendGift = async (req, res) => {
  try {
    const { giftId, receiverId, roomId, amount } = req.body;

    if (!giftId || !receiverId) {
      return res.status(400).json({ message: 'Gift ID and receiver ID are required' });
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create transaction for gift
    const transaction = new Transaction({
      user: req.user.id,
      type: 'gift-send',
      amount: amount || 1,
      currency: 'coins',
      status: 'completed',
      relatedUser: receiverId,
      giftId,
      roomId,
      reference: `gift-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: `Sent gift to ${receiver.username}`
    });

    await transaction.save();

    // Deduct from sender
    sender.wallet.coins -= (amount || 1);
    await sender.save();

    // Add to receiver
    receiver.wallet.coins += Math.floor((amount || 1) * 0.7); // 70% goes to receiver
    await receiver.save();

    res.status(201).json({
      message: 'Gift sent successfully',
      transaction,
      senderWallet: sender.wallet,
      receiverWallet: receiver.wallet
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send gift', error: error.message });
  }
};

exports.requestWithdrawal = async (req, res) => {
  try {
    const { amount, paymentMethod, bankDetails } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method are required' });
    }

    const user = await User.findById(req.user.id);
    const settings = await AdminSettings.findOne();

    if (user.wallet.coins < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Get minimum withdrawal from settings
    const minWithdrawal = settings?.paymentMethods?.[paymentMethod]?.minWithdrawal || 10;
    if (amount < minWithdrawal) {
      return res.status(400).json({ message: `Minimum withdrawal is ${minWithdrawal}` });
    }

    const transaction = new Transaction({
      user: req.user.id,
      type: 'withdrawal',
      amount,
      currency: 'coins',
      paymentMethod,
      status: 'pending',
      reference: `withdrawal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: `Withdrawal request for ${amount} coins`
    });

    await transaction.save();

    res.status(201).json({
      message: 'Withdrawal request submitted',
      transaction
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to request withdrawal', error: error.message });
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;

    const filter = { user: req.user.id };
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(filter)
      .populate('relatedUser', 'username profileImage')
      .populate('giftId', 'name image')
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
    res.status(500).json({ message: 'Failed to get transaction history', error: error.message });
  }
};

exports.getWallet = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      wallet: user.wallet,
      bankDetails: user.bankDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get wallet', error: error.message });
  }
};
