const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketIO = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/live-streaming-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const giftRoutes = require('./routes/giftRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/gifts', giftRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Room events
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    io.to(roomId).emit('user-joined', {
      userId,
      socketId: socket.id,
      timestamp: new Date()
    });
  });

  socket.on('leave-room', (roomId, userId) => {
    socket.leave(roomId);
    io.to(roomId).emit('user-left', {
      userId,
      timestamp: new Date()
    });
  });

  // Chat events
  socket.on('send-message', (roomId, message) => {
    io.to(roomId).emit('receive-message', {
      ...message,
      timestamp: new Date()
    });
  });

  // Gift events
  socket.on('send-gift', (roomId, gift) => {
    io.to(roomId).emit('gift-received', {
      ...gift,
      timestamp: new Date()
    });
  });

  // Streaming events
  socket.on('start-stream', (roomId, streamData) => {
    io.to(roomId).emit('stream-started', streamData);
  });

  socket.on('stop-stream', (roomId) => {
    io.to(roomId).emit('stream-stopped');
  });

  // Disconnect event
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    socket.broadcast.emit('user-disconnected', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server, io };
