import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { strings } from '../src/i18n.js';

test('en and zh dictionaries have identical keys', () => {
  assert.deepEqual(Object.keys(strings.en).sort(), Object.keys(strings.zh).sort());
});

test('every data-i18n key in index.html exists in both dictionaries', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const keys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]);
  assert.ok(keys.length > 0, 'index.html should contain data-i18n attributes');
  for (const k of keys) {
    assert.ok(k in strings.en, `missing en key: ${k}`);
    assert.ok(k in strings.zh, `missing zh key: ${k}`);
  }
});
