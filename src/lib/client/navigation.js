// @ts-nocheck -- migrated browser module; typed conversion is intentionally deferred.
(function (root) {
  'use strict';
  var DPDPA = root.DPDPA;
  var VIEWS = ['landing', 'assessment', 'report'];
  var SUBS = { landing: 'Data Protection Readiness', assessment: 'Assessment in progress', report: 'Executive Report' };
  function showView(name) {
    VIEWS.forEach(function (v) { var el = document.getElementById('view-' + v); if (el) el.hidden = (v !== name); });
    // Context-aware nav: landing shows its in-page links (How it works / Coverage /
    // Start Assessment); the assessment & report views show the app links.
    var onLanding = (name === 'landing');
    Array.prototype.forEach.call(document.querySelectorAll('.nav [data-nav]'), function (a) {
      a.hidden = (a.getAttribute('data-nav') === 'landing') ? !onLanding : onLanding;
    });
    Array.prototype.forEach.call(document.querySelectorAll('.nav [data-view]'), function (a) {
      a.classList.toggle('active', a.getAttribute('data-view') === name);
    });
    var sub = document.querySelector('.brand .sub'); if (sub) sub.textContent = SUBS[name] || '';
    if (root.scrollTo) root.scrollTo({ top: 0, behavior: 'auto' });
    runSpies();
  }
  DPDPA.app = {
    showView: showView,
    showReport: function () { showView('report'); if (DPDPA.report) DPDPA.report.render(); runSpies(); }
  };

  /* --- scroll-spy: highlight the nav link for the section currently in view --- */
  var headerEl = document.querySelector('.site-header');
  function headerH() { return headerEl ? headerEl.offsetHeight : 64; }
  function spy(getLinks, getOffset, isActive) {
    return function () {
      if (!isActive()) return;
      var links = getLinks(), offset = getOffset(), current = links[0];
      for (var i = 0; i < links.length; i++) {
        var el = links[i].id ? document.getElementById(links[i].id) : null;
        if (el && el.getBoundingClientRect().top - offset <= 1) current = links[i];
      }
      links.forEach(function (l) { if (l.a) l.a.classList.toggle('active', l === current); });
    };
  }
  var landingSpy = spy(
    function () { return [
      { id: null, a: document.querySelector('.nav a[data-view="landing"]') },   // Overview = top
      { id: 'flow', a: document.querySelector('.nav a[href="#flow"]') },          // How it works
      { id: 'coverage', a: document.querySelector('.nav a[href="#coverage"]') }   // Coverage
    ]; },
    function () { return headerH() + 24; },
    function () { var v = document.getElementById('view-landing'); return v && !v.hidden; }
  );
  var reportSpy = spy(
    function () { return Array.prototype.map.call(document.querySelectorAll('#report-toolbar .report-nav a'),
      function (a) { return { id: (a.getAttribute('href') || '').replace('#', ''), a: a }; }); },
    function () { var t = document.getElementById('report-toolbar'); return headerH() + (t ? t.offsetHeight : 0) + 20; },
    function () { var v = document.getElementById('view-report'); return v && !v.hidden; }
  );
  function runSpies() { landingSpy(); reportSpy(); }
  var ticking = false;
  root.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    (root.requestAnimationFrame || function (f) { f(); })(function () { runSpies(); ticking = false; });
  }, { passive: true });
  root.addEventListener('resize', runSpies);
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest ? e.target.closest('[data-view]') : null;
    if (!t) return;
    e.preventDefault();
    var v = t.getAttribute('data-view');
    if (v === 'report') DPDPA.app.showReport(); else showView(v);
  });
  // Landing init: icons + live stats + domain grid
  DPDPA.hydrateIcons();
  var grid = document.getElementById('domain-grid');
  if (grid) grid.innerHTML = DPDPA.domains.map(function (d) {
    var count = DPDPA.getQuestionsByDomain(d.id).length;
    return '<div class="dom-chip card-hover"><div class="di">' + DPDPA.icon(d.icon) + '</div>' +
      '<div><b>' + d.name + '</b><span>' + d.sections + ' \u00b7 ' + count + ' controls</span></div></div>';
  }).join('');

  /* Draw the five-step connector once the process is meaningfully in view. */
  var flow = document.querySelector('.flow');
  if (flow) {
    var reduceFlowMotion = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceFlowMotion || !root.IntersectionObserver) {
      flow.setAttribute('data-drawn', '1');
    } else {
      var flowObserver = new root.IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (!entries[i].isIntersecting) continue;
          flow.setAttribute('data-drawn', '1');
          flowObserver.disconnect();
          break;
        }
      }, { threshold: .35 });
      flowObserver.observe(flow);
    }
  }
  showView('landing');
})(window);

export {};
