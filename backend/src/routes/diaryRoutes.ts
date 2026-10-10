import { Router } from 'express';
import { DiaryController } from '../controllers/diaryController';
import { authenticateJwt } from '../middlewares/auth';

const router = Router();

router.use(authenticateJwt);

router.get('/entries', DiaryController.getEntries);
router.post('/entries', DiaryController.createEntry);

export default router;
