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
