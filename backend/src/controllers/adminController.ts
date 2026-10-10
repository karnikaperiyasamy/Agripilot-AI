import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { MLClientService } from '../services/mlClientService';

export class AdminController {
  // 1. Comprehensive Platform Analytics & System Overview
  static async getPlatformStats(req: AuthRequest, res: Response) {
    try {
      const userCount = await prisma.user.count();
      const roleCounts = await prisma.user.groupBy({
        by: ['role'],
        _count: { id: true }
      });

      const listingCount = await prisma.marketListing.count();
      const orderCount = await prisma.order.count();
      const totalVolumeResult = await prisma.order.aggregate({
        _sum: { totalAmount: true, quantity: true }
      });

      const farmCount = await prisma.farm.count();
      const fieldCount = await prisma.field.count();
      const batchCount = await prisma.batchTraceability.count();
      const expertCasesCount = await prisma.cropHealthObservation.count();
      const poolCount = await prisma.groupPurchasePool.count();

      const aiStatus = await MLClientService.getModelStatus();
      const aiRegistry = await MLClientService.getModelRegistry();

      return res.json({
        success: true,
        data: {
          users: {
            total: userCount,
            byRole: roleCounts.reduce((acc: any, curr) => {
              acc[curr.role] = curr._count.id;
              return acc;
            }, {})
          },
          commerce: {
            activeListings: listingCount,
            totalOrders: orderCount,
            grossMerchandiseValue: totalVolumeResult._sum.totalAmount || 0,
            tradedVolumeQuintals: totalVolumeResult._sum.quantity || 0,
            activeGroupPools: poolCount
          },
          agronomicReach: {
            farmsRegistered: farmCount,
            fieldsUnderDigitalTwin: fieldCount,
            verifiedTraceabilityBatches: batchCount,
            healthCasesEscalated: expertCasesCount
          },
          aiModelInfrastructure: {
            status: aiStatus,
            registry: aiRegistry
          }
        }
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. User list & role management with search & filter
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const { role, search } = req.query;

      const whereClause: any = {};
      if (role) whereClause.role = String(role);
      if (search) {
        whereClause.OR = [
          { name: { contains: String(search) } },
          { email: { contains: String(search) } }
        ];
      }

      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          phone: true,
          isActive: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, count: users.length, data: users });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. System Activity & Audit Logs
  static async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const logs = await prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true, name: true, role: true } } }
      });
      return res.json({ success: true, data: logs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 4. Change user role or active status
  static async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { role, isActive } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          role: role || undefined,
          isActive: isActive !== undefined ? isActive : undefined
        }
      });

      return res.json({ success: true, message: 'User privileges updated', data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
