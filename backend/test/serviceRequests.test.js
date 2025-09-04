const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const express = require('express');
const request = require('http');
const serviceRequestRoutes = require('../routes/serviceRequests');

describe('Service Request Routes', () => {
  let server;
  let app;

  before(async () => {
    app = express();
    app.use(express.json());
    app.use('/service-requests', serviceRequestRoutes);
    
    server = app.listen(0); // Use port 0 to get random available port
  });

  after(async () => {
    if (server) {
      server.close();
    }
  });

  it('should create a service request with valid data', async () => {
    const validData = {
      user_id: 'test_user_123',
      title: 'Test Service Request',
      description: 'This is a test service request with sufficient description length',
      skills: ['React', 'TypeScript'],
      willing_to_pay: true,
      budget: 500,
      location: 'Remote'
    };

    const port = server.address().port;
    const postData = JSON.stringify(validData);
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/service-requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = request.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            assert.strictEqual(res.statusCode, 201);
            const result = JSON.parse(body);
            assert.ok(result.data);
            assert.strictEqual(result.data.title, validData.title);
            assert.strictEqual(result.data.user_id, validData.user_id);
            assert.ok(result.data.id);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  });

  it('should reject service request with invalid data', async () => {
    const invalidData = {
      user_id: 'test_user_123',
      title: 'X', // Too short
      description: 'Short', // Too short
      skills: [], // Empty array
      willing_to_pay: 'not_boolean' // Wrong type
    };

    const port = server.address().port;
    const postData = JSON.stringify(invalidData);
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/service-requests',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = request.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            assert.strictEqual(res.statusCode, 400);
            const result = JSON.parse(body);
            assert.strictEqual(result.error, 'Validation failed');
            assert.ok(result.details);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  });

  it('should get user service requests', async () => {
    const userId = 'test_user_123';
    const port = server.address().port;
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: `/service-requests/user/${userId}`,
      method: 'GET'
    };

    return new Promise((resolve, reject) => {
      const req = request.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            assert.strictEqual(res.statusCode, 200);
            const result = JSON.parse(body);
            assert.ok(result.data);
            assert.ok(Array.isArray(result.data));
            assert.ok(result.pagination);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  });
});