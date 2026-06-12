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
