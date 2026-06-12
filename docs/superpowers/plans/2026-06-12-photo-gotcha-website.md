# Photo Gotcha Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild sparklingwill.com as a bilingual (EN/中文) single-page showcase for the Photo Gotcha app, with a canvas hero animation that "paints" the result photo from its basic colors.

**Architecture:** Keep the existing Vite vanilla-JS stack. New modules: `src/i18n.js` (strings + language toggle), `src/paint-engine.js` (canvas painting loop). `index.html`, `src/style.css`, `src/main.js` are rewritten; the galaxy theme and old product cards are removed. Web-sized images are generated once from the photo repo's assets via a sharp script.

**Tech Stack:** Vite 7, vanilla JS/CSS, `sharp` (dev-only asset script), Node's built-in `node --test` runner (no test framework dependency).

**Spec:** `docs/superpowers/specs/2026-06-12-photo-gotcha-website-design.md`

**IMPORTANT — do not `git push` until the final task's verification passes.** Pushing to `main` auto-deploys to GitHub Pages via `.github/workflows/deploy.yml`. Commit locally after each task; push only at the end with user approval.

---

### Task 1: Generate web-sized image assets

**Files:**
- Create: `tools/prepare-assets.mjs`
- Create (generated): `public/img/*.jpg` (9 files)
- Modify: `package.json` (sharp devDependency added by npm)

- [ ] **Step 1: Install sharp**

Run: `npm install -D sharp`
Expected: adds `sharp` to devDependencies, exit 0.

- [ ] **Step 2: Write the asset script**

Create `tools/prepare-assets.mjs`:

```js
// One-off: resize/compress Photo Gotcha demo assets into public/img.
// Source of truth is the photo repo; re-run if those assets change.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const SRC = 'C:/Users/xw431/source/repos/photo/r2-assets/templates';
const OUT = 'public/img';
mkdirSync(OUT, { recursive: true });

const jobs = [
  ['sample_input_girl.png', 'input-girl.jpg', 700],
  ['sample_input_cat.jpeg', 'input-cat.jpg', 700],
  ['polaroid.jpeg', 'result-polaroid.jpg', 1000],
  ['neon.jpeg', 'tpl-neon.jpg', 800],
  ['qipao.jpeg', 'tpl-qipao.jpg', 800],
  ['vintage.jpeg', 'tpl-vintage.jpg', 800],
  ['snow.jpeg', 'tpl-snow.jpg', 800],
  ['sunset.jpeg', 'tpl-sunset.jpg', 800],
  ['forest.jpeg', 'tpl-forest.jpg', 800],
];

for (const [src, out, size] of jobs) {
  const info = await sharp(join(SRC, src))
    .resize(size, size, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(join(OUT, out));
  console.log(`${out}: ${info.width}x${info.height} ${(info.size / 1024).toFixed(0)}KB`);
}
```

- [ ] **Step 3: Run it and verify output**

Run: `node tools/prepare-assets.mjs`
Expected: 9 lines printed, each file under ~250KB. Then `ls public/img` shows the 9 jpgs.

- [ ] **Step 4: Commit**

```bash
git add tools/prepare-assets.mjs public/img package.json package-lock.json
git commit -m "Add web-sized Photo Gotcha demo assets and prep script"
```

---

### Task 2: i18n module (strings + toggle)

**Files:**
- Create: `src/i18n.js`
- Test: `tests/i18n.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `tests/i18n.test.mjs`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/`
Expected: FAIL — cannot find module `../src/i18n.js`.

- [ ] **Step 3: Write src/i18n.js**

```js
// All visible page copy, both languages. Keys map to data-i18n attributes.
export const strings = {
  en: {
    heroKicker: 'Sparkling Will presents',
    heroTagline: 'Your photos, painted into a moment.',
    heroSub: 'Upload a photo or two. Our AI studies their colors, then paints you back a moment worth keeping.',
    heroCta: 'Coming soon to Google Play',
    inputsLabel: 'your photos',
    arrowLabel: 'drawn from their colors',
    resultLabel: 'painted by Photo Gotcha',
    howTitle: 'How it works',
    step1Title: 'Share a photo',
    step1Body: 'Pick one or two photos of you — or anyone you love.',
    step2Title: 'Choose a style',
    step2Body: 'Sixteen styles, from neon nights to vintage film.',
    step3Title: 'Pull the crank',
    step3Body: 'A polaroid slides out — your moment, painted.',
    galleryTitle: 'Styles',
    gallerySub: '16 styles · 40 city backdrops',
    tplNeon: 'Neon',
    tplQipao: 'Qipao',
    tplVintage: 'Vintage',
    tplSnow: 'Snow',
    tplSunset: 'Sunset',
    tplForest: 'Forest',
    aboutTitle: 'About Sparkling Will',
    aboutBody: 'We create cool things to empower people to be more productive and kind.',
    footer: '© 2026 Sparkling Will. All rights reserved.',
  },
  zh: {
    heroKicker: 'Sparkling Will 出品',
    heroTagline: '一拍，一世界。',
    heroSub: '上传一两张照片，AI 读懂它们的色彩，为你绘出值得珍藏的一刻。',
    heroCta: '即将登陆 Google Play',
    inputsLabel: '你的照片',
    arrowLabel: '取其色，绘其形',
    resultLabel: 'Photo Gotcha 绘成',
    howTitle: '如何使用',
    step1Title: '上传照片',
    step1Body: '选择一两张你或所爱之人的照片。',
    step2Title: '挑选风格',
    step2Body: '十六种风格，从霓虹夜色到复古胶片。',
    step3Title: '转动手柄',
    step3Body: '一张拍立得缓缓滑出——属于你的一刻。',
    galleryTitle: '风格',
    gallerySub: '16 种风格 · 40 座城市背景',
    tplNeon: '霓虹',
    tplQipao: '旗袍',
    tplVintage: '复古',
    tplSnow: '落雪',
    tplSunset: '夕照',
    tplForest: '林间',
    aboutTitle: '关于 Sparkling Will',
    aboutBody: '我们创造美好的事物，让人们更高效、更友善。',
    footer: '© 2026 Sparkling Will 版权所有',
  },
};

function apply(lang) {
  const dict = strings[lang];
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.body.classList.toggle('lang-zh', lang === 'zh');
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const t = dict[el.dataset.i18n];
    if (t) el.textContent = t;
  });
  const toggle = document.getElementById('lang-toggle');
  if (toggle) toggle.textContent = lang === 'zh' ? 'EN' : '中文';
}

export function initI18n() {
  const saved = localStorage.getItem('sw-lang');
  const lang = saved === 'en' || saved === 'zh'
    ? saved
    : (navigator.language || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
  apply(lang);
  document.getElementById('lang-toggle')?.addEventListener('click', () => {
    const next = document.documentElement.lang.startsWith('zh') ? 'en' : 'zh';
    localStorage.setItem('sw-lang', next);
    apply(next);
  });
}
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/`
Expected: test 1 PASSES. Test 2 still FAILS (old index.html has no data-i18n yet) — that's expected; it will pass after Task 4. Note this in the task output.

- [ ] **Step 5: Commit**

```bash
git add src/i18n.js tests/i18n.test.mjs
git commit -m "Add bilingual i18n module with key-parity test"
```

---

### Task 3: Canvas paint engine

**Files:**
- Create: `src/paint-engine.js`
- Test: `tests/paint-engine.test.mjs`

- [ ] **Step 1: Write the failing test for the pure color-extraction function**

Create `tests/paint-engine.test.mjs`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/paint-engine.test.mjs`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Write src/paint-engine.js**

```js
// Paints an image onto a canvas in looping stages — soft washes of its
// dominant colors, coarse dabs, fine dabs, then the crisp photo — so the
// viewer watches the result get "drawn" from its basic colors.

const STAGES = { wash: 2500, coarse: 3500, fine: 4000, resolve: 2000, hold: 3000, wipe: 700 };
const WASH_COUNT = 16;

// Pure: pixel buffer (RGBA) -> up to `count` dominant colors, most common
// first. Samples every 16th pixel into coarse 8-level-per-channel buckets.
export function dominantColors(pixels, count = 6) {
  const buckets = new Map();
  for (let i = 0; i < pixels.length; i += 64) {
    const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    const key = ((r >> 5) << 6) | ((g >> 5) << 3) | (b >> 5);
    let bk = buckets.get(key);
    if (!bk) buckets.set(key, bk = { n: 0, r: 0, g: 0, b: 0 });
    bk.n++; bk.r += r; bk.g += g; bk.b += b;
  }
  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((bk) => `rgb(${(bk.r / bk.n) | 0},${(bk.g / bk.n) | 0},${(bk.b / bk.n) | 0})`);
}

export function drawStatic(canvas, img) {
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

export function startPaintLoop(canvas, img, paper = '#f6f1e7') {
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');

  const off = document.createElement('canvas');
  off.width = W; off.height = H;
  const offCtx = off.getContext('2d', { willReadFrequently: true });
  offCtx.drawImage(img, 0, 0, W, H);
  const pixels = offCtx.getImageData(0, 0, W, H).data;
  const palette = dominantColors(pixels);

  const sampleAt = (x, y) => {
    const i = ((y | 0) * W + (x | 0)) * 4;
    return `rgb(${pixels[i]},${pixels[i + 1]},${pixels[i + 2]})`;
  };

  const makeWashes = () =>
    Array.from({ length: WASH_COUNT }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: (0.25 + Math.random() * 0.3) * W,
      color: palette[i % palette.length],
      t0: (i / WASH_COUNT) * STAGES.wash,
    }));

  const drawWash = (wsh) => {
    const grad = ctx.createRadialGradient(wsh.x, wsh.y, 0, wsh.x, wsh.y, wsh.r);
    grad.addColorStop(0, wsh.color);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = grad;
    ctx.fillRect(wsh.x - wsh.r, wsh.y - wsh.r, wsh.r * 2, wsh.r * 2);
    ctx.globalAlpha = 1;
  };

  const drawDabs = (n, rMin, rMax, alpha) => {
    ctx.globalAlpha = alpha;
    for (let i = 0; i < n; i++) {
      const x = Math.random() * W, y = Math.random() * H;
      const r = rMin + Math.random() * (rMax - rMin);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      ctx.scale(1, 0.45);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = sampleAt(x, y);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  };

  const tWash = STAGES.wash;
  const tCoarse = tWash + STAGES.coarse;
  const tFine = tCoarse + STAGES.fine;
  const tResolve = tFine + STAGES.resolve;
  const tHold = tResolve + STAGES.hold;
  const tEnd = tHold + STAGES.wipe;

  let start = performance.now();
  let washes = makeWashes();
  let washIdx = 0;

  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, W, H);

  function frame(now) {
    let t = now - start;
    if (t >= tEnd) {
      start = now;
      t = 0;
      washes = makeWashes();
      washIdx = 0;
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);
    }
    if (t < tWash) {
      while (washIdx < washes.length && washes[washIdx].t0 <= t) drawWash(washes[washIdx++]);
    } else if (t < tCoarse) {
      drawDabs(12, 24, 46, 0.45);
    } else if (t < tFine) {
      drawDabs(40, 5, 12, 0.8);
    } else if (t < tResolve) {
      ctx.globalAlpha = Math.min(1, (t - tFine) / STAGES.resolve);
      ctx.drawImage(off, 0, 0);
      ctx.globalAlpha = 1;
    } else if (t >= tHold) {
      ctx.globalAlpha = Math.min(1, (t - tHold) / STAGES.wipe);
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
```

- [ ] **Step 4: Run tests**

Run: `node --test tests/paint-engine.test.mjs`
Expected: 2 PASS (the DOM-dependent functions are never invoked at import time).

- [ ] **Step 5: Commit**

```bash
git add src/paint-engine.js tests/paint-engine.test.mjs
git commit -m "Add canvas paint engine with dominant-color extraction"
```

---

### Task 4: Rewrite index.html, delete dead files

**Files:**
- Modify: `index.html` (full rewrite)
- Delete: `src/counter.js`, `src/javascript.svg`

- [ ] **Step 1: Delete dead files**

```bash
git rm src/counter.js src/javascript.svg
```

- [ ] **Step 2: Replace index.html entirely**

```html
<!doctype html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Photo Gotcha — AI photo moments by Sparkling Will</title>
  <meta name="description"
    content="Photo Gotcha turns your photos into painted polaroid moments. Upload one or two photos, pick a style, pull the crank. Coming soon to Google Play." />
  <link rel="canonical" href="https://sparklingwill.com/" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://sparklingwill.com/" />
  <meta property="og:title" content="Photo Gotcha — AI photo moments by Sparkling Will" />
  <meta property="og:description"
    content="Upload one or two photos, pick a style, pull the crank — get back a painted polaroid moment. Coming soon to Google Play." />
  <meta property="og:image" content="https://sparklingwill.com/img/result-polaroid.jpg" />

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="https://sparklingwill.com/" />
  <meta property="twitter:title" content="Photo Gotcha — AI photo moments by Sparkling Will" />
  <meta property="twitter:description"
    content="Upload one or two photos, pick a style, pull the crank — get back a painted polaroid moment. Coming soon to Google Play." />
  <meta property="twitter:image" content="https://sparklingwill.com/img/result-polaroid.jpg" />

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Noto+Serif+SC:wght@400;600&display=swap"
    rel="stylesheet">
</head>

<body>
  <nav class="topnav">
    <span class="wordmark">Sparkling Will</span>
    <button id="lang-toggle" class="lang-toggle" type="button" aria-label="Switch language">中文</button>
  </nav>

  <header class="hero">
    <p class="kicker" data-i18n="heroKicker">Sparkling Will presents</p>
    <h1 class="hero-title">Photo Gotcha</h1>
    <p class="tagline" data-i18n="heroTagline">Your photos, painted into a moment.</p>
    <p class="hero-sub" data-i18n="heroSub">Upload a photo or two. Our AI studies their colors, then paints
      you back a moment worth keeping.</p>

    <div class="hero-stage">
      <div class="inputs">
        <figure class="snapshot s1">
          <img src="/img/input-girl.jpg" alt="Input photo: a portrait" width="350" height="600" />
        </figure>
        <figure class="snapshot s2">
          <img src="/img/input-cat.jpg" alt="Input photo: a cat" width="700" height="525" />
        </figure>
        <p class="stage-label" data-i18n="inputsLabel">your photos</p>
      </div>

      <div class="flow">
        <span class="flow-arrow" aria-hidden="true">⟶</span>
        <span class="flow-label" data-i18n="arrowLabel">drawn from their colors</span>
      </div>

      <figure class="polaroid-frame">
        <canvas id="paint-canvas" width="600" height="800"
          aria-label="Animation of the generated polaroid being painted from basic colors"></canvas>
        <figcaption class="stage-label" data-i18n="resultLabel">painted by Photo Gotcha</figcaption>
      </figure>
    </div>

    <span class="cta-pill" data-i18n="heroCta">Coming soon to Google Play</span>
  </header>

  <main>
    <section id="how" class="how fade-in">
      <h2 data-i18n="howTitle">How it works</h2>
      <div class="steps">
        <div class="step">
          <span class="step-mark" aria-hidden="true">①</span>
          <h3 data-i18n="step1Title">Share a photo</h3>
          <p data-i18n="step1Body">Pick one or two photos of you — or anyone you love.</p>
        </div>
        <div class="step">
          <span class="step-mark" aria-hidden="true">②</span>
          <h3 data-i18n="step2Title">Choose a style</h3>
          <p data-i18n="step2Body">Sixteen styles, from neon nights to vintage film.</p>
        </div>
        <div class="step">
          <span class="step-mark" aria-hidden="true">③</span>
          <h3 data-i18n="step3Title">Pull the crank</h3>
          <p data-i18n="step3Body">A polaroid slides out — your moment, painted.</p>
        </div>
      </div>
    </section>

    <section id="styles" class="gallery fade-in">
      <h2 data-i18n="galleryTitle">Styles</h2>
      <p class="gallery-sub" data-i18n="gallerySub">16 styles · 40 city backdrops</p>
      <div class="tpl-grid">
        <figure class="tpl-card">
          <img src="/img/tpl-neon.jpg" alt="Neon style example" loading="lazy" />
          <figcaption data-i18n="tplNeon">Neon</figcaption>
        </figure>
        <figure class="tpl-card">
          <img src="/img/tpl-qipao.jpg" alt="Qipao style example" loading="lazy" />
          <figcaption data-i18n="tplQipao">Qipao</figcaption>
        </figure>
        <figure class="tpl-card">
          <img src="/img/tpl-vintage.jpg" alt="Vintage style example" loading="lazy" />
          <figcaption data-i18n="tplVintage">Vintage</figcaption>
        </figure>
        <figure class="tpl-card">
          <img src="/img/tpl-snow.jpg" alt="Snow style example" loading="lazy" />
          <figcaption data-i18n="tplSnow">Snow</figcaption>
        </figure>
        <figure class="tpl-card">
          <img src="/img/tpl-sunset.jpg" alt="Sunset style example" loading="lazy" />
          <figcaption data-i18n="tplSunset">Sunset</figcaption>
        </figure>
        <figure class="tpl-card">
          <img src="/img/tpl-forest.jpg" alt="Forest style example" loading="lazy" />
          <figcaption data-i18n="tplForest">Forest</figcaption>
        </figure>
      </div>
    </section>

    <section id="about" class="about fade-in">
      <h2 data-i18n="aboutTitle">About Sparkling Will</h2>
      <p data-i18n="aboutBody">We create cool things to empower people to be more productive and kind.</p>
    </section>
  </main>

  <footer>
    <p data-i18n="footer">© 2026 Sparkling Will. All rights reserved.</p>
  </footer>

  <script type="module" src="./src/main.js"></script>
</body>

</html>
```

Note: the snapshot `width`/`height` attributes should match the actual generated asset dimensions from Task 1's output (update the numbers if `prepare-assets` printed different ones) — they prevent layout shift.

- [ ] **Step 3: Run the full test suite**

Run: `node --test tests/`
Expected: ALL PASS — the i18n coverage test from Task 2 now finds the data-i18n attributes.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Rewrite index.html around Photo Gotcha; drop old product cards"
```

---

### Task 5: Restyle (paper/ink theme)

**Files:**
- Modify: `src/style.css` (full rewrite)

- [ ] **Step 1: Replace src/style.css entirely**

```css
:root {
  --paper: #f6f1e7;
  --frame: #fffdf8;
  --ink: #26221c;
  --ink-soft: #6f6557;
  --vermilion: #b8432e;
  --serif: 'Cormorant Garamond', 'Noto Serif SC', 'Songti SC', serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--serif);
  background-color: var(--paper);
  color: var(--ink);
  line-height: 1.7;
  /* faint paper grain */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
}

.lang-zh {
  font-family: 'Noto Serif SC', 'Songti SC', var(--serif);
}

/* ---- nav ---- */
.topnav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.4rem clamp(1.2rem, 5vw, 3rem);
}

.wordmark {
  font-size: 1.05rem;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.lang-toggle {
  font-family: inherit;
  font-size: 0.95rem;
  background: none;
  border: 1px solid var(--vermilion);
  color: var(--vermilion);
  border-radius: 999px;
  padding: 0.25rem 0.9rem;
  cursor: pointer;
  transition: background 0.25s, color 0.25s;
}

.lang-toggle:hover {
  background: var(--vermilion);
  color: var(--frame);
}

/* ---- hero ---- */
.hero {
  text-align: center;
  padding: clamp(2rem, 7vh, 5rem) 1.2rem 4rem;
}

.kicker {
  font-size: 0.85rem;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

.hero-title {
  font-size: clamp(3rem, 9vw, 5.5rem);
  font-weight: 500;
  letter-spacing: 0.04em;
  margin: 0.4rem 0 0.2rem;
}

.tagline {
  font-size: clamp(1.2rem, 3vw, 1.6rem);
  color: var(--vermilion);
  margin-bottom: 0.8rem;
}

.hero-sub {
  max-width: 34rem;
  margin: 0 auto 3rem;
  color: var(--ink-soft);
}

.hero-stage {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: clamp(1rem, 4vw, 3.5rem);
  flex-wrap: wrap;
  margin-bottom: 2.6rem;
}

.inputs {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.snapshot {
  background: var(--frame);
  padding: 8px 8px 22px;
  box-shadow: 0 6px 24px rgba(38, 34, 28, 0.18);
}

.snapshot img {
  display: block;
  width: 130px;
  height: auto;
}

.snapshot.s1 {
  transform: rotate(-5deg);
}

.snapshot.s2 {
  transform: rotate(4deg) translateY(-6px);
}

.stage-label {
  font-size: 0.9rem;
  font-style: italic;
  color: var(--ink-soft);
  margin-top: 0.5rem;
}

.flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.flow-arrow {
  font-size: 2.2rem;
  color: var(--vermilion);
  line-height: 1;
}

.flow-label {
  font-size: 0.85rem;
  font-style: italic;
  color: var(--ink-soft);
  max-width: 9rem;
}

.polaroid-frame {
  background: var(--frame);
  padding: 12px 12px 16px;
  box-shadow: 0 10px 36px rgba(38, 34, 28, 0.22);
  transform: rotate(1.5deg);
}

.polaroid-frame canvas {
  display: block;
  width: min(300px, 76vw);
  height: auto;
  background: var(--paper);
}

.cta-pill {
  display: inline-block;
  border: 1px solid var(--vermilion);
  color: var(--vermilion);
  border-radius: 999px;
  padding: 0.5rem 1.6rem;
  font-size: 1rem;
  letter-spacing: 0.08em;
}

/* ---- sections ---- */
main section {
  max-width: 62rem;
  margin: 0 auto;
  padding: clamp(3rem, 9vh, 5.5rem) 1.4rem;
  text-align: center;
}

main h2 {
  font-size: clamp(1.7rem, 4.5vw, 2.4rem);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

main h2::after {
  content: '';
  display: block;
  width: 2.4rem;
  height: 2px;
  background: var(--vermilion);
  margin: 0.7rem auto 0;
}

/* ---- how ---- */
.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 2.2rem;
  margin-top: 2.4rem;
}

.step-mark {
  font-size: 1.8rem;
  color: var(--vermilion);
}

.step h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0.4rem 0 0.3rem;
}

.step p {
  color: var(--ink-soft);
}

/* ---- gallery ---- */
.gallery-sub {
  color: var(--ink-soft);
  font-style: italic;
  margin-bottom: 2.2rem;
}

.tpl-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
  gap: 1.8rem;
  justify-items: center;
}

.tpl-card {
  background: var(--frame);
  padding: 8px 8px 6px;
  box-shadow: 0 6px 22px rgba(38, 34, 28, 0.16);
  transition: transform 0.35s ease;
}

.tpl-card:nth-child(odd) {
  transform: rotate(-2deg);
}

.tpl-card:nth-child(even) {
  transform: rotate(2deg);
}

.tpl-card:hover {
  transform: rotate(0deg) scale(1.04);
}

.tpl-card img {
  display: block;
  width: 100%;
  max-width: 13rem;
  aspect-ratio: 3 / 4;
  object-fit: cover;
}

.tpl-card figcaption {
  font-size: 0.95rem;
  color: var(--ink-soft);
  padding: 0.4rem 0 0.2rem;
}

/* ---- about / footer ---- */
.about p {
  max-width: 32rem;
  margin: 1.6rem auto 0;
  color: var(--ink-soft);
  font-size: 1.1rem;
}

footer {
  text-align: center;
  padding: 2.5rem 1rem;
  color: var(--ink-soft);
  font-size: 0.9rem;
}

/* ---- scroll fade ---- */
.fade-in {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  .fade-in {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .tpl-card {
    transition: none;
  }
}

@media (max-width: 640px) {
  .hero-stage {
    flex-direction: column;
  }

  .inputs {
    flex-direction: row;
    align-items: flex-end;
    gap: 1.2rem;
  }

  .inputs .stage-label {
    width: 100%;
  }

  .flow-arrow {
    transform: rotate(90deg);
  }
}
```

- [ ] **Step 2: Verify the stylesheet loads**

Run: `npm run dev` (background), open http://localhost:5173 — page should show the paper theme (unstyled hero canvas is still blank until Task 6 wires the engine). Stop the dev server after checking, or leave it running for Task 6.

- [ ] **Step 3: Commit**

```bash
git add src/style.css
git commit -m "Restyle site with paper-and-ink Photo Gotcha theme"
```

---

### Task 6: Rewrite main.js (bootstrap: i18n, fades, hero engine)

**Files:**
- Modify: `src/main.js` (full rewrite)

- [ ] **Step 1: Replace src/main.js entirely**

```js
import './style.css';
import { initI18n } from './i18n.js';
import { startPaintLoop, drawStatic } from './paint-engine.js';

initI18n();

// Reveal sections as they scroll into view.
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  }
}, { threshold: 0.15 });
document.querySelectorAll('.fade-in').forEach((el) => io.observe(el));

// Hero: paint the generated polaroid from its basic colors, looping.
const canvas = document.getElementById('paint-canvas');
const img = new Image();
img.src = '/img/result-polaroid.jpg';
img.onload = () => {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drawStatic(canvas, img);
  } else {
    startPaintLoop(canvas, img, getComputedStyle(document.body).backgroundColor);
  }
};
img.onerror = () => {
  // Without the result image there is nothing to paint; leave the empty
  // polaroid frame (paper-colored canvas) rather than a broken animation.
  canvas.closest('.polaroid-frame')?.classList.add('canvas-failed');
};
```

- [ ] **Step 2: Run all tests**

Run: `node --test tests/`
Expected: ALL PASS.

- [ ] **Step 3: Visual verification in dev server**

Run: `npm run dev` (background), open http://localhost:5173 and verify:
- Hero loop runs: washes → coarse dabs → fine dabs → crisp photo → hold → wipe → repeats (~16s cycle).
- 中文 toggle swaps all copy and persists across reload; EN toggles back.
- Emulate `prefers-reduced-motion: reduce` (DevTools → Rendering) → static polaroid, no loop.
- Narrow to ~375px width → inputs row, arrow rotates, layout holds.

- [ ] **Step 4: Commit**

```bash
git add src/main.js
git commit -m "Wire i18n, scroll fades, and hero paint loop"
```

---

### Task 7: Housekeeping — sitemap, README, build verification

**Files:**
- Modify: `public/sitemap.xml:5` (lastmod)
- Modify: `README.md`
- Modify: `package.json` (add test script)

- [ ] **Step 1: Update sitemap lastmod**

In `public/sitemap.xml` change `<lastmod>2026-02-10</lastmod>` to `<lastmod>2026-06-12</lastmod>`.

- [ ] **Step 2: Add test script to package.json**

In `package.json` scripts add: `"test": "node --test tests/"`.

- [ ] **Step 3: Rewrite README product section**

Replace the full README.md content with:

```markdown
# Sparkling Will Website

Source for [sparklingwill.com](https://sparklingwill.com) — a bilingual
(EN/中文) showcase for **Photo Gotcha**, our AI photo app: upload 1–2
photos, pick a style, pull the crank, get a painted polaroid moment.
(App source: `../photo`.)

## Mission
"We create cool things to empower people to be more productive and kind."

## Stack
- [Vite](https://vitejs.dev/) (Vanilla JS + CSS), no runtime dependencies.
- `src/paint-engine.js` — canvas loop that "paints" the hero polaroid
  from its dominant colors.
- `src/i18n.js` — EN/中文 strings + toggle.
- Deploys to GitHub Pages via `.github/workflows/deploy.yml` on push to main.

## Local development
1. `npm install`
2. `npm run dev`
3. `npm test` — i18n key parity + paint-engine unit tests.

## Demo assets
`public/img/` is generated from `../photo/r2-assets/templates` by
`node tools/prepare-assets.mjs` (requires the photo repo checked out as a
sibling). Re-run if the app's sample/template images change.
```

- [ ] **Step 4: Run tests and production build**

Run: `npm test && npm run build`
Expected: tests PASS; build succeeds; `dist/` contains `index.html`, hashed assets, `img/` with 9 jpgs, `.nojekyll`, `CNAME`.

- [ ] **Step 5: Preview the production build**

Run: `npm run preview` (background), open the printed URL, confirm the hero animation and images work from `dist/`.

- [ ] **Step 6: Commit**

```bash
git add public/sitemap.xml README.md package.json
git commit -m "Update sitemap, README, and test script for the redesign"
```

---

### Task 8: Final review and push (user gate)

- [ ] **Step 1: Full visual pass** — both languages, mobile + desktop widths, reduced motion, hero loop quality. Fix any rough edges found (tune STAGES timing or dab sizes in `src/paint-engine.js` if the painting feels too fast/slow).

- [ ] **Step 2: Ask the user** to look at the dev/preview URL before pushing. Pushing to `main` deploys to production (GitHub Pages). Only `git push` after the user approves.
