# fonts

The project's licensed typefaces, as supplied.

## PP Right Didone — in use

14 `.otf` weights. The prototype uses **Narrow Light** (weight 300, narrow
width), which is exactly what the `headings/h3`–`h6` tokens specify. It is
subset to latin, converted to `.woff2` in `src/assets/fonts/`, and embedded by
`build.mjs`.

## PP Radio Grotesk — missing

The design's `Typography/font style/sans serif` token names **PP Radio
Grotesk**. Those files are not in the repository, so the prototype uses a
clearly-marked stand-in (Outfit) for all sans text.

Drop the `.woff2` files here to fix it — see `src/assets/fonts/README.md` for
the four-step swap. The family is already first in the `--sans` stack, so it
takes over as soon as the files exist.

PP Right Grotesk was removed: it is a different family from the same foundry,
uploaded by mistake, and it had no 400 weight at normal width, which made every
`regular` token render too heavy.

## Licensing

These are commercial faces in a public repository, which makes them
downloadable by anyone. Consider making the repo private, or keeping only the
subset `.woff2` files here and the full `.otf` set somewhere access-controlled.
