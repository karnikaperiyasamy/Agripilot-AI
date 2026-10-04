import test from 'node:test';
import assert from 'node:assert';
import app from '../src/index';
import http from 'http';

let server: http.Server;
const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}/api`;

test.before(async () => {
  return new Promise<void>((resolve) => {
    server = app.listen(PORT, () => resolve());
  });
});

test.after(async () => {
  const { prisma } = await import('../src/config/db');
  await prisma.$disconnect();
  return new Promise<void>((resolve) => {
    server.close(() => resolve());
  });
});

test('GET /api/health should return HEALTHY status', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.status, 'HEALTHY');
});

test('POST /api/auth/login should authenticate Demo Farmer', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'farmer@farmprofit.com',
      password: 'password123'
    })
  });
  const json = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.user.role, 'FARMER');
  assert.ok(json.data.token);
});

test('GET /api/schemes should return government schemes', async () => {
  const res = await fetch(`${BASE_URL}/schemes`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.length >= 8);
  const pmKisan = data.find((s: any) => s.schemeName === 'PM-KISAN');
  assert.ok(pmKisan);
});

test('GET /api/marketplace/listings should return active crop listings', async () => {
  const res = await fetch(`${BASE_URL}/marketplace/listings`);
  const json = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(json.success, true);
  assert.ok(json.data.length >= 1);
});

test('POST /api/ai/predict-yield should return agronomic yield prediction', async () => {
  const res = await fetch(`${BASE_URL}/ai/predict-yield`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      crop: 'Basmati Rice',
      soil_type: 'Alluvial',
      irrigation_type: 'Drip',
      area_acres: 5.0
    })
  });
  const json = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(json.success, true);
  assert.ok(json.data.estimated_yield_per_acre > 0);
});
