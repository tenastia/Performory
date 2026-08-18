/*
 * icons.js — line-icon set redrawn to match the Figma icon components.
 *
 * The Figma icons are vector nodes that this environment cannot export (the
 * network policy blocks figma.com asset URLs), so each glyph here is a
 * hand-drawn stand-in matched to the design's 1.5px thin-line style. Swapping
 * in the real exports means replacing a single entry in this map.
 */
var Icons = (function () {
  'use strict';

  function wrap(body, size, opts) {
    opts = opts || {};
    var s = opts.size || size;
    return (
      '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + size + ' ' + size +
      '" fill="none" stroke="currentColor" stroke-width="' + (opts.sw || 1.4) +
      '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>'
    );
  }

  var glyphs = {
    /* ---- header controls -------------------------------------------- */
    ellipsis: function (o) {
      return wrap(
        '<circle cx="2.2" cy="6" r=".9" fill="currentColor" stroke="none"/>' +
        '<circle cx="6" cy="6" r=".9" fill="currentColor" stroke="none"/>' +
        '<circle cx="9.8" cy="6" r=".9" fill="currentColor" stroke="none"/>',
        12, o
      );
    },
    // The "modal-horizontal" icon variant: a single 10×2 bar.
    bar: function (o) {
      return wrap('<path d="M1 6h10"/>', 12, Object.assign({ sw: 2 }, o));
    },
    close: function (o) {
      return wrap('<path d="M2 2l8 8M10 2l-8 8"/>', 12, Object.assign({ sw: 1.6 }, o));
    },
    calendar: function (o) {
      return wrap(
        '<rect x="2.5" y="3.5" width="11" height="10" rx="2"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/>',
        16, o
      );
    },
    info: function (o) {
      return wrap('<circle cx="8" cy="8" r="6"/><path d="M8 7.2v4M8 4.9v.6"/>', 16, o);
    },
    gear: function (o) {
      return wrap(
        '<circle cx="8" cy="8" r="2.1"/><circle cx="8" cy="8" r="4.7"/>' +
        '<path d="M8 3.3V1.9M8 12.7v1.4M12.7 8h1.4M1.9 8h1.4' +
        'M11.3 4.7l1-1M3.7 12.3l1-1M11.3 11.3l1 1M3.7 3.7l1 1"/>',
        16, o
      );
    },
    filter: function (o) {
      return wrap('<path d="M2 4h12M4 8h8M6 12h4"/>', 16, o);
    },
    sort: function (o) {
      return wrap('<path d="M5 2.5v11M5 13.5l-2.2-2.4M11 13.5v-11M11 2.5l2.2 2.4"/>', 16, o);
    },
    edit: function (o) {
      return wrap('<path d="M11.2 2.6l2.2 2.2-8 8-3 .8.8-3 8-8z"/>', 16, o);
    },
    eye: function (o) {
      return wrap('<path d="M1.5 8S4 3.8 8 3.8 14.5 8 14.5 8 12 12.2 8 12.2 1.5 8 1.5 8z"/>' +
        '<circle cx="8" cy="8" r="1.9"/>', 16, o);
    },
    pin: function (o) {
      return wrap('<path d="M8 14s5-4.3 5-7.6A5 5 0 003 6.4C3 9.7 8 14 8 14z"/><circle cx="8" cy="6.4" r="1.7"/>', 16, o);
    },
    plus: function (o) {
      return wrap('<path d="M8 3.5v9M3.5 8h9"/>', 16, o);
    },
    dotsV: function (o) {
      return wrap('<path d="M8 4.2v.2M8 7.9v.2M8 11.6v.2"/>', 16, Object.assign({ sw: 2 }, o));
    },
    chevronLeft: function (o) {
      return wrap('<path d="M10 3.5L5.5 8l4.5 4.5"/>', 16, o);
    },
    chevronRight: function (o) {
      return wrap('<path d="M6 3.5L10.5 8 6 12.5"/>', 16, o);
    },
    chevronDown: function (o) {
      return wrap('<path d="M4 6.5L8 10.5l4-4"/>', 16, o);
    },
    check: function (o) {
      return wrap('<path d="M3.5 8.5l3 3 6-7"/>', 16, o);
    },
    search: function (o) {
      return wrap('<circle cx="7.2" cy="7.2" r="4.4"/><path d="M10.6 10.6L14 14"/>', 16, o);
    },

    /* ---- practice tools --------------------------------------------- */
    download: function (o) {
      return wrap('<path d="M8 2.5v8M4.6 7.4L8 10.8l3.4-3.4M3 13.2h10"/>', 16, o);
    },
    mic: function (o) {
      return wrap(
        '<rect x="6" y="2" width="4" height="7.5" rx="2"/>' +
        '<path d="M3.8 8a4.2 4.2 0 008.4 0M8 12.2V14"/>',
        16, o
      );
    },
    play: function (o) {
      return wrap('<path d="M5.5 3.4l6.5 4.6-6.5 4.6z"/>', 16, o);
    },
    stop: function (o) {
      return wrap('<rect x="4.5" y="4.5" width="7" height="7" rx="1.5" fill="currentColor"/>', 16, o);
    },

    /* ---- tab bar ------------------------------------------------------ */
    tabHome: function (o) {
      return wrap('<path d="M3 9.6L12 2.6l9 7v10.4a1 1 0 01-1 1h-4.6v-6.4H8.6V21H4a1 1 0 01-1-1z"/>', 24, o);
    },
    // Brain — the "Practice" glyph in the design.
    tabPractice: function (o) {
      return wrap(
        '<path d="M12 4.2v15.6"/>' +
        '<path d="M12 5.4a2.6 2.6 0 00-4.6 1.2 2.5 2.5 0 00-2.2 3.6 2.6 2.6 0 000 3.9 2.5 2.5 0 002.5 3 2.6 2.6 0 004.3 1"/>' +
        '<path d="M12 5.4a2.6 2.6 0 014.6 1.2 2.5 2.5 0 012.2 3.6 2.6 2.6 0 010 3.9 2.5 2.5 0 01-2.5 3 2.6 2.6 0 01-4.3 1"/>' +
        '<path d="M7.4 10.2h2M14.6 10.2h2M8.4 14.4h1.8M13.8 14.4h1.8"/>',
        24, o
      );
    },
    tabNew: function (o) {
      return wrap('<path d="M9 18.2V5.4l9-2v12.4"/><ellipse cx="6.6" cy="18.4" rx="2.5" ry="2.1"/>' +
        '<ellipse cx="15.6" cy="15.8" rx="2.5" ry="2.1"/>', 24, o);
    },
    tabProfile: function (o) {
      return wrap('<path d="M12 3.4c2.4 0 4 1.9 4 4.4s-1.6 4.8-4 4.8-4-2.3-4-4.8 1.6-4.4 4-4.4z"/>' +
        '<path d="M4.6 21c.6-4 3.7-6 7.4-6s6.8 2 7.4 6"/>', 24, o);
    },

    /* ---- misc --------------------------------------------------------- */
    // Celebration drum on the Practice End screen.
    drum: function (o) {
      return wrap(
        '<ellipse cx="16" cy="13" rx="10" ry="2.6"/>' +
        '<path d="M6 13v8c0 1.4 4.5 2.6 10 2.6s10-1.2 10-2.6v-8"/>' +
        '<path d="M7.4 15.4l4.3 7M11.7 15.9l4.3 6.9M16 15.9l4.3 6.9M20.3 15.4l4.3 6.6"/>' +
        '<path d="M16 7.6V4M9.4 9L7 6.2M22.6 9L25 6.2M4.6 12.4L1.8 11M27.4 12.4l2.8-1.4"/>',
        32, o
      );
    },
    folder: function (o) {
      return wrap('<path d="M2.5 6.5A1.5 1.5 0 014 5h4l1.6 2H20a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0120 19H4a1.5 1.5 0 01-1.5-1.5z" fill="currentColor" stroke="none"/>', 24, o);
    },
    clock: function (o) {
      return wrap('<circle cx="8" cy="8" r="6"/><path d="M8 4.6V8l2.4 1.6"/>', 16, o);
    },
    bell: function (o) {
      return wrap('<path d="M4 11.5V7.6a4 4 0 118 0v3.9l1.2 1.6H2.8z"/><path d="M6.6 14.2a1.6 1.6 0 002.8 0"/>', 16, o);
    },
    logout: function (o) {
      return wrap('<path d="M6 3.5H3.5v9H6M9 8h5M11.8 5.6L14 8l-2.2 2.4"/>', 16, o);
    }
  };

  function get(name, opts) {
    var g = glyphs[name];
    return g ? g(opts || {}) : '';
  }

  return { get: get, names: Object.keys(glyphs) };
})();
