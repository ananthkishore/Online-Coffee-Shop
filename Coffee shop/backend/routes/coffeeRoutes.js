const express = require('express');
const router = express.Router();
const {
  getCoffeesByShop,
  createCoffee,
  updateCoffee,
  deleteCoffee
} = require('../controllers/coffeeController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public route to view a shop's menu
router.get('/shop/:shopId', getCoffeesByShop);

// Owner-only CRUD routes
router.post('/', protect, authorizeRoles('owner'), upload.single('image'), createCoffee);
router.put('/:id', protect, authorizeRoles('owner'), upload.single('image'), updateCoffee);
router.delete('/:id', protect, authorizeRoles('owner'), deleteCoffee);

module.exports = router;
