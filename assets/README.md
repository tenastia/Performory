# assets

Drop the project's real design assets here.

| Subfolder | What goes here |
| --- | --- |
| `fonts/` | PP Right Didone and PP Radio Grotesk webfonts (`.woff2`) |
| `scores/` | Engraved sheet-music exports from the Figma file |

The prototype currently ships documented stand-ins for both — free substitute
typefaces and procedurally generated engravings. See HANDOFF.md §5 for what each
one replaces and how the swap works.

Files land here first; `build.mjs` inlines them into `dist/index.html` so the
prototype stays a single self-contained file with no external requests.
