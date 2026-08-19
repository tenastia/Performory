# fonts (build inputs)

Web-ready fonts embedded as data URIs by `build.mjs`, so the prototype stays a
single self-contained file.

| File | Family in CSS | Weight | Status |
| --- | --- | --- | --- |
| `pp-right-didone-narrow-light.woff2` | `PP Right Didone` | 300 | licensed, correct |
| `outfit-substitute.woff2` | `Outfit` | 100–900 variable | **placeholder** |

## Replacing the sans placeholder

The design specifies **PP Radio Grotesk**, which has not been supplied. Outfit
stands in: a geometric grotesk of similar proportion, variable across 100–900
so both weights the tokens ask for (200 ultralight, 400 regular) resolve to
real instances.

1. Put the PP Radio Grotesk `.woff2` files here.
2. In `src/styles.css`, add an `@font-face` per weight naming the family
   exactly `PP Radio Grotesk`, and delete the `Outfit` block above it.
3. Register each file in the inline list in `build.mjs`.
4. Delete `outfit-substitute.woff2`.

`PP Radio Grotesk` is already first in the `--sans` stack, so nothing else
needs to change.

## Regenerating the Didone subset

```
pyftsubset "assets/fonts/PP Right Didone - Narrow Light.otf" \
  --unicodes="U+0020-007F,U+00A0-00FF,U+2010-2027,U+2030-205E,U+20AC,U+2122" \
  --flavor=woff2 --layout-features='*' --no-hinting --desubroutinize \
  --output-file="src/assets/fonts/pp-right-didone-narrow-light.woff2"
```
