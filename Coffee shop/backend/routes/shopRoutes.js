const express = require('express');
const router = express.Router();
const {
  getShops,
  getMyShop,
  getShopById,
  createShop,
  updateShop,
  toggleShopStatus
} = require('../controllers/shopController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getShops);

// Owner-only routes (must be BEFORE /:id to prevent "my-shop" being matched as a dynamic segment)
router.get('/my-shop', protect, authorizeRoles('owner'), getMyShop);

// Parameterized public route (must come AFTER specific named routes)
router.get('/:id', getShopById);
router.post('/', protect, authorizeRoles('owner'), upload.single('image'), createShop);
router.put('/:id', protect, authorizeRoles('owner'), upload.single('image'), updateShop);
router.patch('/:id/toggle-status', protect, authorizeRoles('owner'), toggleShopStatus);

module.exports = router;
