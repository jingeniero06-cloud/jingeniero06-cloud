# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **static personal portfolio website** (plain HTML/CSS/vanilla JS, deployed to GitHub Pages via `.nojekyll`). There is no build system, no package manager, no backend, no database, and no automated test suite. See `README.md` for the project description.

### Running the site (development)

It **must be served over HTTP** — do not open the pages via `file://`. `script.js` fetches `assets/mega-ai-sites.json` at runtime (the Mega Inc. fleet directory on `mega-inc.html`), which fails under `file://` due to CORS.

Serve the repo root with any static server, e.g.:

```
python3 -m http.server 8000
```

Then browse to `http://localhost:8000/`. Pages: `index.html` (home), `work.html`, `queue.html`, `akua.html`, `campaign-ops.html`, `mega-inc.html`. All share `styles.css` and `script.js`.

### Lint / test / build

- **Build:** none. Files are deployed as-is.
- **Lint:** no linter is configured.
- **Tests:** no automated tests exist. Verify manually in a browser — the core dynamic behavior is the `mega-inc.html` fleet directory populating from `assets/mega-ai-sites.json` and its search/platform/batch filters updating the row count ("Showing X of Y domains").

### Optional asset generation

`scripts/extract_portfolio_images.py` regenerates portfolio preview images from the PDFs in `assets/`. It is a build-time helper (not needed to run the site) and requires `pymupdf` and `pillow`, which are **not** in the update script. Install them only when regenerating assets: `pip install pymupdf pillow`.
