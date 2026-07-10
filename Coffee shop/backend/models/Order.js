const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  items: [
    {
      coffee: {
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Coffee',
          required: true
        },
        name: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        image: {
          type: String,
          default: ''
        }
      },
      quantity: {
        type: Number,
        required: true,
        default: 1
      }
    }
  ],
  subtotal: {
    type: Number,
    required: true
  },
  tip: {
    type: Number,
    default: 0
  },
  deliveryFee: {
    type: Number,
    default: 2.50
  },
  total: {
    type: Number,
    required: true
  },
  address: {
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    houseNo: { type: String, required: true },
    street: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: { type: String }
  },
  paymentMethod: {
    type: String,
    enum: ['Google Pay', 'PhonePe', 'Cash on Delivery', 'Credit Card'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'COD'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'received', 'ready', 'accepted', 'picked_up', 'delivered'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
