const express = require('express');
const paymentController = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Protected routes
router.post('/coins/purchase', authMiddleware, paymentController.purchaseCoins);
router.post('/diamonds/purchase', authMiddleware, paymentController.purchaseDiamonds);
router.post('/payment/:transactionId/complete', authMiddleware, paymentController.completePayment);
router.post('/gift/send', authMiddleware, paymentController.sendGift);
router.post('/withdrawal/request', authMiddleware, paymentController.requestWithdrawal);
router.get('/transactions', authMiddleware, paymentController.getTransactionHistory);
router.get('/wallet', authMiddleware, paymentController.getWallet);

module.exports = router;
