import express from 'express';
import QRCode from 'qrcode';
import { Device, Product, DeviceProduct } from '../models/index.js';
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';

const router = express.Router();

// Get all devices
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    const devices = await Device.findAll({
      where,
      include: [
        {
          model: Product,
          as: 'products',
          through: { 
            attributes: ['id', 'quantity', 'price', 'position', 'isAvailable'] 
          },
          attributes: ['id', 'name', 'description', 'image', 'category']
        }
      ],
    });
    
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get device by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const device = await Device.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: { 
            attributes: ['id', 'quantity', 'price', 'position', 'isAvailable'] 
          },
          attributes: ['id', 'name', 'description', 'image', 'category']
        }
      ],
    });
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    console.error('Error fetching device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new device
router.post('/', async (req, res) => {
  try {
    const { name, location, status = 'active' } = req.body;
    
    if (!name || !location) {
      return res.status(400).json({ error: 'Name and location are required' });
    }
    
    const deviceId = `DEV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const qrCodeData = `device:${deviceId}`;
    
    // Generate QR code
    const qrCode = await QRCode.toDataURL(qrCodeData);
    
    const device = await Device.create({
      name,
      deviceId,
      location,
      status,
      qrCode,
      qrCodeData,
    });
    
    res.status(201).json(device);
  } catch (error) {
    console.error('Error creating device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update device
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, status } = req.body;
    
    const device = await Device.findByPk(id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    if (name) device.name = name;
    if (location) device.location = location;
    if (status) device.status = status;
    
    await device.save();
    
    res.json(device);
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete device
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const device = await Device.findByPk(id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    await device.destroy();
    
    res.json({ message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get device by QR code data
router.get('/qr/:qrData', async (req, res) => {
  try {
    const { qrData } = req.params;
    
    const device = await Device.findOne({
      where: { qrCodeData: qrData },
      include: [
        {
          model: Product,
          as: 'products',
          through: { 
            attributes: ['id', 'quantity', 'price', 'position', 'isAvailable'] 
          },
          attributes: ['id', 'name', 'description', 'image', 'category'],
          where: { isAvailable: true, quantity: { [Op.gt]: 0 } }
        }
      ],
    });
    
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    res.json(device);
  } catch (error) {
    console.error('Error fetching device by QR code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add product to device
router.post('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, quantity, price, position } = req.body;
    
    const device = await Device.findByPk(id);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Add product to device with through attributes
    await device.addProduct(product, {
      through: {
        quantity: quantity || 0,
        price: price || product.price,
        position: position || null,
        isAvailable: true
      }
    });
    
    // Return the updated device with its products
    const updatedDevice = await Device.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'products',
          through: { 
            attributes: ['id', 'quantity', 'price', 'position', 'isAvailable'] 
          },
          attributes: ['id', 'name', 'description', 'image', 'category']
        }
      ]
    });
    
    res.status(201).json(updatedDevice);
  } catch (error) {
    console.error('Error adding product to device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product in device
router.put('/:deviceId/products/:productId', async (req, res) => {
  try {
    const { deviceId, productId } = req.params;
    const { quantity, price, position, isAvailable } = req.body;
    
    const device = await Device.findByPk(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update the through table
    await device.addProduct(product, {
      through: {
        quantity,
        price,
        position,
        isAvailable: isAvailable !== undefined ? isAvailable : true
      },
      update: true // This will update if the association already exists
    });
    
    // Return the updated device with its products
    const updatedDevice = await Device.findByPk(deviceId, {
      include: [
        {
          model: Product,
          as: 'products',
          through: { 
            attributes: ['id', 'quantity', 'price', 'position', 'isAvailable'] 
          },
          attributes: ['id', 'name', 'description', 'image', 'category']
        }
      ]
    });
    
    res.json(updatedDevice);
  } catch (error) {
    console.error('Error updating product in device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove product from device
router.delete('/:deviceId/products/:productId', async (req, res) => {
  try {
    const { deviceId, productId } = req.params;
    
    const device = await Device.findByPk(deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }
    
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Remove the association
    await device.removeProduct(product);
    
    res.json({ message: 'Product removed from device successfully' });
  } catch (error) {
    console.error('Error removing product from device:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
