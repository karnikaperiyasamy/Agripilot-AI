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
            title: 'Expert Prescription Received 🩺',
            message: `Dr. ${req.user!.name} has verified your crop health sample and submitted a treatment plan: ${prescription}`,
            category: 'CROP_HEALTH'
          }
        });
      }

      return res.status(201).json({ success: true, message: 'Advisory prescription recorded and sent to farmer', data: expertCase });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // 3. Farmer Submit Query / Disease Diagnosis to Expert
  static async submitQuery(req: AuthRequest, res: Response) {
    try {
      const observerId = req.user!.id;
      const {
        symptomDescription,
        fieldId,
        cropCycleId,
        imageUrl,
        aiPredictionClass,
        aiConfidence = 0.88,
        recommendedAction,
        preventionAdvice,
        riskLevel = 'Medium'
      } = req.body;

      if (!symptomDescription) {
        return res.status(400).json({ success: false, message: 'Symptom or query description is required' });
      }

      const confVal = parseFloat(aiConfidence || '0.88');
      const isUncertain = confVal < 0.75;
      const statusText = isUncertain ? 'ESCALATED' : 'PENDING';

      const observation = await prisma.cropHealthObservation.create({
        data: {
          observerId,
          fieldId: fieldId || null,
          cropCycleId: cropCycleId || null,
          symptomDescription,
          imageUrl: imageUrl || null,
          aiPredictionClass: aiPredictionClass || (isUncertain ? 'Uncertain Foliar Lesion' : 'Foliar Health Inspection'),
          aiConfidence: confVal,
          riskLevel: isUncertain ? 'High' : riskLevel,
          recommendedAction: recommendedAction || 'Apply organic neem extract and isolate infected leaves',
          preventionAdvice: preventionAdvice || 'Maintain optimal crop spacing and avoid field-to-field flooding',
          expertReviewStatus: statusText
        }
      });

      // Notify Experts if escalated or submitted
      const experts = await prisma.user.findMany({ where: { role: 'EXPERT' } });
      for (const exp of experts) {
        await prisma.notification.create({
          data: {
            userId: exp.id,
            title: isUncertain ? '⚠️ Low-Confidence AI Diagnosis Escalated' : 'New Farmer Consultation Request 🌾',
            message: `${req.user!.name} submitted a crop health consultation (${aiPredictionClass || 'Foliar Lesion'}, Conf: ${Math.round(confVal * 100)}%): "${symptomDescription.substring(0, 60)}..."`,
            category: 'CROP_HEALTH'
          }
        });
      }

      return res.status(201).json({
        success: true,
        message: isUncertain
          ? 'AI diagnosis confidence was uncertain (<75%). Case automatically escalated to certified agricultural experts for review.'
          : 'Your crop health observation has been recorded and submitted to agricultural experts.',
        data: observation,
        isUncertain
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}
