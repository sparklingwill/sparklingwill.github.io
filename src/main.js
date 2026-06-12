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
