/*
 * score.js — procedural music-engraving generator.
 *
 * PLACEHOLDER ART. The Figma file uses real engraved score images as bitmap
 * fills. Until those exports land in src/assets/scores/, every score surface in
 * the prototype (carousel cards, practice fragments, section thumbnails) is
 * drawn by this generator as inline SVG.
 *
 * To swap in the real artwork see HANDOFF.md → "Replacing placeholder assets".
 * Nothing else in the app calls into the drawing internals; Score.svg() is the
 * only entry point, so replacing it is a one-function change.
 */
var Score = (function () {
  'use strict';

  /* ---------------------------------------------------------------- random */

  // Deterministic PRNG so a given piece always renders the same score.
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  /* ------------------------------------------------------------------ clef */

  // The clefs are drawn as tapered strokes rather than filled glyph outlines:
  // it keeps the fine-line engraving feel of the design and avoids shipping a
  // music font. Coordinates are in staff-spaces, origin at the top staff line.

  function spiralPath(cx, cy, r0, r1, a0, a1, turns) {
    var pts = [];
    var steps = 48;
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      var ang = a0 + (a1 - a0) * t;
      var r = r0 + (r1 - r0) * t;
      pts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
    }
    return pts;
  }

  function smooth(pts) {
    if (pts.length < 2) return '';
    var d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
    for (var i = 1; i < pts.length - 1; i++) {
      var mx = (pts[i][0] + pts[i + 1][0]) / 2;
      var my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += 'Q' + f(pts[i][0]) + ' ' + f(pts[i][1]) + ' ' + f(mx) + ' ' + f(my);
    }
    var last = pts[pts.length - 1];
    d += 'L' + f(last[0]) + ' ' + f(last[1]);
    return d;
  }

  function f(n) {
    return Math.round(n * 100) / 100;
  }

  // G clef. The spiral eye sits on the G line (staff line 4 from the top = y 3).
  function trebleClef(x, s, ink) {
    var g = [];
    var cx = x + 0.9 * s;
    var eye = 3 * s; // G line

    // Inner spiral, unwinding outward and up.
    var spiral = spiralPath(cx, eye, 0.16 * s, 1.08 * s, Math.PI * 0.35, -Math.PI * 2.35, 0);
    // Sweep up the left side, over the top hook, and back down through the eye
    // into the tail. Proportioned so the clef spans ~7 staff spaces overall.
    var upper = [
      [cx - 1.06 * s, eye - 0.25 * s],
      [cx - 1.0 * s, eye - 1.6 * s],
      [cx - 0.42 * s, eye - 2.85 * s],
      [cx + 0.14 * s, eye - 3.85 * s],
      [cx + 0.36 * s, eye - 4.55 * s],
      [cx + 0.16 * s, eye - 4.95 * s],
      [cx - 0.18 * s, eye - 4.6 * s],
      [cx - 0.3 * s, eye - 3.75 * s],
      [cx - 0.12 * s, eye - 2.4 * s],
      [cx + 0.14 * s, eye - 0.9 * s],
      [cx + 0.34 * s, eye + 0.7 * s],
      [cx + 0.42 * s, eye + 1.85 * s],
      [cx + 0.24 * s, eye + 2.6 * s],
      [cx - 0.24 * s, eye + 2.85 * s],
      [cx - 0.7 * s, eye + 2.55 * s],
      [cx - 0.72 * s, eye + 2.05 * s],
      [cx - 0.4 * s, eye + 1.92 * s],
      [cx - 0.2 * s, eye + 2.15 * s]
    ];

    g.push(
      '<path d="' + smooth(spiral) + '" fill="none" stroke="' + ink +
      '" stroke-width="' + f(0.26 * s) + '" stroke-linecap="round"/>'
    );
    g.push(
      '<path d="' + smooth(upper) + '" fill="none" stroke="' + ink +
      '" stroke-width="' + f(0.3 * s) + '" stroke-linecap="round"/>'
    );
    return g.join('');
  }

  // F clef: a filled comma with two dots straddling the F line (y 1).
  function bassClef(x, s, ink) {
    var cx = x + 0.5 * s;
    var fLine = 1 * s;
    var body = [
      [cx + 0.15 * s, fLine - 0.85 * s],
      [cx + 0.7 * s, fLine - 0.55 * s],
      [cx + 0.85 * s, fLine + 0.35 * s],
      [cx + 0.5 * s, fLine + 1.6 * s],
      [cx - 0.35 * s, fLine + 2.5 * s],
      [cx - 1.15 * s, fLine + 2.95 * s]
    ];
    return (
      '<circle cx="' + f(cx + 0.1 * s) + '" cy="' + f(fLine - 0.55 * s) + '" r="' + f(0.42 * s) +
      '" fill="' + ink + '"/>' +
      '<path d="' + smooth(body) + '" fill="none" stroke="' + ink + '" stroke-width="' +
      f(0.42 * s) + '" stroke-linecap="round"/>' +
      '<circle cx="' + f(cx + 1.35 * s) + '" cy="' + f(fLine - 0.5 * s) + '" r="' + f(0.16 * s) +
      '" fill="' + ink + '"/>' +
      '<circle cx="' + f(cx + 1.35 * s) + '" cy="' + f(fLine + 0.5 * s) + '" r="' + f(0.16 * s) +
      '" fill="' + ink + '"/>'
    );
  }

  /* ------------------------------------------------------------ accidentals */

  function sharp(x, y, s, ink) {
    var w = 0.28 * s;
    return (
      '<g stroke="' + ink + '" stroke-linecap="round" fill="none">' +
      '<line x1="' + f(x) + '" y1="' + f(y - 1.05 * s) + '" x2="' + f(x) + '" y2="' + f(y + 0.85 * s) +
      '" stroke-width="' + f(w * 0.55) + '"/>' +
      '<line x1="' + f(x + 0.55 * s) + '" y1="' + f(y - 1.25 * s) + '" x2="' + f(x + 0.55 * s) +
      '" y2="' + f(y + 0.65 * s) + '" stroke-width="' + f(w * 0.55) + '"/>' +
      '<line x1="' + f(x - 0.3 * s) + '" y1="' + f(y - 0.1 * s) + '" x2="' + f(x + 0.85 * s) +
      '" y2="' + f(y - 0.42 * s) + '" stroke-width="' + f(w) + '"/>' +
      '<line x1="' + f(x - 0.3 * s) + '" y1="' + f(y + 0.6 * s) + '" x2="' + f(x + 0.85 * s) +
      '" y2="' + f(y + 0.28 * s) + '" stroke-width="' + f(w) + '"/>' +
      '</g>'
    );
  }

  function flat(x, y, s, ink) {
    var pts = [
      [x, y - 1.6 * s],
      [x, y + 0.6 * s],
      [x + 0.55 * s, y + 0.05 * s],
      [x + 0.2 * s, y - 0.35 * s],
      [x, y - 0.1 * s]
    ];
    return (
      '<path d="' + smooth(pts) + '" fill="none" stroke="' + ink + '" stroke-width="' +
      f(0.16 * s) + '" stroke-linecap="round" stroke-linejoin="round"/>'
    );
  }

  /* ------------------------------------------------------------------ rests */

  function quarterRest(x, y, s, ink) {
    var pts = [
      [x, y - 1.1 * s],
      [x + 0.45 * s, y - 0.35 * s],
      [x + 0.05 * s, y + 0.1 * s],
      [x + 0.5 * s, y + 0.9 * s],
      [x + 0.1 * s, y + 0.6 * s],
      [x + 0.35 * s, y + 1.25 * s]
    ];
    return (
      '<path d="' + smooth(pts) + '" fill="none" stroke="' + ink + '" stroke-width="' +
      f(0.22 * s) + '" stroke-linecap="round"/>'
    );
  }

  /* ------------------------------------------------------------- note parts */

  function notehead(x, y, s, ink, open) {
    var rx = 0.68 * s;
    var ry = 0.5 * s;
    return (
      '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + f(rx) + '" ry="' + f(ry) +
      '" transform="rotate(-20 ' + f(x) + ' ' + f(y) + ')"' +
      (open
        ? ' fill="none" stroke="' + ink + '" stroke-width="' + f(0.17 * s) + '"'
        : ' fill="' + ink + '"') +
      '/>'
    );
  }

  function ledgers(x, y, s, ink, topY, bottomY) {
    var out = '';
    var w = 1.15 * s;
    var yy;
    for (yy = topY - 2 * s; yy >= y - 0.4 * s; yy -= 2 * s) {
      out += '<line x1="' + f(x - w) + '" y1="' + f(yy) + '" x2="' + f(x + w) + '" y2="' + f(yy) +
        '" stroke="' + ink + '" stroke-width="' + f(0.1 * s) + '"/>';
    }
    for (yy = bottomY + 2 * s; yy <= y + 0.4 * s; yy += 2 * s) {
      out += '<line x1="' + f(x - w) + '" y1="' + f(yy) + '" x2="' + f(x + w) + '" y2="' + f(yy) +
        '" stroke="' + ink + '" stroke-width="' + f(0.1 * s) + '"/>';
    }
    return out;
  }

  /* -------------------------------------------------------------- one staff */

  // Builds a single staff's worth of notes. `staffTop` is the y of line 1.
  function buildStaff(cfg) {
    var s = cfg.s;
    var rand = cfg.rand;
    var ink = cfg.ink;
    var top = cfg.top;
    var bottom = top + 4 * s;
    var out = [];

    // Five staff lines.
    for (var i = 0; i < 5; i++) {
      out.push(
        '<line x1="' + f(cfg.x0) + '" y1="' + f(top + i * s) + '" x2="' + f(cfg.x1) +
        '" y2="' + f(top + i * s) + '" stroke="' + ink + '" stroke-width="' + f(0.09 * s) + '"/>'
      );
    }

    out.push(cfg.clef === 'bass' ? bassClef(cfg.x0 + 0.6 * s, s, ink) : trebleClef(cfg.x0 + 0.5 * s, s, ink));
    // Clef y needs shifting into the staff's own coordinate space.
    var clefIdx = out.length - 1;
    out[clefIdx] = '<g transform="translate(0 ' + f(top) + ')">' + out[clefIdx] + '</g>';

    var cursor = cfg.x0 + (cfg.clef === 'bass' ? 3.2 : 3.6) * s;
    var end = cfg.x1 - 0.8 * s;
    // Pitch is a random walk in staff steps measured down from the top line.
    var step = cfg.clef === 'bass' ? 3 : 2;

    var beamGroup = [];

    function flushBeam() {
      if (beamGroup.length < 2) {
        // A lone short note keeps its stem but gets no beam.
        beamGroup = [];
        return;
      }
      var stemUp = beamGroup[0].stemUp;
      var yEdge = beamGroup.map(function (n) {
        return n.stemUp ? n.y - 3.4 * s : n.y + 3.4 * s;
      });
      var beamY0 = stemUp ? Math.min.apply(null, yEdge) : Math.max.apply(null, yEdge);
      var beamY1 = beamY0 + (rand() - 0.5) * 1.2 * s;
      // Keep beams from drifting into the neighbouring staff.
      var lo = top - 2.4 * s;
      var hi = bottom + 2.0 * s;
      var shift = 0;
      if (Math.min(beamY0, beamY1) < lo) shift = lo - Math.min(beamY0, beamY1);
      else if (Math.max(beamY0, beamY1) > hi) shift = hi - Math.max(beamY0, beamY1);
      beamY0 += shift;
      beamY1 += shift;
      var xa = beamGroup[0].x + (stemUp ? 0.6 * s : -0.6 * s);
      var xb = beamGroup[beamGroup.length - 1].x + (stemUp ? 0.6 * s : -0.6 * s);

      beamGroup.forEach(function (n) {
        var t = (n.x - beamGroup[0].x) / Math.max(1, xb - xa);
        var ty = beamY0 + (beamY1 - beamY0) * t;
        var sx = n.x + (stemUp ? 0.6 * s : -0.6 * s);
        out.push(
          '<line x1="' + f(sx) + '" y1="' + f(n.y) + '" x2="' + f(sx) + '" y2="' + f(ty) +
          '" stroke="' + ink + '" stroke-width="' + f(0.12 * s) + '"/>'
        );
      });

      var th = 0.48 * s;
      out.push(
        '<path d="M' + f(xa) + ' ' + f(beamY0) + 'L' + f(xb) + ' ' + f(beamY1) +
        'L' + f(xb) + ' ' + f(beamY1 + th) + 'L' + f(xa) + ' ' + f(beamY0 + th) + 'Z" fill="' + ink + '"/>'
      );
      // Roughly half the groups get a second (sixteenth) beam.
      if (rand() < 0.45) {
        var o = th + 0.32 * s;
        out.push(
          '<path d="M' + f(xa) + ' ' + f(beamY0 + o) + 'L' + f(xb) + ' ' + f(beamY1 + o) +
          'L' + f(xb) + ' ' + f(beamY1 + o + th) + 'L' + f(xa) + ' ' + f(beamY0 + o + th) +
          'Z" fill="' + ink + '"/>'
        );
      }
      beamGroup = [];
    }

    var barCount = 0;
    var sinceBar = 0;
    var slurStart = null;

    while (cursor < end) {
      var r = rand();

      if (sinceBar > 5 + rand() * 3 && cursor < end - 2 * s) {
        flushBeam();
        out.push(
          '<line x1="' + f(cursor) + '" y1="' + f(top) + '" x2="' + f(cursor) + '" y2="' + f(bottom) +
          '" stroke="' + ink + '" stroke-width="' + f(0.1 * s) + '"/>'
        );
        cursor += 1.1 * s;
        sinceBar = 0;
        barCount++;
        continue;
      }

      if (r < 0.06 && cfg.rests !== false) {
        flushBeam();
        out.push(quarterRest(cursor, top + 2 * s, s, ink));
        cursor += 1.9 * s;
        sinceBar++;
        continue;
      }

      // Random walk, clamped to a readable range around the staff.
      step += Math.round((rand() - 0.5) * 5);
      if (step < -3) step = -3 + Math.round(rand() * 2);
      if (step > 11) step = 11 - Math.round(rand() * 2);

      var y = top + (step * s) / 2;
      var stemUp = step > 4;
      var isShort = r < 0.72;

      out.push(ledgers(cursor, y, s, ink, top, bottom));

      if (r < 0.1) out.push(sharp(cursor - 1.15 * s, y, s, ink));
      else if (r < 0.15) out.push(flat(cursor - 1.05 * s, y, s, ink));

      out.push(notehead(cursor, y, s, ink, !isShort && r > 0.9));

      if (isShort) {
        beamGroup.push({ x: cursor, y: y, stemUp: stemUp });
        if (beamGroup.length >= 2 + Math.floor(rand() * 3)) flushBeam();
        cursor += (1.5 + rand() * 0.5) * s;
      } else {
        flushBeam();
        out.push(
          '<line x1="' + f(cursor + (stemUp ? 0.6 * s : -0.6 * s)) + '" y1="' + f(y) +
          '" x2="' + f(cursor + (stemUp ? 0.6 * s : -0.6 * s)) + '" y2="' +
          f(stemUp ? y - 3.4 * s : y + 3.4 * s) + '" stroke="' + ink + '" stroke-width="' +
          f(0.12 * s) + '"/>'
        );
        cursor += (2.4 + rand() * 0.8) * s;
      }

      // Occasional phrase slur over the notes just placed.
      if (slurStart === null && rand() < 0.14) {
        slurStart = { x: cursor, y: y };
      } else if (slurStart && cursor - slurStart.x > 5 * s) {
        var mx = (slurStart.x + cursor) / 2;
        out.push(
          '<path d="M' + f(slurStart.x) + ' ' + f(slurStart.y - 1.5 * s) + 'Q' + f(mx) + ' ' +
          f(Math.min(slurStart.y, y) - 3.2 * s) + ' ' + f(cursor) + ' ' + f(y - 1.5 * s) +
          '" fill="none" stroke="' + ink + '" stroke-width="' + f(0.1 * s) + '"/>'
        );
        slurStart = null;
      }

      sinceBar++;
    }
    flushBeam();

    return out.join('');
  }

  /* ------------------------------------------------------------------- api */

  /**
   * Render an engraved-looking score as an inline SVG string.
   *
   * @param {object} o
   * @param {number} o.width    viewBox width
   * @param {number} o.height   viewBox height
   * @param {string} o.seed     any string; same seed renders the same music
   * @param {number} [o.space]  staff space in px (drives overall note size)
   * @param {string} [o.ink]    stroke/fill colour
   * @param {number} [o.systems] how many grand staves to stack
   * @param {boolean} [o.grand] true for treble+bass pairs, false for a single staff
   */
  function svg(o) {
    var width = o.width;
    var height = o.height;
    var s = o.space || 6;
    var ink = o.ink || '#111111';
    var rand = rng(hash(String(o.seed || 'performory')));
    var grand = o.grand !== false;
    // Beams and ledger lines can reach ~2.4 staff spaces past a staff, so the
    // padding has to clear them or fitted renders clip at the card edge.
    var pad = o.pad == null ? 2.8 * s : o.pad;

    var staffH = 4 * s;
    var innerGap = 2.6 * s; // treble → bass within one system
    var systemH = grand ? staffH * 2 + innerGap : staffH;
    var systemGap = o.systemGap == null ? 3.4 * s : o.systemGap;

    var available = height - pad * 2;
    // Auto mode rounds up so the music overflows and gets cropped by `slice`,
    // rather than leaving dead space at the bottom of the card.
    var systems = o.systems || Math.max(1, Math.ceil((available + systemGap) / (systemH + systemGap)));

    // When the caller asks for an exact number of systems, size the viewBox to
    // them so the music fills its container instead of floating in whitespace.
    if (o.systems) height = pad * 2 + systems * systemH + (systems - 1) * systemGap;

    var x0 = pad;
    var x1 = width - pad;
    var parts = [];
    var y = pad;

    for (var i = 0; i < systems; i++) {
      if (grand) {
        // Brace + the bracket line joining the pair.
        var braceTop = y;
        var braceBot = y + staffH * 2 + innerGap;
        parts.push(
          '<path d="M' + f(x0 - 0.35 * s) + ' ' + f(braceTop) + 'Q' + f(x0 - 1.5 * s) + ' ' +
          f((braceTop + braceBot) / 2) + ' ' + f(x0 - 0.35 * s) + ' ' + f(braceBot) +
          '" fill="none" stroke="' + ink + '" stroke-width="' + f(0.16 * s) + '"/>'
        );
        parts.push(buildStaff({ s: s, rand: rand, ink: ink, top: y, x0: x0, x1: x1, clef: 'treble' }));
        parts.push(
          buildStaff({
            s: s, rand: rand, ink: ink, top: y + staffH + innerGap, x0: x0, x1: x1, clef: 'bass'
          })
        );
        // Final barline through both staves.
        parts.push(
          '<line x1="' + f(x1) + '" y1="' + f(braceTop) + '" x2="' + f(x1) + '" y2="' + f(braceBot) +
          '" stroke="' + ink + '" stroke-width="' + f(0.12 * s) + '"/>'
        );
      } else {
        parts.push(buildStaff({ s: s, rand: rand, ink: ink, top: y, x0: x0, x1: x1, clef: 'treble' }));
      }
      y += systemH + systemGap;
    }

    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + ' ' + height +
      '" width="100%" height="100%" preserveAspectRatio="' +
      (o.systems ? 'xMidYMid meet' : 'xMidYMid slice') + '" aria-hidden="true">' +
      parts.join('') +
      '</svg>'
    );
  }

  function dataUri(o) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg(o));
  }

  return { svg: svg, dataUri: dataUri };
})();
