import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { DigitalTwinService } from '../services/digitalTwinService';

export class FarmerController {
  // 1. Get farmer's overview (farms, fields, active cycles)
  static async getDashboardOverview(req: AuthRequest, res: Response) {
    try {
      const farmerId = req.user!.id;

      const farms = await prisma.farm.findMany({
        where: { farmerId },
        include: {
          fields: {
            include: {
              cropCycles: {
                orderBy: { createdAt: 'desc' },
                take: 1,
                include: { crop: true }
              },
              soilRecords: { orderBy: { testDate: 'desc' }, take: 1 }
            }
          },
          weatherRecords: { orderBy: { recordedDate: 'desc' }, take: 1 }
        }
      });

      const todayDecisions = await DigitalTwinService.getDailyDecisionEngine(farmerId);

      const recentExpenses = await prisma.expense.findMany({
        where: { farmerId },
        orderBy: { expenseDate: 'desc' },
        take: 5
      });

      const totalExpenses = await prisma.expense.aggregate({
        where: { farmerId },
        _sum: { amount: true }
      });

      const notifications = await prisma.notification.findMany({
        where: { userId: farmerId },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      return res.json({
        success: true,
        data: {
          farms,
          todayDecisions,
          summary: {
            totalFarms: farms.length,
            totalFields: farms.reduce((acc, f) => acc + f.fields.length, 0),
            totalExpenses: totalExpenses._sum.amount || 0,
            pendingAlerts: notifications.length
          },
          recentExpenses,
          notifications
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. Digital Twin for a specific field
  static async getFieldTwin(req: AuthRequest, res: Response) {
    try {
      const { fieldId } = req.params;
      const twin = await DigitalTwinService.getFieldDigitalTwin(fieldId);
      return res.json({ success: true, data: twin });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Today's Farm Decisions
  static async getTodayDecisions(req: AuthRequest, res: Response) {
    try {
      const decisions = await DigitalTwinService.getDailyDecisionEngine(req.user!.id);
      return res.json({ success: true, data: decisions });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 4. Crop Cycles (Backward compatible with legacy /farmer/crops)
  static async getCrops(req: AuthRequest, res: Response) {
    try {
      const farmerId = req.user!.id;
      const cycles = await prisma.cropCycle.findMany({
        where: { field: { farm: { farmerId } } },
        include: {
          crop: true,
          field: { select: { id: true, name: true, areaAcres: true } },
          expenses: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Format to support both legacy and modern UI
      const formatted = cycles.map(c => ({
        id: c.id,
        cropName: c.crop.name,
        variety: c.variety,
        area: c.field.areaAcres,
        season: c.crop.season,
        status: c.status,
        expectedYield: c.targetYieldQuintals,
        actualYield: c.actualYieldQuintals,
        marketPrice: c.expectedMarketPrice,
        plantingDate: c.sowingDate.toISOString().split('T')[0],
        expectedHarvestDate: c.expectedHarvestDate.toISOString().split('T')[0],
        currentGrowthStage: c.currentGrowthStage,
        fieldId: c.field.id,
        fieldName: c.field.name,
        totalExpenses: c.expenses.reduce((s, e) => s + e.amount, 0)
      }));

      return res.json(formatted);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async addCrop(req: AuthRequest, res: Response) {
    try {
      const farmerId = req.user!.id;
      const {
        cropName,
        variety = 'Standard',
        area,
        season = 'Kharif',
        expectedYield = 25.0,
        marketPrice = 3000.0,
        plantingDate,
        expectedHarvestDate,
        fieldId
      } = req.body;

      // Find or create crop catalog item
      let crop = await prisma.crop.findFirst({ where: { name: cropName } });
      if (!crop) {
        crop = await prisma.crop.create({
          data: { name: cropName, season }
        });
      }

      // Find field or use default
      let targetFieldId = fieldId;
      let locationName = 'Ludhiana Farm Gate';
      if (!targetFieldId) {
        let field = await prisma.field.findFirst({
          where: { farm: { farmerId } },
          include: { farm: true }
        });
        if (!field) {
          const farm = await prisma.farm.create({
            data: { farmerId, name: 'Green Valley Farm', locationName: 'Ludhiana Farm Gate' }
          });
          field = await prisma.field.create({
            data: { farmId: farm.id, name: 'Main Field', areaAcres: area ? parseFloat(area) : 5.0 }
          });
          locationName = farm.locationName;
        } else {
          locationName = field.farm.locationName;
        }
        targetFieldId = field.id;
      }

      const cycle = await prisma.cropCycle.create({
        data: {
          fieldId: targetFieldId,
          cropId: crop.id,
          variety,
          sowingDate: plantingDate ? new Date(plantingDate) : new Date(),
          expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : new Date(Date.now() + 120 * 86400000),
          status: 'GROWING',
          currentGrowthStage: 'Vegetative',
          targetYieldQuintals: expectedYield ? parseFloat(expectedYield) : 25.0,
          expectedMarketPrice: marketPrice ? parseFloat(marketPrice) : 3000.0
        },
        include: { crop: true, field: true }
      });

      // Auto-publish to ProduceListing marketplace so it is instantly visible to Merchants & Consumers
      await prisma.produceListing.create({
        data: {
          farmerId,
          cropName,
          variety,
          availableQuantity: expectedYield ? parseFloat(expectedYield) : 25.0,
          unit: 'Quintals',
          askingPricePerUnit: marketPrice ? parseFloat(marketPrice) : 3000.0,
          qualityGrade: 'Grade A',
          locationName: locationName,
          status: 'AVAILABLE'
        }
      });

      return res.status(201).json({
        success: true,
        message: 'Crop registered in field digital twin & marketplace successfully',
        data: cycle
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateCrop(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { cropName, area, expectedYield, marketPrice, plantingDate, expectedHarvestDate, status, currentGrowthStage } = req.body;

      const updated = await prisma.cropCycle.update({
        where: { id },
        data: {
          targetYieldQuintals: expectedYield ? parseFloat(expectedYield) : undefined,
          expectedMarketPrice: marketPrice ? parseFloat(marketPrice) : undefined,
          sowingDate: plantingDate ? new Date(plantingDate) : undefined,
          expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : undefined,
          status: status || undefined,
          currentGrowthStage: currentGrowthStage || undefined
        }
      });

      return res.json({ success: true, message: 'Crop details updated', data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteCrop(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await prisma.cropCycle.delete({ where: { id } });
      return res.json({ success: true, message: 'Crop cycle removed' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
