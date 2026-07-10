const Coffee = require('../models/Coffee');
const Shop = require('../models/Shop');

// @desc    Get all coffees of a specific shop
// @route   GET /api/coffees/shop/:shopId
// @access  Public
exports.getCoffeesByShop = async (req, res) => {
  try {
    const coffees = await Coffee.find({ shop: req.params.shopId });
    res.json({ success: true, count: coffees.length, data: coffees });
  } catch (error) {
    console.error('GetCoffeesByShop Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching coffees' });
  }
};

// @desc    Create coffee menu item
// @route   POST /api/coffees
// @access  Private (Owner only)
exports.createCoffee = async (req, res) => {
  try {
    const { name, description, price, category, isAvailable } = req.body;
    
    // Find the owner's shop first
    const shop = await Shop.findOne({ owner: req.user.id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Register your coffee shop first before creating menu items' });
    }

    let imagePath = '';
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const coffee = await Coffee.create({
      shop: shop._id,
      name,
      description,
      price: Number(price),
      category,
      isAvailable: isAvailable === undefined ? true : isAvailable === 'true' || isAvailable === true,
      image: imagePath
    });

    res.status(201).json({ success: true, data: coffee });
  } catch (error) {
    console.error('CreateCoffee Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error creating coffee item' });
  }
};

// @desc    Update coffee menu item
// @route   PUT /api/coffees/:id
// @access  Private (Owner only)
exports.updateCoffee = async (req, res) => {
  try {
    let coffee = await Coffee.findById(req.params.id);
    if (!coffee) {
      return res.status(404).json({ success: false, message: 'Coffee item not found' });
    }

    // Verify that the shop belongs to the currently logged in owner
    const shop = await Shop.findById(coffee.shop);
    if (!shop || shop.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this menu item' });
    }

    const { name, description, price, category, isAvailable } = req.body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (category !== undefined) updateData.category = category;
    if (isAvailable !== undefined) {
      updateData.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    coffee = await Coffee.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: coffee });
  } catch (error) {
    console.error('UpdateCoffee Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error updating coffee item' });
  }
};

// @desc    Delete coffee menu item
// @route   DELETE /api/coffees/:id
// @access  Private (Owner only)
exports.deleteCoffee = async (req, res) => {
  try {
    const coffee = await Coffee.findById(req.params.id);
    if (!coffee) {
      return res.status(404).json({ success: false, message: 'Coffee item not found' });
    }

    // Verify that the shop belongs to the currently logged in owner
    const shop = await Shop.findById(coffee.shop);
    if (!shop || shop.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this menu item' });
    }

    await Coffee.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coffee item removed successfully' });
  } catch (error) {
    console.error('DeleteCoffee Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error deleting coffee item' });
  }
};
