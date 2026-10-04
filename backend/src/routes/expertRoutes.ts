import { Router } from 'express';
import { ExpertController } from '../controllers/expertController';
import { authenticateJwt, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/cases', ExpertController.getCases);
router.post('/query', ExpertController.submitQuery);
router.post('/cases/:observationId/prescribe', requireRole(['EXPERT']), ExpertController.prescribeCase);

export default router;
