import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export class LaborController {
  static async getLaborJobs(req: AuthRequest, res: Response) {
    try {
      const jobs = await prisma.laborJob.findMany({
        where: { status: 'OPEN' },
        include: {
          farmer: { select: { id: true, name: true, phone: true } },
          applications: true
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, data: jobs });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async createLaborJob(req: AuthRequest, res: Response) {
    try {
      const farmerId = req.user!.id;
      const { title, requiredWorkers, dailyWage, startDate, durationDays, description } = req.body;

      const job = await prisma.laborJob.create({
        data: {
          farmerId,
          title,
          requiredWorkers: parseInt(requiredWorkers) || 2,
          dailyWage: parseFloat(dailyWage) || 600.0,
          startDate: new Date(startDate || Date.now()),
          durationDays: parseInt(durationDays) || 3,
          description: description || 'Seasonal farm work',
          status: 'OPEN'
        }
      });

      return res.status(201).json({ success: true, message: 'Labor job posted', data: job });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  static async applyForJob(req: AuthRequest, res: Response) {
    try {
      const { jobId } = req.params;
      const { workerName, workerPhone, experienceYears } = req.body;

      const app = await prisma.laborApplication.create({
        data: {
          laborJobId: jobId,
          workerName: workerName || req.user?.name || 'Farm Worker',
          workerPhone: workerPhone || '9876543210',
          experienceYears: parseInt(experienceYears) || 2,
          status: 'HIRED'
        }
      });

      return res.status(201).json({ success: true, message: 'Application submitted and worker registered', data: app });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
