# fonts

The design specifies two Pangram Pangram faces, which are licensed and not
redistributable, so the prototype ships free substitutes instead:

| Design font | Substitute | Notes |
| --- | --- | --- |
| PP Right Didone | Didot on iOS, else Bodoni Moda | serif display |
| PP Radio Grotesk | Outfit | sans, weights 200/400 |

## Swapping in the real faces

1. Drop the `.woff2` files here.
2. Add an `@font-face` block per weight in `src/styles.css`, naming them exactly
   `PP Right Didone` and `PP Radio Grotesk` — both are already first in the
   `--serif` / `--sans` stacks, so nothing else needs to change.
3. Register each new file in the inline list in `build.mjs`, next to the two
   substitutes, so it gets embedded as a data URI.
4. Remove the two compensations that only exist because Bodoni Moda runs wider
   than PP Right Didone's narrow cut (both flagged in `styles.css`):
   the letter-spacing on `.h3/.h5/.h6`, and the `.piece-card .card-title`
   override back to `headings/h6` at 20/20.
