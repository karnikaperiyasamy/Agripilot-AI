import { Request, Response } from 'express';
import { prisma } from '../config/db';

export class GroupBuyingController {
  static async listPools(req: Request, res: Response) {
    try {
      const { category } = req.query;
      const pools = await prisma.groupPurchasePool.findMany({
        where: category ? { category: String(category) } : {},
        include: { members: true },
        orderBy: { createdAt: 'desc' }
      });

      if (pools.length === 0) {
        // Seed initial active group purchase pools if database is empty
        const initialPools = [
          {
            title: 'Bulk Organic Neem Fertilizer (40kg Bags)',
            category: 'Fertilizers',
            itemDetails: 'Cold-pressed Neem Cake Fertilizer 100% Bio-Organic (50 Bags Minimum)',
            basePricePerUnit: 850,
            discountPricePerUnit: 620,
            unit: 'Bag',
            targetQuantity: 100,
            currentQuantity: 65,
            minMembers: 5,
            closingDate: new Date(Date.now() + 10 * 86400000),
            status: 'OPEN',
            createdByUserId: 'system-admin'
          },
          {
            title: 'Certified Pusa Basmati 1121 High-Yield Seeds',
            category: 'Seeds',
            itemDetails: 'ICAR Certified Breeder Seed Foundation Grade (10kg Pack)',
            basePricePerUnit: 1400,
            discountPricePerUnit: 1050,
            unit: 'Pack',
            targetQuantity: 50,
            currentQuantity: 32,
            minMembers: 4,
            closingDate: new Date(Date.now() + 7 * 86400000),
            status: 'OPEN',
            createdByUserId: 'system-admin'
          },
          {
            title: 'Solar Powered Drip Irrigation Automation Controllers',
            category: 'Equipment',
            itemDetails: 'IoT Smart Solenoid Valves + 50W Solar Panel & Remote Mobile App Kit',
            basePricePerUnit: 14500,
            discountPricePerUnit: 11200,
            unit: 'Kit',
            targetQuantity: 15,
            currentQuantity: 11,
            minMembers: 3,
            closingDate: new Date(Date.now() + 14 * 86400000),
            status: 'OPEN',
            createdByUserId: 'system-admin'
          }
        ];

        for (const p of initialPools) {
          await prisma.groupPurchasePool.create({ data: p });
        }

        const freshPools = await prisma.groupPurchasePool.findMany({
          include: { members: true },
          orderBy: { createdAt: 'desc' }
        });
        return res.json({ success: true, data: freshPools });
      }

      return res.json({ success: true, data: pools });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async joinPool(req: Request, res: Response) {
    try {
      const farmerId = (req as any).user?.id;
      const { poolId, quantity } = req.body;

      if (!poolId || !quantity) {
        return res.status(400).json({ success: false, message: 'poolId and quantity are required' });
      }

      const pool = await prisma.groupPurchasePool.findUnique({ where: { id: poolId } });
      if (!pool) return res.status(404).json({ success: false, message: 'Group purchase pool not found' });

      const user = farmerId ? await prisma.user.findUnique({ where: { id: farmerId } }) : null;
      const farmerName = user?.name || 'Gurdev Singh (Farmer)';
      const qtyNum = parseFloat(quantity);
      const totalCost = qtyNum * pool.discountPricePerUnit;

      const member = await prisma.groupPurchaseMember.create({
        data: {
          poolId,
          farmerId: farmerId || 'system-farmer',
          farmerName,
          quantity: qtyNum,
          totalCost,
          paymentStatus: 'PAID'
        }
      });

      // Update pool current quantity
      const newQty = pool.currentQuantity + qtyNum;
      const isFulfilled = newQty >= pool.targetQuantity;

      await prisma.groupPurchasePool.update({
        where: { id: poolId },
        data: {
          currentQuantity: newQty,
          status: isFulfilled ? 'FULFILLED' : 'OPEN'
        }
      });

      return res.json({
        success: true,
        message: `Successfully joined group purchase for ${qtyNum} ${pool.unit}(s)! Total saved: Rs. ${(pool.basePricePerUnit - pool.discountPricePerUnit) * qtyNum}`,
        member
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createPool(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || 'system-admin';
      const { title, category, itemDetails, basePricePerUnit, discountPricePerUnit, unit, targetQuantity, closingDateDays = 14 } = req.body;

      const pool = await prisma.groupPurchasePool.create({
        data: {
          title,
          category,
          itemDetails,
          basePricePerUnit: parseFloat(basePricePerUnit),
          discountPricePerUnit: parseFloat(discountPricePerUnit),
          unit: unit || 'Kg',
          targetQuantity: parseFloat(targetQuantity),
          closingDate: new Date(Date.now() + Number(closingDateDays) * 86400000),
          createdByUserId: userId
        }
      });

      return res.json({ success: true, data: pool });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
