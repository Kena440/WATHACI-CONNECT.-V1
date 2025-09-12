import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const localesDir = path.resolve(__dirname, '../src/locales');

function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') {
      Object.assign(acc, flatten(value, newKey));
    } else {
      acc[newKey] = true;
    }
    return acc;
  }, {});
}

const files = fs.readdirSync(localesDir).filter((f) => f.endsWith('.json'));
const translations = files.map((file) => ({
  lang: path.basename(file, '.json'),
  data: JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf-8')),
}));

const base = flatten(translations[0].data);
const baseKeys = Object.keys(base).sort();

translations.slice(1).forEach(({ lang, data }) => {
  const keys = Object.keys(flatten(data)).sort();
  test(`translation keys for ${lang}`, () => {
    assert.deepStrictEqual(keys, baseKeys);
  });
});
