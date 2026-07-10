const Shop = require('../models/Shop');
const Coffee = require('../models/Coffee');

// @desc    Get all shops (default filters by isOpen: true unless requested otherwise)
// @route   GET /api/shops
// @access  Public
exports.getShops = async (req, res) => {
  try {
    const filter = {};
    
    // Customers only see open shops by default
    if (!req.query.all) {
      filter.isOpen = true;
    }

    const shops = await Shop.find(filter).populate('owner', 'name email');
    res.json({ success: true, count: shops.length, data: shops });
  } catch (error) {
    console.error('GetShops Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching shops' });
  }
};

// @desc    Get current owner's shop
// @route   GET /api/shops/my-shop
// @access  Private (Owner only)
exports.getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) {
      // Return 200 with null data — owner simply hasn't created a shop yet (not an error)
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: shop });
  } catch (error) {
    console.error('GetMyShop Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching your shop details' });
  }
};

// @desc    Get specific shop details by ID (including menu)
// @route   GET /api/shops/:id
// @access  Public
exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('owner', 'name email');
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Coffee shop not found' });
    }

    // Get menu items of this shop
    const menu = await Coffee.find({ shop: req.params.id });

    res.json({
      success: true,
      data: {
        shop,
        menu
      }
    });
  } catch (error) {
    console.error('GetShopById Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Coffee shop not found' });
    }
    res.status(500).json({ success: false, message: 'Server error fetching shop details' });
  }
};

// @desc    Create coffee shop
// @route   POST /api/shops
// @access  Private (Owner only)
exports.createShop = async (req, res) => {
  try {
    // Check if owner already has a shop
    const existingShop = await Shop.findOne({ owner: req.user.id });
    if (existingShop) {
      return res.status(400).json({ success: false, message: 'Owner can only register one coffee shop' });
    }

    const { name, description, address, phone, openTime, closeTime } = req.body;
    
    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const shop = await Shop.create({
      owner: req.user.id,
      name,
      description,
      address,
      phone,
      openTime,
      closeTime,
      image: imagePath,
      isOpen: true
    });

    res.status(201).json({ success: true, data: shop });
  } catch (error) {
    console.error('CreateShop Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating coffee shop' });
  }
};

// @desc    Update coffee shop details
// @route   PUT /api/shops/:id
// @access  Private (Owner only)
exports.updateShop = async (req, res) => {
  try {
    let shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Coffee shop not found' });
    }

    // Check ownership
    if (shop.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this shop' });
    }

    const { name, description, address, phone, openTime, closeTime } = req.body;
    const updateData = { name, description, address, phone, openTime, closeTime };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    shop = await Shop.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: shop });
  } catch (error) {
    console.error('UpdateShop Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating coffee shop' });
  }
};

// @desc    Toggle coffee shop open/closed status
// @route   PATCH /api/shops/:id/toggle-status
// @access  Private (Owner only)
exports.toggleShopStatus = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Coffee shop not found' });
    }

    // Check ownership
    if (shop.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this shop status' });
    }

    shop.isOpen = !shop.isOpen;
    await shop.save();

    res.json({ success: true, data: shop });
  } catch (error) {
    console.error('ToggleShopStatus Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error toggling shop status' });
  }
};
