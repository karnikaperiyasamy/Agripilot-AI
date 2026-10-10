import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class EnterpriseController {
  /**
   * Enterprise B2B Supply Chain Overview & Aggregated Crop Supply Forecast
   */
  static async getSupplyForecasts(req: Request, res: Response) {
    try {
      const { region = 'South India (Tamil Nadu & AP)' } = req.query;

      const supplyHeatmap = [
        { cropName: 'Pusa Basmati 1121 Rice', region: 'Punjab / Haryana', estimatedHarvestQuintals: 45000, peakAvailability: 'October 2026', avgMandiPrice: 4250 },
        { cropName: 'Erode Organic Turmeric', region: 'Tamil Nadu (Erode & Salem)', estimatedHarvestQuintals: 18000, peakAvailability: 'November 2026', avgMandiPrice: 8900 },
        { cropName: 'Coimbatore Hybrid Cotton', region: 'Tamil Nadu (Coimbatore)', estimatedHarvestQuintals: 22000, peakAvailability: 'October 2026', avgMandiPrice: 6700 },
        { cropName: 'Yellow Maize / Corn', region: 'Karnataka / AP', estimatedHarvestQuintals: 35000, peakAvailability: 'Immediate', avgMandiPrice: 2200 }
      ];

      const supplierReliability = [
        { supplierName: 'Kongu Naadu FPO Co. Ltd', reliabilityScore: 98.4, fulfilledOrders: 142, qualityPassRate: 99.1 },
        { supplierName: 'Green Valley Farmers Producer Org', reliabilityScore: 96.8, fulfilledOrders: 89, qualityPassRate: 97.5 },
        { supplierName: 'Sahyadri Agro Federation', reliabilityScore: 95.2, fulfilledOrders: 110, qualityPassRate: 96.0 }
      ];

      const qualityRejectionStats = {
        totalInspectedQuintals: 12500,
        acceptedQuintals: 12150,
        rejectedQuintals: 350,
        rejectionRatePercent: 2.8,
        commonRejectionReasons: ['Moisture content above 14%', 'Foreign matter / chaff exceeding 1.5%']
      };

      return res.json({
        success: true,
        region: String(region),
        supplyHeatmap,
        supplierReliability,
        qualityRejectionStats
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Bulk Procurement Contract Intent Creation
   */
  static async createProcurementIntent(req: Request, res: Response) {
    try {
      const { buyerOrganization, cropName, requiredQuantityQuintals, maxBudgetPerQuintal, deliveryLocation } = req.body;

      if (!buyerOrganization || !cropName || !requiredQuantityQuintals) {
        return res.status(400).json({ success: false, message: 'buyerOrganization, cropName, and requiredQuantityQuintals are required' });
      }

      const intent = {
        intentId: `ENT-INTENT-${Math.floor(10000 + Math.random() * 90000)}`,
        buyerOrganization,
        cropName,
        requiredQuantityQuintals: parseFloat(requiredQuantityQuintals),
        maxBudgetPerQuintal: parseFloat(maxBudgetPerQuintal || '4500'),
        deliveryLocation: deliveryLocation || 'Central Logistics Terminal',
        status: 'ACTIVE_BIDDING',
        matchedFPOs: ['Kongu Naadu FPO Co. Ltd', 'Green Valley Farmers Producer Org'],
        createdAt: new Date().toISOString()
      };

      return res.status(201).json({ success: true, message: 'Enterprise bulk procurement intent published', data: intent });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
