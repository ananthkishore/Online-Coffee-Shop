const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment } = require('../controllers/paymentController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/create-payment-intent', protect, authorizeRoles('customer'), createPaymentIntent);
router.post('/confirm', protect, authorizeRoles('customer'), confirmPayment);

module.exports = router;
