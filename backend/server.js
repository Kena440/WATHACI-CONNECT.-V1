import http from 'http';
import { randomBytes, scryptSync } from 'crypto';

const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
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
        const salt = randomBytes(16).toString('hex');
        const hash = scryptSync(password, salt, 64).toString('hex');
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ hash: `${salt}:${hash}` }));
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

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
