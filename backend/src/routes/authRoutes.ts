import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateJwt } from '../middlewares/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateJwt, AuthController.getMe);
router.put('/language', authenticateJwt, AuthController.updateLanguage);

export default router;
