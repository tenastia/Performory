/*
 * screens.js — one entry per Figma frame.
 *
 * Each screen exposes render(param) → HTML and an optional mount(root, param)
 * that wires up behaviour. Frame names from the Figma flow are noted above each
 * screen so the handoff maps one-to-one.
 */
var Screens = (function () {
  'use strict';

  var esc = UI.esc;

  /* ================================================================ helpers */

  function shell(parts) {
    return UI.statusBar() + parts;
  }

  function scrollArea(inner, cls) {
    return '<div class="screen-body ' + (cls || '') + '">' + inner + '</div>';
  }

  function gap(px) {
    return '<div style="height:' + px + 'px"></div>';
  }

  function sectionLabel(text, right) {
    return (
      '<div class="row-between pad-x" style="margin-bottom:16px">' +
      '<span class="body-s muted">' + esc(text) + '</span>' +
      (right || '') + '</div>'
    );
  }

  /** Smooth-curve area chart matching the Individual Piece frame. */
  function chart(piece, range) {
    var w = 340, h = 158, n = 7;
    var seed = 0;
    for (var c = 0; c < piece.id.length; c++) seed += piece.id.charCodeAt(c) * (c + 1);
    seed += { Day: 3, Week: 7, Month: 31, Year: 365 }[range] || 7;

    var vals = [];
    for (var i = 0; i < n; i++) {
      var v = Math.abs(Math.sin(seed * 0.37 + i * 1.11) * Math.cos(seed * 0.11 + i * 0.7));
      vals.push(1 + v * 6);
    }

    var x = function (i) { return (i / (n - 1)) * w; };
    var y = function (v) { return h - ((v - 1) / 6) * (h - 12) - 6; };

    // Catmull-Rom → cubic bezier for the flowing line in the design.
    var d = 'M' + x(0).toFixed(1) + ' ' + y(vals[0]).toFixed(1);
    for (var k = 0; k < n - 1; k++) {
      var p0 = vals[Math.max(0, k - 1)], p1 = vals[k], p2 = vals[k + 1], p3 = vals[Math.min(n - 1, k + 2)];
      var c1x = x(k) + (x(k + 1) - x(k)) / 3;
      var c1y = y(p1 + (p2 - p0) / 6);
      var c2x = x(k + 1) - (x(k + 1) - x(k)) / 3;
      var c2y = y(p2 - (p3 - p1) / 6);
      d += 'C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ',' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) +
        ',' + x(k + 1).toFixed(1) + ' ' + y(p2).toFixed(1);
    }

    var grid = '';
    for (var g = 1; g <= 7; g++) {
      var gy = y(g).toFixed(1);
      grid += '<line x1="0" y1="' + gy + '" x2="' + w + '" y2="' + gy +
        '" stroke="#333" stroke-width=".6" stroke-dasharray="1 3"/>';
    }

    // Axis labels live inside the SVG so they stay locked to the gridlines.
    var labels = '';
    for (var L = 7; L >= 1; L--) {
      labels += '<text x="-6" y="' + (y(L) + 3).toFixed(1) + '" text-anchor="end" font-size="8" ' +
        'fill="#333" font-family="inherit">' + L + '</text>';
    }

    return (
      '<div style="padding:0 27.5px">' +
      '<div>' +
      '<svg viewBox="-14 0 ' + (w + 14) + ' ' + h + '" width="100%" style="display:block">' +
      labels +
      '<defs><linearGradient id="chartfill" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#ffffff" stop-opacity=".16"/>' +
      '<stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient></defs>' +
      grid +
      '<path d="' + d + 'L' + w + ' ' + h + 'L0 ' + h + 'Z" fill="url(#chartfill)"/>' +
      '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>' +
      '</svg></div></div>'
    );
  }

  function weekdayRow() {
    return (
      '<div style="display:flex;justify-content:space-between;padding:0 39.5px;font-size:10px;' +
      'line-height:16px;color:#5c5c5c;text-transform:uppercase">' +
      ['s', 'm', 't', 'w', 't', 'f', 's'].map(function (d) {
        return '<span style="width:9px;text-align:center">' + d + '</span>';
      }).join('') + '</div>'
    );
  }

  /** Hero score card used across the New Piece wizard. */
  function heroCard(draft, opts) {
    opts = opts || {};
    var showSections = draft.showSections;
    var overlay = '';
    if (showSections) {
      var cells = '';
      for (var i = 0; i < 12; i++) {
        cells += '<div style="border:1px dashed rgba(255,255,255,.32);border-radius:4px"></div>';
      }
      overlay =
        '<div style="position:absolute;inset:12px;display:grid;grid-template-columns:repeat(3,1fr);' +
        'grid-template-rows:repeat(4,1fr);gap:6px;pointer-events:none">' + cells + '</div>';
    }

    return (
      '<div class="hero-card">' +
      '<div class="paper">' + UI.scoreFor(draft, 354, 322, 8) + '</div>' +
      '<div class="veil"></div>' + overlay +
      (opts.edit !== false
        ? '<button class="icon-btn" data-act="edit-art" style="position:absolute;left:12px;top:12px" ' +
          'aria-label="Edit artwork">' + Icons.get('edit', { size: 14 }) + '</button>'
        : '') +
      '<button class="chip" data-act="toggle-sections" style="position:absolute;right:12px;top:12px">' +
      '<span>Identified Sections</span>' +
      '<span style="display:inline-flex;align-items:center;gap:6px;background:#292929;border-radius:4px;' +
      'padding:2px 6px">' + esc(draft.sections) + ' ' + Icons.get('eye', { size: 13 }) + '</span>' +
      '</button>' +
      (opts.field
        ? '<div class="hero-field"><input class="field" id="titleField" placeholder="Type in the title*" ' +
          'value="' + esc(draft.title || '') + '" autocomplete="off"></div>'
        : '<h2 class="h6 hero-title">' + esc(draft.title || 'Untitled piece') + '</h2>') +
      '</div>'
    );
  }

  function ensureDraft() {
    var s = App.state;
    if (!s.draft) {
      s.draft = {
        id: 'draft', title: '', sections: 48, fileName: null,
        due: null, hasDue: null, days: [], times: ['11:00', '16:00'],
        notify: false, showSections: false
      };
    }
    return s.draft;
  }

  /* ================================================================== HOME */
  /* Figma: "Home Screen" (73:2571) */

  var home = {
    render: function () {
      var s = App.state;
      var q = Data.quotes[s.quoteIndex % Data.quotes.length];
      var recent = s.pieces.slice().sort(function (a, b) {
        return (b.lastPracticed || '').localeCompare(a.lastPracticed || '');
      });

      var cards = recent.length
        ? '<div class="coverflow" id="cf">' +
          recent.map(function (p, i) {
            return '<div class="slot' + (i === 0 ? ' is-active' : '') + '" data-i="' + i +
              '" style="position:absolute;left:50%;margin-left:-121px;top:0">' +
              UI.pieceCard(p, 'Practice Again') + '</div>';
          }).join('') + '</div>' +
          gap(8) + UI.dots(recent.length, 0, 'cf-dots')
        : '<div class="empty-state"><p class="body-s dim">Nothing practiced yet. Your recent pieces will show up here.</p></div>';

      return shell(
        UI.header({
          left: { icon: 'ellipsis', act: 'menu', label: 'Menu' },
          right: { icon: 'calendar', act: 'events', label: 'Events' }
        }) +
        scrollArea(
          gap(4) +
          '<h1 class="h5 screen-title">Welcome, ' + esc(s.user ? s.user.name : Data.user.name) + '</h1>' +
          gap(26) +
          '<p class="body-xs dim screen-title" style="margin:0">Recently practiced</p>' +
          gap(38) +
          cards +
          gap(28) +
          '<div class="quote-card">' +
          '<div><p class="body-xs" style="margin:0 0 4px">Quote of the day</p>' +
          '<p class="quote" style="margin:0">' + esc(q.text) + '</p></div>' +
          '<p class="body-xs attrib" style="margin:0">' + esc(q.by) + '</p></div>' +
          gap(16) +
          '<div class="pad-x"><button class="btn btn-primary" data-act="new-piece">Memorize New Piece</button></div>' +
          gap(36) +
          sectionLabel('Upcoming events') +
          '<div class="events-panel">' +
          s.events.slice(0, 3).map(UI.eventRow).join('') +
          gap(8) +
          '<div style="padding:0 64px"><button class="btn btn-primary btn-sm" data-act="all-events" ' +
          'style="width:100%">All Events</button></div>' +
          '</div>' +
          gap(36) +
          sectionLabel('Read about stagefright', UI.dots(Data.articles.length, 0, 'art-dots')) +
          '<div class="article-strip" id="artStrip">' +
          Data.articles.map(function (a, i) {
            return '<button class="article-card" data-act="article" data-id="' + esc(a.id) + '">' +
              '<div class="article-art">' + Data.articleArt(a.hue, i + 1) + '</div>' +
              '<div class="date body-xs">' + esc(a.date) + '</div>' +
              '<div class="head">' + esc(a.title) + '</div></button>';
          }).join('') +
          '</div>' +
          gap(24),
          'pad-bottom'
        ) +
        UI.tabBar('home')
      );
    },

    mount: function (root) {
      var cf = root.querySelector('#cf');
      if (cf) mountCoverflow(cf, root.querySelector('.cf-dots'));

      var strip = root.querySelector('#artStrip');
      var artDots = root.querySelector('.art-dots');
      if (strip && artDots) {
        strip.addEventListener('scroll', function () {
          var i = Math.round(strip.scrollLeft / 289);
          Array.prototype.forEach.call(artDots.children, function (d, j) {
            d.classList.toggle('on', j === Math.min(i, artDots.children.length - 1));
          });
        }, { passive: true });
      }

      root.addEventListener('click', function (e) {
        var a = e.target.closest('[data-act]');
        if (!a) return;
        var act = a.dataset.act;
        if (act === 'practice') App.go('/piece/' + a.dataset.id);
        else if (act === 'new-piece') App.go('/new', { mode: 'fade' });
        else if (act === 'all-events' || act === 'events') App.go('/events');
        else if (act === 'article') App.go('/article/' + a.dataset.id);
        else if (act === 'add-event') App.toast('Added to your calendar');
        else if (act === 'menu') App.go('/profile', { mode: 'fade' });
      });
    }
  };

  /** Coverflow behaviour: drag or tap to change the active card. */
  function mountCoverflow(cf, dotsEl) {
    var slots = Array.prototype.slice.call(cf.children);
    var active = 0;
    var startX = null;
    var dragged = 0;

    function layout(dragPx) {
      dragPx = dragPx || 0;
      slots.forEach(function (el, i) {
        var d = i - active;
        var k = d === 0 ? 1 : 0.6033;
        var dist = 0;
        if (d !== 0) {
          var sign = d > 0 ? 1 : -1;
          dist = sign * (121 + 8 + 73 + (Math.abs(d) - 1) * 154);
        }
        el.style.transform = 'translateX(' + (dist + dragPx) + 'px) scale(' + k + ')';
        el.style.zIndex = String(10 - Math.abs(d));
        el.classList.toggle('is-active', d === 0);
        el.querySelector('.piece-card').style.pointerEvents = d === 0 ? 'auto' : 'none';
      });
      if (dotsEl) {
        Array.prototype.forEach.call(dotsEl.children, function (dot, i) {
          dot.classList.toggle('on', i === active);
        });
      }
    }

    function to(i) {
      active = Math.max(0, Math.min(slots.length - 1, i));
      layout(0);
    }

    cf.addEventListener('pointerdown', function (e) {
      startX = e.clientX;
      dragged = 0;
      slots.forEach(function (s) { s.style.transition = 'none'; });
    });
    cf.addEventListener('pointermove', function (e) {
      if (startX === null) return;
      dragged = e.clientX - startX;
      layout(dragged * 0.6);
    });
    function release() {
      if (startX === null) return;
      slots.forEach(function (s) { s.style.transition = ''; });
      if (Math.abs(dragged) > 40) to(active + (dragged < 0 ? 1 : -1));
      else layout(0);
      startX = null;
    }
    cf.addEventListener('pointerup', release);
    cf.addEventListener('pointercancel', release);
    cf.addEventListener('pointerleave', release);

    cf.addEventListener('click', function (e) {
      var slot = e.target.closest('.slot');
      if (slot && !slot.classList.contains('is-active')) {
        e.stopPropagation();
        to(+slot.dataset.i);
      }
    }, true);

    layout(0);
  }

  /* =============================================================== LIBRARY */
  /* Figma: "Library Screen" (73:2787) — the Practice tab */

  var library = {
    render: function () {
      var s = App.state;
      var sorted = s.pieces.slice().sort(function (a, b) {
        return (b.lastPracticed || '').localeCompare(a.lastPracticed || '');
      });

      var body = sorted.length
        ? sorted.map(function (p) {
            return '<div style="display:flex;justify-content:center;margin-bottom:24px">' +
              UI.pieceCard(p, 'Practice') + '</div>';
          }).join('')
        : '<div class="empty-state">' +
          '<div style="opacity:.5">' + Icons.get('tabNew', { size: 48, sw: 1 }) + '</div>' +
          '<h2 class="h6">No pieces yet</h2>' +
          '<p class="body-s dim" style="margin:0">Upload a score and Performory will break it into ' +
          'sections you can memorize one at a time.</p>' +
          '<button class="btn btn-primary" data-act="new-piece" style="width:auto;padding:16px 32px">' +
          'Memorize New Piece</button></div>';

      return shell(
        UI.header({
          left: { icon: 'filter', act: 'filter', label: 'Filter' },
          right: { icon: 'sort', act: 'sort', label: 'Sort' },
          title: 'Practice',
          subtitle: 'Showing most recently practiced first'
        }) +
        scrollArea(gap(24) + body, 'pad-bottom') +
        UI.tabBar('practice')
      );
    },

    mount: function (root) {
      root.addEventListener('click', function (e) {
        var a = e.target.closest('[data-act]');
        if (a && a.dataset.act === 'practice') { App.go('/piece/' + a.dataset.id); return; }
        if (a && a.dataset.act === 'new-piece') { App.go('/new', { mode: 'fade' }); return; }
        if (a && (a.dataset.act === 'filter' || a.dataset.act === 'sort')) {
          App.toast('Sorting is not part of this prototype');
          return;
        }
        var card = e.target.closest('.piece-card');
        if (card) App.go('/piece/' + card.dataset.piece);
      });
    }
  };

  /* ================================================================= PIECE */
  /* Figma: "Individual Piece" (73:2803) */

  var pieceScreen = {
    render: function (id) {
      var p = App.piece(id) || App.state.pieces[0];
      if (!p) return home.render();
      var range = App.state.chartRange || 'Week';

      return shell(
        UI.header({
          left: { icon: 'ellipsis', act: 'menu', label: 'Options' },
          right: { icon: 'close', act: 'back', label: 'Close' },
          title: p.title
        }) +
        scrollArea(
          gap(40) +
          weekdayRow() +
          gap(38) +
          chart(p, range) +
          gap(29) +
          '<div class="center">' +
          UI.segmented('range', [
            { value: 'Year', label: 'Year' }, { value: 'Month', label: 'Month' },
            { value: 'Week', label: 'Week' }, { value: 'Day', label: 'Day' }
          ], range) +
          '</div>' +
          gap(43) +
          '<div class="pad-x"><div class="stat-row">' +
          UI.statTile(p.memorized + '%', 'Memorized') +
          UI.statTile(p.sessions, 'Total Sessions') +
          UI.statTile(p.sectionsPracticed + '/' + p.sections, 'Sections Practiced') +
          '</div></div>' +
          gap(31) +
          sectionLabel('Upcoming events',
            '<button class="body-s" data-act="all-events">See All</button>') +
          '<div class="pad-x"><div class="cal-tiles">' +
          App.state.events.slice(0, 3).map(UI.calTile).join('') +
          '</div></div>' +
          gap(24) +
          '<div class="pad-x"><button class="btn btn-primary" data-act="memorize" data-id="' +
          esc(p.id) + '">Memorize</button></div>',
          'pad-bottom'
        ) +
        UI.tabBar('practice')
      );
    },

    mount: function (root, id) {
      root.addEventListener('click', function (e) {
        var seg = e.target.closest('[data-seg="range"] button');
        if (seg) {
          App.state.chartRange = seg.dataset.val;
          App.save();
          App.refresh();
          return;
        }
        var a = e.target.closest('[data-act]');
        if (!a) return;
        if (a.dataset.act === 'memorize') App.go('/sections/' + a.dataset.id, { mode: 'modal' });
        else if (a.dataset.act === 'all-events') App.go('/events');
        else if (a.dataset.act === 'menu') App.toast('Piece options are not part of this prototype');
      });
    }
  };

  /* ====================================================== SECTIONS (modal) */
  /* Figma: "sections selector modal" (73:3226) */

  var sections = {
    overlay: true,
    render: function (id) {
      var p = App.piece(id) || App.state.pieces[0];
      var count = Math.min(6, Math.max(2, Math.round(p.sections / 8)));
      var cards = [];

      // Each column carries its own label and selection dot, so the two rows in
      // the design stay aligned however far the strip is scrolled.
      function column(key, label, pct, seed, extraClass) {
        return (
          '<div class="section-col" data-sec="' + key + '">' +
          '<div class="section-card">' +
          '<div class="thumb">' + Score.svg({ width: 130, height: 150, seed: seed, space: 5, ink: '#111' }) + '</div>' +
          '<div class="meta"><div><div class="body-s">' + pct + '%</div>' +
          '<div class="body-xs dim">Memorized</div></div>' +
          '<span class="dim">' + Icons.get('dotsV', { size: 14 }) + '</span></div></div>' +
          '<div class="body-s" style="text-align:center;margin-top:12px">' + esc(label) + '</div>' +
          '<div class="center" style="margin-top:8px"><span class="radio ' + extraClass + '">' +
          (key === 'all' ? '' : key) + '</span></div></div>'
        );
      }

      cards.push(column('all', 'All', p.memorized, p.id + '-all', 'all'));
      for (var i = 1; i <= count; i++) {
        var pct = Math.max(2, Math.round(p.memorized * (1.15 - i * 0.16)));
        cards.push(column(i, 'Section ' + i, pct, p.id + '-s' + i, ''));
      }

      return (
        '<div class="scrim">' +
        '<div class="sheet" role="dialog" aria-modal="true" aria-label="Select sections">' +
        '<button class="icon-btn ghost sheet-close" data-act="back" aria-label="Close">' +
        Icons.get('close', { size: 12 }) + '</button>' +
        gap(20) +
        '<p class="body-md" style="text-align:center;margin:0 16px 20px">Select sections you want<br>to practice today</p>' +
        '<div class="section-strip" id="secStrip">' + cards.join('') + '</div>' +
        gap(20) +
        '<div style="padding:0 58px"><button class="btn btn-primary btn-sm" data-act="start" data-id="' +
        esc(p.id) + '">Start Practice</button></div>' +
        '</div></div>'
      );
    },

    mount: function (root, id) {
      var selected = { all: true, list: [] };
      var strip = root.querySelector('#secStrip');

      function paint() {
        Array.prototype.forEach.call(strip.children, function (col) {
          var key = col.dataset.sec;
          var on = key === 'all' ? selected.all : (!selected.all && selected.list.indexOf(key) >= 0);
          col.querySelector('.section-card').classList.toggle('on', on);
          col.querySelector('.radio').classList.toggle('on', on);
        });
      }

      root.addEventListener('click', function (e) {
        var card = e.target.closest('[data-sec]');
        if (card) {
          var key = card.dataset.sec;
          if (key === 'all') {
            selected.all = true;
            selected.list = [];
          } else {
            selected.all = false;
            var at = selected.list.indexOf(key);
            if (at >= 0) selected.list.splice(at, 1);
            else selected.list.push(key);
            if (!selected.list.length) selected.all = true;
          }
          paint();
          return;
        }
        var a = e.target.closest('[data-act]');
        if (a && a.dataset.act === 'start') {
          var list = selected.all ? null : selected.list.slice().sort(function (x, y) { return x - y; });
          App.startSession(a.dataset.id, list);
          App.go('/practice/' + a.dataset.id, { mode: 'modal' });
        }
      });

      paint();
    }
  };

  /* ============================================================== PRACTICE */
  /* Figma: "Practice Screen Beginning / Two Bars / Three Bars" (73:2881, 74:5877, 74:6204) */

  var practice = {
    render: function (id) {
      var s = App.state.session;
      var p = App.piece(id) || App.state.pieces[0];
      if (!s) { App.startSession(p.id, null); s = App.state.session; }

      var pct = Math.round((s.index / Math.max(1, s.total)) * 100);
      var label = s.sections ? s.sections.join(', ') : 'All';
      // Widening the viewBox fits more bars into the same card; the SVG scales
      // to the card, so "Three" simply renders smaller notes across more music.
      var fragWidth = { One: 190, Two: 300, Three: 410 }[s.bars] || 190;

      return shell(
        UI.header({
          left: { icon: 'gear', act: 'settings', label: 'Practice settings' },
          right: { icon: 'close', act: 'quit', label: 'End practice' },
          title: p.title
        }) +
        scrollArea(
          gap(26) +
          '<div class="row-between pad-x">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
          '<span class="body-md">Sections</span>' +
          '<button class="chip" data-act="edit-sections">' + esc(label) + ' ' +
          Icons.get('edit', { size: 13 }) + '</button></div>' +
          '<span class="body-md">' + pct + '%</span></div>' +
          gap(22) +
          '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
          gap(56) +
          '<p class="body-s dim" style="text-align:center;margin:0">Finish the fragment below</p>' +
          gap(24) +
          '<div class="fragment" id="frag">' +
          Score.svg({ width: fragWidth, height: 0, systems: 1, space: 9, seed: p.id + '-f' + s.index, ink: '#111' }) +
          '</div>' +
          gap(22) +
          '<div class="center">' +
          '<div class="segmented labelled" data-seg="bars"><span class="seg-label body-s">Show Bars:</span>' +
          ['One', 'Two', 'Three'].map(function (b) {
            return '<button data-val="' + b + '" aria-selected="' + (b === s.bars) + '">' + b + '</button>';
          }).join('') + '</div></div>' +
          gap(48) +
          '<div class="btn-row">' +
          '<button class="btn btn-outline" data-act="skip">Skip</button>' +
          '<button class="btn btn-primary" data-act="played">Played</button></div>' +
          gap(28) +
          '<div class="practice-tools">' +
          '<button class="tool-btn" data-act="save-rec" ' + (s.recordings.length ? '' : 'disabled') +
          ' aria-label="Download recording">' + Icons.get('download', { size: 18 }) + '</button>' +
          '<button class="tool-btn" data-act="record" aria-label="Record">' +
          Icons.get('mic', { size: 18 }) + '</button>' +
          '<button class="tool-btn" data-act="play" ' + (s.recordings.length ? '' : 'disabled') +
          ' aria-label="Play recording">' + Icons.get('play', { size: 18 }) + '</button>' +
          '</div>' +
          gap(24),
          'pad-bottom'
        )
      );
    },

    mount: function (root, id) {
      var s = App.state.session;

      root.addEventListener('click', function (e) {
        var seg = e.target.closest('[data-seg="bars"] button');
        if (seg) {
          s.bars = seg.dataset.val;
          App.save();
          App.refresh();
          return;
        }
        var a = e.target.closest('[data-act]');
        if (!a) return;
        var act = a.dataset.act;

        if (act === 'played' || act === 'skip') {
          App.advance(act === 'played' ? 'played' : 'skip');
          if (App.state.session.index >= App.state.session.total) {
            App.finishSession();
            App.go('/end/' + id, { mode: 'push' });
          } else {
            App.refresh();
          }
        } else if (act === 'record') {
          App.go('/record/' + id, { mode: 'modal' });
        } else if (act === 'play') {
          playLast(s);
        } else if (act === 'save-rec') {
          saveLast(s);
        } else if (act === 'quit') {
          App.endSession();
          App.go('/piece/' + id, { mode: 'pop' });
        } else if (act === 'edit-sections') {
          App.go('/sections/' + id, { mode: 'modal' });
        } else if (act === 'settings') {
          App.toast('Practice settings are not part of this prototype');
        }
      });
    }
  };

  function playLast(s) {
    var last = s.recordings[s.recordings.length - 1];
    if (!last) return;
    if (last.simulated) { App.toast('That take was simulated — no audio was captured'); return; }
    App.Store.get(last.key).then(function (blob) {
      if (!blob) { App.toast('Recording is no longer available'); return; }
      var url = URL.createObjectURL(blob);
      var audio = new Audio(url);
      audio.onended = function () { URL.revokeObjectURL(url); };
      audio.play().catch(function () { App.toast('Playback was blocked by the browser'); });
      App.toast('Playing ' + last.name);
    });
  }

  function saveLast(s) {
    var last = s.recordings[s.recordings.length - 1];
    if (!last || last.simulated) { App.toast('Nothing recorded to save yet'); return; }
    App.Store.get(last.key).then(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = last.name + '.webm';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      // Sandboxed viewers block page-initiated saves outright, so this cannot
      // promise the file landed — the take is kept in the app either way.
      App.toast('Exporting ' + last.name + '…');
    });
  }

  /* ================================================================ RECORD */
  /* Figma: "Record" (73:2915) */

  var record = {
    render: function (id) {
      var p = App.piece(id) || App.state.pieces[0];
      var s = App.state.session;
      var n = (s ? s.index : 0) + 1;
      var bars = '';
      for (var i = 0; i < 64; i++) bars += '<i></i>';

      return (
        '<div class="screen-body record-screen" style="display:flex;flex-direction:column">' +
        UI.statusBar() +
        '<button class="grabber" data-act="back" aria-label="Close recorder"><span></span></button>' +
        '<div class="grow" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0">' +
        '<h1 class="h6" style="text-align:center;padding:0 24px">' + esc(p.title) + '</h1>' +
        gap(6) +
        '<p class="body-s dim" style="margin:0">Fragment ' + n + '</p>' +
        gap(56) +
        '<div class="waveform" id="wave" style="width:240px">' + bars + '</div>' +
        gap(20) +
        '<p class="body-xs" id="timer" style="margin:0;letter-spacing:.5px">00:00:00</p>' +
        gap(8) +
        '<p class="body-xs dim" id="micNote" style="margin:0;height:16px"></p>' +
        '</div>' +
        '<div style="padding:0 24px calc(48px + var(--safe-bottom))">' +
        '<button class="record-btn" id="recBtn" aria-label="Start recording">' +
        Icons.get('mic', { size: 26, sw: 1.5 }) + '</button></div>' +
        '</div>'
      );
    },

    mount: function (root, id) {
      var wave = root.querySelector('#wave');
      var bars = Array.prototype.slice.call(wave.children);
      var timerEl = root.querySelector('#timer');
      var note = root.querySelector('#micNote');
      var btn = root.querySelector('#recBtn');
      var raf = null;
      var t0 = 0;
      var live = false;

      // HH:MM:SS, as shown in the Record frame.
      function fmt(ms) {
        var total = Math.floor(ms / 1000);
        return [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60]
          .map(function (n) { return String(n).padStart(2, '0'); })
          .join(':');
      }

      function tick() {
        var levels = App.Media.levels(bars.length);
        for (var i = 0; i < bars.length; i++) {
          bars[i].style.height = (4 + levels[i] * 52).toFixed(1) + 'px';
        }
        timerEl.textContent = fmt(Date.now() - t0);
        raf = requestAnimationFrame(tick);
      }

      function stopAll() {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      }

      btn.addEventListener('click', function () {
        if (!live) {
          App.Media.start().then(function (res) {
            live = true;
            t0 = Date.now();
            btn.classList.add('rec');
            btn.innerHTML = Icons.get('stop', { size: 22 });
            btn.setAttribute('aria-label', 'Stop recording');
            note.textContent = res.simulated
              ? 'Simulated — microphone unavailable here'
              : 'Recording';
            tick();
          });
        } else {
          live = false;
          stopAll();
          var ms = Date.now() - t0;
          btn.classList.remove('rec');
          btn.innerHTML = Icons.get('mic', { size: 26, sw: 1.5 });
          App.Media.stop().then(function (blob) {
            var s = App.state.session;
            var entry = {
              name: 'Fragment ' + ((s ? s.index : 0) + 1),
              ms: ms,
              simulated: !blob,
              key: 'rec:' + Date.now()
            };
            var done = blob ? App.Store.put(entry.key, blob) : Promise.resolve();
            done.then(function () {
              if (s) { s.recordings.push(entry); App.save(); }
              App.toast(entry.simulated ? 'Take saved (simulated audio)' : 'Take saved · ' + fmt(ms));
              App.go('/practice/' + id, { mode: 'pop' });
            });
          });
        }
      });

      // Leaving the screen must not leave the microphone open.
      root.addEventListener('screen:teardown', function () {
        stopAll();
        if (App.Media.recording) App.Media.stop();
      });
    }
  };

  /* =========================================================== PRACTICE END */
  /* Figma: "Practice End Screen" (73:3173) */

  var end = {
    render: function (id) {
      var p = App.piece(id) || App.state.pieces[0];
      var others = App.state.pieces.filter(function (x) { return x.id !== p.id; });

      return shell(
        UI.header({
          left: { icon: 'gear', act: 'settings', label: 'Settings' },
          right: { icon: 'close', act: 'finish', label: 'Close' }
        }) +
        scrollArea(
          gap(40) +
          '<div class="center">' + Icons.get('drum', { size: 76, sw: 1.1 }) + '</div>' +
          gap(28) +
          '<p class="body-s dim" style="text-align:center;margin:0">Finished practicing</p>' +
          gap(10) +
          '<h1 class="h5 screen-title">' + esc(p.title) + '</h1>' +
          gap(38) +
          '<div class="pad-x"><div class="stat-row">' +
          UI.statTile(p.memorized + '%', 'Memorized') +
          UI.statTile(p.sessions, 'Total Sessions') +
          UI.statTile(p.sectionsPracticed + '/' + p.sections, 'Sections Practiced') +
          '</div></div>' +
          gap(30) +
          sectionLabel('Practice next:', UI.dots(Math.max(1, others.length), 0, 'next-dots')) +
          '<div class="article-strip" id="nextStrip">' +
          (others.length
            ? others.map(function (o) {
                return '<button class="article-card" style="width:277px" data-act="next" data-id="' + esc(o.id) + '">' +
                  '<div class="article-art" style="height:202px;position:relative;background:#fcfcfc">' +
                  UI.scoreFor(o, 290, 210, 6) +
                  '<div style="position:absolute;inset:0;background:linear-gradient(to top,#090909 30%,rgba(0,0,0,0) 90%)"></div>' +
                  '<div class="label-date"><span class="d">' + esc(o.dueLabel.d) + '</span>' +
                  '<span class="m">' + esc(o.dueLabel.m) + '</span></div>' +
                  '<h3 class="h6" style="position:absolute;left:16px;right:16px;bottom:16px">' +
                  esc(o.title) + '</h3></div></button>';
              }).join('')
            : '<p class="body-s dim pad-x">Nothing else queued.</p>') +
          '</div>' +
          gap(28) +
          '<div class="pad-x"><button class="btn btn-primary" data-act="finish">Finish Practice</button></div>',
          'pad-bottom'
        )
      );
    },

    mount: function (root, id) {
      root.addEventListener('click', function (e) {
        var a = e.target.closest('[data-act]');
        if (!a) return;
        if (a.dataset.act === 'finish') {
          App.endSession();
          App.go('/home', { mode: 'fade' });
        } else if (a.dataset.act === 'next') {
          App.endSession();
          App.go('/piece/' + a.dataset.id, { mode: 'fade' });
        } else if (a.dataset.act === 'settings') {
          App.toast('Settings are not part of this prototype');
        }
      });
    }
  };

  /* ============================================================ NEW / UPLOAD */
  /* Figma: "Upload File" (73:2623) */

  var newPiece = {
    render: function () {
      return shell(
        UI.header({
          left: { icon: 'info', act: 'info', label: 'About uploads' },
          right: { icon: 'close', act: 'home', label: 'Close' }
        }) +
        scrollArea(
          gap(56) +
          '<p class="body-md" style="text-align:center;margin:0">Upload New Piece</p>' +
          gap(28) +
          '<div class="pad-x stack-v" style="gap:16px">' +
          '<button class="btn btn-primary" data-act="device">From Device</button>' +
          '<button class="btn btn-primary" data-act="drive">From Google Drive</button>' +
          '<button class="btn btn-primary" data-act="dropbox">From Dropbox</button>' +
          '</div>' +
          gap(44) +
          '<div class="pad-x"><button class="btn btn-outline" data-act="musescore">' +
          'Connect MuseScore Account</button></div>',
          'pad-bottom'
        ) +
        UI.tabBar('new')
      );
    },

    mount: function (root) {
      root.addEventListener('click', function (e) {
        var a = e.target.closest('[data-act]');
        if (!a) return;
        var act = a.dataset.act;

        if (act === 'device') {
          App.Files.pick().then(function (file) {
            if (!file) { App.toast('No file chosen'); return; }
            App.state.pendingFile = { name: file.name, size: file.size, type: file.type };
            window.__pendingFile = file;
            App.go('/uploading');
          });
        } else if (act === 'drive' || act === 'dropbox') {
          // Stand-in for the provider's own picker — see the Files screen.
          App.state.pendingSource = act === 'drive' ? 'Google Drive' : 'Dropbox';
          App.go('/files');
        } else if (act === 'musescore') {
          App.toast('Account linking is not part of this prototype');
        } else if (act === 'info') {
          App.toast('PDF, MusicXML and images up to 25 MB');
        }
      });
    }
  };

  /* ========================================================== FILE BROWSER */
  /* Figma: "File Browser - iOS - Folder - Grid" (74:5002) */

  var files = {
    render: function () {
      function glyph(kind) {
        if (kind === 'folder') {
          return '<svg width="64" height="52" viewBox="0 0 64 52" aria-hidden="true">' +
            '<path d="M2 8a4 4 0 014-4h16l5 6h33a4 4 0 014 4v34a4 4 0 01-4 4H6a4 4 0 01-4-4z" fill="#3ab7f0"/>' +
            '<circle cx="32" cy="30" r="10" fill="none" stroke="#1b7fb5" stroke-width="1.6"/>' +
            '<path d="M32 25v10M28 31l4 4 4-4" fill="none" stroke="#1b7fb5" stroke-width="1.6" ' +
            'stroke-linecap="round" stroke-linejoin="round"/></svg>';
        }
        var tint = kind === 'pdf' ? '#e5443b' : '#3f8ae0';
        return '<svg width="52" height="66" viewBox="0 0 52 66" aria-hidden="true">' +
          '<path d="M2 4a2 2 0 012-2h28l18 18v42a2 2 0 01-2 2H4a2 2 0 01-2-2z" fill="#fff"/>' +
          '<path d="M32 2l18 18H34a2 2 0 01-2-2z" fill="#d9d9de"/>' +
          '<text x="26" y="34" text-anchor="middle" font-size="13" font-weight="700" ' +
          'fill="' + tint + '" font-family="-apple-system,sans-serif">' + kind + '</text>' +
          '<circle cx="26" cy="48" r="7" fill="none" stroke="#c9c9ce" stroke-width="1.4"/></svg>';
      }

      return (
        '<div class="screen-body files" style="display:flex;flex-direction:column;padding:0">' +
        UI.statusBar() +
        '<div class="files-head">' +
        '<span style="width:60px"></span>' +
        '<span style="display:flex;align-items:center;gap:6px;font-weight:600">Recents ' +
        Icons.get('chevronDown', { size: 14 }) + '</span>' +
        '<button data-act="back" style="color:#0a84ff;width:60px;text-align:right">Cancel</button></div>' +
        '<div class="files-search">' + Icons.get('search', { size: 15 }) + '<span>Search</span></div>' +
        '<div class="grow" style="overflow:auto">' +
        '<div class="files-grid">' +
        Data.files.map(function (f, i) {
          return '<button class="file-item" data-file="' + i + '">' +
            '<div class="glyph">' + glyph(f.kind) + '</div>' +
            '<div class="nm">' + esc(f.name) + '</div>' +
            '<div class="sub">' + esc(f.sub).replace(/\n/g, '<br>') + '</div></button>';
        }).join('') +
        '</div></div>' +
        '<div class="files-tabs">' +
        '<div class="on">' + Icons.get('clock', { size: 20 }) + '<span>Recents</span></div>' +
        '<div>' + Icons.get('tabProfile', { size: 20 }) + '<span>Shared</span></div>' +
        '<div>' + Icons.get('folder', { size: 20 }) + '<span>Browse</span></div>' +
        '</div></div>'
      );
    },

    mount: function (root) {
      root.addEventListener('click', function (e) {
        var item = e.target.closest('[data-file]');
        if (item) {
          var f = Data.files[+item.dataset.file];
          if (f.kind === 'folder') { App.toast('Folders are not browsable in this prototype'); return; }
          App.state.pendingFile = { name: f.name + '.' + f.kind, size: 1572864, type: 'application/' + f.kind };
          window.__pendingFile = null;
          App.go('/uploading');
        }
      });
    }
  };

  /* ============================================================= UPLOADING */
  /* Figma: "Uploading Screen" (73:2639) */

  var uploading = {
    render: function () {
      return shell(
        '<div class="screen-body" style="display:flex;flex-direction:column;justify-content:center">' +
        '<div class="pad-x">' +
        '<div style="position:relative;height:56px;border-radius:12px;background:#292929;overflow:hidden">' +
        '<div id="upFill" style="position:absolute;inset:0;width:6%;background:#3a3a3a;' +
        'transition:width .2s linear"></div>' +
        '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;' +
        'font-size:16px">Uploading File</div>' +
        '</div>' +
        '<p class="body-xs dim" id="upName" style="text-align:center;margin:12px 0 0"></p>' +
        '</div></div>' +
        UI.tabBar('new')
      );
    },

    mount: function (root) {
      var fill = root.querySelector('#upFill');
      var nameEl = root.querySelector('#upName');
      var meta = App.state.pendingFile || { name: 'score.pdf', size: 1572864 };
      var file = window.__pendingFile;
      nameEl.textContent = meta.name + ' · ' + (meta.size / 1048576).toFixed(1) + ' MB';

      var draft = ensureDraft();
      draft.fileName = meta.name;
      draft.title = '';
      draft.sections = 48;

      function proceed() {
        fill.style.width = '100%';
        setTimeout(function () { App.go('/title'); }, 260);
      }

      if (file) {
        // Real read of the picked file, with real progress.
        App.Files.read(file, function (p) {
          fill.style.width = Math.max(6, Math.round(p * 96)) + '%';
        }).then(function () {
          return App.Files.toArtwork(file);
        }).then(function (blob) {
          if (blob) {
            return App.Store.put('art:draft', blob).then(function (key) {
              // Without a working blob store the artwork still shows for this
              // session, it just will not survive a reload.
              draft.hasArtwork = !!key;
              draft.artwork = URL.createObjectURL(blob);
            });
          }
        }).then(proceed, function () {
          App.toast('That file could not be read');
          App.go('/new', { mode: 'pop' });
        });
      } else {
        // Provider stand-in: animate a plausible transfer.
        var p = 0.06;
        var iv = setInterval(function () {
          p += 0.04 + Math.random() * 0.06;
          fill.style.width = Math.min(96, p * 100) + '%';
          if (p >= 1) { clearInterval(iv); proceed(); }
        }, 90);
        root.addEventListener('screen:teardown', function () { clearInterval(iv); });
      }
    }
  };

  /* ================================================================= TITLE */
  /* Figma: "New Piece Title" (73:2646) + "New Piece Title Input" (73:2673) */

  var title = {
    render: function () {
      var draft = ensureDraft();
      return shell(
        UI.header({
          left: { icon: 'ellipsis', act: 'menu', label: 'Options' },
          right: { icon: 'close', act: 'cancel', label: 'Cancel' },
          title: 'New Piece'
        }) +
        scrollArea(
          gap(24) +
          heroCard(draft, { field: true }) +
          '<div class="grow"></div>' +
          '<div class="pad-x"><button class="btn btn-primary" id="continueBtn" data-act="continue"' +
          (draft.title ? '' : ' disabled') + '>Continue</button></div>' +
          gap(16),
          'pad-bottom column'
        ) +
        UI.tabBar('new')
      );
    },

    mount: function (root) {
      var draft = ensureDraft();
      var field = root.querySelector('#titleField');
      var btn = root.querySelector('#continueBtn');

      field.addEventListener('input', function () {
        draft.title = field.value.trim();
        if (draft.title) btn.removeAttribute('disabled');
        else btn.setAttribute('disabled', '');
      });
      field.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && draft.title) { field.blur(); App.go('/duedate'); }
      });

      root.addEventListener('click', function (e) {
        var a = e.target.closest('[data-act]');
        if (!a) return;
        if (a.dataset.act === 'continue') { App.save(); App.go('/duedate'); }
        else if (a.dataset.act === 'cancel') { App.state.draft = null; App.go('/home', { mode: 'fade' }); }
        else if (a.dataset.act === 'toggle-sections') { draft.showSections = !draft.showSections; App.refresh(); }
        else if (a.dataset.act === 'edit-art') App.toast('Cropping is not part of this prototype');
        else if (a.dataset.act === 'menu') App.toast('Options are not part of this prototype');
      });
    }
  };

  /* =============================================================== DUE DATE */
  /* Figma: "New Piece Add Due Date" (73:2700) + "New Piece Date Selector" (73:2721) */

  var duedate = {
    render: function () {
      var draft = ensureDraft();
      var cal = draft.hasDue === true ? calendarBlock(draft) : '';

      return shell(
        UI.header({
          left: { icon: 'ellipsis', act: 'menu', label: 'Options' },
          right: { icon: 'close', act: 'cancel', label: 'Cancel' },
          title: 'New Piece'
        }) +
        scrollArea(
          gap(24) +
          heroCard(draft, {}) +
          gap(28) +
          '<p class="body-s pad-x" style="margin:0">Do you have a date you need to memorize this piece by?</p>' +
          gap(16) +
          '<div class="btn-row">' +
          '<button class="btn ' + (draft.hasDue === true ? 'btn-primary' : 'btn-outline') +
          '" data-act="yes">Yes</button>' +
          '<button class="btn ' + (draft.hasDue === false ? 'btn-primary' : 'btn-outline') +
          '" data-act="no">Not Yet</button></div>' +
          (cal ? gap(28) + '<p class="body-s muted pad-x" style="margin:0 0 12px">Select the date</p>' + cal : '') +
          gap(32) +
          '<div class="pad-x"><button class="btn btn-primary" data-act="continue"' +
          (draft.hasDue === null ? ' disabled' : '') + '>Continue</button></div>' +
          gap(16),
          'pad-bottom'
        ) +
        UI.tabBar('new')
      );
    },

    mount: function (root) {
      var draft = ensureDraft();
      root.addEventListener('click', function (e) {
        var day = e.target.closest('[data-day]');
        if (day && !day.disabled) {
          draft.due = day.dataset.day;
          App.save();
          App.refresh();
          return;
        }
        var nav = e.target.closest('[data-mon]');
        if (nav) {
          draft.monthOffset = (draft.monthOffset || 0) + (+nav.dataset.mon);
          App.refresh();
          return;
        }
        var a = e.target.closest('[data-act]');
        if (!a) return;
        var act = a.dataset.act;
        if (act === 'yes') { draft.hasDue = true; App.refresh(); }
        else if (act === 'no') { draft.hasDue = false; draft.due = null; App.refresh(); }
        else if (act === 'continue') { App.save(); App.go('/schedule'); }
        else if (act === 'cancel') { App.state.draft = null; App.go('/home', { mode: 'fade' }); }
        else if (act === 'toggle-sections') { draft.showSections = !draft.showSections; App.refresh(); }
        else if (act === 'edit-art') App.toast('Cropping is not part of this prototype');
      });
    }
  };

  function calendarBlock(draft) {
    var base = new Date();
    base.setDate(1);
    base.setMonth(base.getMonth() + (draft.monthOffset || 0));
    var year = base.getFullYear();
    var month = base.getMonth();
    var monthName = base.toLocaleString('en-US', { month: 'long' });
    var first = new Date(year, month, 1).getDay();
    var days = new Date(year, month + 1, 0).getDate();
    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var cells = ['s', 'm', 't', 'w', 't', 'f', 's'].map(function (d) {
      return '<div class="dow">' + d + '</div>';
    });
    for (var b = 0; b < first; b++) cells.push('<div></div>');
    for (var d = 1; d <= days; d++) {
      var iso = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var past = new Date(year, month, d) < today;
      cells.push(
        '<button data-day="' + iso + '" class="' + (draft.due === iso ? 'sel' : '') + '"' +
        (past ? ' disabled' : '') + '>' + d + '</button>'
      );
    }

    return (
      '<div class="calendar">' +
      '<div class="cal-head"><span class="mon">' + monthName + ', ' + year + ' ' +
      Icons.get('chevronDown', { size: 14 }) + '</span>' +
      '<span class="cal-nav">' +
      '<button data-mon="-1" aria-label="Previous month">' + Icons.get('chevronLeft', { size: 16 }) + '</button>' +
      '<button data-mon="1" aria-label="Next month">' + Icons.get('chevronRight', { size: 16 }) + '</button>' +
      '</span></div>' +
      '<div class="cal-grid">' + cells.join('') + '</div></div>'
    );
  }

  /* =============================================================== SCHEDULE */
  /* Figma: "Ne Piece Schedule Set Up" (73:2746) */

  var schedule = {
    render: function () {
      var draft = ensureDraft();
      var dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      return shell(
        UI.header({
          left: { icon: 'ellipsis', act: 'menu', label: 'Options' },
          right: { icon: 'close', act: 'cancel', label: 'Cancel' },
          title: 'New Piece'
        }) +
        scrollArea(
          gap(24) +
          heroCard(draft, {}) +
          gap(28) +
          '<p class="body-s pad-x" style="margin:0">Based on the timeline and the size of the piece we ' +
          'recommend practice it at least twice a day.</p>' +
          gap(28) +
          '<p class="body-s muted pad-x" style="margin:0 0 16px">Select the days when you would like to ' +
          'practice the piece.</p>' +
          '<div class="day-picker">' +
          dayNames.map(function (d, i) {
            return '<button data-day="' + i + '" class="' + (draft.days.indexOf(i) >= 0 ? 'on' : '') +
              '" aria-pressed="' + (draft.days.indexOf(i) >= 0) + '">' + d + '</button>';
          }).join('') +
          '</div>' +
          gap(28) + '<div class="rule"></div>' + gap(24) +
          '<p class="body-s muted pad-x" style="margin:0 0 16px">Set the time when you would like to ' +
          'practice the piece</p>' +
          '<div class="time-slots">' +
          draft.times.map(function (t, i) {
            return '<div class="time-slot"><input type="time" value="' + esc(t) + '" data-time="' + i + '">' +
              (draft.times.length > 1
                ? '<button class="rm" data-rm="' + i + '" aria-label="Remove time">&times;</button>'
                : '') + '</div>';
          }).join('') +
          '<button class="time-slot add" data-act="add-time">Add</button>' +
          '</div>' +
          gap(28) + '<div class="rule"></div>' + gap(24) +
          '<div class="row-between pad-x">' +
          '<span class="body-s muted">Send Notifications</span>' +
          '<span class="toggle">' +
          '<button data-notify="0" class="' + (!draft.notify ? 'on' : '') + '">No</button>' +
          '<button data-notify="1" class="' + (draft.notify ? 'on' : '') + '">Yes</button>' +
          '</span></div>' +
          gap(32) +
          '<div class="pad-x"><button class="btn btn-primary" data-act="start">Start Memorizing</button></div>' +
          gap(16),
          'pad-bottom'
        ) +
        UI.tabBar('new')
      );
    },

    mount: function (root) {
      var draft = ensureDraft();

      root.addEventListener('change', function (e) {
        var t = e.target.closest('[data-time]');
        if (t) { draft.times[+t.dataset.time] = t.value; App.save(); }
      });

      root.addEventListener('click', function (e) {
        var day = e.target.closest('[data-day]');
        if (day) {
          var i = +day.dataset.day;
          var at = draft.days.indexOf(i);
          if (at >= 0) draft.days.splice(at, 1); else draft.days.push(i);
          App.save();
          App.refresh();
          return;
        }
        var rm = e.target.closest('[data-rm]');
        if (rm) { draft.times.splice(+rm.dataset.rm, 1); App.refresh(); return; }
        var nf = e.target.closest('[data-notify]');
        if (nf) { draft.notify = nf.dataset.notify === '1'; App.save(); App.refresh(); return; }

        var a = e.target.closest('[data-act]');
        if (!a) return;
        if (a.dataset.act === 'add-time') {
          draft.times.push('18:00');
          App.refresh();
        } else if (a.dataset.act === 'start') {
          commitDraft(draft);
        } else if (a.dataset.act === 'cancel') {
          App.state.draft = null;
          App.go('/home', { mode: 'fade' });
        } else if (a.dataset.act === 'toggle-sections') {
          draft.showSections = !draft.showSections;
          App.refresh();
        }
      });
    }
  };

  function commitDraft(draft) {
    var id = 'p' + Date.now();
    var due = draft.due ? new Date(draft.due) : null;
    var piece = {
      id: id,
      title: draft.title || draft.fileName || 'Untitled piece',
      composer: '',
      sections: draft.sections,
      memorized: 0,
      sessions: 0,
      sectionsPracticed: 0,
      due: draft.due,
      dueLabel: due
        ? { d: String(due.getDate()), m: due.toLocaleString('en-US', { month: 'short' }) }
        : { d: '—', m: '' },
      lastPracticed: new Date().toISOString().slice(0, 10),
      schedule: { days: draft.days, times: draft.times, notify: draft.notify },
      hasArtwork: !!draft.hasArtwork,
      artwork: draft.artwork
    };

    var move = draft.hasArtwork
      ? App.Store.get('art:draft').then(function (blob) {
          if (blob) return App.Store.put('art:' + id, blob);
        })
      : Promise.resolve();

    move.then(function () {
      App.state.pieces.unshift(piece);
      App.state.draft = null;
      App.state.pendingFile = null;
      App.save();
      if (draft.notify) requestNotifications();
      App.toast('“' + piece.title + '” added to your library');
      App.go('/piece/' + id, { mode: 'fade' });
    });
  }

  function requestNotifications() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(function () { /* user dismissed */ });
    }
  }

  /* ================================================================ EVENTS */
  /* Added: the "All Events" / "See All" destination, which the flow references
     but does not draw. */

  var events = {
    render: function () {
      return shell(
        UI.header({
          left: { icon: 'chevronLeft', act: 'back', label: 'Back' },
          right: { icon: 'calendar', act: 'sync', label: 'Sync' },
          title: 'Upcoming Events'
        }) +
        scrollArea(
          gap(24) +
          '<div class="events-panel">' +
          App.state.events.map(UI.eventRow).join('') +
          '</div>' +
          gap(24) +
          '<p class="body-xs dim pad-x" style="margin:0;text-align:center">' +
          'Added screen — the design references “All Events” but does not specify it.</p>',
          'pad-bottom'
        ) +
        UI.tabBar('practice')
      );
    },
    mount: function (root) {
      root.addEventListener('click', function (e) {
        var a = e.target.closest('[data-act]');
        if (!a) return;
        if (a.dataset.act === 'add-event') App.toast('Added to your calendar');
        else if (a.dataset.act === 'sync') App.toast('Calendar sync is not part of this prototype');
      });
    }
  };

  /* =============================================================== ARTICLE */
  /* Added: the destination for the "Read about stagefright" cards. */

  var article = {
    render: function (id) {
      var a = Data.articles.filter(function (x) { return x.id === id; })[0] || Data.articles[0];
      var idx = Data.articles.indexOf(a);
      return shell(
        UI.header({
          left: { icon: 'chevronLeft', act: 'back', label: 'Back' },
          right: { icon: 'plus', act: 'save', label: 'Save' }
        }) +
        scrollArea(
          gap(16) +
          '<div class="pad-x"><div class="article-art" style="height:220px">' +
          Data.articleArt(a.hue, idx + 1) + '</div></div>' +
          gap(20) +
          '<p class="body-xs dim pad-x" style="margin:0">' + esc(a.date) + '</p>' +
          gap(8) +
          '<h1 class="h6 pad-x" style="text-transform:none;font-size:24px;line-height:28px">' +
          esc(a.title) + '</h1>' +
          gap(20) +
          a.body.split('\n\n').map(function (para) {
            return '<p class="body-md pad-x" style="margin:0 0 16px;color:#d6d6d6">' + esc(para) + '</p>';
          }).join('') +
          gap(8) +
          '<p class="body-xs dim pad-x" style="margin:0;text-align:center">' +
          'Added screen — the design shows the cards but not the article itself.</p>',
          'pad-bottom'
        ) +
        UI.tabBar('home')
      );
    },
    mount: function (root) {
      root.addEventListener('click', function (e) {
        var a = e.target.closest('[data-act]');
        if (a && a.dataset.act === 'save') App.toast('Saved to your reading list');
      });
    }
  };

  /* =============================================================== PROFILE */
  /* Added: the fourth tab, which the tab bar links to but the flow never draws. */

  var profile = {
    render: function () {
      var s = App.state;
      var totalSessions = s.pieces.reduce(function (n, p) { return n + p.sessions; }, 0);
      var avg = s.pieces.length
        ? Math.round(s.pieces.reduce(function (n, p) { return n + p.memorized; }, 0) / s.pieces.length)
        : 0;

      return shell(
        UI.header({
          right: { icon: 'gear', act: 'settings', label: 'Settings' }
        }) +
        scrollArea(
          '<div class="profile-head">' +
          '<div class="avatar">' + esc(Data.user.name.charAt(0)) + '</div>' +
          '<h1 class="h5" style="margin:0">' + esc(Data.user.full) + '</h1>' +
          '<p class="body-xs dim" style="margin:0">' + esc(Data.user.instrument) +
          ' · since ' + esc(Data.user.since) + '</p>' +
          '</div>' +
          gap(28) +
          '<div class="pad-x"><div class="stat-row">' +
          UI.statTile(s.pieces.length, 'Pieces') +
          UI.statTile(totalSessions, 'Total Sessions') +
          UI.statTile(avg + '%', 'Avg Memorized') +
          '</div></div>' +
          gap(28) +
          '<div class="list-group">' +
          '<button class="list-row"><span>Notifications</span><span class="val">' +
          (s.settings.notifications ? 'On' : 'Off') + '</span></button>' +
          '<button class="list-row"><span>Practice reminders</span><span class="val">' +
          (s.settings.reminders ? 'On' : 'Off') + '</span></button>' +
          '<button class="list-row" data-act="connected"><span>Connected accounts</span>' +
          '<span class="val">MuseScore</span></button>' +
          '</div>' +
          gap(16) +
          '<div class="list-group">' +
          '<button class="list-row" data-act="reset"><span>Reset prototype data</span>' +
          '<span class="val">' + Icons.get('logout', { size: 14 }) + '</span></button>' +
          '</div>' +
          gap(20) +
          '<p class="body-xs dim pad-x" style="margin:0;text-align:center">' +
          'Added screen — the tab bar links to Profile but the flow does not draw it.</p>',
          'pad-bottom'
        ) +
        UI.tabBar('profile')
      );
    },

    mount: function (root) {
      root.addEventListener('click', function (e) {
        var row = e.target.closest('.list-row');
        if (!row) return;
        var act = row.dataset.act;
        if (act === 'reset') {
          if (window.confirm('Clear all prototype data and start over?')) App.reset();
        } else if (act === 'connected') {
          App.toast('Account linking is not part of this prototype');
        } else {
          var key = row.textContent.indexOf('reminders') >= 0 ? 'reminders' : 'notifications';
          App.state.settings[key] = !App.state.settings[key];
          App.save();
          App.refresh();
        }
      });
    }
  };

  return {
    home: home,
    library: library,
    piece: pieceScreen,
    sections: sections,
    practice: practice,
    record: record,
    end: end,
    new: newPiece,
    files: files,
    uploading: uploading,
    title: title,
    duedate: duedate,
    schedule: schedule,
    events: events,
    article: article,
    profile: profile
  };
})();
