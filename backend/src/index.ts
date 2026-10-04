import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import farmerRoutes from './routes/farmerRoutes';
import financeRoutes from './routes/financeRoutes';
import marketplaceRoutes from './routes/marketplaceRoutes';
import logisticsRoutes from './routes/logisticsRoutes';
import machineryRoutes from './routes/machineryRoutes';
import laborRoutes from './routes/laborRoutes';
import expertRoutes from './routes/expertRoutes';
import consumerRoutes from './routes/consumerRoutes';
import adminRoutes from './routes/adminRoutes';
import schemeRoutes from './routes/schemeRoutes';
import aiRoutes from './routes/aiRoutes';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'AgriTwin AI API Gateway',
    timestamp: new Date().toISOString(),
    environment: ENV.NODE_ENV
  });
});

import notificationRoutes from './routes/notificationRoutes';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/machinery', machineryRoutes);
app.use('/api/labor', laborRoutes);
app.use('/api/expert', expertRoutes);
app.use('/api/consumer', consumerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

// Static Web App Serving (Vite React Build)
import path from 'path';
import fs from 'fs';
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Centralized Error Handling
app.use(errorHandler);

import { exec } from 'child_process';

if (process.env.NODE_ENV !== 'test') {
  app.listen(ENV.PORT, () => {
    console.log(`====================================================`);
    console.log(`🌾 AgriPilot AI Gateway Server running on port ${ENV.PORT}`);
    console.log(`📡 Health Check: http://localhost:${ENV.PORT}/api/health`);
    console.log(`🤖 ML Service: ${ENV.ML_SERVICE_URL}`);
    console.log(`🌐 Application Web UI: http://localhost:3000`);
    console.log(`====================================================`);
  });
}

export default app;
