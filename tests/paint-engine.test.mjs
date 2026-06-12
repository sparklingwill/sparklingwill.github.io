import test from 'node:test';
import assert from 'node:assert/strict';
import { dominantColors } from '../src/paint-engine.js';

// Build an RGBA pixel buffer: `count` pixels of [r,g,b].
function px(count, [r, g, b]) {
  const out = new Uint8ClampedArray(count * 4);
  for (let i = 0; i < count; i++) out.set([r, g, b, 255], i * 4);
  return out;
}

test('returns most common colors first', () => {
  const buf = new Uint8ClampedArray([...px(160, [200, 40, 40]), ...px(48, [40, 40, 200])]);
  const colors = dominantColors(buf, 2);
  assert.equal(colors.length, 2);
  assert.equal(colors[0], 'rgb(200,40,40)');
  assert.equal(colors[1], 'rgb(40,40,200)');
});

test('caps result at requested count', () => {
  const buf = px(640, [10, 200, 10]);
  assert.equal(dominantColors(buf, 6).length, 1);
});
