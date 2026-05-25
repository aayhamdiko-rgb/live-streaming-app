const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate('followers', 'username profileImage level')
      .populate('following', 'username profileImage level');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, bio, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { username, bio, profileImage, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

exports.followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (currentUserId === userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const currentUser = await User.findById(currentUserId);
    const userToFollow = await User.findById(userId);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already following
    if (currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }

    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);

    await currentUser.save();
    await userToFollow.save();

    res.status(200).json({
      message: 'User followed successfully',
      following: currentUser.following
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to follow user', error: error.message });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const userToUnfollow = await User.findById(userId);

    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if following
    if (!currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'Not following this user' });
    }

    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);

    await currentUser.save();
    await userToUnfollow.save();

    res.status(200).json({
      message: 'User unfollowed successfully',
      following: currentUser.following
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unfollow user', error: error.message });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('followers', 'username profileImage level badges');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      followers: user.followers,
      count: user.followers.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get followers', error: error.message });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('following', 'username profileImage level badges');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      following: user.following,
      count: user.following.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get following', error: error.message });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    })
      .select('username profileImage level badges')
      .limit(20);

    res.status(200).json({
      users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search users', error: error.message });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      stats: {
        level: user.level,
        badges: user.badges,
        followers: user.followers.length,
        following: user.following.length,
        wallet: user.wallet,
        totalEarnings: user.wallet.totalEarnings,
        totalSpent: user.wallet.totalSpent
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user stats', error: error.message });
  }
};

exports.updateBankDetails = async (req, res) => {
  try {
    const { shaamCash, suretyCash, binanceWallet } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        bankDetails: {
          shaamCash,
          suretyCash,
          binanceWallet
        }
      },
      { new: true }
    );

    res.status(200).json({
      message: 'Bank details updated successfully',
      bankDetails: user.bankDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bank details', error: error.message });
  }
};
