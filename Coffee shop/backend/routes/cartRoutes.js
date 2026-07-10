const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all cart routes (Customer only)
router.use(protect, authorizeRoles('customer'));

router.get('/', getCart);
router.post('/add', addToCart);
router.post('/remove', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
