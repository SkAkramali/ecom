const { spawn } = require('child_process');
const assert = require('assert');
const test = require('node:test');
const path = require('path');

test('E-Commerce Backend API Integration Tests', async (t) => {
  // Start backend server on port 5005 to avoid conflict with standard 5000 port
  const serverProcess = spawn('node', [path.join(__dirname, '../server.js')], {
    env: { ...process.env, PORT: '5005', JWT_SECRET: 'test_super_secret_key_2026' },
    stdio: 'pipe'
  });

  // Ensure server process is terminated on test exit
  t.after(() => {
    serverProcess.kill();
  });

  // Wait for the server to start
  await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => {
      serverProcess.kill();
      reject(new Error('Server start timed out after 5 seconds'));
    }, 5000);

    serverProcess.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('E-Commerce Backend running') || output.includes('running on http://localhost:')) {
        clearTimeout(timeout);
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Server Stderr:', data.toString());
    });

    serverProcess.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    serverProcess.on('exit', (code) => {
      clearTimeout(timeout);
      if (code !== null && code !== 0) {
        reject(new Error(`Server exited unexpectedly with code ${code}`));
      }
    });
  });

  const baseUrl = 'http://localhost:5005/api';
  let userToken = '';
  const testEmail = `test_${Date.now()}@example.com`;

  await t.test('GET /api/products - fetch products catalog list', async () => {
    const res = await fetch(`${baseUrl}/products`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
  });

  await t.test('POST /api/auth/register - create new user customer account', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Test',
        email: testEmail,
        password: 'password123'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.token);
    assert.strictEqual(data.user.email, testEmail);
    assert.strictEqual(data.user.role, 'customer');
    userToken = data.token;
  });

  await t.test('POST /api/auth/login - login with registered credentials', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    assert.strictEqual(data.user.email, testEmail);
  });

  await t.test('GET /api/auth/me - fetch authenticated user details', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.email, testEmail);
    assert.strictEqual(data.user.name, 'John Test');
  });
});
