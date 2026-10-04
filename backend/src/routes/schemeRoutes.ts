import { Router } from 'express';
import { SchemeController } from '../controllers/schemeController';

const router = Router();

router.get('/', SchemeController.getAllSchemes);
router.get('/:id', SchemeController.getSchemeById);
router.get('/category/:category', SchemeController.getSchemesByCategory);
router.post('/check-eligibility', SchemeController.checkEligibility);

export default router;
