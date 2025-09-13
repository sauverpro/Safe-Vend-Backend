import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  deviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id',
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id',
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.ENUM('mpesa', 'card', 'cash', 'other'),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'pending',
  },
  paymentReference: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('initiated', 'processing', 'completed', 'failed', 'cancelled'),
    defaultValue: 'initiated',
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Customer phone number for M-Pesa transactions',
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional transaction details',
  },
}, {
  timestamps: true,
  tableName: 'transactions',
  indexes: [
    {
      fields: ['transactionId'],
      unique: true,
    },
    {
      fields: ['deviceId'],
    },
    {
      fields: ['paymentStatus'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

export default Transaction;
