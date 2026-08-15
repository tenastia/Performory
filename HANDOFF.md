# Performory — prototype handoff

Built from Figma file `JcyxyoeuSt9eXvx8snYdfW`, section **Performory flow**
(`73:4999`). Everything below is what a developer or designer needs in order to
pick this up: what maps to what, what is real, what is standing in for
something, and where the prototype knowingly departs from the design.

---

## 1. What this is

A single-file, dependency-free web prototype styled as the iOS app. It runs in
mobile Safari, installs to the home screen, and drives real platform APIs where
the design implies them.

It is a **prototype**, not an iOS codebase. Nothing here is meant to be
compiled into an app — it exists to make the flow clickable, to pressure-test
the interaction model, and to serve as an unambiguous spec for whoever builds
the native app.

---

## 2. Screen inventory

All 17 designed frames are implemented, plus 4 screens the flow references but
does not draw. Routes are hash-based (`#/home`, `#/piece/brahms-pc1`, …).

| # | Figma frame | Node | Route | Notes |
| --- | --- | --- | --- | --- |
| 1 | Home Screen | `73:2571` | `/home` | Coverflow carousel is drag- and tap-driven |
| 2 | Library Screen | `73:2787` | `/library` | The Practice tab |
| 3 | Individual Piece | `73:2803` | `/piece/:id` | Chart re-renders per range |
| 4 | sections selector modal | `73:3226` | `/sections/:id` | Renders as a true overlay above the piece |
| 5 | Practice Screen Beginning | `73:2881` | `/practice/:id` | `Show Bars: One` |
| 6 | Practice Screen Two Bars | `74:5877` | `/practice/:id` | `Show Bars: Two` |
| 7 | Practice Screen Three Bars | `74:6204` | `/practice/:id` | `Show Bars: Three` |
| 8 | Record | `73:2915` | `/record/:id` | Live microphone |
| 9 | Practice End Screen | `73:3173` | `/end/:id` | Stats reflect the session just finished |
| 10 | Upload File | `73:2623` | `/new` | |
| 11 | File Browser – iOS – Folder – Grid | `74:5002` | `/files` | See §5 |
| 12 | Uploading Screen | `73:2639` | `/uploading` | Real read progress |
| 13 | New Piece Title | `73:2646` | `/title` | |
| 14 | New Piece Title Input | `73:2673` | `/title` | Same screen, focused state |
| 15 | New Piece Add Due Date | `73:2700` | `/duedate` | |
| 16 | New Piece Date Selector | `73:2721` | `/duedate` | Same screen, calendar revealed by "Yes" |
| 17 | Ne Piece Schedule Set Up | `73:2746` | `/schedule` | |

Frames 13/14, 15/16 and 5/6/7 are states of one screen rather than separate
screens — that is how they are built, and how they should be built natively.

### Screens added

The flow links to these but never draws them. They are built in the design's
system and each carries a visible note saying it is an addition.

| Route | Why it exists |
| --- | --- |
| `/profile` | The tab bar has a fourth tab with no destination |
| `/events` | "All Events" (Home) and "See All" (Piece) both point somewhere |
| `/article/:id` | The "Read about stagefright" cards are tappable |
| Library empty state | The flow only shows a populated library |

---

## 3. Design tokens

Transcribed from the Figma variable collections, not eyeballed. They live at the
top of `src/styles.css` as custom properties.

### Colour — `Colour/Primary`

| Token | Value | Used for |
| --- | --- | --- |
| `--black-1000` | `#191919` | App background |
| `--black-950` | `#292929` | Raised surfaces, icon buttons, chips |
| `--black-900` | `#333333` | Hairline borders, chart gridlines |
| `--black-800` | `#474747` | Inactive carousel dots |
| `--black-700` | `#5c5c5c` | Weekday axis labels |
| `--black-500` | `#858585` | Inactive segmented-control labels |
| `--black-400` | `#999999` | |
| `--black-300` | `#adadad` | Inactive tab labels, score-card border |
| `--black-200` | `#c2c2c2` | Progress-ring stroke and value |
| `--black-50` | `#e0e0e0` | |
| `--white` | `#ffffff` | |
| `--off-white` | `#fcfcfc` | Score-card paper |
| `--muted` | `#a8a8a8` | Section labels ("Upcoming events") |

### Typography

Serif `PP Right Didone` (narrow light, weight 300) for display; sans
`PP Radio Grotesk` (ultralight 200 / regular 400) for everything else.

| Style | Size / line-height |
| --- | --- |
| `headings/h3` | 32 / 36 |
| `headings/h5` | 24 / 24 |
| `headings/h6` | 20 / 20 |
| `body/md` | 16 / 20 |
| `body/s` | 14 / 16 |
| `body/xs` | 12 / 16 |
| `body/xxs` | 10 / 14, tracking 0.2 |
| `buttons/primary_button_lg` | 16 / 20 |

### Geometry

| Token | Value | Applies to |
| --- | --- | --- |
| `--r-sm` | 6px | Icon buttons, stat tiles, segmented items |
| `--r-md` | 8px | Segmented container, inputs, section cards |
| `--r-lg` | 12px | Cards, primary buttons, calendar tiles |
| `--r-pill` | 30px | Active tab pill |
| `--gutter` | 24px | Page gutter throughout |

Frames are 402pt (iPhone 16 Pro); Home is drawn at 393pt (iPhone 16). The
prototype is fluid and centres on a 440px max width, so both resolve correctly.

---

## 4. Interaction model

### Real platform APIs

| Behaviour | API | Degrades to |
| --- | --- | --- |
| "From Device" upload | `<input type="file">` — the real iOS document picker | Toast if cancelled |
| Upload progress | `FileReader` `onprogress` — genuine byte progress | — |
| Score artwork | `<canvas>` downscale to 900px JPEG, stored as a blob | Procedural engraving for PDF/MusicXML |
| Recording | `getUserMedia` + `MediaRecorder` | Simulated meter, labelled on screen |
| Live waveform | WebAudio `AnalyserNode`, time-domain peak per bar | Synthesised waveform |
| Playback | `Audio` + object URL | Toast explaining the take was simulated |
| Saving a take | Blob download | Blocked inside sandboxed viewers; the file is still stored |
| Blob storage | IndexedDB (`performory` → `blobs`) | In-memory for the session only |
| App state | `localStorage` (`performory.state.v1`) | In-memory |
| Notification opt-in | `Notification.requestPermission()` on "Yes" | No-op |

Everything degrades rather than failing: if the microphone is denied or the page
is in a sandboxed iframe, the recorder still runs with a synthesised meter and
says so under the timer. **Upload an image of a score and it becomes that
piece's artwork everywhere** — carousel, library, hero, practice fragments —
and survives a reload.

### Model

- A **session** is created when you tap Start Practice. It carries the chosen
  sections, a fragment count, the played/skipped tally, and any takes recorded.
- **Fragments per section is 4** (`FRAGMENTS_PER_SECTION`, `src/app.js`). Three
  sections → 12 fragments, so one "Played" reads as ~9%, matching the Practice
  frame. This number is invented — the design does not specify it.
- Finishing a session increments `sessions`, adds played fragments to
  `sectionsPracticed`, and raises `memorized` by up to 6 points scaled by the
  share played cleanly. Also invented; the real curve is a product decision.
- "Skip" advances without credit.

### Navigation

Push (slide from right), pop, modal (slide up), overlay (fade, keeps the screen
beneath), and cross-fade between tabs. Reduced-motion is honoured. A navigation
requested during a transition is queued rather than dropped.

---

## 5. Placeholder assets — and how to replace them

Three things in the prototype stand in for assets that exist in the design but
could not be exported: this environment's network policy blocks `figma.com`
asset URLs, and both typefaces are commercially licensed.

Each is isolated behind one swap point.

### Fonts

`PP Right Didone` and `PP Radio Grotesk` are Pangram Pangram faces and are not
redistributable, so the prototype ships free substitutes:

- serif → **Didot** on iOS (a close match, already on the device), falling back
  to embedded **Bodoni Moda**
- sans → embedded **Outfit**

**To swap in the real fonts:** drop the `.woff2` files in
`src/assets/fonts/`, add two `@font-face` blocks naming them `PP Right Didone`
and `PP Radio Grotesk`, and register them in `build.mjs`'s inline list. Nothing
else changes — both families are already first in the stacks in `src/styles.css`.

Two cosmetic compensations exist purely because Bodoni Moda runs wider than
PP Right Didone's narrow cut, and should be **removed** once the real face is in:

- `-0.015em` letter-spacing and `text-wrap: balance` on `.h3/.h5/.h6`
- `.piece-card .card-title` overridden to 18/20 with a two-line clamp — the
  design has it at `headings/h6` (20/20) on a single line

### Score artwork

The design fills score surfaces with bitmap engravings. `src/score.js` generates
them instead: seeded so a piece always renders the same music, with real staves,
clefs, beam groups, accidentals, rests, slurs and ledger lines.

**To swap in the real artwork:** put the exports in `src/assets/scores/` and
change `UI.scoreFor()` in `src/ui.js` — it is the only function the app calls
for score art, and it already prefers a real image when a piece has one (that is
how uploaded images work). Everything downstream keeps working.

### Icons

`src/icons.js` redraws the Figma icon components as 1.4px line glyphs. Replace
individual entries in the `glyphs` map with the real exports.

Article cover art is likewise abstract (`Data.articleArt`) standing in for the
rendered 3D illustrations.

---

## 6. Deviations from the design

Deliberate, and worth reviewing:

1. **Library card size.** The Library frame draws the score card ~8% smaller
   than the Home carousel. The prototype uses the component's native 242×356 in
   both places, assuming the Figma difference is incidental.
2. **iOS document picker (`74:5002`).** That frame is Apple's own Files sheet,
   which the OS supplies. "From Device" therefore opens the *real* picker. The
   drawn browser is kept and reachable via "From Google Drive" / "From Dropbox",
   standing in for those providers' pickers — which are also not ours to draw.
3. **Record screen dismissal.** The frame has no chrome, so a user who opens it
   and does not record has no exit. A grabber was added at the top.
4. **Repeated placeholder content.** The Library shows the same Brahms card five
   times and Home the same recital three times. The seed data varies them so
   list behaviour, sorting and empty states are actually exercised.
5. **Date label on a new piece.** Pieces created without a due date show `—`;
   the design only ever shows a populated date chip.
6. **Chart data** is synthesised per piece and range. The design shows one
   static curve.

## 7. Not built

Called out so nobody assumes otherwise. Each is a toast in the prototype:

- Sort and filter on Library (icons are drawn, no behaviour is specified)
- The `…` overflow menus
- MuseScore / Google Drive / Dropbox account linking
- Practice settings (the gear on the Practice and End screens)
- Score cropping (the pencil on the New Piece hero)
- Calendar sync from the events screens

Section thumbnails in the selector modal are generated per section rather than
being real slices of the uploaded score — slicing needs the real engraving and
the section boundaries that "Identified Sections: 48" implies.

## 8. Open questions for the design

1. **What is a "section", and what is a "fragment"?** The Practice screen shows
   one fragment at a time and the modal selects sections, but the relationship
   is unspecified. The prototype assumes 4 fragments per section.
2. **How does `Memorized %` actually move?** Currently invented (see §4).
3. **What does "Identified Sections: 48" mean for a 3-page PDF** — is section
   detection server-side, and what happens while it is still running? The
   prototype jumps straight from upload to a finished count of 48.
4. **What happens to a piece with no due date?** It has no place in the "31
   Sept" chip or in the schedule recommendation, which is phrased around a
   deadline.
5. **Does the practice schedule drive local notifications, and what do they
   say?** The toggle exists; the content does not.
6. **`31 Sept`** appears on the Home card and in the Brahms seed data. September
   has 30 days.
