import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  // deviceId: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  //   unique: false,
  // },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
    defaultValue: 'active',
  },
  lastMaintenance: {
    type: DataTypes.DATE,
  },
  qrCode: {
    type: DataTypes.TEXT,
  },
  qrCodeData: {
    type: DataTypes.STRING,
    unique: true,
  },
}, {
  timestamps: true,
  tableName: 'devices',
});

export default Device;
