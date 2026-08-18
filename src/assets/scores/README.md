# scores

Engraved sheet-music artwork. The design fills every score surface — carousel
cards, the New Piece hero, practice fragments, section thumbnails — with bitmap
engravings that could not be exported from Figma in this environment.

Until they land, `src/score.js` generates them: seeded per piece, with real
staves, clefs, beam groups, accidentals, rests, slurs and ledger lines.

## Swapping in the real artwork

Name each export after its piece id from `src/data.js` — `brahms-pc1`,
`chopin-noct`, `debussy-clair`, `rach-prelude`, `bach-inv` — then point
`UI.scoreFor()` in `src/ui.js` at it. That function is the only place the app
asks for score art, and it already prefers a real image when a piece has one
(that is how uploaded photos become artwork), so the change is one branch.

Note that `build.mjs` will need to inline these as data URIs to keep the single
file self-contained. Tell me the format you are exporting and I will wire it up.
