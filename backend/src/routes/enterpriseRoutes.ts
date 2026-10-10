import { Router } from 'express';
import { EnterpriseController } from '../controllers/enterpriseController';
import { authenticateJwt } from '../middlewares/auth';

const router = Router();

router.get('/forecasts', EnterpriseController.getSupplyForecasts);
router.post('/intents', authenticateJwt, EnterpriseController.createProcurementIntent);

export default router;
