import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export class LogisticsController {
  // 1. Get available transport jobs / requests
  static async getTransportRequests(req: AuthRequest, res: Response) {
    try {
      const requests = await prisma.transportRequest.findMany({
        include: {
          order: {
            include: {
              buyer: { select: { id: true, name: true, phone: true } },
              seller: { select: { id: true, name: true, phone: true } }
            }
          },
          deliveryUpdates: { orderBy: { timestamp: 'desc' } }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json({ success: true, count: requests.length, data: requests });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. Claim / Accept Transport Job
  static async acceptTransportRequest(req: AuthRequest, res: Response) {
    try {
      const transporterId = req.user!.id;
      const { requestId } = req.params;
      const { driverName, driverPhone, vehicleRegNumber } = req.body;

      const updated = await prisma.transportRequest.update({
        where: { id: requestId },
        data: {
          transporterId,
          status: 'ACCEPTED',
          driverName: driverName || 'Rajinder Pal',
          driverPhone: driverPhone || '9876500112',
          vehicleRegNumber: vehicleRegNumber || 'PB-10-CZ-4482'
        }
      });

      await prisma.deliveryUpdate.create({
        data: {
          transportRequestId: requestId,
          statusText: 'Vehicle Dispatched to Farm for Loading',
          locationName: 'Ludhiana Fleet Hub'
        }
      });

      return res.json({ success: true, message: 'Transport booking confirmed', data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Post Delivery Tracking Update
  static async updateDeliveryStatus(req: AuthRequest, res: Response) {
    try {
      const { requestId } = req.params;
      const { statusText, locationName, newStatus } = req.body;

      const update = await prisma.deliveryUpdate.create({
        data: {
          transportRequestId: requestId,
          statusText,
          locationName
        }
      });

      if (newStatus) {
        await prisma.transportRequest.update({
          where: { id: requestId },
          data: { status: newStatus }
        });

        // If delivered, update associated Order status
        if (newStatus === 'DELIVERED') {
          const reqItem = await prisma.transportRequest.findUnique({ where: { id: requestId } });
          if (reqItem?.orderId) {
            await prisma.order.update({
              where: { id: reqItem.orderId },
              data: { status: 'DELIVERED', paymentStatus: 'COMPLETED' }
            });
          }
        }
      }

      return res.json({ success: true, message: 'Transit checkpoint logged', data: update });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
