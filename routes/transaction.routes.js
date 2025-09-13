import express from 'express';
import { Transaction, Device, Product, DeviceProduct } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

// Get all transactions with filters
router.get('/', async (req, res) => {
  try {
    const { 
      search = '', 
      status = 'all', 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply status filter
    if (status !== 'all') {
      where.status = status;
    }

    // Apply date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    // Apply search filter
    if (search) {
      where[Op.or] = [
        { transactionId: { [Op.like]: `%${search}%` } },
        { paymentReference: { [Op.like]: `%${search}%` } },
        { customerPhone: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where,
      include: [
        { model: Device, as: 'device', attributes: ['name', 'location'] },
        { model: Product, as: 'product', attributes: ['name', 'price'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      transactions: transactions.map(t => ({
        id: t.id,
        transactionId: t.transactionId,
        status: t.status,
        paymentStatus: t.paymentStatus,
        amount: t.amount,
        paymentMethod: t.paymentMethod,
        product: t.product,
        device: t.device,
        customerPhone: t.customerPhone,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }))
    });
    
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new transaction (initiate purchase)
router.post('/', async (req, res) => {
  try {
    const { deviceId, productId, paymentMethod, customerPhone, quantity = 1 } = req.body;

    // Validate required fields
    if (!deviceId || !productId || !paymentMethod) {
      return res.status(400).json({ 
        error: 'Device ID, Product ID, and payment method are required' 
      });
    }

    // Check if device exists and is active
    const device = await Device.findOne({ 
      where: { 
        id: deviceId, 
        status: 'active' 
      } 
    });
    
    if (!device) {
      return res.status(400).json({ 
        error: 'Device not found or inactive' 
      });
    }

    // Check if product exists and is in stock in the device
    const deviceProduct = await DeviceProduct.findOne({
      where: { 
        deviceId,
        productId,
        isAvailable: true,
        quantity: { [Op.gte]: quantity }
      },
      include: ['product']
    });

    if (!deviceProduct) {
      return res.status(400).json({ 
        error: 'Product not available or out of stock in this device' 
      });
    }

    // Create transaction
    const transaction = await Transaction.create({
      transactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      deviceId,
      productId,
      quantity: parseInt(quantity),
      amount: deviceProduct.price * quantity,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'initiated',
      customerPhone: paymentMethod === 'mpesa' ? customerPhone : null,
    });

    // In a real application, you would integrate with a payment provider here
    // For now, we'll simulate a successful payment
    
    // Process payment (simulated)
    setTimeout(async () => {
      try {
        // Update transaction status
        await transaction.update({ 
          paymentStatus: 'completed',
          status: 'completed',
          paymentReference: `PAY-${Date.now()}`
        });

        // Update device product quantity
        await deviceProduct.decrement('quantity', { by: quantity });
        
        // If quantity reaches zero, mark as unavailable
        if (deviceProduct.quantity - quantity <= 0) {
          await deviceProduct.update({ isAvailable: false });
        }

        // In a real application, you would trigger the vending machine here
        console.log(`Vending ${quantity} of product ${productId} from device ${deviceId}`);
        
      } catch (error) {
        console.error('Error processing payment:', error);
        await transaction.update({ 
          paymentStatus: 'failed',
          status: 'failed',
          metadata: { error: error.message }
        });
      }
    }, 2000); // Simulate 2 second payment processing

    res.status(201).json({
      message: 'Transaction initiated',
      transactionId: transaction.transactionId,
      status: transaction.status,
      amount: transaction.amount,
      product: deviceProduct.product.name
    });
    
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction status
router.get('/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Transaction.findOne({
      where: { transactionId },
      include: [
        { model: Device, as: 'device', attributes: ['name', 'location'] },
        { model: Product, as: 'product', attributes: ['name', 'price'] }
      ]
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    res.json({
      transactionId: transaction.transactionId,
      status: transaction.status,
      paymentStatus: transaction.paymentStatus,
      amount: transaction.amount,
      product: transaction.product,
      device: transaction.device,
      createdAt: transaction.createdAt
    });
    
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transactions by device
router.get('/device/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: { deviceId },
      include: [
        { model: Product, as: 'product', attributes: ['name', 'price'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
    res.json({
      total: count,
      transactions: transactions.map(t => ({
        id: t.id,
        transactionId: t.transactionId,
        status: t.status,
        paymentStatus: t.paymentStatus,
        amount: t.amount,
        product: t.product,
        createdAt: t.createdAt
      }))
    });
    
  } catch (error) {
    console.error('Error fetching device transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
