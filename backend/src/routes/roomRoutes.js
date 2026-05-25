const express = require('express');
const roomController = require('../controllers/roomController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', roomController.getRooms);
router.get('/:roomId', roomController.getRoomById);

// Protected routes
router.post('/', authMiddleware, roomController.createRoom);
router.put('/:roomId', authMiddleware, roomController.updateRoom);
router.delete('/:roomId', authMiddleware, roomController.deleteRoom);
router.post('/:roomId/join', authMiddleware, roomController.joinRoom);
router.post('/:roomId/leave', authMiddleware, roomController.leaveRoom);
router.post('/:roomId/ban', authMiddleware, roomController.banUser);
router.post('/:roomId/unban', authMiddleware, roomController.unbanUser);
router.post('/:roomId/start', authMiddleware, roomController.startStreaming);
router.post('/:roomId/stop', authMiddleware, roomController.stopStreaming);

module.exports = router;
