const mongoose = require('mongoose');

const coffeeSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please add a coffee name'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Please specify a category (e.g. Espresso, Cold Brew)'],
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coffee', coffeeSchema);
