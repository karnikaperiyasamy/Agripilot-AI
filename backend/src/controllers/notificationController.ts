import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export class NotificationController {
  // Get notifications for logged in user
  static async getNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 30
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false }
      });

      return res.json({
        success: true,
        unreadCount,
        data: notifications
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Mark single notification as read
  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: { id, userId },
        data: { isRead: true }
      });

      return res.json({ success: true, message: 'Notification marked as read' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });

      return res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
