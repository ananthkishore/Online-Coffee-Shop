const Cart = require('../models/Cart');
const Coffee = require('../models/Coffee');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private (Customer only)
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user.id })
      .populate({
        path: 'items.coffee',
        populate: { path: 'shop', select: 'name isOpen' } // populate shop details
      });

    // If cart doesn't exist, create one
    if (!cart) {
      cart = await Cart.create({ customer: req.user.id, items: [] });
    }

    res.json({ success: true, data: cart });
  } catch (error) {
    console.error('GetCart Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving cart' });
  }
};

// @desc    Add item or update quantity in cart
// @route   POST /api/cart/add
// @access  Private (Customer only)
exports.addToCart = async (req, res) => {
  try {
    const { coffeeId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    // Check if coffee item exists and is available
    const coffee = await Coffee.findById(coffeeId);
    if (!coffee) {
      return res.status(404).json({ success: false, message: 'Coffee item not found' });
    }
    if (!coffee.isAvailable) {
      return res.status(400).json({ success: false, message: 'Coffee item is currently unavailable' });
    }

    // Get customer cart or create if not exists
    let cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) {
      cart = new Cart({ customer: req.user.id, items: [] });
    }

    // Check if coffee already exists in the cart
    const itemIndex = cart.items.findIndex(item => item.coffee.toString() === coffeeId);

    if (itemIndex > -1) {
      // Item exists, add to existing quantity
      cart.items[itemIndex].quantity += qty;
    } else {
      // New item in cart
      cart.items.push({ coffee: coffeeId, quantity: qty });
    }

    await cart.save();
    
    // Fetch and return populated cart
    const populatedCart = await Cart.findOne({ customer: req.user.id })
      .populate({
        path: 'items.coffee',
        populate: { path: 'shop', select: 'name isOpen' }
      });

    res.json({ success: true, data: populatedCart });
  } catch (error) {
    console.error('AddToCart Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error adding to cart' });
  }
};

// @desc    Remove or decrement item from cart
// @route   POST /api/cart/remove
// @access  Private (Customer only)
exports.removeFromCart = async (req, res) => {
  try {
    const { coffeeId, removeFully } = req.body;

    let cart = await Cart.findOne({ customer: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.coffee.toString() === coffeeId);

    if (itemIndex > -1) {
      if (removeFully || cart.items[itemIndex].quantity <= 1) {
        // Remove item entirely
        cart.items.splice(itemIndex, 1);
      } else {
        // Decrement quantity by 1
        cart.items[itemIndex].quantity -= 1;
      }
      await cart.save();
    }

    const populatedCart = await Cart.findOne({ customer: req.user.id })
      .populate({
        path: 'items.coffee',
        populate: { path: 'shop', select: 'name isOpen' }
      });

    res.json({ success: true, data: populatedCart });
  } catch (error) {
    console.error('RemoveFromCart Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error removing item from cart' });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart/clear
// @access  Private (Customer only)
exports.clearCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ customer: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('ClearCart Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error clearing cart' });
  }
};
