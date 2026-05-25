const express = require('express');
const giftController = require('../controllers/giftController');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

const router = express.Router();

// Public routes
router.get('/', giftController.getAllGifts);
router.get('/:giftId', giftController.getGiftById);
router.get('/category/:category', giftController.getGiftsByCategory);
router.get('/rarity/:rarity', giftController.getGiftsByRarity);
router.get('/search', giftController.searchGifts);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, giftController.createGift);
router.put('/:giftId', authMiddleware, adminMiddleware, giftController.updateGift);
router.delete('/:giftId', authMiddleware, adminMiddleware, giftController.deleteGift);

module.exports = router;
