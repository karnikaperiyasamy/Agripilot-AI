import { Router } from 'express';
import { MarketplaceController } from '../controllers/marketplaceController';
import { authenticateJwt, requireRole } from '../middlewares/auth';

const router = Router();

// Public / Authenticated read listings
router.get('/listings', MarketplaceController.getListings);
router.get('/buyer-requirements', MarketplaceController.getBuyerRequirements);

router.use(authenticateJwt);

router.post('/listings', requireRole(['FARMER']), MarketplaceController.createListing);
router.post('/buyer-requirements', requireRole(['MERCHANT']), MarketplaceController.createBuyerRequirement);
router.get('/buyer-requirements/:requirementId/match', MarketplaceController.matchRequirementToListings);

// Offers & Negotiation
router.get('/offers', MarketplaceController.getOffers);
router.post('/offers', MarketplaceController.createOffer);
router.post('/offers/:offerId/respond', MarketplaceController.respondToOffer);

// Orders & Payments
router.get('/orders', MarketplaceController.getOrders);
router.post('/orders/:orderId/pay', MarketplaceController.processOrderPayment);
router.post('/transport/:transportRequestId/status', MarketplaceController.updateShipmentStatus);

export default router;
