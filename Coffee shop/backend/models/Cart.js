const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [
    {
      coffee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coffee',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: [1, 'Quantity must be at least 1']
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
