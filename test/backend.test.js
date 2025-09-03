import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';

// Simple test for Express backend
describe('Express Backend Tests', () => {
  let serverProcess;
  let serverReady = false;

  before(async () => {
    // Start the server for testing
    serverProcess = spawn('node', ['backend/server.js'], {
      cwd: process.cwd(),
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise((resolve) => {
      serverProcess.stdout.on('data', (data) => {
        if (data.toString().includes('Express server running')) {
          serverReady = true;
          resolve();
        }
      });
    });

    // Give it a moment to fully initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  after(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  test('health endpoint returns OK status', async () => {
    if (!serverReady) {
      assert.fail('Server not ready for testing');
    }

    const response = await fetch('http://localhost:3001/health');
    assert.strictEqual(response.status, 200);
    
    const data = await response.json();
    assert.strictEqual(data.status, 'OK');
    assert.strictEqual(data.message, 'Express server is running');
  });

  test('API test endpoint returns message', async () => {
    if (!serverReady) {
      assert.fail('Server not ready for testing');
    }

    const response = await fetch('http://localhost:3001/api/test');
    assert.strictEqual(response.status, 200);
    
    const data = await response.json();
    assert.strictEqual(data.message, 'Hello from Express backend!');
    assert.ok(data.timestamp);
  });

  test('password hashing endpoint works correctly', async () => {
    if (!serverReady) {
      assert.fail('Server not ready for testing');
    }

    const response = await fetch('http://localhost:3001/hash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: 'test123' }),
    });

    assert.strictEqual(response.status, 200);
    
    const data = await response.json();
    assert.ok(data.hash);
    assert.ok(data.hash.includes(':'));
  });

  test('password hashing endpoint returns error for missing password', async () => {
    if (!serverReady) {
      assert.fail('Server not ready for testing');
    }

    const response = await fetch('http://localhost:3001/hash', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    assert.strictEqual(response.status, 400);
    
    const data = await response.json();
    assert.strictEqual(data.error, 'Password required');
  });
});