import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000/api';

test('E2E: Login as Demo Farmer and obtain JWT', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'farmer@farmprofit.com', password: 'password123' })
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.data.user.role, 'FARMER');

  const token = data.data.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // 1. Overview & Decisions
  const dashRes = await fetch(`${BASE_URL}/farmer/dashboard`, { headers: authHeaders });
  const dashData = await dashRes.json();
  assert.strictEqual(dashRes.status, 200);
  assert.strictEqual(dashData.success, true);
  assert.ok(dashData.data.todayDecisions.length >= 2);
  const fieldId = dashData.data.farms[0].fields[0].id;

  // 2. Field Digital Twin
  const twinRes = await fetch(`${BASE_URL}/farmer/digital-twin/field/${fieldId}`, { headers: authHeaders });
  const twinData = await twinRes.json();
  assert.strictEqual(twinRes.status, 200);
  assert.strictEqual(twinData.success, true);
  assert.ok(twinData.data.aiIntelligence.yieldPrediction);
  assert.ok(twinData.data.aiIntelligence.irrigationRecommendation);

  // 3. What-If Decision Simulator
  const simRes = await fetch(`${BASE_URL}/ai/simulate-decision`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      baseline: {
        scenario_name: 'Flood Irrigation',
        crop: 'Basmati Rice',
        area_acres: 5.0,
        irrigation_method: 'Flood',
        fertilizer_intensity: 'Conventional',
        expected_mandi_price: 4000.0,
        selling_timing: 'Immediate'
      },
      alternatives: [
        {
          scenario_name: 'Precision Drip + Storage',
          crop: 'Basmati Rice',
          area_acres: 5.0,
          irrigation_method: 'Drip',
          fertilizer_intensity: 'Optimized',
          expected_mandi_price: 4000.0,
          selling_timing: 'Post-Harvest Storage (+30d)'
        }
      ]
    })
  });
  const simData = await simRes.json();
  assert.strictEqual(simRes.status, 200);
  assert.strictEqual(simData.success, true);
  assert.strictEqual(simData.data.recommended_scenario, 'Precision Drip + Storage');
  assert.ok(simData.data.expected_profit_gain > 0);

  // 4. Mandi Price Forecast
  const priceRes = await fetch(`${BASE_URL}/ai/price-forecast`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      crop: 'Wheat',
      mandi: 'Khanna (Punjab)',
      current_price: 2450.0
    })
  });
  const priceData = await priceRes.json();
  assert.strictEqual(priceRes.status, 200);
  assert.strictEqual(priceData.success, true);
  assert.ok(priceData.data.forecast_14d > 0);

  // 5. Scheme Eligibility Check
  const schemeRes = await fetch(`${BASE_URL}/schemes/check-eligibility`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ landSizeAcres: 5.0 })
  });
  const schemeData = await schemeRes.json();
  assert.strictEqual(schemeRes.status, 200);
  assert.strictEqual(schemeData.success, true);
  assert.ok(schemeData.eligibleSchemes.length >= 3);
});
