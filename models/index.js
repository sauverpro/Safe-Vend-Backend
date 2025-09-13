import Device from './Device.model.js';
import Product from './Product.model.js';
import DeviceProduct from './DeviceProduct.model.js';
import Transaction from './Transaction.model.js';
import User from './User.model.js';

// Define relationships
Device.belongsToMany(Product, { 
  through: DeviceProduct,
  foreignKey: 'deviceId',
  otherKey: 'productId',
  as: 'products'
});

Product.belongsToMany(Device, { 
  through: DeviceProduct,
  foreignKey: 'productId',
  otherKey: 'deviceId',
  as: 'devices'
});

// Transaction relationships
Transaction.belongsTo(Device, { foreignKey: 'deviceId', as: 'device' });
Transaction.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Add hasMany relationships
Device.hasMany(Transaction, { foreignKey: 'deviceId', as: 'transactions' });
Product.hasMany(Transaction, { foreignKey: 'productId', as: 'transactions' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });

// Export all models
export {
  Device,
  Product,
  DeviceProduct,
  Transaction,
  User
};
