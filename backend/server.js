const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const services = [
  { id: 1, name: 'Web Design' },
  { id: 2, name: 'Accounting' }
];

const users = [
  { id: 1, name: 'Jane' },
  { id: 2, name: 'John' }
];

app.get('/api/services', (req, res) => {
  res.json(services);
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
