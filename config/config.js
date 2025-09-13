import dotenv from 'dotenv';

dotenv.config();

const config = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME || 'condom_vending',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: console.log,
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || null,
    database: process.env.DB_NAME ? `${process.env.DB_NAME}_test` : 'condom_vending_test',
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
};

// Ensure required production environment variables are set
if (process.env.NODE_ENV === 'production') {
  const requiredVars = ['DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_HOST'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables for production: ${missingVars.join(', ')}`);
  }
}

export default config;
