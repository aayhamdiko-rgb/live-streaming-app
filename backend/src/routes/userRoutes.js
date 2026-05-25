const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/profile/:userId', userController.getProfile);
router.get('/search', userController.searchUsers);
router.get('/:userId/followers', userController.getFollowers);
router.get('/:userId/following', userController.getFollowing);
router.get('/:userId/stats', userController.getUserStats);

// Protected routes
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/follow/:userId', authMiddleware, userController.followUser);
router.post('/unfollow/:userId', authMiddleware, userController.unfollowUser);
router.put('/bank-details', authMiddleware, userController.updateBankDetails);

module.exports = router;
