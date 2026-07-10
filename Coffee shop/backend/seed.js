const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Shop = require('./models/Shop');
const Coffee = require('./models/Coffee');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Payment = require('./models/Payment');
const SupplierEarning = require('./models/SupplierEarning');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/coffee_shop');
    console.log('Connected to MongoDB for seeding...');

    // Clear all existing data
    await User.deleteMany();
    await Shop.deleteMany();
    await Coffee.deleteMany();
    await Cart.deleteMany();
    await Order.deleteMany();
    await Payment.deleteMany();
    await SupplierEarning.deleteMany();
    console.log('Database cleared.');

    // 1. Seed Users (passwords will be automatically hashed by User pre-save hook)
    const owner = await User.create({
      name: 'Oliver Owner',
      email: 'owner@gmail.com',
      password: 'password123',
      role: 'owner',
      phone: '+1 (555) 111-2222'
    });

    const supplier = await User.create({
      name: 'Sam Supplier',
      email: 'supplier@gmail.com',
      password: 'password123',
      role: 'supplier',
      phone: '+1 (555) 333-4444'
    });

    const customer = await User.create({
      name: 'Claire Customer',
      email: 'customer@gmail.com',
      password: 'password123',
      role: 'customer',
      phone: '+1 (555) 555-6666'
    });

    console.log('Users seeded successfully.');

    // 2. Seed Shop
    const shop = await Shop.create({
      owner: owner._id,
      name: 'Mocha Magic',
      description: 'Handcrafted espresso beverages, premium nitro cold brews, and fresh daily organic pastries.',
      address: '742 Evergreen Terrace, Springfield',
      phone: '+1 (555) 777-8888',
      image: '', // empty to use fallback or placeholder
      openTime: '07:00',
      closeTime: '21:00',
      isOpen: true
    });

    console.log('Coffee Shop seeded successfully.');

    // 3. Seed Coffee items
    await Coffee.create([
      {
        shop: shop._id,
        name: 'Vanilla Iced Latte',
        description: 'Chilled espresso blended with velvety whole milk, premium Madagascar vanilla syrup, served over ice.',
        price: 4.50,
        category: 'Latte',
        isAvailable: true
      },
      {
        shop: shop._id,
        name: 'Caramel Macchiato',
        description: 'Freshly steamed milk with vanilla-flavored syrup marked with espresso and drizzled with caramel sauce.',
        price: 5.25,
        category: 'Latte',
        isAvailable: true
      },
      {
        shop: shop._id,
        name: 'Double Espresso Shot',
        description: 'Rich, full-bodied espresso shot featuring a dense crema and a complex sweet, chocolaty flavor profile.',
        price: 2.75,
        category: 'Espresso',
        isAvailable: true
      },
      {
        shop: shop._id,
        name: 'Nitro Cold Brew',
        description: 'Slow-steeped cold brew coffee infused with nitrogen for a cascading body, rich foam, and naturally sweet taste.',
        price: 4.95,
        category: 'Cold Brew',
        isAvailable: true
      },
      {
        shop: shop._id,
        name: 'Warm Cinnamon Roll',
        description: 'Freshly baked flaky pastry swirled with brown sugar cinnamon and topped with sweet cream cheese frosting.',
        price: 3.50,
        category: 'Pastry',
        isAvailable: true
      }
    ]);

    console.log('Coffee Menu seeded successfully.');
    console.log('Database seeding complete! All mock records are active.');
    
    // Print logins for ease of access
    console.log('\n--- Mock Login Credentials ---');
    console.log('Customer: customer@gmail.com / password123');
    console.log('Owner:    owner@gmail.com    / password123');
    console.log('Supplier: supplier@gmail.com / password123');
    console.log('-------------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
