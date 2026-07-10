const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'card'
  },
  transactionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'success'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
