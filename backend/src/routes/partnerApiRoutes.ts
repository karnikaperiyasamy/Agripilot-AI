import { Router } from 'express';
import { PartnerApiController } from '../controllers/partnerApiController';

const router = Router();

// Partner API v1 Endpoints
router.post('/partner/keys', PartnerApiController.generateApiKey);
router.get('/partner/listings', PartnerApiController.getCropListings);
router.post('/webhooks/subscriptions', PartnerApiController.subscribeWebhook);

export default router;
