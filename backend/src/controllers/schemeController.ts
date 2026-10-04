import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class SchemeController {
  static async getAllSchemes(req: Request, res: Response) {
    try {
      const schemes = await prisma.governmentScheme.findMany({
        orderBy: { createdAt: 'asc' }
      });
      return res.json(schemes);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getSchemeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const scheme = await prisma.governmentScheme.findUnique({ where: { id } });
      if (!scheme) return res.status(404).json({ success: false, message: 'Scheme not found' });
      return res.json(scheme);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getSchemesByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const schemes = await prisma.governmentScheme.findMany({
        where: { category: { contains: category } }
      });
      return res.json(schemes);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async checkEligibility(req: Request, res: Response) {
    try {
      const { landSizeAcres, state, cropType, isSmallMarginal } = req.body;

      const size = parseFloat(landSizeAcres) || 5.0;
      const eligibleSchemes: any[] = [];

      const all = await prisma.governmentScheme.findMany();

      for (const s of all) {
        let isEligible = true;
        let reason = 'Eligible under general agricultural guidelines.';

        if (s.schemeName === 'PM-KISAN') {
          isEligible = size <= 10.0;
          reason = 'Landholding meets eligible farmer family criteria.';
        } else if (s.schemeName.includes('Kisan Credit Card')) {
          isEligible = true;
          reason = `Eligible for subsidized crop cultivation credit up to Rs. 3 Lakhs @ 4% net interest.`;
        } else if (s.schemeName.includes('PMKSY')) {
          isEligible = true;
          reason = 'Eligible for 55% subsidy on Drip and Sprinkler irrigation system equipment.';
        }

        if (isEligible) {
          eligibleSchemes.push({
            scheme: s,
            matchReason: reason
          });
        }
      }

      return res.json({ success: true, count: eligibleSchemes.length, eligibleSchemes });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
