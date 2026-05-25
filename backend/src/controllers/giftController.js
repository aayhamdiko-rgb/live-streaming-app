const Gift = require('../models/Gift');

exports.getAllGifts = async (req, res) => {
  try {
    const { category, rarity, isActive, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (rarity) filter.rarity = rarity;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (page - 1) * limit;

    const gifts = await Gift.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Gift.countDocuments(filter);

    res.status(200).json({
      gifts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get gifts', error: error.message });
  }
};

exports.getGiftById = async (req, res) => {
  try {
    const gift = await Gift.findById(req.params.giftId);

    if (!gift) {
      return res.status(404).json({ message: 'Gift not found' });
    }

    res.status(200).json({ gift });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get gift', error: error.message });
  }
};

exports.createGift = async (req, res) => {
  try {
    const { name, image, price, currency, category, rarity, animation } = req.body;

    if (!name || !image || !price || !currency) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const gift = new Gift({
      name,
      image,
      price,
      currency,
      category: category || 'emoji',
      rarity: rarity || 'common',
      animation: animation || null,
      isActive: true
    });

    await gift.save();

    res.status(201).json({
      message: 'Gift created successfully',
      gift
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create gift', error: error.message });
  }
};

exports.updateGift = async (req, res) => {
  try {
    const { name, image, price, currency, category, rarity, isActive, animation } = req.body;

    const gift = await Gift.findByIdAndUpdate(
      req.params.giftId,
      {
        name: name || undefined,
        image: image || undefined,
        price: price || undefined,
        currency: currency || undefined,
        category: category || undefined,
        rarity: rarity || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        animation: animation || undefined
      },
      { new: true, runValidators: true }
    );

    if (!gift) {
      return res.status(404).json({ message: 'Gift not found' });
    }

    res.status(200).json({
      message: 'Gift updated successfully',
      gift
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update gift', error: error.message });
  }
};

exports.deleteGift = async (req, res) => {
  try {
    const gift = await Gift.findByIdAndDelete(req.params.giftId);

    if (!gift) {
      return res.status(404).json({ message: 'Gift not found' });
    }

    res.status(200).json({ message: 'Gift deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete gift', error: error.message });
  }
};

exports.getGiftsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const gifts = await Gift.find({ category, isActive: true })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rarity: 1, price: 1 });

    const total = await Gift.countDocuments({ category, isActive: true });

    res.status(200).json({
      gifts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get gifts by category', error: error.message });
  }
};

exports.getGiftsByRarity = async (req, res) => {
  try {
    const { rarity } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const gifts = await Gift.find({ rarity, isActive: true })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ price: -1 });

    const total = await Gift.countDocuments({ rarity, isActive: true });

    res.status(200).json({
      gifts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get gifts by rarity', error: error.message });
  }
};

exports.searchGifts = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters' });
    }

    const gifts = await Gift.find({
      $and: [
        { isActive: true },
        { name: { $regex: query, $options: 'i' } }
      ]
    })
      .limit(20);

    res.status(200).json({
      gifts,
      count: gifts.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search gifts', error: error.message });
  }
};
