import { Router } from 'express';
import { GroupBuyingController } from '../controllers/groupBuyingController';
import { authenticateJwt } from '../middlewares/auth';

const router = Router();

router.get('/pools', GroupBuyingController.listPools);
router.post('/join', authenticateJwt, GroupBuyingController.joinPool);
router.post('/pools', authenticateJwt, GroupBuyingController.createPool);

export default router;
