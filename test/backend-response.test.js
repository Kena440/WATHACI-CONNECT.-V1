import { test } from 'node:test';
import assert from 'node:assert';
import app from '../backend/index.js';

// Ensure the server still responds after adding security middleware
// Uses dynamic port to avoid conflicts

test('POST /users returns provided user data', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  const res = await fetch(`http://localhost:${port}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Alice', email: 'alice@example.com' }),
  });

  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.deepStrictEqual(data, {
    user: { name: 'Alice', email: 'alice@example.com' },
  });

  await new Promise((resolve) => server.close(resolve));
});

