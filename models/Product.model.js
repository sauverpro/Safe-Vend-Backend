import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('classic', 'premium', 'flavored', 'sensitive', 'extra-safe'),
    defaultValue: 'classic',
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'JSON object containing product features like size, material, etc.'
  }
}, {
  timestamps: true,
  tableName: 'products',
});

export default Product;
