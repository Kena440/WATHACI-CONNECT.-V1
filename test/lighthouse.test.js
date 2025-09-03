import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

test('index.html contains meta description', () => {
  const html = readFileSync(join(import.meta.dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /<meta\s+name="description"\s+content="[^"]*"/);
});

test('robots.txt exists', () => {
  const path = join(import.meta.dirname, '..', 'robots.txt');
  assert.ok(existsSync(path), 'robots.txt file should exist');
});
