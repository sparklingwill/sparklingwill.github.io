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
