## Rules
- Ignore all paths in `.gitignore` (node_modules, dist, etc.).
- Ensure the repo is clean and only the necessary files are committed.

## Deployment & Troubleshooting

### Static Asset Loading (JS/CSS)
- **Deployment Platform**: GitHub Pages (Custom Domain `sparklingwill.com`)
- **Vite Configuration**:
  - Use `base: '/'` in `vite.config.js` for absolute paths.
  - This is required for custom domains (e.g., `sparklingwill.com`), not relative paths (`./`) which are usually for subdirectories.
- **GitHub Pages Quirk**:
  - Always include an empty `.nojekyll` file in `public/`.
  - This prevents Jekyll from ignoring files/directories starting with `_` (even though Vite defaults to `assets`, this is a safety measure).

### Local Verification
- **Do NOT**: Open `dist/index.html` directly via file explorer (`file://` protocol). This fails due to module loading restrictions.
- **Do**: Run `npm run preview` to spin up a local server for the `dist` folder.
- **Do**: Open the localhost URL (e.g., `http://localhost:4173/`) provided by the preview command.
