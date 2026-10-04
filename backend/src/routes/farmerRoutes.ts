import { Router } from 'express';
import { FarmerController } from '../controllers/farmerController';
import { authenticateJwt, requireRole } from '../middlewares/auth';

const router = Router();

router.use(authenticateJwt);

// Dashboard overview & Digital Twin
router.get('/dashboard', requireRole(['FARMER']), FarmerController.getDashboardOverview);
router.get('/digital-twin/field/:fieldId', FarmerController.getFieldTwin);
router.get('/decisions/today', FarmerController.getTodayDecisions);

// Crop cycles (Preserves legacy /farmer/crops)
router.get('/crops', FarmerController.getCrops);
router.post('/crops', requireRole(['FARMER']), FarmerController.addCrop);
router.put('/crops/:id', requireRole(['FARMER']), FarmerController.updateCrop);
router.delete('/crops/:id', requireRole(['FARMER']), FarmerController.deleteCrop);

export default router;
