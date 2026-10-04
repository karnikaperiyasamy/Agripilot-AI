import { Router } from 'express';
import { LogisticsController } from '../controllers/logisticsController';
import { authenticateJwt, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/requests', LogisticsController.getTransportRequests);
router.post('/requests/:requestId/accept', requireRole(['TRANSPORTER']), LogisticsController.acceptTransportRequest);
router.post('/requests/:requestId/update-status', requireRole(['TRANSPORTER']), LogisticsController.updateDeliveryStatus);

export default router;
