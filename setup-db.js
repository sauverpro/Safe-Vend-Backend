import { sequelize } from './config/database.js';
import { User, Device, Product, Transaction, DeviceProduct } from './models/index.js';
import bcrypt from 'bcrypt';

async function setupDatabase() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models (force: true will drop existing tables)
    console.log('Syncing database...');
    await sequelize.sync({ force: true });
    console.log('Database synced successfully!');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      phone: '+1234567890'
    });
    console.log('Created admin user:', adminUser.email);

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 10);
    const regularUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: userPassword,
      role: 'user',
      phone: '+1987654321'
    });
    console.log('Created regular user:', regularUser.email);

    console.log('Database setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
