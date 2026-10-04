import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'file:./agritwin.db',
  JWT_SECRET: process.env.JWT_SECRET || 'agritwin_super_secret_jwt_key_2026_secured',
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
