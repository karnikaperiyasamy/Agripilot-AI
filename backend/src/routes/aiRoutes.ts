import { Router, Request, Response } from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import { AIController } from '../controllers/aiController';
import { CopilotController } from '../controllers/copilotController';
import { AIEcosystemController } from '../controllers/aiEcosystemController';
import { ENV } from '../config/env';
import { authenticateJwt } from '../middlewares/auth';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// Legacy & Copilot AI endpoints
router.post('/chat', AIController.chat);
router.post('/copilot-chat', authenticateJwt, CopilotController.copilotChat);
router.get('/farming-tips', AIController.getFarmingTips);
router.get('/recommend-crops', AIController.recommendCrops);
router.get('/profit-tips', AIController.getProfitTips);

// AI Ecosystem Decision Support Endpoints
router.post('/profit-simulator', AIEcosystemController.calculateProfitSimulation);
router.post('/what-to-grow', AIEcosystemController.recommendWhatToGrow);
router.get('/farm-risk-score', authenticateJwt, AIEcosystemController.getFarmRiskScore);
router.post('/water-management', AIEcosystemController.getWaterManagementAdvisory);
router.get('/pest-forecast', AIEcosystemController.getPestRiskForecast);
router.post('/evaluate-offer', AIEcosystemController.evaluateBuyerOffer);

// ML endpoints
router.post('/predict-yield', AIController.predictYield);
router.post('/pest-risk', AIController.pestRisk);
router.post('/price-forecast', AIController.priceForecast);
router.post('/harvest-window', AIController.harvestWindow);
router.post('/irrigation-decision', AIController.irrigationDecision);
router.post('/simulate-decision', AIController.simulateDecision);

// Model Registry & Observability
router.get('/models/status', AIController.getModelStatus);
router.get('/models/registry', AIController.getModelRegistry);

// Primary ML Core Modules Endpoints
router.post('/classify-disease', upload.single('file'), AIController.classifyDisease);
router.get('/diagnosis-history', AIController.getDiagnosisHistory);
router.post('/diagnosis-compare', AIController.compareDiagnoses);
router.post('/ml-crop-recommendation', AIController.recommendCropML);

export default router;
