/*
 * app.js — state, persistence, routing, and the device integrations.
 *
 * The prototype talks to real platform APIs where the design implies them:
 *   • the document picker (<input type="file">) for uploading a score,
 *   • getUserMedia + MediaRecorder + WebAudio for the practice recorder,
 *   • IndexedDB for score images and recordings, localStorage for everything else.
 *
 * Every one of those degrades to a simulated equivalent when the platform says
 * no (permission denied, insecure context, sandboxed iframe), so the flow is
 * always walkable. Media.simulated tells the UI which mode it is in.
 */
var App = (function () {
  'use strict';

  var KEY = 'performory.state.v1';

  /* ============================================================ blob store */

  // Object store for anything too big for localStorage: uploaded score images
  // and practice recordings.
  var Store = (function () {
    var dbp = null;

    function open() {
      if (dbp) return dbp;
      dbp = new Promise(function (resolve) {
        if (!window.indexedDB) return resolve(null);
        var settled = false;
        var done = function (v) { if (!settled) { settled = true; resolve(v); } };
        // On a file:// origin, in private mode, and inside some sandboxed
        // iframes the open request can hang without firing either handler, so
        // the whole store degrades to "unavailable" rather than stalling the
        // flow that is waiting on it.
        setTimeout(function () { done(null); }, 1500);
        try {
          var req = indexedDB.open('performory', 1);
          req.onupgradeneeded = function () { req.result.createObjectStore('blobs'); };
          req.onsuccess = function () { done(req.result); };
          req.onerror = function () { done(null); };
          req.onblocked = function () { done(null); };
        } catch (e) {
          done(null);
        }
      });
      return dbp;
    }

    function tx(mode) {
      return open().then(function (db) {
        if (!db) return null;
        try {
          return db.transaction('blobs', mode).objectStore('blobs');
        } catch (e) {
          return null;
        }
      });
    }

    return {
      put: function (key, blob) {
        return tx('readwrite').then(function (s) {
          if (!s) return null;
          return new Promise(function (resolve) {
            var r = s.put(blob, key);
            r.onsuccess = function () { resolve(key); };
            r.onerror = function () { resolve(null); };
          });
        });
      },
      get: function (key) {
        return tx('readonly').then(function (s) {
          if (!s) return null;
          return new Promise(function (resolve) {
            var r = s.get(key);
            r.onsuccess = function () { resolve(r.result || null); };
            r.onerror = function () { resolve(null); };
          });
        });
      },
      del: function (key) {
        return tx('readwrite').then(function (s) { if (s) s.delete(key); });
      }
    };
  })();

  /* ================================================================ state */

  var state = null;

  function fresh() {
    return {
      pieces: JSON.parse(JSON.stringify(Data.pieces)),
      events: Data.events.slice(),
      recordings: {},
      quoteIndex: 0,
      draft: null,
      session: null,
      settings: { notifications: true, reminders: true },
      seenIntro: false
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return fresh();
      var parsed = JSON.parse(raw);
      var base = fresh();
      Object.keys(base).forEach(function (k) {
        if (parsed[k] !== undefined) base[k] = parsed[k];
      });
      return base;
    } catch (e) {
      return fresh();
    }
  }

  function save() {
    try {
      // Object URLs are per-session; they are rebuilt from IndexedDB on boot.
      var copy = JSON.parse(JSON.stringify(state));
      copy.pieces.forEach(function (p) { delete p.artwork; });
      localStorage.setItem(KEY, JSON.stringify(copy));
    } catch (e) { /* private mode / quota — the prototype still runs in memory */ }
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    ['artwork', 'rec'].forEach(function () { /* blobs are left; keys are piece-scoped */ });
    state = fresh();
    save();
    location.hash = '#/home';
    location.reload();
  }

  function piece(id) {
    for (var i = 0; i < state.pieces.length; i++) {
      if (state.pieces[i].id === id) return state.pieces[i];
    }
    return null;
  }

  // Rebuild object URLs for artwork persisted in IndexedDB.
  function hydrateArtwork() {
    return Promise.all(state.pieces.map(function (p) {
      if (!p.hasArtwork) return null;
      return Store.get('art:' + p.id).then(function (blob) {
        if (blob) p.artwork = URL.createObjectURL(blob);
      });
    }));
  }

  /* ============================================================== device */

  var Files = {
    /**
     * Opens the real system document picker. Resolves with a File, or null if
     * the user cancelled or no picker is available.
     */
    pick: function (accept) {
      return new Promise(function (resolve) {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = accept || '.pdf,.xml,.musicxml,.mxl,image/*';
        input.style.position = 'fixed';
        input.style.left = '-9999px';
        document.body.appendChild(input);

        var done = false;
        function finish(v) {
          if (done) return;
          done = true;
          input.remove();
          resolve(v);
        }
        input.addEventListener('change', function () {
          finish(input.files && input.files[0] ? input.files[0] : null);
        });
        // Safari fires no cancel event on older versions; the focus fallback
        // keeps the flow from hanging if the sheet is dismissed.
        input.addEventListener('cancel', function () { finish(null); });
        window.addEventListener('focus', function once() {
          window.removeEventListener('focus', once);
          setTimeout(function () { if (!input.files || !input.files.length) finish(null); }, 800);
        });

        try {
          input.click();
        } catch (e) {
          finish(null);
        }
      });
    },

    /** Reads a file, reporting real progress, and resolves with an ArrayBuffer. */
    read: function (file, onProgress) {
      return new Promise(function (resolve, reject) {
        var fr = new FileReader();
        fr.onprogress = function (e) {
          if (e.lengthComputable) onProgress(e.loaded / e.total);
        };
        fr.onload = function () { onProgress(1); resolve(fr.result); };
        fr.onerror = function () { reject(fr.error); };
        fr.readAsArrayBuffer(file);
      });
    },

    /**
     * Turns an uploaded image into a downscaled JPEG blob suitable for use as
     * the piece's score artwork. Resolves null for non-images (PDF/MusicXML),
     * which keep the procedural engraving instead.
     */
    toArtwork: function (file) {
      if (!/^image\//.test(file.type)) return Promise.resolve(null);
      return new Promise(function (resolve) {
        var url = URL.createObjectURL(file);
        var img = new Image();
        img.onload = function () {
          var max = 900;
          var scale = Math.min(1, max / img.width);
          var c = document.createElement('canvas');
          c.width = Math.round(img.width * scale);
          c.height = Math.round(img.height * scale);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          URL.revokeObjectURL(url);
          c.toBlob(function (blob) { resolve(blob); }, 'image/jpeg', 0.82);
        };
        img.onerror = function () { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
      });
    }
  };

  var Media = {
    simulated: false,
    recording: false,
    _stream: null,
    _rec: null,
    _chunks: [],
    _ctx: null,
    _analyser: null,
    _data: null,
    _simPhase: 0,

    /** Starts a real recording; falls back to a simulated meter if denied. */
    start: function () {
      var self = this;
      self._chunks = [];
      var canRecord = navigator.mediaDevices && navigator.mediaDevices.getUserMedia &&
        typeof MediaRecorder !== 'undefined';

      if (!canRecord) {
        self.simulated = true;
        self.recording = true;
        return Promise.resolve({ simulated: true });
      }

      return navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        self._stream = stream;
        self.simulated = false;

        var AC = window.AudioContext || window.webkitAudioContext;
        self._ctx = new AC();
        // Created after an await, so the context has lost the user gesture and
        // starts suspended on Chrome and iOS Safari — the meter reads silence
        // until it is resumed.
        if (self._ctx.state === 'suspended') self._ctx.resume();
        var src = self._ctx.createMediaStreamSource(stream);
        self._analyser = self._ctx.createAnalyser();
        self._analyser.fftSize = 256;
        self._analyser.smoothingTimeConstant = 0.6;
        src.connect(self._analyser);
        self._data = new Uint8Array(self._analyser.frequencyBinCount);

        var mime = ['audio/webm', 'audio/mp4', 'audio/aac'].filter(function (t) {
          return MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t);
        })[0];
        self._rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        self._rec.ondataavailable = function (e) { if (e.data.size) self._chunks.push(e.data); };
        self._rec.start();
        self.recording = true;
        return { simulated: false };
      }).catch(function () {
        self.simulated = true;
        self.recording = true;
        return { simulated: true };
      });
    },

    /** Current input level per bar, 0..1. Synthesised when simulated. */
    levels: function (bars) {
      var out = new Array(bars);
      var i;
      if (!this.simulated && this._analyser) {
        this._analyser.getByteTimeDomainData(this._data);
        var per = Math.floor(this._data.length / bars) || 1;
        for (i = 0; i < bars; i++) {
          var peak = 0;
          for (var j = 0; j < per; j++) {
            var v = Math.abs(this._data[i * per + j] - 128) / 128;
            if (v > peak) peak = v;
          }
          out[i] = Math.min(1, peak * 2.2);
        }
        return out;
      }
      this._simPhase += 0.22;
      for (i = 0; i < bars; i++) {
        var a = Math.sin(this._simPhase + i * 0.42) * 0.5 + 0.5;
        var b = Math.sin(this._simPhase * 1.7 + i * 0.13) * 0.5 + 0.5;
        out[i] = Math.max(0.06, a * b * 0.95);
      }
      return out;
    },

    /** Stops and resolves with a Blob, or null when simulated. */
    stop: function () {
      var self = this;
      self.recording = false;
      return new Promise(function (resolve) {
        if (self.simulated || !self._rec) {
          self._teardown();
          return resolve(null);
        }
        self._rec.onstop = function () {
          var blob = new Blob(self._chunks, { type: self._rec.mimeType || 'audio/webm' });
          self._teardown();
          resolve(blob);
        };
        try {
          self._rec.stop();
        } catch (e) {
          self._teardown();
          resolve(null);
        }
      });
    },

    _teardown: function () {
      if (this._stream) this._stream.getTracks().forEach(function (t) { t.stop(); });
      if (this._ctx && this._ctx.state !== 'closed') this._ctx.close();
      this._stream = null;
      this._rec = null;
      this._ctx = null;
      this._analyser = null;
    }
  };

  /* =============================================================== router */

  var stack = [];
  var current = null;
  var busy = false;
  var queued = null;

  function parse(hash) {
    var clean = (hash || '').replace(/^#/, '') || '/home';
    var parts = clean.split('/').filter(Boolean);
    return { name: parts[0] || 'home', param: parts[1] || null, path: '/' + parts.join('/') };
  }

  function tabOf(name) {
    if (name === 'home') return 'home';
    if (name === 'library' || name === 'piece' || name === 'events') return 'practice';
    if (['new', 'files', 'uploading', 'title', 'duedate', 'schedule'].indexOf(name) >= 0) return 'new';
    if (name === 'profile') return 'profile';
    return null;
  }

  function go(path, opts) {
    opts = opts || {};
    // A navigation asked for mid-transition is deferred, never dropped: work
    // that finishes fast (a small file upload) would otherwise strand the user
    // on the screen it was supposed to leave.
    if (busy) { queued = [path, opts]; return; }
    var target = parse(path);
    if (current && current.path === target.path && !opts.force) return;

    var mode = opts.mode;
    if (!mode) {
      var back = stack.length > 1 && stack[stack.length - 2].path === target.path;
      if (back) mode = 'pop';
      else if (current && tabOf(current.name) !== tabOf(target.name) && tabOf(target.name)) mode = 'fade';
      else mode = 'push';
    }

    if (mode === 'pop') stack.pop();
    else if (mode === 'fade') stack = [target];
    else stack.push(target);

    render(target, mode);
  }

  function back() {
    if (stack.length > 1) {
      go(stack[stack.length - 2].path, { mode: 'pop' });
    } else {
      go('/home', { mode: 'fade' });
    }
  }

  var stackEl;
  var overlayEl = null;
  var overlayUnder = null;

  function teardown(el) {
    el.dispatchEvent(new CustomEvent('screen:teardown'));
    el.remove();
  }

  function closeOverlay() {
    if (!overlayEl) return;
    var el = overlayEl;
    overlayEl = null;
    // Flagged so it stops counting as the top of the stack while it fades out.
    el.dataset.dying = '1';
    el.classList.add('anim-fade-out');
    setTimeout(function () { teardown(el); }, 180);
  }

  function render(route, mode) {
    var screen = Screens[route.name] || Screens.home;

    // An overlay (the sections sheet) floats above the screen that opened it,
    // so dismissing it must not re-render what is already underneath.
    if (overlayEl) {
      var under = overlayUnder;
      closeOverlay();
      if (route.path === under) {
        current = route;
        history.replaceState(null, '', '#' + route.path);
        return;
      }
    }

    var next = document.createElement('section');
    next.className = 'screen' + (screen.overlay ? ' overlay' : '');
    next.dataset.screen = route.name;
    next.innerHTML = screen.render(route.param);

    var prev = null;
    for (var i = stackEl.children.length - 1; i >= 0; i--) {
      if (!stackEl.children[i].dataset.dying) { prev = stackEl.children[i]; break; }
    }
    stackEl.appendChild(next);

    if (screen.mount) screen.mount(next, route.param);
    bindCommon(next);

    if (screen.overlay) {
      overlayEl = next;
      overlayUnder = current ? current.path : null;
      next.classList.add('anim-fade-in');
      current = route;
      history.replaceState(null, '', '#' + route.path);
      return;
    }

    if (prev) {
      busy = true;
      var inCls = mode === 'pop' ? 'anim-pop-in' : mode === 'modal' ? 'anim-modal-in'
        : mode === 'fade' ? 'anim-fade-in' : 'anim-push-in';
      var outCls = mode === 'pop' ? 'anim-pop-out' : mode === 'modal' ? 'anim-fade-out'
        : mode === 'fade' ? 'anim-fade-out' : 'anim-push-out';

      // Popping animates the outgoing screen on top of the one being revealed.
      if (mode === 'pop') stackEl.insertBefore(next, prev);

      next.classList.add(inCls);
      prev.classList.add(outCls);

      var settle = function () {
        teardown(prev);
        next.classList.remove(inCls);
        busy = false;
        if (queued) {
          var q = queued;
          queued = null;
          go(q[0], q[1]);
        }
      };
      var t = setTimeout(settle, 460);
      next.addEventListener('animationend', function once() {
        next.removeEventListener('animationend', once);
        clearTimeout(t);
        settle();
      });
    }

    current = route;
    if (location.hash !== '#' + route.path) {
      history.replaceState(null, '', '#' + route.path);
    }
    document.documentElement.scrollTop = 0;
  }

  function refresh() {
    if (current) render(current, null);
  }

  /* Delegated handlers every screen shares. */
  function bindCommon(root) {
    root.addEventListener('click', function (e) {
      var tab = e.target.closest('[data-tab]');
      if (tab) {
        go(tab.dataset.tab, { mode: 'fade' });
        return;
      }
      var act = e.target.closest('[data-act]');
      if (!act) return;
      var name = act.dataset.act;
      if (name === 'back') back();
      else if (name === 'close') back();
      else if (name === 'home') go('/home', { mode: 'fade' });
    });
  }

  /* ================================================================ toast */

  var toastTimer = null;
  function toast(msg) {
    var host = document.getElementById('device');
    var old = host.querySelector('.toast');
    if (old) old.remove();
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    host.appendChild(el);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.remove(); }, 2400);
  }

  /* ============================================================== practice */

  function startSession(pieceId, sectionIds) {
    var p = piece(pieceId);
    // A section is worked through in several fragments; practising all three
    // of the design's example sections gives 12 fragments, so one "Played"
    // reads as the 9% shown in the Practice frame.
    var FRAGMENTS_PER_SECTION = 4;
    var total = sectionIds && sectionIds.length
      ? sectionIds.length * FRAGMENTS_PER_SECTION
      : Math.min(12, p.sections);
    state.session = {
      pieceId: pieceId,
      sections: sectionIds || null,
      total: total,
      index: 0,
      played: 0,
      skipped: 0,
      bars: 'One',
      startedAt: Date.now(),
      recordings: []
    };
    save();
  }

  function advance(kind) {
    var s = state.session;
    if (!s) return;
    if (kind === 'played') s.played++;
    else s.skipped++;
    s.index++;
    save();
  }

  function finishSession() {
    var s = state.session;
    if (!s) return;
    var p = piece(s.pieceId);
    if (p) {
      p.sessions += 1;
      p.sectionsPracticed = Math.min(p.sections, p.sectionsPracticed + s.played);
      // Memorisation creeps up with the share of fragments played cleanly.
      var gain = Math.round((s.played / Math.max(1, s.total)) * 6);
      p.memorized = Math.min(100, p.memorized + gain);
      p.lastPracticed = new Date().toISOString().slice(0, 10);
    }
    save();
  }

  function endSession() {
    state.session = null;
    save();
  }

  /* ================================================================= boot */

  function boot() {
    state = load();
    stackEl = document.getElementById('stack');

    if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
      document.body.classList.add('standalone');
    }

    hydrateArtwork().then(function () {
      var route = parse(location.hash);
      stack = [route];
      render(route, null);
    });

    window.addEventListener('hashchange', function () {
      var r = parse(location.hash);
      if (!current || r.path !== current.path) go(r.path);
    });
  }

  return {
    get state() { return state; },
    save: save,
    reset: reset,
    piece: piece,
    go: go,
    back: back,
    refresh: refresh,
    toast: toast,
    Files: Files,
    Media: Media,
    Store: Store,
    startSession: startSession,
    advance: advance,
    finishSession: finishSession,
    endSession: endSession,
    boot: boot
  };
})();
