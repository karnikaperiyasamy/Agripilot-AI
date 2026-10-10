import { Router } from 'express';
import { FPOController } from '../controllers/fpoController';
import { authenticateJwt } from '../middlewares/auth';

const router = Router();

router.get('/organizations', FPOController.getOrganizations);
router.post('/organizations', authenticateJwt, FPOController.createOrganization);
router.get('/organizations/:fpoId/aggregation', FPOController.getFPOAggregation);

export default router;
