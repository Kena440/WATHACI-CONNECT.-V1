import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const html = readFileSync(join(import.meta.dirname, '..', 'index.html'), 'utf8');

test('html tag has lang attribute', () => {
  assert.match(html, /<html\s+lang="[^"]+"/);
});

test('all images have alt attributes', () => {
  const imgTags = html.match(/<img\s+[^>]*>/g) || [];
  for (const tag of imgTags) {
    assert.match(tag, /alt=/, `Image tag missing alt attribute: ${tag}`);
  }
});
