import { Router } from 'express';
import { LogisticsController } from '../controllers/logisticsController';
import { authenticateJwt, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/requests', LogisticsController.getTransportRequests);
router.get('/vehicles', LogisticsController.getVehicles);
router.post('/vehicles', requireRole(['TRANSPORTER']), LogisticsController.registerVehicle);
router.get('/load-pooling', LogisticsController.getLoadPooling);
router.post('/requests/:requestId/accept', requireRole(['TRANSPORTER']), LogisticsController.acceptTransportRequest);
router.post('/requests/:requestId/update-status', requireRole(['TRANSPORTER']), LogisticsController.updateDeliveryStatus);

export default router;
