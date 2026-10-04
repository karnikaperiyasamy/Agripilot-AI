import { Router } from 'express';
import { MachineryController } from '../controllers/machineryController';
import { authenticateJwt } from '../middlewares/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/', MachineryController.getMachinery);
router.post('/book', MachineryController.bookMachinery);

export default router;
