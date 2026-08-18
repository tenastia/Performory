# fonts (build inputs)

Latin subsets of the project's licensed faces, converted from the `.otf`
originals in `/assets/fonts/`. `build.mjs` embeds these as data URIs so the
prototype stays a single self-contained file.

| File | Family declared in CSS | Weight |
| --- | --- | --- |
| `pp-right-didone-narrow-light.woff2` | `PP Right Didone` | 300 |
| `pp-right-grotesk-light.woff2` | `PP Right Grotesk` | 200 |
| `pp-right-grotesk-medium.woff2` | `PP Right Grotesk` | 500 |

Weights are declared as the fonts themselves report them, not as the design
tokens name them, so CSS font matching resolves the tokens on its own: a
requested 400 finds Medium (500), a requested 200 finds Light exactly.

## Regenerating

```
pyftsubset "assets/fonts/<file>.otf" \
  --unicodes="U+0020-007F,U+00A0-00FF,U+2010-2027,U+2030-205E,U+20AC,U+2122" \
  --flavor=woff2 --layout-features='*' --no-hinting --desubroutinize \
  --output-file="src/assets/fonts/<name>.woff2"
```
