import test from 'node:test';
import assert from 'node:assert/strict';
import {
  platformFor, storeUrlFor, usesAppleSmartBanner, shouldPrompt,
  APP_STORE_URL, PLAY_STORE_URL,
} from '../src/install.js';

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.108 Mobile/15E148 Safari/604.1',
  androidChrome: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  // iPadOS 13+ and a real Mac send the same string; only touch points differ.
  ipadOrMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
};

test('phones are routed to their own store', () => {
  assert.equal(platformFor(UA.iphoneSafari), 'ios');
  assert.equal(platformFor(UA.iphoneChrome), 'ios');
  assert.equal(platformFor(UA.androidChrome), 'android');
});

test('an iPad is iOS, the Mac sending the same string is not', () => {
  assert.equal(platformFor(UA.ipadOrMac, 5), 'ios');
  assert.equal(platformFor(UA.ipadOrMac, 0), null);
});

test('desktop belongs to no store', () => {
  assert.equal(platformFor(UA.windows), null);
  assert.equal(platformFor(''), null);
  assert.equal(storeUrlFor(null), null);
});

test('each platform gets its own listing', () => {
  assert.equal(storeUrlFor('ios'), APP_STORE_URL);
  assert.equal(storeUrlFor('android'), PLAY_STORE_URL);
  assert.match(APP_STORE_URL, /id6801330867$/);
  assert.match(PLAY_STORE_URL, /id=com\.sparklingwill\.photogotcha$/);
});

test('only iOS Safari draws Apple’s own banner', () => {
  assert.equal(usesAppleSmartBanner(UA.iphoneSafari), true);
  assert.equal(usesAppleSmartBanner(UA.ipadOrMac, 5), true);
  assert.equal(usesAppleSmartBanner(UA.iphoneChrome), false);
  assert.equal(usesAppleSmartBanner(UA.androidChrome), false);
  assert.equal(usesAppleSmartBanner(UA.windows), false);
});

test('we prompt only where ours is the only banner', () => {
  // iOS Safari already has Apple's, so a second one would be noise.
  assert.equal(shouldPrompt(UA.iphoneSafari, 0, false), false);
  assert.equal(shouldPrompt(UA.iphoneChrome, 0, false), true);
  assert.equal(shouldPrompt(UA.androidChrome, 0, false), true);
  assert.equal(shouldPrompt(UA.windows, 0, false), false);
});

test('a dismissal is respected', () => {
  assert.equal(shouldPrompt(UA.androidChrome, 0, true), false);
  assert.equal(shouldPrompt(UA.iphoneChrome, 0, true), false);
});
