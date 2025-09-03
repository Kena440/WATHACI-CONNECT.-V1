import express from 'express';
import cors from 'cors';
import { randomBytes, scryptSync } from 'crypto';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Express server is running' });
});

// Password hashing endpoint (existing functionality)
app.post('/hash', (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password required' });
    }
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    res.json({ hash: `${salt}:${hash}` });
  } catch (err) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Basic API endpoint for testing frontend connectivity
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Hello from Express backend!', 
    timestamp: new Date().toISOString() 
  });
});

app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
});
