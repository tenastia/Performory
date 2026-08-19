/*
 * data.js — seed content for the prototype.
 *
 * Copy is transcribed from the Figma frames. Where the design repeats one
 * placeholder row (the Library screen shows the same Brahms card five times,
 * the Home screen the same recital three times) the seed varies it so the
 * prototype demonstrates real list behaviour instead of a repeated mock.
 */
var Data = (function () {
  'use strict';

  var pieces = [
    {
      id: 'brahms-pc1',
      title: 'J. Brahms Piano Concerto N1.',
      composer: 'Johannes Brahms',
      sections: 48,
      memorized: 73,
      sessions: 14,
      sectionsPracticed: 35,
      due: '2025-09-31',
      dueLabel: { d: '31', m: 'Sept' },
      lastPracticed: '2025-09-14',
      schedule: { days: [0, 2, 4], times: ['11:00', '16:00'], notify: false }
    },
    {
      id: 'chopin-noct',
      title: 'F. Chopin. Nocturne C-moll',
      composer: 'Frédéric Chopin',
      sections: 24,
      memorized: 64,
      sessions: 9,
      sectionsPracticed: 15,
      due: '2025-10-16',
      dueLabel: { d: '16', m: 'Oct' },
      lastPracticed: '2025-09-12',
      schedule: { days: [1, 3], times: ['09:30'], notify: true }
    },
    {
      id: 'debussy-clair',
      title: 'C. Debussy. Clair de Lune',
      composer: 'Claude Debussy',
      sections: 32,
      memorized: 41,
      sessions: 6,
      sectionsPracticed: 13,
      due: '2025-11-19',
      dueLabel: { d: '19', m: 'Nov' },
      lastPracticed: '2025-09-09',
      schedule: { days: [2, 5], times: ['18:00'], notify: false }
    },
    {
      id: 'rach-prelude',
      title: 'S. Rachmaninoff. Prelude Op. 3',
      composer: 'Sergei Rachmaninoff',
      sections: 18,
      memorized: 22,
      sessions: 4,
      sectionsPracticed: 4,
      due: '2025-12-08',
      dueLabel: { d: '8', m: 'Dec' },
      lastPracticed: '2025-09-02',
      schedule: { days: [0, 3, 6], times: ['07:45', '20:00'], notify: true }
    },
    {
      id: 'bach-inv',
      title: 'J.S. Bach. Invention N4',
      composer: 'Johann Sebastian Bach',
      sections: 12,
      memorized: 88,
      sessions: 21,
      sectionsPracticed: 11,
      due: '2026-01-22',
      dueLabel: { d: '22', m: 'Jan' },
      lastPracticed: '2025-08-30',
      schedule: { days: [1, 4], times: ['12:00'], notify: false }
    }
  ];

  var events = [
    {
      id: 'ev1', d: '25', m: 'Sept',
      venue: 'Carnegie Hall',
      title: 'Charity Recital in Memory of Johannes Brahms (solo)'
    },
    {
      id: 'ev2', d: '16', m: 'Oct',
      venue: 'NY Opera Theatre',
      title: 'Autumn Chamber Series — Chopin & Debussy (solo)'
    },
    {
      id: 'ev3', d: '8', m: 'Dec',
      venue: 'Queen Elizabeth Theatre',
      title: 'Winter Gala: Rachmaninoff Preludes (with orchestra)'
    },
    {
      id: 'ev4', d: '14', m: 'Jan',
      venue: 'Wigmore Hall',
      title: 'Bach Inventions — lunchtime recital (solo)'
    },
    {
      id: 'ev5', d: '2', m: 'Mar',
      venue: 'Musikverein, Brahms-Saal',
      title: 'Brahms Piano Concerto N1 with the Vienna Chamber Orchestra'
    }
  ];

  var articles = [
    {
      id: 'a1', date: 'Aug 16', hue: 34, cover: 'assets/covers/story-one.jpg',
      title: 'The Role of Cortisol in Stage Fright: Understanding the Stress Response',
      body: 'Cortisol is the body\'s primary stress hormone, and the surge you feel in the ' +
        'minutes before walking on stage is the same response that once helped us outrun ' +
        'predators. It sharpens attention and floods the muscles — useful on a savannah, ' +
        'less useful in the second movement of a concerto.\n\n' +
        'The research is consistent on one point: performers who interpret the surge as ' +
        'readiness rather than dread play measurably better. The physiology is identical. ' +
        'The label is not.\n\n' +
        'Practising under mild, deliberate stress — a recording light, a single listener, ' +
        'a timer — narrows the gap between the practice room and the stage, so the hormone ' +
        'arrives as a familiar guest rather than an ambush.'
    },
    {
      id: 'a2', date: 'Aug 16', hue: 208, cover: 'assets/covers/story-two.jpg',
      title: 'Practising in the Dark: What Memory Does When You Remove the Score',
      body: 'Removing the score forces retrieval rather than recognition, and retrieval is ' +
        'what builds durable memory. The uncomfortable blank you hit two bars in is not a ' +
        'failure — it is the exact location of the work still to do.\n\n' +
        'Sectional practice with the page hidden turns a vague sense of "I nearly know it" ' +
        'into a specific map of what is solid and what is not.'
    },
    {
      id: 'a3', date: 'Aug 9', hue: 128,
      title: 'Spaced Repetition at the Keyboard: Borrowing from Language Learning',
      body: 'Spacing effects are among the most reliably replicated findings in cognitive ' +
        'psychology, and they transfer cleanly to motor and musical memory.\n\n' +
        'The practical version: revisit a section just as it begins to feel shaky, not ' +
        'while it is still fresh. Intervals that stretch — a day, three days, a week — beat ' +
        'the same total minutes spent in one sitting.'
    }
  ];

  var quotes = [
    { text: '“The beginning is the most important part of the work”', by: '– Plato' },
    { text: '“What we play is life”', by: '– Louis Armstrong' },
    { text: '“Practice means to perform, over and over again”', by: '– Martha Graham' },
    { text: '“The notes I handle no better than many. But the pauses — ah, that is where the art resides”', by: '– Artur Schnabel' }
  ];

  /* Files shown by the in-app stand-in for the iOS document picker
     (Figma frame "File Browser - iOS - Folder - Grid"). */
  var files = [
    { kind: 'folder', name: 'Arc Search', sub: '2 items' },
    { kind: 'folder', name: 'Blackmagic Cam', sub: '1 item' },
    { kind: 'folder', name: 'Delta', sub: '18 items' },
    { kind: 'folder', name: 'Darkroom', sub: '9 items' },
    { kind: 'pdf', name: 'W.Mozart', sub: '22/05/24\n1,5 MB' },
    { kind: 'pdf', name: 'Brahms_Piano_Concerto', sub: '22/05/24\n1,5 MB' },
    { kind: 'folder', name: 'Downloads', sub: '36 items' },
    { kind: 'zip', name: '1440x2560_lasvegas_3_t...da_v01', sub: '22/05/24\n1,5 MB' },
    { kind: 'zip', name: '1440x2560_lasvegas_3_t...da_v01', sub: '22/05/24\n1,5 MB' }
  ];

  /**
   * Cover art for an article. Uses the supplied export when the article has
   * one; the generated fallback covers articles that were not exported.
   * Deterministic per article, so generated covers stay stable across renders.
   */
  function articleArt(hue, seed, cover) {
    if (cover) {
      return '<img src="' + cover + '" alt="" ' +
        'style="width:100%;height:100%;object-fit:cover;display:block">';
    }
    var s = seed || 1;
    var blobs = '';
    for (var i = 0; i < 5; i++) {
      var x = 20 + ((s * (i + 3) * 37) % 240);
      var y = 20 + ((s * (i + 7) * 53) % 160);
      var r = 26 + ((s * (i + 2) * 17) % 46);
      blobs +=
        '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="hsl(' + (hue + i * 14) +
        ' 24% ' + (26 + i * 6) + '% / .55)"/>';
    }
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 277 202" preserveAspectRatio="xMidYMid slice">' +
      '<defs><filter id="b' + s + '"><feGaussianBlur stdDeviation="18"/></filter></defs>' +
      '<rect width="277" height="202" fill="hsl(' + hue + ' 18% 14%)"/>' +
      '<g filter="url(#b' + s + ')">' + blobs + '</g>' +
      '<rect width="277" height="202" fill="url(#g' + s + ')"/>' +
      '<defs><linearGradient id="g' + s + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#000" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>' +
      '</svg>'
    );
  }

  return {
    user: { name: 'Alex', full: 'Alex Rivera', instrument: 'Piano', since: 'March 2024' },
    pieces: pieces,
    events: events,
    articles: articles,
    quotes: quotes,
    files: files,
    articleArt: articleArt
  };
})();
