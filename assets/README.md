# assets

Drop the project's real design assets here.

| Subfolder | What goes here |
| --- | --- |
| `fonts/` | PP Right Didone and PP Radio Grotesk webfonts (`.woff2`) |
| `scores/` | Engraved sheet-music exports from the Figma file |

The fonts are wired in. The score engravings are still procedurally generated —
see HANDOFF.md §5.

Files land here first; `build.mjs` inlines them into `dist/index.html` so the
prototype stays a single self-contained file with no external requests.
