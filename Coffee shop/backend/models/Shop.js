const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a shop name'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  image: {
    type: String,
    default: '' // stores the path of the uploaded image
  },
  openTime: {
    type: String,
    required: [true, 'Please add open time (e.g. 08:00)']
  },
  closeTime: {
    type: String,
    required: [true, 'Please add close time (e.g. 20:00)']
  },
  isOpen: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shop', shopSchema);
