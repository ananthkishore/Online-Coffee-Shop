const express = require('express');
const router = express.Router();
const {
  createOrder,
  getCustomerOrders,
  getOwnerOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// All order routes are protected
router.use(protect);

router.post('/', authorizeRoles('customer'), createOrder);
router.get('/customer', authorizeRoles('customer'), getCustomerOrders);
router.get('/owner', authorizeRoles('owner'), getOwnerOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorizeRoles('owner', 'supplier'), updateOrderStatus);

module.exports = router;
