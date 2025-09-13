import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientId: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  merchantTransactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  payerTelephoneNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  description: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  paymentOperatorTransactionId: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  basePayTransactionId: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
  },
  transactionFee: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  collectedAmount: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  monthsPaid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  paymentProviderTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  callbackUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  trackId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Additional timestamps
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'payments',
  timestamps: true,
  underscored: false,
});

export default Payment;
