import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class DiaryController {
  static async getEntries(req: Request, res: Response) {
    try {
      const farmerId = (req as any).user?.id;
      const entries = await prisma.farmDiaryEntry.findMany({
        where: farmerId ? { farmerId } : {},
        orderBy: { activityDate: 'desc' },
        take: 50
      });

      if (entries.length === 0 && farmerId) {
        // Seed baseline initial entries for clean farmer digital diary experience
        const initialEntries = [
          {
            farmerId,
            cropName: 'Pusa Basmati 1121 Rice',
            activityType: 'Sowing',
            activityDate: new Date(Date.now() - 90 * 86400000),
            details: 'Planted breeder seed foundation batch @ 10kg/acre',
            quantityOrArea: '5 Acres',
            costAmount: 4500
          },
          {
            farmerId,
            cropName: 'Pusa Basmati 1121 Rice',
            activityType: 'Fertilizer',
            activityDate: new Date(Date.now() - 60 * 86400000),
            details: 'Applied Neem-Coated Urea 45kg bag + Zinc Sulphate 5kg',
            quantityOrArea: '5 Bags',
            costAmount: 2850
          },
          {
            farmerId,
            cropName: 'Pusa Basmati 1121 Rice',
            activityType: 'Irrigation',
            activityDate: new Date(Date.now() - 15 * 86400000),
            details: '18mm Drip irrigation cycle executed (182,000 Liters)',
            quantityOrArea: '18mm Drip',
            costAmount: 800
          }
        ];

        for (const e of initialEntries) {
          await prisma.farmDiaryEntry.create({ data: e });
        }

        const freshEntries = await prisma.farmDiaryEntry.findMany({
          where: { farmerId },
          orderBy: { activityDate: 'desc' }
        });
        return res.json({ success: true, data: freshEntries });
      }

      return res.json({ success: true, data: entries });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createEntry(req: Request, res: Response) {
    try {
      const farmerId = (req as any).user?.id;
      const { cropName, activityType, details, quantityOrArea, costAmount, activityDate } = req.body;

      if (!cropName || !activityType) {
        return res.status(400).json({ success: false, message: 'cropName and activityType are required' });
      }

      const costVal = parseFloat(costAmount || '0');

      const entry = await prisma.farmDiaryEntry.create({
        data: {
          farmerId: farmerId || 'system-farmer',
          cropName,
          activityType,
          details: details || '',
          quantityOrArea: quantityOrArea || '',
          costAmount: costVal,
          activityDate: activityDate ? new Date(activityDate) : new Date()
        }
      });

      // Automatically sync to Expense model if costAmount > 0
      if (farmerId && costVal > 0) {
        await prisma.expense.create({
          data: {
            farmerId,
            category: activityType === 'Fertilizer' ? 'Fertilizers' : activityType === 'Sowing' ? 'Seeds' : activityType === 'Labour' ? 'Labor' : 'Other',
            amount: costVal,
            description: `[Digital Diary] ${cropName} - ${details || activityType}`
          }
        });
      }

      return res.json({ success: true, data: entry });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
