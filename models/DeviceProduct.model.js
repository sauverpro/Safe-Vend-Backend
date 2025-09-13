import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const DeviceProduct = sequelize.define('DeviceProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  deviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: 'Price at which this product is sold in this device',
  },
  position: {
    type: DataTypes.STRING(10),
    allowNull: true,
    comment: 'Physical position in the vending machine (e.g., A1, B2)',
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  timestamps: true,
  tableName: 'device_products',
  indexes: [
    {
      unique: true,
      fields: ['deviceId', 'productId'],
    },
  ],
});

export default DeviceProduct;
