const Order = require('../models/Order');
const SupplierEarning = require('../models/SupplierEarning');

// @desc    Get all available delivery jobs (status: ready, no supplier assigned)
// @route   GET /api/supplier/available
// @access  Private (Supplier only)
exports.getAvailableJobs = async (req, res) => {
  try {
    const jobs = await Order.find({
      orderStatus: 'ready',
      $or: [{ supplier: null }, { supplier: { $exists: false } }]
    })
      .populate('shop', 'name address phone image')
      .populate('customer', 'name phone')
      .sort({ updatedAt: 1 });

    res.json({ success: true, count: jobs.length, data: jobs });
  } catch (error) {
    console.error('GetAvailableJobs Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving delivery jobs' });
  }
};

// @desc    Accept a delivery job
// @route   PATCH /api/supplier/:orderId/accept
// @access  Private (Supplier only)
exports.acceptJob = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus !== 'ready') {
      return res.status(400).json({ success: false, message: 'Order is not ready for delivery' });
    }

    // Atomically check and set supplier to prevent race conditions between suppliers
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: req.params.orderId, orderStatus: 'ready', $or: [{ supplier: null }, { supplier: { $exists: false } }] },
      { $set: { supplier: req.user.id, orderStatus: 'accepted' } },
      { new: true }
    )
      .populate('shop', 'name address phone image')
      .populate('customer', 'name phone')
      .populate('supplier', 'name phone');

    if (!updatedOrder) {
      return res.status(400).json({ success: false, message: 'Order has already been accepted by another supplier' });
    }

    res.json({ success: true, message: 'Delivery job accepted successfully', data: updatedOrder });
  } catch (error) {
    console.error('AcceptJob Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error accepting delivery job' });
  }
};

// @desc    Get current supplier's accepted deliveries
// @route   GET /api/supplier/my-deliveries
// @access  Private (Supplier only)
exports.getMyDeliveries = async (req, res) => {
  try {
    const deliveries = await Order.find({
      supplier: req.user.id
    })
      .populate('shop', 'name address phone image')
      .populate('customer', 'name phone')
      .populate('supplier', 'name phone')
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (error) {
    console.error('GetMyDeliveries Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving your deliveries' });
  }
};

// @desc    Get supplier dashboard analytics
// @route   GET /api/supplier/dashboard
// @access  Private (Supplier only)
exports.getSupplierDashboard = async (req, res) => {
  try {
    const supplierId = req.user.id;

    // Total delivered orders count
    const totalDeliveries = await Order.countDocuments({
      supplier: supplierId,
      orderStatus: 'delivered'
    });

    // Sum total earnings and tips
    const earningsRecords = await SupplierEarning.find({ supplier: supplierId });
    
    let totalEarnings = 0;
    let totalTips = 0;
    
    earningsRecords.forEach(record => {
      totalEarnings += record.earnings;
      totalTips += record.tip;
    });

    // Get today's earnings
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todayEarningsRecords = await SupplierEarning.find({
      supplier: supplierId,
      date: { $gte: startOfToday, $lte: endOfToday }
    });

    let todayEarnings = 0;
    let todayTips = 0;

    todayEarningsRecords.forEach(record => {
      todayEarnings += record.earnings;
      todayTips += record.tip;
    });

    const todayDeliveriesCount = todayEarningsRecords.length;

    res.json({
      success: true,
      data: {
        totalDeliveries,
        earnings: Number(totalEarnings.toFixed(2)),
        tips: Number(totalTips.toFixed(2)),
        todayDeliveriesCount,
        todayEarnings: Number((todayEarnings + todayTips).toFixed(2))
      }
    });
  } catch (error) {
    console.error('GetSupplierDashboard Error:', error.message);
    res.status(500).json({ success: false, message: 'Server error retrieving dashboard analytics' });
  }
};
