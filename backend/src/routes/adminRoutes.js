const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Dashboard
router.get('/dashboard', adminController.getAdminDashboard);

// User management
router.get('/users', adminController.getAllUsers);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/unban', adminController.unbanUser);
router.put('/users/:userId/role', adminController.changeUserRole);

// Transaction management
router.get('/transactions', adminController.getTransactions);
router.post('/transactions/:transactionId/approve', adminController.approveWithdrawal);
router.post('/transactions/:transactionId/reject', adminController.rejectWithdrawal);

// Settings
router.get('/settings', adminController.getAdminSettings);
router.put('/settings', adminController.updateAdminSettings);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Room management
router.delete('/rooms/:roomId', adminController.deleteRoom);

module.exports = router;
