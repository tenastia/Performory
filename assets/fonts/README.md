# fonts

The project's licensed typefaces, as supplied. 30 `.otf` files across two
Pangram Pangram families.

## In use by the prototype

`build.mjs` embeds latin subsets of three weights, converted to `.woff2` and
kept in `src/assets/fonts/`:

| File here | Weight | Where it is used |
| --- | --- | --- |
| `PP Right Didone - Narrow Light.otf` | 300 | `headings/h3`–`h6` |
| `PPRightGrotesk-Light.otf` | 200 | `body/*_light` |
| `PPRightGrotesk-Medium.otf` | 500 | `body/*_regular`, `buttons/*` |

The remaining 27 files are the rest of both families, kept for future use.

## Open question

The Figma token `Typography/font style/sans serif` names **PP Radio Grotesk**;
the family supplied here is **PP Right Grotesk** — a different family from the
same foundry. The prototype uses what was supplied. If Radio Grotesk is the
correct one, add it here and the swap is three lines in `styles.css` plus three
in `build.mjs`.

## Licensing

These are commercial faces in a public repository, which makes them
downloadable by anyone. Consider making the repo private, or keeping only the
subset `.woff2` files in the repo and the full `.otf` set somewhere
access-controlled.
