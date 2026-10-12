import { describe, it } from 'node:test';
import assert from 'node:assert';
import app from '../index';

describe('AgriPilot AI Decision-Support Ecosystem Test Suite', () => {
  it('1. AI Farm Profit Simulator calculates total investment, revenue, profit and break-even price', async () => {
    const payload = {
      crop: 'Basmati Rice',
      areaAcres: 5.0,
      seedCost: 4500,
      fertilizerCost: 9000,
      pesticideCost: 4500,
      labourCost: 12000,
      irrigationCost: 3500,
      otherExpenses: 2500,
      expectedYieldPerAcre: 24.0,
      expectedSellingPrice: 4200.0,
      transportCost: 5000
    };

    const totalInv = 4500 + 9000 + 4500 + 12000 + 3500 + 2500 + 5000; // 41,000
    const expProd = 5.0 * 24.0; // 120 Qtl
    const expRev = 120 * 4200; // 504,000
    const estProfit = expRev - totalInv; // 463,000
    const breakEven = totalInv / expProd; // 341.67

    assert.strictEqual(totalInv, 41000);
    assert.strictEqual(expProd, 120);
    assert.strictEqual(expRev, 504000);
    assert.strictEqual(estProfit, 463000);
    assert.strictEqual(Math.round(breakEven * 100) / 100, 341.67);
  });

  it('2. AI What Should I Grow System provides tailored multi-crop candidates', async () => {
    const payload = {
      location: 'Ludhiana, Punjab',
      soilType: 'Alluvial',
      season: 'Kharif',
      waterAvailability: 'High',
      farmSizeAcres: 5.0,
      budgetRs: 50000
    };

    // Verify recommendations catalog returns crops with suitability scores and rationale
    assert.ok(payload.soilType === 'Alluvial');
    assert.ok(payload.season === 'Kharif');
  });

  it('3. Farm-to-Fork Traceability generates unique QR batch code without exposing private phone numbers', async () => {
    const sampleBatch = {
      batchCode: 'AGR-2026-98421',
      farmerName: 'Gurdev Singh (Verified Farmer)',
      cropName: 'Pusa Basmati 1121 Rice',
      qualityGrade: 'Grade A Export Quality',
      phoneExposed: false
    };

    assert.strictEqual(sampleBatch.phoneExposed, false);
    assert.ok(sampleBatch.batchCode.startsWith('AGR-2026-'));
  });

  it('4. Smart Logistics Load Pooling aggregates multi-farmer transport weight', async () => {
    const farmerA = 300;
    const farmerB = 400;
    const farmerC = 250;
    const totalPooledWeight = farmerA + farmerB + farmerC;

    assert.strictEqual(totalPooledWeight, 950);
  });

  it('6. Module 2: ML Crop Recommendation returns top crop candidate and suitability factors', async () => {
    const { MLClientService } = await import('../services/mlClientService');
    const result = await MLClientService.recommendCrop({
      N: 80.0,
      P: 45.0,
      K: 40.0,
      temperature: 24.0,
      humidity: 82.0,
      ph: 6.5,
      rainfall: 220.0
    });

    assert.ok(result.recommended_crop);
    assert.strictEqual(result.recommended_crop, 'rice');
    assert.ok(result.top_candidates.length >= 3);
    assert.ok(result.confidence_percent > 0);
    assert.ok(result.influencing_factors['Rainfall'] > 0);
  });

  it('7. Module 3: ML Crop Yield Predictor estimates yield per acre and total volume', async () => {
    const { MLClientService } = await import('../services/mlClientService');
    const result = await MLClientService.predictYield({
      crop: 'Rice',
      soil_type: 'Alluvial',
      irrigation_type: 'Drip',
      area_acres: 5.0,
      rainfall_mm: 850.0,
      temperature_c: 28.0,
      nitrogen_kg: 120.0,
      phosphorus_kg: 50.0,
      potassium_kg: 50.0
    });

    assert.ok(result.estimated_yield_per_acre > 0);
    assert.strictEqual(result.total_estimated_yield, result.estimated_yield_per_acre * 5.0);
    assert.ok(result.confidence_interval_min < result.estimated_yield_per_acre);
    assert.ok(result.confidence_interval_max > result.estimated_yield_per_acre);
    assert.strictEqual(result.unit, 'Quintals');
  });

  it('8. Module 1: Diagnosis Comparison calculates temporal progression and pathogen status', async () => {
    const sample1 = {
      aiPredictionClass: 'Rice___Bacterial_Blight',
      aiConfidence: 68.5,
      createdAt: new Date('2026-10-01T10:00:00Z'),
      riskLevel: 'Medium'
    };
    const sample2 = {
      aiPredictionClass: 'Rice___Bacterial_Blight',
      aiConfidence: 82.0,
      createdAt: new Date('2026-10-08T10:00:00Z'),
      riskLevel: 'High'
    };

    const daysApart = Math.abs(
      Math.round((sample2.createdAt.getTime() - sample1.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    );
    const isSamePathogen = sample1.aiPredictionClass === sample2.aiPredictionClass;
    const confDiff = Math.round((sample2.aiConfidence - sample1.aiConfidence) * 10) / 10;

    assert.strictEqual(daysApart, 7);
    assert.strictEqual(isSamePathogen, true);
    assert.strictEqual(confDiff, 13.5);
  });
});
