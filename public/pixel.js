// Ad measurement for sparklingwill.com — one file, one place to configure.
//
// Loads the TikTok Pixel when TIKTOK_PIXEL_ID is set and exposes a tiny
// helper the pages use to report conversions. Included unbundled (public/)
// by the homepage, /get and the web client at /app/, so the id lives here
// and nowhere else. With the id empty nothing is loaded and every helper is
// a no-op, which is how the site behaves until a campaign is actually set up.
//
// Events reported (TikTok standard names, so a Meta pixel could share them):
//   ViewContent           /get, before the store redirect (content_name = platform)
//   ClickButton           a store or "try in browser" button on the homepage
//   CompleteRegistration  a new account created in the web client
//   Purchase              a Stripe purchase whose credits landed (value in USD)
//
// Privacy: the pixel sets a cookie and reports page views to TikTok. This is
// disclosed in privacy.html ("Advertising measurement on our website").
// The pixel is not loaded for visitors whose browser sends Global Privacy
// Control, and holds consent for EU/UK-timezone visitors until they interact
// with a store button, which is the narrowest gate that still lets a campaign
// measure its own clicks.

(function () {
  var TIKTOK_PIXEL_ID = 'DAM6JHJC77U9OQ6PLQ8G'; // TikTok Events Manager, pixel "sparklingwill.com"

  var w = window;
  var ready = Promise.resolve(false);

  function stub() {
    var ttq = w.ttq = w.ttq || [];
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready',
      'alias', 'group', 'enableCookie', 'disableCookie', 'holdConsent', 'revokeConsent', 'grantConsent'];
    ttq.setAndDefer = function (t, e) {
      t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); };
    };
    for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
    ttq.instance = function (t) {
      var e = ttq._i[t] || [];
      for (var n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
      return e;
    };
    ttq.load = function (id, opts) {
      var src = 'https://analytics.tiktok.com/i18n/pixel/events.js';
      ttq._i = ttq._i || {}; ttq._i[id] = []; ttq._i[id]._u = src;
      ttq._t = ttq._t || {}; ttq._t[id] = +new Date();
      ttq._o = ttq._o || {}; ttq._o[id] = opts || {};
      var s = document.createElement('script');
      s.async = true;
      s.src = src + '?sdkid=' + id + '&lib=ttq';
      ready = new Promise(function (resolve) {
        s.onload = function () { resolve(true); };
        s.onerror = function () { resolve(false); };
      });
      var first = document.getElementsByTagName('script')[0];
      first.parentNode.insertBefore(s, first);
    };
    w.TiktokAnalyticsObject = 'ttq';
    return ttq;
  }

  function gpc() {
    return navigator.globalPrivacyControl === true;
  }

  function likelyEU() {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      return /^Europe\//.test(tz);
    } catch (e) { return false; }
  }

  var enabled = !!TIKTOK_PIXEL_ID && !gpc();
  if (enabled) {
    var ttq = stub();
    if (likelyEU()) ttq.holdConsent();
    ttq.load(TIKTOK_PIXEL_ID);
    ttq.page();
  }

  // TikTok's event diagnostics want every event to carry a `contents` array
  // whose items have a non-empty content_id (it flags "Content ID is missing"
  // otherwise). Callers pass a short content_name such as "google_play"; this
  // turns it into the shape TikTok expects so no page has to know the schema.
  function withContents(params) {
    var p = {};
    for (var k in params) p[k] = params[k];
    var id = p.content_id || p.content_name;
    if (id && !p.contents) {
      p.content_id = String(id);
      p.content_type = p.content_type || 'product';
      p.contents = [{ content_id: p.content_id, content_name: p.content_name || p.content_id, content_type: p.content_type }];
    }
    return p;
  }

  /** Report an event; safe to call whether or not the pixel is loaded. */
  w.swTrack = function (event, params) {
    if (!enabled) return;
    try {
      if (likelyEU()) w.ttq.grantConsent(); // an explicit click on a store button
      w.ttq.track(event, withContents(params || {}));
    } catch (e) { /* measurement must never break a page */ }
  };

  /** Resolves once the pixel script has loaded (or failed), capped by `ms`. */
  w.swPixelReady = function (ms) {
    if (!enabled) return Promise.resolve(false);
    var timeout = new Promise(function (resolve) { setTimeout(function () { resolve(false); }, ms || 800); });
    return Promise.race([ready, timeout]);
  };
})();
