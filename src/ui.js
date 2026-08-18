/*
 * ui.js — the pieces of the design system that more than one screen uses.
 * Every builder returns an HTML string; screens compose them and then bind
 * behaviour in their own mount().
 */
var UI = (function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------ status bar */

  function statusBar() {
    var now = new Date();
    var h = now.getHours() % 12 || 12;
    var m = String(now.getMinutes()).padStart(2, '0');
    return (
      '<div class="statusbar">' +
      '<span>' + h + ':' + m + '</span>' +
      '<span class="sb-right">' +
      '<svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor" aria-hidden="true">' +
      '<rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="6" rx="1"/>' +
      '<rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>' +
      '<svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">' +
      '<path d="M8 10.6l1.9-2a2.7 2.7 0 00-3.8 0zM4.2 6.9l1.3 1.3a3.9 3.9 0 015 0l1.3-1.3a5.7 5.7 0 00-7.6 0z"/>' +
      '<path d="M1.6 4.3l1.3 1.3a7.5 7.5 0 0110.2 0l1.3-1.3a9.3 9.3 0 00-12.8 0z"/></svg>' +
      '<svg width="27" height="13" viewBox="0 0 27 13" fill="none" aria-hidden="true">' +
      '<rect x=".5" y="1" width="22" height="11" rx="3" stroke="currentColor" stroke-opacity=".4"/>' +
      '<rect x="2" y="2.5" width="19" height="8" rx="2" fill="currentColor"/>' +
      '<path d="M24 4.6v3.8a2 2 0 000-3.8z" fill="currentColor" fill-opacity=".4"/></svg>' +
      '</span></div>'
    );
  }

  /* ----------------------------------------------------------------- header */

  /**
   * The header block shared by nearly every screen: a row of icon buttons and
   * an optional serif title underneath.
   */
  function header(o) {
    o = o || {};
    var left = o.left
      ? '<button class="icon-btn" data-act="' + esc(o.left.act) + '" aria-label="' + esc(o.left.label) + '">' +
        Icons.get(o.left.icon) + '</button>'
      : '<span style="width:28px"></span>';
    var right = o.right
      ? '<button class="icon-btn" data-act="' + esc(o.right.act) + '" aria-label="' + esc(o.right.label) + '">' +
        Icons.get(o.right.icon) + '</button>'
      : '<span style="width:28px"></span>';

    return (
      '<div class="screen-header">' +
      '<div class="header-row">' + left + right + '</div>' +
      (o.title ? '<h1 class="h5 screen-title">' + esc(o.title) + '</h1>' : '') +
      (o.subtitle ? '<p class="body-xs dim screen-title" style="margin:0">' + esc(o.subtitle) + '</p>' : '') +
      '</div>'
    );
  }

  /* ------------------------------------------------------------------ tabs */

  var TABS = [
    { id: 'home', label: 'Home', icon: 'tabHome', route: '/home' },
    { id: 'practice', label: 'Practice', icon: 'tabPractice', route: '/library' },
    { id: 'new', label: 'New Piece', icon: 'tabNew', route: '/new' },
    { id: 'profile', label: 'Profile', icon: 'tabProfile', route: '/profile' }
  ];

  function tabBar(active) {
    return (
      '<nav class="tabbar">' +
      TABS.map(function (t) {
        return (
          '<button class="' + (t.id === active ? 'on' : '') + '" data-tab="' + t.route + '"' +
          (t.id === active ? ' aria-current="page"' : '') + '>' +
          Icons.get(t.icon) +
          '<span>' + t.label + '</span></button>'
        );
      }).join('') +
      '</nav>'
    );
  }

  /* ------------------------------------------------------------------ rings */

  function ring(value, suffix, label, pct) {
    var arc = '';
    if (pct != null) {
      var c = 2 * Math.PI * 18;
      arc =
        '<svg viewBox="0 0 38 38"><circle cx="19" cy="19" r="18" fill="none" stroke="#c2c2c2" stroke-width="1"/>' +
        '<circle cx="19" cy="19" r="18" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"' +
        ' stroke-dasharray="' + (c * pct / 100).toFixed(1) + ' ' + c.toFixed(1) + '"' +
        ' transform="rotate(-90 19 19)"/></svg>';
    } else {
      arc = '<svg viewBox="0 0 38 38"><circle cx="19" cy="19" r="18" fill="none" stroke="#c2c2c2" stroke-width="1"/></svg>';
    }
    return (
      '<div class="ring-stat"><div class="ring">' + arc +
      '<span>' + esc(value) + esc(suffix || '') + '</span></div>' +
      '<span class="ring-label">' + esc(label) + '</span></div>'
    );
  }

  /* ------------------------------------------------------------- score card */

  /**
   * card-recently-practiced. `cta` is the button label; pass null for a card
   * that is not directly actionable.
   */
  function pieceCard(piece, cta) {
    return (
      '<article class="piece-card" data-piece="' + esc(piece.id) + '">' +
      '<div class="paper">' + scoreFor(piece, 254, 368, 7) + '</div>' +
      '<div class="veil"></div>' +
      '<div class="label-date"><span class="d">' + esc(piece.dueLabel.d) + '</span>' +
      '<span class="m">' + esc(piece.dueLabel.m) + '</span></div>' +
      '<div class="card-rings rings">' +
      ring(piece.memorized, '%', 'Memorized', piece.memorized) +
      ring(piece.sessions, '', 'Sessions') +
      '</div>' +
      '<h3 class="h6 card-title">' + esc(piece.title) + '</h3>' +
      (cta
        ? '<button class="btn btn-sm btn-dark card-cta" data-act="practice" data-id="' + esc(piece.id) + '">' +
          esc(cta) + '</button>'
        : '') +
      '</article>'
    );
  }

  /**
   * Score artwork for a piece. Uses the user's own uploaded image when there is
   * one, otherwise falls back to the procedural engraving.
   */
  function scoreFor(piece, w, h, space) {
    if (piece && piece.artwork) {
      return '<img src="' + esc(piece.artwork) + '" alt="" style="width:100%;height:100%;object-fit:cover">';
    }
    return Score.svg({
      width: w, height: h, space: space || 7,
      seed: (piece && piece.id) || 'performory', ink: '#141414'
    });
  }

  /* ------------------------------------------------------------------ misc */

  function segmented(name, options, selected) {
    return (
      '<div class="segmented" role="tablist" data-seg="' + esc(name) + '">' +
      options.map(function (o) {
        return '<button role="tab" data-val="' + esc(o.value) + '" aria-selected="' +
          (o.value === selected) + '">' + esc(o.label) + '</button>';
      }).join('') +
      '</div>'
    );
  }

  function statTile(value, label) {
    return (
      '<div class="stat-tile"><span class="v">' + esc(value) + '</span>' +
      '<span class="k">' + esc(label) + '</span></div>'
    );
  }

  function dots(count, index, cls) {
    var out = '';
    for (var i = 0; i < count; i++) out += '<i class="' + (i === index ? 'on' : '') + '"></i>';
    return '<div class="dots ' + (cls || '') + '">' + out + '</div>';
  }

  function eventRow(ev) {
    return (
      '<div class="event-row">' +
      '<div class="event-date"><div class="d">' + esc(ev.d) + '</div><div class="m">' + esc(ev.m) + '</div></div>' +
      '<div class="event-sep"></div>' +
      '<div class="event-main">' +
      '<div class="event-venue body-xs">' + Icons.get('pin') + '<span>' + esc(ev.venue) + '</span></div>' +
      '<div class="body-s">' + esc(ev.title) + '</div>' +
      '</div>' +
      '<div class="event-actions">' +
      '<button class="icon-btn ghost" aria-label="Event options">' + Icons.get('dotsV', { size: 20 }) + '</button>' +
      '<button class="icon-btn" data-act="add-event" data-id="' + esc(ev.id) + '" aria-label="Add to calendar">' +
      Icons.get('plus', { size: 22 }) + '</button>' +
      '</div></div>'
    );
  }

  function calTile(ev) {
    return (
      '<div class="cal-tile"><span class="d">' + esc(ev.d) + '</span><span class="m">' + esc(ev.m) + '</span></div>'
    );
  }

  return {
    esc: esc,
    statusBar: statusBar,
    header: header,
    tabBar: tabBar,
    ring: ring,
    pieceCard: pieceCard,
    scoreFor: scoreFor,
    segmented: segmented,
    statTile: statTile,
    dots: dots,
    eventRow: eventRow,
    calTile: calTile,
    TABS: TABS
  };
})();
