import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middlewares/auth';

export class ExpertController {
  // 1. Get unresolved or pending cases
  static async getCases(req: AuthRequest, res: Response) {
    try {
      const cases = await prisma.cropHealthObservation.findMany({
        include: {
          observer: { select: { id: true, name: true, phone: true } },
          field: true,
          cropCycle: { include: { crop: true } },
          expertCases: {
            include: { expert: { select: { id: true, name: true } } }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, count: cases.length, data: cases });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 2. Submit Expert Diagnosis & Prescription
  static async prescribeCase(req: AuthRequest, res: Response) {
    try {
      const expertId = req.user!.id;
      const { observationId } = req.params;
      const { diagnosisNotes, prescription } = req.body;

      if (!diagnosisNotes || !prescription) {
        return res.status(400).json({ success: false, message: 'Diagnosis notes and prescription are required' });
      }

      const expertCase = await prisma.expertCase.create({
        data: {
          observationId,
          expertId,
          diagnosisNotes,
          prescription,
          status: 'RESOLVED'
        }
      });

      await prisma.cropHealthObservation.update({
        where: { id: observationId },
        data: { expertReviewStatus: 'REVIEWED' }
      });

      const obs = await prisma.cropHealthObservation.findUnique({ where: { id: observationId } });
      if (obs?.observerId) {
        await prisma.notification.create({
          data: {
            userId: obs.observerId,
            title: 'Expert Prescription Received',
            message: `Dr. ${req.user!.name} has verified your crop health sample and submitted a treatment plan.`,
            category: 'CROP_HEALTH'
          }
        });
      }

      return res.status(201).json({ success: true, message: 'Advisory prescription recorded and sent to farmer', data: expertCase });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Farmer Submit Query to Expert
  static async submitQuery(req: AuthRequest, res: Response) {
    try {
      const observerId = req.user!.id;
      const { symptomDescription, fieldId, cropCycleId, imageUrl, aiPredictionClass, aiConfidence } = req.body;

      if (!symptomDescription) {
        return res.status(400).json({ success: false, message: 'Query description is required' });
      }

      const observation = await prisma.cropHealthObservation.create({
        data: {
          observerId,
          fieldId: fieldId || null,
          cropCycleId: cropCycleId || null,
          symptomDescription,
          imageUrl: imageUrl || null,
          aiPredictionClass: aiPredictionClass || 'Foliar Inspection Requested',
          aiConfidence: aiConfidence || 0.92,
          expertReviewStatus: 'PENDING'
        }
      });

      // Notify Experts
      const experts = await prisma.user.findMany({ where: { role: 'EXPERT' } });
      for (const exp of experts) {
        await prisma.notification.create({
          data: {
            userId: exp.id,
            title: 'New Farmer Consultation Request 🌾',
            message: `${req.user!.name} submitted a crop health consultation request: "${symptomDescription.substring(0, 60)}..."`,
            category: 'CROP_HEALTH'
          }
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Your query has been escalated to agricultural experts. You will be notified when an expert prescribes a treatment plan.',
        data: observation
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
