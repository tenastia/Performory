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

Two hosts are wired up, and both run the same `node build.mjs` and serve
`dist/`.

**Netlify** — `netlify.toml` sets `publish = "dist"`, which is the whole fix
for the "Page not found" screen: the repository root holds only sources, so
without it Netlify looks for an `index.html` that is not there. Every pull
request gets a deploy preview at
`https://deploy-preview-<number>--performory.netlify.app`, and `main` publishes
to the project's own URL. A catch-all `200` redirect to `/index.html` keeps a
hard refresh on a deep link from 404ing, since the prototype routes on the URL
hash.

**GitHub Pages** — `.github/workflows/pages.yml` builds on every push and pull
request, but only pushes to `main` deploy (the `github-pages` environment
rejects deploys from other branches). Enable it once in **Settings → Pages →
Source: GitHub Actions**; after that the run's summary shows the public URL.

Either URL is a real HTTPS origin, so the microphone and persistent state work
there — a sandboxed embed blocks both.

## Layout

| Path | What it is |
| --- | --- |
| `src/index.html` | App shell |
| `src/styles.css` | Design tokens transcribed from Figma + all component styles |
| `src/showcase.css` | Presentation layer — the device frame and stage, not product |
| `src/score.js` | Procedural music-engraving generator (placeholder score art) |
| `src/icons.js` | Line-icon set redrawn to match the Figma icon components |
| `src/data.js` | Seed content — pieces, events, articles, quotes |
| `src/ui.js` | Shared design-system pieces (cards, rings, tab bar, header) |
| `src/screens.js` | One entry per Figma frame |
| `src/app.js` | State, persistence, router, device integrations |
| `build.mjs` | Inlines everything into `dist/index.html` |
| `netlify.toml` | Netlify build command, publish directory and hash-route redirect |

## Handoff

**[HANDOFF.md](HANDOFF.md)** covers the frame-by-frame mapping, the token
transcription, what is real versus simulated, the placeholder assets and how to
replace them, and every place the prototype knowingly departs from the design.
