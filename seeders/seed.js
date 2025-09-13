import  {sequelize}  from '../config/database.js';
import { Device, Product, User, Transaction, DeviceProduct } from '../models/index.js';

const seedDatabase = async () => {
  try {
    // Sync all models
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Clear existing data
    await Transaction.destroy({ where: {} });
    await DeviceProduct.destroy({ where: {} });
    await Device.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',  
      role: 'admin',
      phone: '+1234567890'
    });
    console.log('Created admin user:', JSON.stringify(adminUser.get({ plain: true }), null, 2));

    // Create regular user
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',  
      role: 'user',
      phone: '+1987654321'
    });
    console.log('Created regular user:', JSON.stringify(regularUser.get({ plain: true }), null, 2));

    // Create products
    const products = await Product.bulkCreate([
      {
        name: 'Premium Protection',
        description: 'Ultra-thin for maximum sensitivity',
        price: 4.99,
        image: 'premium.jpg',
        stock: 100,
        category: 'condoms'
      },
      {
        name: 'Extra Safe',
        description: 'Maximum protection with ribbed texture',
        price: 3.99,
        image: 'extra-safe.jpg',
        stock: 150,
        category: 'condoms'
      },
      {
        name: 'Natural Feeling',
        description: 'Thin material for natural sensation',
        price: 4.49,
        image: 'natural.jpg',
        stock: 120,
        category: 'condoms'
      },
      {
        name: 'Flavored Pack',
        description: 'Assorted flavors for extra fun',
        price: 5.99,
        image: 'flavored.jpg',
        stock: 80,
        category: 'condoms'
      },
      {
        name: 'Lubricant Gel',
        description: 'Water-based personal lubricant',
        price: 8.99,
        image: 'lubricant.jpg',
        stock: 60,
        category: 'accessories'
      }
    ]);

    // Create devices
    const devices = await Device.bulkCreate([
      {
        name: 'Downtown Mall',
        location: 'Level 2, Near Restrooms',
        status: 'active',
        lastMaintenance: new Date(),
        capacity: 50,
        currentStock: 45
      },
      {
        name: 'University Campus',
        location: 'Student Union Building',
        status: 'active',
        lastMaintenance: new Date(),
        capacity: 40,
        currentStock: 30
      },
      {
        name: 'Central Station',
        location: 'Platform 3',
        status: 'maintenance',
        lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        capacity: 30,
        currentStock: 10
      },
      {
        name: 'City Center',
        location: 'Main Square',
        status: 'inactive',
        lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        capacity: 35,
        currentStock: 5
      }
    ]);

    // Create device-product associations
    for (const device of devices) {
      // Each device gets 3 random products
      const productIndices = new Set();
      
      while (productIndices.size < 3) {
        const randomIndex = Math.floor(Math.random() * products.length);
        productIndices.add(randomIndex);
      }
      
      for (const index of productIndices) {
        const product = products[index];
        const quantity = Math.floor(Math.random() * 10) + 5; // 5-15 items
        
        await DeviceProduct.create({
          deviceId: device.id,
          productId: product.id,
          quantity: quantity,
          lastRestocked: new Date()
        });
      }
    }

    // Create sample transactions
    const transactions = [];
    const statuses = ['completed', 'failed', 'refunded'];
    const paymentMethods = ['card', 'mobile', 'crypto'];
    
    // Generate transactions for the last 30 days
    for (let i = 0; i < 50; i++) {
      const randomDevice = devices[Math.floor(Math.random() * devices.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomUser = Math.random() > 0.5 ? adminUser : regularUser;
      const daysAgo = Math.floor(Math.random() * 30);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      
      transactions.push({
        deviceId: randomDevice.id,
        productId: randomProduct.id,
        userId: randomUser.id,
        quantity: Math.floor(Math.random() * 3) + 1,
        amount: randomProduct.price * (Math.floor(Math.random() * 3) + 1),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        createdAt: createdAt,
        updatedAt: new Date()
      });
    }
    
    await Transaction.bulkCreate(transactions);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
