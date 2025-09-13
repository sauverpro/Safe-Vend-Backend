const mongoose = require('mongoose');
const config = require('../config/database');

// Import models
const User = require('../models/User.model');
const Device = require('../models/Device.model');
const Product = require('../models/Product.model');
const Transaction = require('../models/Transaction.model');
const DeviceProduct = require('../models/DeviceProduct.model');

// Import seed data
const users = require('./data/users');
const devices = require('./data/devices');
const products = require('./data/products');
const transactions = require('./data/transactions');
const deviceProducts = require('./data/deviceProducts');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.database, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  try {
    await User.deleteMany({});
    await Device.deleteMany({});
    await Product.deleteMany({});
    await Transaction.deleteMany({});
    await DeviceProduct.deleteMany({});
    console.log('Database cleared!');
  } catch (err) {
    console.error('Error clearing database:', err);
    process.exit(1);
  }
};

// Import all data
const importData = async () => {
  try {
    await connectDB();
    await clearData();

    // Insert data
    const createdUsers = await User.insertMany(users);
    console.log('Users seeded!');

    const createdProducts = await Product.insertMany(products);
    console.log('Products seeded!');

    const createdDevices = await Device.insertMany(devices);
    console.log('Devices seeded!');

    // Update deviceProducts with actual IDs
    const updatedDeviceProducts = deviceProducts.map(dp => {
      const device = createdDevices.find(d => d.deviceId === dp.device);
      const product = createdProducts.find(p => p.sku === dp.product);
      return {
        ...dp,
        device: device._id,
        product: product._id
      };
    });

    await DeviceProduct.insertMany(updatedDeviceProducts);
    console.log('Device-Product relationships seeded!');

    // Update transactions with actual IDs
    const updatedTransactions = await Promise.all(transactions.map(async t => {
      const device = createdDevices.find(d => d.deviceId === t.device);
      const user = createdUsers.find(u => u.email === t.user);
      
      // Get product details for each item in the transaction
      const items = await Promise.all(t.items.map(async item => {
        const product = createdProducts.find(p => p.sku === item.product);
        return {
          product: product._id,
          quantity: item.quantity,
          price: item.price
        };
      }));

      return {
        ...t,
        device: device._id,
        user: user._id,
        items,
        totalAmount: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };
    }));

    await Transaction.insertMany(updatedTransactions);
    console.log('Transactions seeded!');

    console.log('All data imported!');
    process.exit(0);
  } catch (err) {
    console.error('Error importing data:', err);
    process.exit(1);
  }
};

// Run the seeder
if (process.argv[2] === '-d') {
  // Clear data only
  (async () => {
    await connectDB();
    await clearData();
    process.exit(0);
  })();
} else {
  // Import all data
  importData();
}
