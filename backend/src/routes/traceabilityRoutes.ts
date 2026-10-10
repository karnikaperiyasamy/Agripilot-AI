import { Router } from 'express';
import { TraceabilityController } from '../controllers/traceabilityController';
import { authenticateJwt } from '../middlewares/auth';

const router = Router();

// Public verified batch view endpoint for QR code scanning
router.get('/batch/:batchCode', TraceabilityController.getBatchDetails);

// Authenticated endpoints
router.post('/create-batch', authenticateJwt, TraceabilityController.createBatch);
router.get('/my-batches', authenticateJwt, TraceabilityController.listBatches);

export default router;
