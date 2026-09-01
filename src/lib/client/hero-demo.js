// @ts-nocheck -- migrated browser module; typed conversion is intentionally deferred.
/* =============================================================================
 * hero-demo.js
 * A dependency-free, 19.5-second product story: Scope -> Assess -> Report.
 * Figures are tied to the declared demo persona in hero-section-demo.md.
 * ========================================================================== */
(function (root) {
  'use strict';

  var DPDPA = root.DPDPA;
  var demo = document.getElementById('demo');
  if (!demo || !DPDPA || !DPDPA.domains || !DPDPA.questions) return;

  var DURATION = 19500;
  var CIRCUMFERENCE = 326.73;
  var ACT_STARTS = { scope: 0, assess: 6500, report: 12000 };
  var reducedQuery = root.matchMedia ? root.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reducedMotion = !!(reducedQuery && reducedQuery.matches);

  var panels = demo.querySelectorAll('[data-demo-panel]');
  var actButtons = demo.querySelectorAll('[data-demo-act]');
  var chips = demo.querySelectorAll('[data-demo-chip]');
  var grid = demo.querySelector('[data-demo-domain-grid]');
  var scopeCounter = demo.querySelector('.demo-scope-counter');
  var domainCount = demo.querySelector('[data-demo-domains]');
  var controlCount = demo.querySelector('[data-demo-controls]');
  var assessCount = demo.querySelector('[data-demo-assess-count]');
  var assessTotal = demo.querySelector('[data-demo-assess-total]');
  var assessRows = demo.querySelectorAll('.demo-domain-row');
  var gauge = demo.querySelector('[data-demo-gauge]');
  var score = demo.querySelector('[data-demo-score]');
  var band = demo.querySelector('[data-demo-band]');
  var reportStats = demo.querySelectorAll('[data-demo-stat]');
  var roadmaps = demo.querySelectorAll('[data-demo-roadmap]');
  var caption = demo.querySelector('[data-demo-caption]');
  var tiles;

  var shortNames = {
    governance: 'Governance', notice: 'Notice', consent: 'Consent', processing: 'Processing',
    rights: 'Rights', children: "Children's", security: 'Security', breach: 'Breach',
    vendors: 'Vendors', processor: 'Processor', retention: 'Retention', crossborder: 'Cross-Border',
    sdf: 'SDF', state: 'State', exemptions: 'Exemptions', records: 'Records'
  };
  var shortRefs = {
    governance: 'S.8', notice: 'S.5', consent: 'S.6', processing: 'S.4, S.7',
    rights: 'S.11–14', children: 'S.9', security: 'S.8(5)', breach: 'S.8(6)',
    vendors: 'S.8(1)', processor: 'R.6–8', retention: 'S.8(7)', crossborder: 'S.16',
    sdf: 'S.10', state: 'S.7(b)', exemptions: 'S.3, S.17', records: 'S.8'
  };

  grid.innerHTML = DPDPA.domains.map(function (domain, index) {
    return '<div class="demo-domain-tile" data-demo-domain="' + domain.id + '" data-state="skel" style="--tile-i:' + index + '">' +
      '<span class="demo-tile-icon">' + DPDPA.icon(domain.icon) + '</span>' +
      '<span class="demo-tile-copy"><span class="demo-tile-name">' + (shortNames[domain.id] || domain.name) + '</span>' +
      '<span class="demo-tile-ref">' + (shortRefs[domain.id] || domain.sections) + '</span></span></div>';
  }).join('');
  tiles = demo.querySelectorAll('[data-demo-domain]');

  var personaExcluded = ['processor', 'state', 'exemptions'];
  var applicableControls = DPDPA.questions.filter(function (question) {
    return personaExcluded.indexOf(question.domain) === -1;
  }).length;
  assessTotal.textContent = applicableControls;

  function each(nodes, fn) {
    for (var i = 0; i < nodes.length; i++) fn(nodes[i], i);
  }

  function setAct(name) {
    each(panels, function (panel) {
      panel.setAttribute('data-active', panel.getAttribute('data-demo-panel') === name ? 'true' : 'false');
    });
    each(actButtons, function (button) {
      var current = button.getAttribute('data-demo-act') === name;
      button.setAttribute('data-current', current ? 'true' : 'false');
      button.setAttribute('aria-pressed', current ? 'true' : 'false');
    });
  }

  function setChip(name, visible) {
    var chip = demo.querySelector('[data-demo-chip="' + name + '"]');
    if (chip) chip.setAttribute('data-visible', visible ? 'true' : 'false');
  }

  function setTile(id, state) {
    var tile = demo.querySelector('[data-demo-domain="' + id + '"]');
    if (tile) tile.setAttribute('data-state', state);
  }

  function pulseTile(id, on) {
    var tile = demo.querySelector('[data-demo-domain="' + id + '"]');
    if (tile) tile.classList.toggle('is-pulsing', !!on);
  }

  function updateScope(excluded) {
    var excludedIds = excluded || [];
    var controls = DPDPA.questions.filter(function (question) {
      return excludedIds.indexOf(question.domain) === -1;
    }).length;
    domainCount.textContent = DPDPA.domains.length - excludedIds.length;
    controlCount.textContent = controls;
    scopeCounter.setAttribute('data-state', 'ready');
  }

  function resetVisuals() {
    setAct('scope');
    each(chips, function (chip) { chip.setAttribute('data-visible', 'false'); });
    each(tiles, function (tile) {
      tile.setAttribute('data-state', 'skel');
      tile.classList.remove('is-pulsing');
    });
    scopeCounter.setAttribute('data-state', 'skel');
    domainCount.textContent = DPDPA.domains.length;
    controlCount.textContent = DPDPA.questions.length;
    assessCount.textContent = '0';
    each(assessRows, function (row) { row.setAttribute('data-state', 'skel'); });
    gauge.style.strokeDashoffset = CIRCUMFERENCE;
    score.textContent = '0';
    band.setAttribute('data-visible', 'false');
    each(reportStats, function (stat) { stat.setAttribute('data-visible', 'false'); });
    each(roadmaps, function (roadmap) { roadmap.setAttribute('data-state', 'hidden'); });
    caption.textContent = 'Tell us who you are. The assessment works out what applies.';
  }

  function easeOutCubic(value) {
    var inverse = 1 - value;
    return 1 - inverse * inverse * inverse;
  }

  function clamp(value) { return Math.max(0, Math.min(1, value)); }

  function updateContinuous(time) {
    if (time >= 6500 && time < 12000) {
      var assessProgress = clamp((time - 6850) / 1700);
      assessCount.textContent = Math.round(applicableControls * easeOutCubic(assessProgress));
    }
    if (time >= 12000) {
      var gaugeProgress = clamp((time - 12250) / 1300);
      var result = Math.round(63 * easeOutCubic(gaugeProgress));
      score.textContent = result;
      gauge.style.strokeDashoffset = CIRCUMFERENCE * (1 - (.63 * easeOutCubic(gaugeProgress)));
    }
  }

  var cues = [
    [0, function () { resetVisuals(); }],
    [700, function () { updateScope([]); }],
    [750, function () {
      setChip('fiduciary', true);
      each(tiles, function (tile) {
        if (tile.getAttribute('data-demo-domain') !== 'processor') tile.setAttribute('data-state', 'on');
      });
    }],
    [1350, function () { setTile('processor', 'off'); updateScope(['processor']); }],
    [1500, function () { setChip('state', true); }],
    [1900, function () { setTile('state', 'off'); updateScope(['processor', 'state']); }],
    [2050, function () { setChip('exemptions', true); }],
    [2450, function () { setTile('exemptions', 'off'); updateScope(personaExcluded); }],
    [2750, function () { setChip('children', true); pulseTile('children', true); }],
    [3170, function () { pulseTile('children', false); }],
    [3250, function () { setChip('crossborder', true); pulseTile('crossborder', true); }],
    [3670, function () { pulseTile('crossborder', false); }],
    [3750, function () { setChip('sdf', true); pulseTile('sdf', true); }],
    [4170, function () { pulseTile('sdf', false); }],
    [4300, function () { caption.textContent = "Three domains removed. You'll never be asked those questions."; }],
    [6500, function () {
      setAct('assess');
      caption.textContent = '66 applicable controls — scored by significance, not by tally.';
    }],
    [7150, function () { assessRows[0].setAttribute('data-state', 'ready'); }],
    [7500, function () { assessRows[1].setAttribute('data-state', 'ready'); }],
    [7850, function () { assessRows[2].setAttribute('data-state', 'ready'); }],
    [8200, function () { assessRows[3].setAttribute('data-state', 'ready'); }],
    [8550, function () { assessRows[4].setAttribute('data-state', 'ready'); }],
    [9000, function () { caption.textContent = 'Weighted by how much each control actually matters.'; }],
    [12000, function () {
      setAct('report');
      caption.textContent = 'The result is candid — and every gap becomes an action.';
    }],
    [13650, function () { band.setAttribute('data-visible', 'true'); }],
    [13950, function () { reportStats[0].setAttribute('data-visible', 'true'); }],
    [14100, function () { reportStats[1].setAttribute('data-visible', 'true'); }],
    [14250, function () { reportStats[2].setAttribute('data-visible', 'true'); }],
    [14600, function () { roadmaps[0].setAttribute('data-state', 'skel'); }],
    [15100, function () { roadmaps[0].setAttribute('data-state', 'ready'); }],
    [15500, function () { roadmaps[1].setAttribute('data-state', 'skel'); }],
    [16000, function () { roadmaps[1].setAttribute('data-state', 'ready'); }],
    [16500, function () { caption.textContent = 'A prioritised roadmap, with an owner and a deadline on every action.'; }]
  ];

  var elapsed = 0;
  var cueIndex = 0;
  var frameId = null;
  var lastTime = null;
  var pauseReasons = {
    hover: false,
    focus: false,
    view: false,
    document: false,
    intro: document.body.classList.contains('intro-active')
  };

  function runCuesTo(time) {
    while (cueIndex < cues.length && cues[cueIndex][0] <= time) {
      cues[cueIndex][1]();
      cueIndex += 1;
    }
  }

  function resetTimeline(time) {
    elapsed = time || 0;
    cueIndex = 0;
    resetVisuals();
    runCuesTo(elapsed);
    updateContinuous(elapsed);
  }

  function advance(delta) {
    elapsed += delta;
    if (elapsed >= DURATION) {
      resetTimeline(elapsed % DURATION);
    } else {
      runCuesTo(elapsed);
      updateContinuous(elapsed);
    }
  }

  function tick(now) {
    if (lastTime === null) lastTime = now;
    advance(now - lastTime);
    lastTime = now;
    frameId = root.requestAnimationFrame(tick);
  }

  function isPaused() {
    return pauseReasons.hover || pauseReasons.focus || pauseReasons.view || pauseReasons.document;
  }

  function syncPlayback() {
    var paused = isPaused();
    demo.classList.toggle('is-paused', paused);
    if (reducedMotion) return;
    if (paused && frameId !== null) {
      advance(Math.max(0, root.performance.now() - lastTime));
      root.cancelAnimationFrame(frameId);
      frameId = null;
      lastTime = null;
    } else if (!paused && frameId === null) {
      lastTime = null;
      frameId = root.requestAnimationFrame(tick);
    }
  }

  function setPause(reason, value) {
    pauseReasons[reason] = !!value;
    syncPlayback();
  }

  function jumpTo(time) {
    resetTimeline(time);
    lastTime = frameId !== null ? root.performance.now() : null;
    syncPlayback();
  }

  function showReducedMotionResult() {
    resetVisuals();
    setAct('report');
    score.textContent = '63';
    gauge.style.strokeDashoffset = CIRCUMFERENCE * .37;
    band.setAttribute('data-visible', 'true');
    each(reportStats, function (stat) { stat.setAttribute('data-visible', 'true'); });
    each(roadmaps, function (roadmap) { roadmap.setAttribute('data-state', 'ready'); });
    caption.textContent = 'A prioritised roadmap, with an owner and a deadline on every action.';
    demo.classList.add('is-paused');
  }

  each(actButtons, function (button) {
    button.addEventListener('click', function () {
      if (reducedMotion) { showReducedMotionResult(); return; }
      jumpTo(ACT_STARTS[button.getAttribute('data-demo-act')]);
    });
  });
  demo.addEventListener('mouseenter', function () { setPause('hover', true); });
  demo.addEventListener('mouseleave', function () { setPause('hover', false); });
  demo.addEventListener('focusin', function () { setPause('focus', true); });
  demo.addEventListener('focusout', function () {
    root.requestAnimationFrame(function () { setPause('focus', demo.contains(document.activeElement)); });
  });
  document.addEventListener('visibilitychange', function () { setPause('document', document.hidden); });
  document.addEventListener('dpdpa:intro-complete', function () {
    if (reducedMotion) {
      showReducedMotionResult();
      return;
    }
    pauseReasons.intro = false;
    jumpTo(0);
  });

  if ('IntersectionObserver' in root) {
    var observer = new root.IntersectionObserver(function (entries) {
      setPause('view', entries[0].intersectionRatio < .15);
    }, { threshold: [0, .15, 1] });
    observer.observe(demo);
  }

  if (reducedMotion) {
    showReducedMotionResult();
  } else {
    resetTimeline(0);
    syncPlayback();
  }

})(window);

export {};
