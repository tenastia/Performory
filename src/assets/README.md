# assets

Drop-point for the real design assets. Everything the prototype currently ships
in place of them is a documented stand-in — see HANDOFF.md §5.

| Folder | What goes here | Currently standing in |
| --- | --- | --- |
| `fonts/` | The licensed webfonts | Bodoni Moda + Outfit (free substitutes) |
| `scores/` | Engraved score exports from the design | Procedural SVG engravings |

Anything added here is inlined into `dist/index.html` by `build.mjs`, so the
prototype stays a single self-contained file with no external requests.
