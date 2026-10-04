import { Router } from 'express';
import { ConsumerController } from '../controllers/consumerController';
import { authenticateJwt } from '../middlewares/auth';

const router = Router();

router.get('/produce', ConsumerController.getFreshProduce);
router.post('/orders', authenticateJwt, ConsumerController.placeDirectOrder);
router.get('/orders', authenticateJwt, ConsumerController.getMyOrders);

export default router;
