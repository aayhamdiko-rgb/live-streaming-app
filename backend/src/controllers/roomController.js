const Room = require('../models/Room');
const User = require('../models/User');

exports.createRoom = async (req, res) => {
  try {
    const { name, description, category, roomType, maxMembers } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const room = new Room({
      name,
      description,
      category: category || 'Entertainment',
      roomType: roomType || 'voice-chat',
      maxMembers: maxMembers || 8,
      owner: req.user.id,
      agoraChannelName: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });

    await room.save();
    await room.populate('owner', 'username profileImage');

    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create room', error: error.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const { category, roomType, isActive, page = 1, limit = 20 } = req.query;

    const filter = { isPublic: true };
    if (category) filter.category = category;
    if (roomType) filter.roomType = roomType;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;

    const rooms = await Room.find(filter)
      .populate('owner', 'username profileImage level')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Room.countDocuments(filter);

    res.status(200).json({
      rooms,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get rooms', error: error.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)
      .populate('owner', 'username profileImage level badges')
      .populate('currentMembers', 'username profileImage level');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    res.status(200).json({ room });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get room', error: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { name, description, category, maxMembers, roomImage } = req.body;

    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only room owner can update room' });
    }

    if (name) room.name = name;
    if (description) room.description = description;
    if (category) room.category = category;
    if (maxMembers) room.maxMembers = maxMembers;
    if (roomImage) room.roomImage = roomImage;
    room.updatedAt = new Date();

    await room.save();

    res.status(200).json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update room', error: error.message });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.bannedUsers.includes(req.user.id)) {
      return res.status(403).json({ message: 'You are banned from this room' });
    }

    if (room.currentMembers.length >= room.maxMembers) {
      return res.status(400).json({ message: 'Room is full' });
    }

    if (!room.currentMembers.includes(req.user.id)) {
      room.currentMembers.push(req.user.id);
      room.totalViewers += 1;
    }

    await room.save();

    res.status(200).json({
      message: 'Joined room successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join room', error: error.message });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.currentMembers = room.currentMembers.filter(id => id.toString() !== req.user.id);

    if (room.currentMembers.length === 0) {
      room.isActive = false;
    }

    await room.save();

    res.status(200).json({
      message: 'Left room successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to leave room', error: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only room owner can delete room' });
    }

    await Room.findByIdAndDelete(req.params.roomId);

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete room', error: error.message });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only room owner can ban users' });
    }

    if (!room.bannedUsers.includes(userId)) {
      room.bannedUsers.push(userId);
      room.currentMembers = room.currentMembers.filter(id => id.toString() !== userId);
      await room.save();
    }

    res.status(200).json({
      message: 'User banned successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to ban user', error: error.message });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only room owner can unban users' });
    }

    room.bannedUsers = room.bannedUsers.filter(id => id.toString() !== userId);
    await room.save();

    res.status(200).json({
      message: 'User unbanned successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unban user', error: error.message });
  }
};

exports.startStreaming = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only room owner can start streaming' });
    }

    room.isActive = true;
    room.startTime = new Date();

    await room.save();

    res.status(200).json({
      message: 'Streaming started',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start streaming', error: error.message });
  }
};

exports.stopStreaming = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only room owner can stop streaming' });
    }

    room.isActive = false;
    room.endTime = new Date();
    room.currentMembers = [];

    await room.save();

    res.status(200).json({
      message: 'Streaming stopped',
      room
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to stop streaming', error: error.message });
  }
};
