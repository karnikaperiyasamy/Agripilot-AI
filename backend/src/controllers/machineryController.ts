import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export class MachineryController {
  static async getMachinery(req: AuthRequest, res: Response) {
    try {
      const machinery = await prisma.machinery.findMany({
        where: { isAvailable: true },
        include: {
          owner: { select: { id: true, name: true, phone: true } }
        }
      });
      return res.json({ success: true, data: machinery });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async bookMachinery(req: AuthRequest, res: Response) {
    try {
      const renterId = req.user!.id;
      const { machineryId, startDate, endDate, days } = req.body;

      const item = await prisma.machinery.findUnique({ where: { id: machineryId } });
      if (!item) return res.status(404).json({ success: false, message: 'Machinery not found' });

      const duration = days ? parseInt(days) : 1;
      const totalCost = duration * item.dailyRate;

      const booking = await prisma.machineryBooking.create({
        data: {
          machineryId,
          renterId,
          startDate: new Date(startDate || Date.now()),
          endDate: new Date(endDate || (Date.now() + duration * 86400000)),
          totalCost,
          status: 'CONFIRMED'
        }
      });

      return res.status(201).json({ success: true, message: 'Rental booking registered', data: booking });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
