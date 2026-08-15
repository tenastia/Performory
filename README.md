# Performory

Memory training app for musicians that builds anxiety resilience.

This repository holds an **interactive prototype** of the iOS app, built from the
Figma flow [`performory / Performory flow`](https://www.figma.com/design/JcyxyoeuSt9eXvx8snYdfW/performory?node-id=73-4999)
(node `73:4999`).

It is a self-contained web prototype styled as the iOS app — no build tooling,
no dependencies, no network calls. Open it in mobile Safari and add it to the
home screen and it runs full-screen like the real thing.

## Run it

```bash
node build.mjs                 # bundles src/ into dist/index.html
open dist/index.html           # or serve dist/ and open it on a phone
```

`dist/index.html` is a single file with the fonts inlined. Serving it over
HTTPS (or `localhost`) is required for the microphone and for state to persist —
`file://` disables IndexedDB.

During development you can skip the build and open `src/index.html` directly.

## Publishing it publicly

`.github/workflows/pages.yml` rebuilds `dist/` and publishes it to GitHub Pages
on every push to `main` or the prototype branch. Enable it once in
**Settings → Pages → Source: GitHub Actions**; after that the run's summary
shows the public URL.

A Pages URL is a real HTTPS origin, so the microphone and persistent state work
there — a sandboxed embed blocks both.

## Layout

| Path | What it is |
| --- | --- |
| `src/index.html` | App shell |
| `src/styles.css` | Design tokens transcribed from Figma + all component styles |
| `src/score.js` | Procedural music-engraving generator (placeholder score art) |
| `src/icons.js` | Line-icon set redrawn to match the Figma icon components |
| `src/data.js` | Seed content — pieces, events, articles, quotes |
| `src/ui.js` | Shared design-system pieces (cards, rings, tab bar, header) |
| `src/screens.js` | One entry per Figma frame |
| `src/app.js` | State, persistence, router, device integrations |
| `build.mjs` | Inlines everything into `dist/index.html` |

## Handoff

**[HANDOFF.md](HANDOFF.md)** covers the frame-by-frame mapping, the token
transcription, what is real versus simulated, the placeholder assets and how to
replace them, and every place the prototype knowingly departs from the design.
