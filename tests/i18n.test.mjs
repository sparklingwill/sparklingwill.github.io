import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { strings, LANGUAGES } from '../src/i18n.js';

const codes = LANGUAGES.map((l) => l.code);

test('LANGUAGES and the dictionaries describe the same set', () => {
  assert.deepEqual(codes.slice().sort(), Object.keys(strings).sort());
});

test('every language has a name to list itself under', () => {
  for (const l of LANGUAGES) {
    assert.ok(l.label && l.htmlLang, `${l.code} needs a label and an htmlLang`);
  }
});

test('every dictionary has identical keys', () => {
  const base = Object.keys(strings.en).sort();
  for (const code of codes) {
    assert.deepEqual(Object.keys(strings[code]).sort(), base, `${code} keys differ from en`);
  }
});

test('no dictionary has an empty string', () => {
  for (const code of codes) {
    for (const [k, v] of Object.entries(strings[code])) {
      assert.ok(typeof v === 'string' && v.trim(), `${code}.${k} is empty`);
    }
  }
});

test('every data-i18n key in index.html exists in every dictionary', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const keys = [...html.matchAll(/data-i18n="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(keys.length > 0, 'index.html should contain data-i18n attributes');
  for (const k of keys) {
    for (const code of codes) {
      assert.ok(k in strings[code], `missing ${code} key: ${k}`);
    }
  }
});
