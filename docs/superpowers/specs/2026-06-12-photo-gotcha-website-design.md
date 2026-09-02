# Sparklingwill website redesign — Photo Gotcha showcase

**Date:** 2026-06-12
**Status:** Approved by user; body updated 2026-09-01 to match what shipped.
**Changelog:** see "Changes since approval" at the end.

## Goal

Rebuild sparklingwill.com as a single-page showcase for the Photo Gotcha
app (AI photo generation: upload 1–2 reference photos, pick a template,
pull the crank, get a polaroid). The page must give visitors the feeling
that the app takes their input photos and *paints* the result from its
basic colors. Design language follows https://shuimo-liuyun.vercel.app/:
minimalist, poetic, ink-on-paper.

Read Code, the highlight extension, and all other tools are removed from
the page. `releases/extension.zip` stays on disk (unlinked) so old links
don't 404.

## Decisions (user-confirmed)

- **App CTA:** "Coming soon to Google Play" — no download link yet.
- **Demo assets:** use the photo repo's own samples —
  `sample_input_girl.png` + `sample_input_cat.jpeg` as inputs,
  `polaroid.jpeg` as the generated result; template images for a gallery.
- **Language:** fully bilingual EN/中文 with a toggle.
- **Hero effect:** canvas painting engine (no libraries).

## Aesthetic

- Warm paper-white background with subtle grain; ink-dark (#1f1d1a-ish)
  text; generous whitespace; slow fade-in on scroll.
- Single accent color: vermilion 朱砂 (≈ #c0392b / traditional E34234
  family) used sparingly (toggle, CTA pill, small rules).
- Type: Cormorant Garamond (display, Latin) + Noto Serif SC (Chinese),
  with a clean system sans fallback for body where appropriate.
- Galaxy/star theme fully removed (`stars-container`, star CSS,
  `counter.js` leftovers deleted).

## Page structure (single page)

1. **Nav** — "Sparklingwill" wordmark; EN/中文 toggle.
2. **Hero** — "Photo Gotcha" title + poetic tagline
   (EN: "Your photos, painted into a moment" · ZH: 「一拍，一世界」 or
   similar). Centerpiece animation (below). Two CTA pills: "Try it in your
   browser", linking to the web client at `/app/`, and a quiet "Coming soon
   to Google Play" pill that is not a link.
3. **How it works** — three steps with minimal line icons:
   ① upload 1–2 photos ② pick a template ③ pull the crank → polaroid.
4. **Template gallery** — fourteen tilted polaroid-framed cards: polaroid,
   mystic, academy, vintage, qipao, forest, sunset, snow, neon, paparazzi,
   camellia, tomato, mohair, casual. Caption: "14 styles to choose from"
   (ZH equivalents).
5. **About** — existing one-line Sparklingwill mission, translated.
6. **Footer** — © 2026 Sparklingwill, plus links: Web app, Privacy Policy,
   Delete account & data.

## Hero painting animation (canvas engine)

A `<canvas>` displays the result polaroid being painted, looping:

1. **Inputs appear** — the two input photos drift in as small tilted
   snapshots beside/above the canvas.
2. **Stage 1 — color washes:** 5–8 dominant colors extracted from the
   result image (coarse downsample + simple clustering) rendered as
   large, soft, semi-transparent blobs.
3. **Stage 2 — coarse strokes:** hundreds of large dabs whose color is
   sampled from the result image at the dab position.
4. **Stage 3 — fine strokes:** thousands of small dabs; detail emerges.
5. **Stage 4 — resolve:** the crisp photo cross-fades in over the
   strokes. Pause ~3s, wipe clean, loop.

Implementation: pure vanilla JS, requestAnimationFrame, offscreen canvas
holding the source pixels for sampling. Target ~150–250 lines, no
dependencies. Time-budgeted stages, divided by a `SPEED` constant, so the total loop is
≈10.5s. Dab counts scale with `SPEED` so shortening the stages does not
thin out the painting. Measured 10467ms on the live site, 2026-09-01.

**Fallbacks:**
- `prefers-reduced-motion: reduce` → static final polaroid, no loop. A
  play/pause control in the polaroid caption lets any visitor stop the loop
  (WCAG 2.2.2 requires a way to stop motion that runs past 5s) and lets a
  reduced-motion visitor opt in. The choice persists in `localStorage`
  (`sw-motion`).
- Image load failure → static final polaroid (or hide hero canvas
  gracefully if even that fails).

## i18n

- All copy lives in a `strings` dict in JS: `{ en: {...}, zh: {...} }`.
- Toggle button swaps text via `data-i18n` attributes; choice persisted
  in `localStorage`; first visit defaults from `navigator.language`
  (zh* → 中文, else EN).
- `<html lang>` updated on toggle. Meta tags stay English (SEO primary
  market) — only visible page copy toggles.

## Assets

Source images live in `C:\Users\xw431\source\repos\photo\r2-assets\`.
Copy into `public/img/` after resizing/compressing to web size
(longest edge ≈ 800px for gallery, ≈ 1000px for hero result; target
~100–200KB each, JPEG/WebP). Needed files:

- `input-girl`, `input-cat`, `result-polaroid` (hero)
- `tpl-{polaroid,mystic,academy,vintage,qipao,forest,sunset,snow,neon,
  paparazzi,camellia,tomato,mohair,casual}` (gallery, 14 files)

Gallery images use `loading="lazy"`.

## SEO / meta

- Title: "Photo Gotcha — AI photo moments by Sparklingwill" (or
  similar); description, OG, and Twitter meta rewritten around Photo
  Gotcha; og:image points at the hero result image.
- Canonical stays `https://sparklingwill.com/`; `robots.txt` and
  `sitemap.xml` kept (sitemap date refreshed).

## Tech / files

Keep the existing Vite vanilla stack. Expected changes:

- `index.html` — rewritten structure + meta.
- `src/style.css` — full restyle (paper theme).
- `src/main.js` — i18n, scroll fades, hero engine bootstrap.
- `src/paint-engine.js` — new: the canvas painting animation.
- `src/i18n.js` — new: strings + toggle logic.
- `src/counter.js`, `src/javascript.svg` — deleted.
- `public/img/` — new compressed assets.
- `.gitattributes` — added 2026-09-01; normalises line endings, which had
  been rewriting every file in the repo as CRLF churn.

Deployment unchanged: `vite build` → `dist/` → GitHub Pages
(`CNAME` = sparklingwill.com; absolute paths + `.nojekyll` conventions
from the previous deployment fix are preserved).

## Testing

- `npm run dev`: visual pass — hero loop, both languages, reduced-motion
  emulation, mobile widths (~375px) and desktop.
- `npm run build` + preview of `dist/`: assets resolve, meta correct.

## Beyond the original scope

These shipped after this spec was approved and are not part of the redesign
it describes. Recorded here so a QA pass does not read them as drift.

- **Legal and support pages**, each standalone with its own inline styles:
  `privacy.html`, `terms.html`, `delete-account.html` (Play Console
  requirement), `support.html` (App Store listing requires a Support URL).
- **Web client at `/app/`** — a separate build published into `public/app/`,
  linked from the hero and footer.

## Changes since approval

| Date | Change |
|---|---|
| 2026-06-12 | Same-day build refinements this spec was never updated for: brand set as one word "Sparklingwill" (143ab42); gallery grew from 6 styles to all 14 and the caption dropped the "40 city backdrops" claim (0cc63bf, d4aa71a); slogan set to "Curate the beauty of simplicity" (d784c5e) |
| 2026-06-15 | Account & data deletion page added (Play Console requirement) |
| 2026-08-14 | Terms of Use added; privacy + deletion pages updated for iOS |
| 2026-08-31 | Privacy policy: generation consent, content reports, post-deletion email hash, per-request log and IP address, purchase retention |
| 2026-08-31 | Support page added; hero loop given a play/pause control and sped up to ≈10.5s |
| 2026-09-01 | Web client published at `/app/`; `.gitattributes` added |

Open items are tracked in `qa-findings.csv` at the repo root.
