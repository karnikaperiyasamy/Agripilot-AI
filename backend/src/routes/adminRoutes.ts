import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateJwt, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticateJwt, requireRole(['ADMIN']));

router.get('/stats', AdminController.getPlatformStats);
router.get('/users', AdminController.getUsers);
router.put('/users/:userId/role', AdminController.updateUserRole);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
