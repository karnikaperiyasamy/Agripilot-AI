import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class SchemeController {
  static async getAllSchemes(req: Request, res: Response) {
    try {
      const { state, farmerCategory, category, search } = req.query;

      let schemes = await prisma.governmentScheme.findMany({
        orderBy: { createdAt: 'asc' }
      });

      if (schemes.length === 0) {
        // Seed official government scheme records
        const officialSchemes = [
          {
            schemeName: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
            description: 'Direct income support of ₹6,000 per year in 3 equal installments of ₹2,000 directly into bank accounts of eligible farmer families.',
            eligibility: 'All landholding farmer families across states regardless of land size (excluding high net income taxpayers).',
            benefits: '₹6,000 / year direct cash transfer via Aadhaar-seeded DBTL.',
            applyUrl: 'https://pmkisan.gov.in',
            category: 'Financial Support',
            state: 'All India',
            farmerCategory: 'All Farmers',
            cropCategory: 'All Crops',
            farmType: 'All Types',
            requiredDocs: 'Aadhaar Card, Land Record / Khasra Khatauni, Bank Account Passbook',
            officialSource: 'Ministry of Agriculture & Farmers Welfare (PM-KISAN Portal)',
            lastVerified: new Date()
          },
          {
            schemeName: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
            description: 'Comprehensive crop insurance coverage against yield losses due to non-preventable natural risks (drought, flood, pest outbreak).',
            eligibility: 'All farmers growing notified crops in notified areas including sharecroppers and tenant farmers.',
            benefits: 'Maximum premium of 2.0% for Kharif, 1.5% for Rabi crops, and 5% for Annual Commercial/Horticultural crops.',
            applyUrl: 'https://pmfby.gov.in',
            category: 'Insurance',
            state: 'All India',
            farmerCategory: 'All Farmers',
            cropCategory: 'Paddy, Wheat, Pulses, Oilseeds, Maize',
            farmType: 'All Types',
            requiredDocs: 'Aadhaar Card, Land Ownership Certificate / Sowing Certificate, Bank Account Details',
            officialSource: 'Ministry of Agriculture (PMFBY Portal)',
            lastVerified: new Date()
          },
          {
            schemeName: 'PMKSY - Per Drop More Crop (Micro Irrigation)',
            description: 'Financial assistance and subsidy for installation of Drip and Sprinkler irrigation systems to improve farm water use efficiency.',
            eligibility: 'Small and marginal farmers receive 55% subsidy; other farmers receive 45% subsidy.',
            benefits: 'Up to 55% capital subsidy for Drip / Sprinkler system setup.',
            applyUrl: 'https://pmksy.gov.in',
            category: 'Irrigation',
            state: 'All India',
            farmerCategory: 'Small & Marginal Farmers',
            cropCategory: 'All Crops',
            farmType: 'Irrigated & Rainfed',
            requiredDocs: 'Aadhaar Card, Land Record, Soil & Water Test Report',
            officialSource: 'Department of Agriculture & Farmers Welfare (PMKSY)',
            lastVerified: new Date()
          },
          {
            schemeName: 'Sub-Mission on Agricultural Mechanization (SMAM)',
            description: 'Subsidy on purchase of farm machinery (Tractors, Combine Harvesters, Rotavators, Seed Drills) and Custom Hiring Centers (CHCs).',
            eligibility: 'Individual farmers, Custom Hiring Centers, FPOs and Cooperatives.',
            benefits: '40% to 50% subsidy on agricultural equipment purchase.',
            applyUrl: 'https://agrimachinery.nic.in',
            category: 'Equipment',
            state: 'All India',
            farmerCategory: 'All Farmers',
            cropCategory: 'All Crops',
            farmType: 'All Types',
            requiredDocs: 'Aadhaar Card, Land Certificate, Bank Passbook, Equipment Quotation',
            officialSource: 'FARMS Portal - Ministry of Agriculture',
            lastVerified: new Date()
          },
          {
            schemeName: 'Soil Health Card Scheme',
            description: 'Free soil testing and issue of Soil Health Cards detailing NPK status, micro-nutrients, organic carbon, and recommended fertilizer doses.',
            eligibility: 'All agricultural farmers across India.',
            benefits: 'Free lab analysis of soil sample + customized crop fertilizer advisory.',
            applyUrl: 'https://soilhealth.dac.gov.in',
            category: 'Soil Management',
            state: 'All India',
            farmerCategory: 'All Farmers',
            cropCategory: 'All Crops',
            farmType: 'All Types',
            requiredDocs: 'Field Survey Number / Khasra No, Farmer Mobile Number',
            officialSource: 'Soil Health Portal - Govt of India',
            lastVerified: new Date()
          }
        ];

        for (const s of officialSchemes) {
          await prisma.governmentScheme.create({ data: s });
        }

        schemes = await prisma.governmentScheme.findMany({ orderBy: { createdAt: 'asc' } });
      }

      // Filter in memory if query parameters supplied
      let filtered = schemes;
      if (state && state !== 'All India') {
        filtered = filtered.filter(s => s.state === 'All India' || s.state === String(state));
      }
      if (farmerCategory && farmerCategory !== 'All Farmers') {
        filtered = filtered.filter(s => s.farmerCategory === 'All Farmers' || s.farmerCategory.includes(String(farmerCategory)));
      }
      if (category) {
        filtered = filtered.filter(s => s.category.toLowerCase().includes(String(category).toLowerCase()));
      }
      if (search) {
        const q = String(search).toLowerCase();
        filtered = filtered.filter(s => s.schemeName.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
      }

      return res.json(filtered);
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

        if (s.schemeName.includes('PM-KISAN')) {
          isEligible = size <= 10.0;
          reason = 'Landholding meets eligible farmer family criteria.';
        } else if (s.schemeName.includes('PMKSY')) {
          isEligible = true;
          reason = 'Eligible for 55% subsidy on Drip and Sprinkler irrigation system equipment.';
        } else if (s.schemeName.includes('Mechanization') || s.schemeName.includes('SMAM')) {
          isEligible = true;
          reason = 'Eligible for 40-50% subsidy on custom hiring and tractor attachments.';
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
