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

## 2a. The showcase frame (presentation only)

`src/showcase.css` wraps the app in a device frame on a captioned stage, so a
reviewer opening the link sees a phone rather than a web page. **None of it is
product** — do not port it to the native app. It contributes the titanium rail,
the Dynamic Island, the side buttons, and the home indicator, all of which the
real device supplies on its own.

It collapses entirely below 620px wide or 640px tall: the app then runs
full-bleed, because a phone frame drawn inside a phone is just a smaller screen.
The caption column needs more room still and appears above 1000px.

The one place the frame reaches into the app is `--safe-bottom`. A real device
reports its home-indicator inset through `env(safe-area-inset-bottom)`; the
simulated device declares the same variable so the tab bar clears the indicator
exactly as it would on hardware.

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
`PP Radio Grotesk` (ultralight 200 / regular 400) for everything else — see §5
on the Radio/Right Grotesk discrepancy.

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

### Fonts — done

The design's licensed faces are wired in. `assets/fonts/` holds the full
supplied set; `build.mjs` embeds three latin subsets as data URIs:

| Design token | File | Weight |
| --- | --- | --- |
| `font style/serif`, `narrow light` | PP Right Didone – Narrow Light | 300 |
| `font style/sans serif`, `ultralight` | PP Right Grotesk – Light | 200 |
| `font style/sans serif`, `regular` | PP Right Grotesk – Medium | 500 |

Weights are declared as the fonts report them rather than as the tokens name
them, so CSS font matching does the mapping: a requested 400 resolves to Medium
(500), a requested 200 hits Light exactly, and headings ask for 300 directly.

**Two open questions.** The Figma token `Typography/font style/sans serif` names
**PP Radio Grotesk**, but the family supplied is **PP Right Grotesk** — a
different family from the same foundry. The prototype uses what was supplied.
If Radio Grotesk is correct, drop those files into `assets/fonts/` and the swap
is three lines in `styles.css` plus three in `build.mjs`.

Related, and visible: the supplied Right Grotesk has no **400** at normal
width — only Light (200) and Medium (500). Every token asking for `regular`
therefore renders at 500, which reads heavy in long text such as the article
body. A Regular weight would fix it, and PP Radio Grotesk very likely has one.

### Icons — done

`src/icons.js` serves the 19 exported glyphs from `/assets`, with their
exported fills and strokes rewritten to `currentColor` so one glyph works
white on the active tab, grey when inactive, and dark on a white button.

Twelve glyphs the export set does not include are still drawn by hand in the
same file, grouped under `drawn` and labelled: chevrons, check, search, stop,
clock, bell, logout, folder, and the celebration drum.

### Article covers — done

`story-cover-one/two.jpg` are wired to the first two articles, re-encoded to
31 KB and 22 KB and embedded by `build.mjs`. The third article still uses the
generated fallback; `Data.articleArt()` prefers a supplied cover and only
generates when there is none.

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
