import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { sequelize } from './config/database.js';
import deviceRoutes from './routes/device.routes.js';
import productRoutes from './routes/product.routes.js';
import transactionRoutes from './routes/transaction.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight for all routes
app.use(express.json());

// Database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

export default app;
