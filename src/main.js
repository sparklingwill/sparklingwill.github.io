import './style.css';
import { initI18n, t } from './i18n.js';
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
const toggle = document.getElementById('motion-toggle');
const img = new Image();
img.src = '/img/result-polaroid.jpg';
img.onload = () => {
  const paper = getComputedStyle(document.body).backgroundColor;
  const loop = startPaintLoop(canvas, img, paper, { autoplay: false });

  // Default to still for anyone who asked the OS for less motion, or who
  // paused on an earlier visit — but always leave a way back in.
  const saved = localStorage.getItem('sw-motion');
  const wanted = saved === 'play' || saved === 'pause'
    ? saved === 'play'
    : !matchMedia('(prefers-reduced-motion: reduce)').matches;

  const relabel = () => {
    toggle.textContent = t(loop.running ? 'motionPause' : 'motionPlay');
  };

  if (wanted) loop.play();
  else drawStatic(canvas, img);

  relabel();
  toggle.hidden = false;
  document.addEventListener('sw:langchange', relabel);
  toggle.addEventListener('click', () => {
    if (loop.running) {
      loop.pause();
      localStorage.setItem('sw-motion', 'pause');
    } else {
      loop.play();
      localStorage.setItem('sw-motion', 'play');
    }
    relabel();
  });
};
img.onerror = () => {
  // Without the result image there is nothing to paint; leave the empty
  // polaroid frame (paper-colored canvas) rather than a broken animation.
  canvas.closest('.polaroid-frame')?.classList.add('canvas-failed');
};
