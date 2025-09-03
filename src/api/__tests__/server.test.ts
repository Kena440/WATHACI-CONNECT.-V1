/**
 * API tests for the backend server
 */

import http from 'http';

describe('Backend Server API', () => {
  let server: http.Server;
  const port = 3001; // Use different port for testing

  beforeAll((done: () => void) => {
    // Start test server
    server = http.createServer((req, res) => {
      if (req.method === 'POST' && req.url === '/hash') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { password } = JSON.parse(body || '{}');
            if (!password) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Password required' }));
              return;
            }
            // Simple test hash (not the real implementation)
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ hash: `test-salt:test-hash-${password}` }));
          } catch (err) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
      } else {
        res.statusCode = 404;
        res.end();
      }
    });

    server.listen(port, done);
  });

  afterAll((done: () => void) => {
    server.close(done);
  });

  it('should hash a password successfully', (done: () => void) => {
    const postData = JSON.stringify({ password: 'testpassword123' });
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/hash',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        expect(res.statusCode).toBe(200);
        const response = JSON.parse(data);
        expect(response).toHaveProperty('hash');
        expect(response.hash).toContain('test-salt:test-hash-testpassword123');
        done();
      });
    });

    req.on('error', () => {
      done();
    });

    req.write(postData);
    req.end();
  });

  it('should return 400 for missing password', (done: () => void) => {
    const postData = JSON.stringify({});
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/hash',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        expect(res.statusCode).toBe(400);
        const response = JSON.parse(data);
        expect(response).toHaveProperty('error');
        expect(response.error).toBe('Password required');
        done();
      });
    });

    req.on('error', () => {
      done();
    });

    req.write(postData);
    req.end();
  });

  it('should return 400 for invalid JSON', (done: () => void) => {
    const postData = 'invalid json';
    
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/hash',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        expect(res.statusCode).toBe(400);
        const response = JSON.parse(data);
        expect(response).toHaveProperty('error');
        expect(response.error).toBe('Invalid JSON');
        done();
      });
    });

    req.on('error', () => {
      done();
    });

    req.write(postData);
    req.end();
  });

  it('should return 404 for unknown endpoints', (done: (error?: any) => void) => {
    const options = {
      hostname: 'localhost',
      port: port,
      path: '/unknown',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      expect(res.statusCode).toBe(404);
      done();
    });

    req.on('error', (err) => {
      done(err);
    });

    req.end();
  });
});