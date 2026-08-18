# fonts

The project's licensed typefaces, as supplied. 30 `.otf` files across two
Pangram Pangram families.

| Family | Files | Weight the design uses |
| --- | --- | --- |
| PP Right Didone | 14 | `Narrow Light` — serif display (`headings/h3`–`h6`) |
| PP Right Grotesk | 16 | `Light` and `Medium` — sans (`body/*`, `buttons/*`) |

## Two things to resolve before these go into the build

**The sans family does not match the Figma variable.** The design's
`Typography/font style/sans serif` token names **PP Radio Grotesk**; what is
supplied here is **PP Right Grotesk** — a different family from the same
foundry. Confirm which is correct before wiring it in.

**These are `.otf`, and the prototype needs `.woff2`.** OpenType files are far
larger than a web subset and Safari support is inconsistent. The build embeds
fonts as data URIs, so each weight needs converting and subsetting to latin
first.

Until both are settled the prototype keeps its substitute faces — Bodoni Moda
for the serif (Didot on iOS) and Outfit for the sans. See HANDOFF.md §5 for the
swap procedure and the two cosmetic compensations to remove once the real
serif is in.

## Licensing

These are commercial faces in a public repository, which makes them
downloadable by anyone. Consider making the repo private, or keeping only
subset `.woff2` files here and the full `.otf` set somewhere access-controlled.
