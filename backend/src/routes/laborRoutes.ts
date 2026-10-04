import { Router } from 'express';
import { LaborController } from '../controllers/laborController';
import { authenticateJwt, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/jobs', LaborController.getLaborJobs);
router.post('/jobs', requireRole(['FARMER']), LaborController.createLaborJob);
router.post('/jobs/:jobId/apply', LaborController.applyForJob);

export default router;
