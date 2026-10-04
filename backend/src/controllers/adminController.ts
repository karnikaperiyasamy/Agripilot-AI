import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';
import { MLClientService } from '../services/mlClientService';

export class AdminController {
  // 1. Platform analytics & summary
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
            tradedVolumeQuintals: totalVolumeResult._sum.quantity || 0
          },
          agronomicReach: {
            farmsRegistered: farmCount,
            fieldsUnderDigitalTwin: fieldCount
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

  // 2. User list & role management
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      const users = await prisma.user.findMany({
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

  // 3. Change user role or status
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

  // 4. System Audit Logs
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
}
