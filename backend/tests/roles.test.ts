import test from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000/api';

test('E2E Roles: Verify all 5 non-farmer roles authenticate and access their endpoints', async () => {
  const roles = [
    { email: 'merchant@agritwin.com', role: 'MERCHANT', endpoint: '/marketplace/buyer-requirements' },
    { email: 'transporter@agritwin.com', role: 'TRANSPORTER', endpoint: '/logistics/requests' },
    { email: 'expert@agritwin.com', role: 'EXPERT', endpoint: '/expert/cases' },
    { email: 'consumer@agritwin.com', role: 'CONSUMER', endpoint: '/consumer/produce' },
    { email: 'admin@agritwin.com', role: 'ADMIN', endpoint: '/admin/stats' }
  ];

  for (const r of roles) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: r.email, password: 'password123' })
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200, `Login failed for ${r.role}`);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.user.role, r.role);

    const token = data.data.token;
    const accessRes = await fetch(`${BASE_URL}${r.endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    assert.strictEqual(accessRes.status, 200, `Access failed for ${r.role} on ${r.endpoint}`);
  }
});
