const express = require('express');
const router = express.Router();
const {
  getAvailableJobs,
  acceptJob,
  getMyDeliveries,
  getSupplierDashboard
} = require('../controllers/supplierController');

const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all supplier routes (Supplier only)
router.use(protect, authorizeRoles('supplier'));

router.get('/available', getAvailableJobs);
router.patch('/:orderId/accept', acceptJob);
router.get('/my-deliveries', getMyDeliveries);
router.get('/dashboard', getSupplierDashboard);

module.exports = router;
