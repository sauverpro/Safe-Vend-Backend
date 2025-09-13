import express from 'express';
import { Product, Device, DeviceProduct } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    const where = { isActive: true };
    
    if (category) where.category = category;
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    
    const products = await Product.findAll({ where });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, stock, features } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }
    
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      stock: parseInt(stock) || 0,
      features: features ? JSON.parse(features) : null,
      isActive: true
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, isActive, features } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = parseFloat(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = parseInt(stock, 10);
    if (isActive !== undefined) product.isActive = isActive === 'true';
    if (features) product.features = JSON.parse(features);
    
    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    product.isActive = false;
    await product.save();
    
    res.json({ message: 'Product deactivated successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get products by device
router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    const device = await Device.findByPk(deviceId, {
      include: [{
        model: DeviceProduct,
        as: 'deviceProducts',
        where: { isAvailable: true, quantity: { [Op.gt]: 0 } },
        include: [{
          model: Product,
          where: { isActive: true },
        }],
      }],
    });
    
    if (!device) return res.status(404).json({ error: 'Device not found' });
    
    const products = device.deviceProducts.map(dp => ({
      ...dp.Product.toJSON(),
      deviceProductId: dp.id,
      devicePrice: dp.price,
      position: dp.position,
      availableQuantity: dp.quantity
    }));
    
    res.json(products);
  } catch (error) {
    console.error('Error fetching device products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
