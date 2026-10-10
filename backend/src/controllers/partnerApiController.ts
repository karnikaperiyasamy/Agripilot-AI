import { Request, Response } from 'express';
import { prisma } from '../config/db';
import crypto from 'crypto';

export class PartnerApiController {
  /**
   * Generate Organization Partner API Key
   */
  static async generateApiKey(req: Request, res: Response) {
    try {
      const { organizationName, scopes = 'read:listings,read:forecasts,write:procurement' } = req.body;

      if (!organizationName) {
        return res.status(400).json({ success: false, message: 'organizationName is required' });
      }

      const rawKey = `agri_live_pk_${crypto.randomBytes(18).toString('hex')}`;
      const apiKeyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

      const partnerKey = await prisma.partnerApiKey.create({
        data: {
          organizationName,
          apiKeyHash,
          scopes,
          rateLimitPerMin: 120,
          isActive: true
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Partner API Key generated. Store this key safely as it will not be displayed again.',
        apiKey: rawKey,
        partnerKey: {
          id: partnerKey.id,
          organizationName: partnerKey.organizationName,
          scopes: partnerKey.scopes,
          rateLimitPerMin: partnerKey.rateLimitPerMin
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Partner API: Query Crop Listings & Harvest Estimates
   */
  static async getCropListings(req: Request, res: Response) {
    try {
      const { cropName, status = 'ACTIVE' } = req.query;
      const whereClause: any = {};
      if (cropName) whereClause.cropName = { contains: String(cropName) };
      if (status) whereClause.status = String(status);

      const listings = await prisma.marketListing.findMany({
        where: whereClause,
        include: { farmer: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      return res.json({
        apiVersion: 'v1',
        partnerEndpoint: '/api/v1/partner/listings',
        count: listings.length,
        data: listings.map(l => ({
          listingId: l.id,
          cropName: l.cropName,
          variety: l.variety,
          availableQuantityQuintals: l.availableQuantity,
          askingPricePerUnit: l.askingPricePerUnit,
          qualityGrade: l.qualityGrade,
          harvestDate: l.harvestDate,
          location: l.locationName,
          status: l.status
        }))
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Register Webhook Subscription for Real-time Order & Dispatch Events
   */
  static async subscribeWebhook(req: Request, res: Response) {
    try {
      const { organizationName, targetUrl, eventTypes = 'ORDER_CREATED,SHIPMENT_DELIVERED,DISEASE_ESCALATED' } = req.body;

      if (!organizationName || !targetUrl) {
        return res.status(400).json({ success: false, message: 'organizationName and targetUrl are required' });
      }

      const secretKey = `whsec_${crypto.randomBytes(16).toString('hex')}`;

      const subscription = await prisma.webhookSubscription.create({
        data: {
          organizationName,
          targetUrl,
          secretKey,
          eventTypes,
          isActive: true
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Webhook subscription created',
        subscription: {
          id: subscription.id,
          organizationName: subscription.organizationName,
          targetUrl: subscription.targetUrl,
          eventTypes: subscription.eventTypes,
          secretKey
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
