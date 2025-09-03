const test = require('node:test');
const assert = require('node:assert');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const path = require('node:path');

const fetch = global.fetch;

test('rate limiter blocks excessive requests', async (t) => {
  const server = spawn('node', ['index.js'], { cwd: path.join(__dirname, '..'), stdio: ['ignore', 'pipe', 'inherit'] });
  t.after(() => server.kill());
  await once(server.stdout, 'data');

  for (let i = 0; i < 100; i++) {
    const res = await fetch('http://localhost:3000/nonexistent');
    assert.notStrictEqual(res.status, 429);
  }

  const limited = await fetch('http://localhost:3000/nonexistent');
  assert.strictEqual(limited.status, 429);
});
