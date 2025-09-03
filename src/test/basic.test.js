import test from 'node:test';
import assert from 'node:assert';

test('basic arithmetic works', () => {
  assert.strictEqual(1 + 1, 2);
});

test('string contains substring', () => {
  assert.ok('hello world'.includes('world'));
});

