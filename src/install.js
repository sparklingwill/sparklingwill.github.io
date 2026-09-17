// Store links, the mobile install prompt, and the platform routing that /get
// uses for ad traffic.

import { t } from './i18n.js';

export const APP_STORE_URL = 'https://apps.apple.com/us/app/photo-gotcha/id6801330867';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.sparklingwill.photogotcha';

const DISMISSED_KEY = 'sw-install-dismissed';

/**
 * Which store a visitor belongs in: 'ios', 'android', or null for desktop and
 * anything unrecognised. Pure, so the routing is testable without a browser.
 */
export function platformFor(ua = '', maxTouchPoints = 0) {
  const s = ua.toLowerCase();
  if (/android/.test(s)) return 'android';
  if (/iphone|ipod|ipad/.test(s)) return 'ios';
  // iPadOS 13+ reports a desktop Safari UA; the touch points give it away.
  if (/macintosh/.test(s) && maxTouchPoints > 1) return 'ios';
  return null;
}

export function storeUrlFor(platform) {
  if (platform === 'ios') return APP_STORE_URL;
  if (platform === 'android') return PLAY_STORE_URL;
  return null;
}

/**
 * iOS Safari draws Apple's own Smart App Banner from the meta tag in the
 * head, so ours would be a second banner saying the same thing. The in-app
 * and third-party iOS browsers (Chrome, Firefox, Edge, Opera) never get
 * Apple's, so there ours is the only one.
 */
export function usesAppleSmartBanner(ua = '', maxTouchPoints = 0) {
  if (platformFor(ua, maxTouchPoints) !== 'ios') return false;
  return !/crios|fxios|edgios|opios/i.test(ua);
}

/** Show the prompt only where it is both relevant and not duplicated. */
export function shouldPrompt(ua = '', maxTouchPoints = 0, dismissed = false) {
  if (dismissed) return false;
  if (!platformFor(ua, maxTouchPoints)) return false;
  return !usesAppleSmartBanner(ua, maxTouchPoints);
}

function isDismissed() {
  try { return localStorage.getItem(DISMISSED_KEY) === '1'; } catch { return false; }
}

/**
 * A dismissible bar offering the store this device can actually install from.
 * Built here rather than in the markup so a desktop visitor never carries it.
 */
export function initInstallPrompt() {
  const ua = navigator.userAgent || '';
  const touch = navigator.maxTouchPoints || 0;
  if (!shouldPrompt(ua, touch, isDismissed())) return;

  const platform = platformFor(ua, touch);
  const bar = document.createElement('aside');
  bar.className = 'install-bar';
  bar.setAttribute('role', 'complementary');

  const text = document.createElement('p');
  text.className = 'install-text';

  const link = document.createElement('a');
  link.className = 'cta-pill cta-solid install-cta';
  link.href = storeUrlFor(platform);
  link.target = '_blank';
  link.rel = 'noopener';

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'install-close';
  close.textContent = '×';
  close.addEventListener('click', () => {
    bar.remove();
    try { localStorage.setItem(DISMISSED_KEY, '1'); } catch { /* storage blocked */ }
  });

  const relabel = () => {
    text.textContent = t('installBody');
    // A short verb, not the full store name: the bar is one line on a phone.
    link.textContent = t('installCta');
    close.setAttribute('aria-label', t('installDismiss'));
  };
  relabel();
  document.addEventListener('sw:langchange', relabel);

  bar.append(text, link, close);
  document.body.append(bar);
}
