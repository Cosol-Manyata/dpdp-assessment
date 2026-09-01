// @ts-nocheck -- migrated browser module; typed conversion is intentionally deferred.
/* =============================================================================
 * assessment.js
 * -----------------------------------------------------------------------------
 * The assessment wizard controller. Renders the organization profile and each
 * compliance domain as a navigable step, captures answers, autosaves to
 * localStorage, tracks progress and hands off to the report on completion.
 *
 * Depends on: questions.js (data + icons), rules.js (applicability helpers).
 * Persistence key is versioned so the storage schema can evolve.
 * ========================================================================== */
(function (root) {
  'use strict';

  var DPDPA = root.DPDPA;
  var STORAGE_KEY = root.DPDPA_STORAGE_KEY || 'dpdpa_assessment_v1';

  /* --------------------------- State management --------------------------- */
  var state = loadState();
  var currentStep = 0;          // 0 = profile, 1..N = applicable domains
  var steps = buildSteps();     // recomputed whenever the profile changes

  function loadState() {
    try {
      var raw = root.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        parsed.profile = parsed.profile || {};
        parsed.answers = parsed.answers || {};
        parsed.meta = parsed.meta || {};
        return parsed;
      }
    } catch (e) { /* ignore corrupt storage */ }
    return { profile: {}, answers: {}, meta: { startedAt: new Date().toISOString() } };
  }

  function saveState() {
    state.meta.updatedAt = new Date().toISOString();
    if (root.DPDPA) root.DPDPA.currentAssessment = state;
    try { root.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* quota */ }
  }

  /* Applicable steps = profile + domains whose applicability() passes. */
  function buildSteps() {
    var list = [{ type: 'profile', id: '__profile__', name: 'Organization Profile', icon: 'governance' }];
    DPDPA.domains.forEach(function (d) {
      if (!d.applicability || d.applicability(state.profile)) {
        list.push({ type: 'domain', id: d.id, name: d.name, icon: d.icon, domain: d });
      }
    });
    return list;
  }

  /* ------------------------------ Progress -------------------------------- */
  function applicableQuestions() {
    var applicableIds = {};
    steps.forEach(function (s) { if (s.type === 'domain') applicableIds[s.id] = true; });
    return DPDPA.questions.filter(function (q) { return applicableIds[q.domain]; });
  }

  function answeredCountFor(domainId) {
    var qs = DPDPA.getQuestionsByDomain(domainId);
    var n = 0;
    qs.forEach(function (q) { if (state.answers[q.id]) n++; });
    return { answered: n, total: qs.length };
  }

  function overallCompletion() {
    var qs = applicableQuestions();
    if (!qs.length) return 0;
    var answered = 0;
    qs.forEach(function (q) { if (state.answers[q.id]) answered++; });
    return Math.round((answered / qs.length) * 100);
  }

  /* ------------------------------ Rendering ------------------------------- */
  var el = {
    stepperList: document.getElementById('stepper-list'),
    stepContent: document.getElementById('step-content'),
    topProgress: document.querySelector('#top-progress > span'),
    sideProgress: document.querySelector('#side-progress > span'),
    sidePct: document.getElementById('side-pct'),
    stepCurrent: document.getElementById('step-current'),
    stepTotal: document.getElementById('step-total'),
    answeredSummary: document.getElementById('answered-summary'),
    btnPrev: document.getElementById('btn-prev'),
    btnNext: document.getElementById('btn-next'),
    btnGenerate: document.getElementById('btn-generate'),
    btnReset: document.getElementById('btn-reset')
  };

  function riskBadgeClass(risk) {
    return risk === 'High' ? 'badge-high' : (risk === 'Medium' ? 'badge-moderate' : 'badge-low');
  }
  function importancePillClass(imp) {
    return imp === 'High' ? 'pill-high' : (imp === 'Medium' ? 'pill-medium' : 'pill-low');
  }

  function renderStepper() {
    el.stepperList.innerHTML = steps.map(function (s, i) {
      var cls = 'step-item';
      if (i === currentStep) cls += ' active';
      var meta = '';
      if (s.type === 'domain') {
        var c = answeredCountFor(s.id);
        if (c.answered === c.total && c.total > 0) cls += ' done';
        meta = '<span class="si-count">' + c.answered + '/' + c.total + '</span>';
      } else {
        cls += hasProfileBasics() ? ' done' : '';
      }
      var icon = (i === currentStep || s.type === 'profile') ? s.icon : s.icon;
      var innerIcon = (i !== currentStep && s.type === 'domain' && answeredCountFor(s.id).answered === answeredCountFor(s.id).total && answeredCountFor(s.id).total > 0)
        ? 'check' : icon;
      return '<div class="' + cls + '" data-step="' + i + '">' +
        '<span class="si-ic">' + DPDPA.icon(innerIcon) + '</span>' +
        '<span class="si-name">' + s.name + '</span>' + meta +
      '</div>';
    }).join('');

    Array.prototype.forEach.call(el.stepperList.querySelectorAll('.step-item'), function (node) {
      node.addEventListener('click', function () { goToStep(parseInt(node.getAttribute('data-step'), 10)); });
    });
  }

  function missingRequiredProfileFields() {
    return DPDPA.profileQuestions.filter(function (pq) {
      if (!pq.required) return false;
      var value = state.profile[pq.field];
      return pq.type === 'multi-select' ? !Array.isArray(value) || !value.length : !value;
    });
  }
  function hasProfileBasics() { return missingRequiredProfileFields().length === 0; }

  function renderProgress() {
    var pct = overallCompletion();
    el.topProgress.style.width = pct + '%';
    el.sideProgress.style.width = pct + '%';
    el.sidePct.textContent = pct + '%';
    el.stepCurrent.textContent = (currentStep + 1);
    el.stepTotal.textContent = steps.length;

    if (steps[currentStep].type === 'domain') {
      var c = answeredCountFor(steps[currentStep].id);
      el.answeredSummary.innerHTML = c.answered === c.total
        ? DPDPA.icon('check') + ' Section complete'
        : (c.answered + ' of ' + c.total + ' answered');
    } else {
      el.answeredSummary.innerHTML = hasProfileBasics() ? DPDPA.icon('check') + ' Saved' : '';
    }
    DPDPA.hydrateIcons(el.answeredSummary);
  }

  /* --------------------------- Profile step ------------------------------- */
  function renderProfileStep() {
    var fields = DPDPA.profileQuestions.map(function (pq) {
      var val = state.profile[pq.field];
      if (pq.type === 'text') {
        return '<div class="field"><label>' + pq.label + (pq.required ? ' *' : '') + '</label>' +
          '<input type="text" data-field="' + pq.field + '" value="' + escapeAttr(val || '') +
          '" placeholder="' + (pq.placeholder || '') + '" /></div>';
      }
      if (pq.type === 'dropdown') {
        var opts = '<option value="">Select…</option>' + pq.options.map(function (o) {
          return '<option value="' + escapeAttr(o) + '"' + (val === o ? ' selected' : '') + '>' + o + '</option>';
        }).join('');
        return '<div class="field"><label>' + pq.label + (pq.required ? ' *' : '') + '</label>' +
          '<select data-field="' + pq.field + '">' + opts + '</select></div>';
      }
      if (pq.type === 'multi-select') {
        var selected = Array.isArray(val) ? val : [];
        var checks = pq.options.map(function (o) {
          var on = selected.indexOf(o) !== -1;
          return '<label class="check' + (on ? ' checked' : '') + '" data-multi="' + pq.field + '" data-val="' + escapeAttr(o) + '">' +
            '<span class="box">' + DPDPA.icon('check') + '</span>' +
            '<span>' + o + '</span></label>';
        }).join('');
        return '<div class="field"><label>' + pq.label + (pq.required ? ' *' : '') + '</label><div class="checks">' + checks + '</div></div>';
      }
      return '';
    }).join('');

    el.stepContent.innerHTML =
      '<div class="domain-header">' +
        '<div class="dh-ic">' + DPDPA.icon('governance') + '</div>' +
        '<div><h2>Organization Profile</h2>' +
        '<p style="margin:2px 0 0">Context that tailors the assessment and shapes the applicability of certain domains.</p></div>' +
      '</div>' +
      '<div class="applic-note">' + DPDPA.icon('info') +
        '<span>Required profile answers tailor fiduciary, processor, children’s data, cross-border, public-service and Significant Data Fiduciary domains. Scope and exemption answers are disclosed in the report as self-assessed assumptions.</span></div>' +
      '<div class="card card-pad mt-2">' + fields + '</div>';

    DPDPA.hydrateIcons(el.stepContent);
    wireProfileInputs();
  }

  function wireProfileInputs() {
    Array.prototype.forEach.call(el.stepContent.querySelectorAll('[data-field]'), function (node) {
      node.addEventListener('input', function () { onProfileChange(node.getAttribute('data-field'), node.value); });
      node.addEventListener('change', function () { onProfileChange(node.getAttribute('data-field'), node.value); });
    });
    Array.prototype.forEach.call(el.stepContent.querySelectorAll('[data-multi]'), function (node) {
      node.addEventListener('click', function (e) {
        e.preventDefault();
        var field = node.getAttribute('data-multi'), v = node.getAttribute('data-val');
        var arr = Array.isArray(state.profile[field]) ? state.profile[field].slice() : [];
        var idx = arr.indexOf(v);
        if (idx === -1) {
          if (field === 'exemptions' && (v === 'None identified' || v === 'Not sure')) arr = [v];
          else {
            if (field === 'exemptions') arr = arr.filter(function (x) { return x !== 'None identified' && x !== 'Not sure'; });
            arr.push(v);
          }
          node.classList.add('checked');
        }
        else { arr.splice(idx, 1); node.classList.remove('checked'); }
        onProfileChange(field, arr);
        if (field === 'exemptions') renderProfileStep();
      });
    });
  }

  function onProfileChange(field, value) {
    state.profile[field] = value;
    saveState();
    // Applicability-affecting fields rebuild the step list & stepper.
    if (field === 'role' || field === 'childrenData' || field === 'crossBorder' ||
        field === 'sdf' || field === 'stateProcessing' || field === 'exemptions') {
      steps = buildSteps();
      renderStepper();
      renderProgress();
    } else {
      renderStepper();
      renderProgress();
    }
  }

  /* ---------------------------- Domain step ------------------------------- */
  function renderDomainStep(step) {
    var domain = step.domain;
    var qs = DPDPA.getQuestionsByDomain(domain.id);

    var cards = qs.map(function (q, i) {
      var current = state.answers[q.id];
      var opts = q.options.map(function (o) {
        var checked = current === o.value;
        // Scores are intentionally hidden from the respondent to avoid biasing
        // answers toward the higher-scoring option — answer honestly, not to score.
        return '<label class="opt' + (checked ? ' checked' : '') + '" data-qid="' + q.id + '" data-val="' + o.value + '">' +
          '<input type="radio" name="' + q.id + '"' + (checked ? ' checked' : '') + ' />' +
          '<span class="mark"></span>' +
          '<span class="opt-label">' + o.label + '</span></label>';
      }).join('');

      return '<div class="card q-card' + (current ? ' answered' : '') + '" id="qc-' + q.id + '">' +
        '<div class="q-top">' +
          '<span class="q-num">Question ' + (i + 1) + ' · ' + q.id + '</span>' +
          '<div class="q-badges">' +
            '<span class="badge ' + riskBadgeClass(q.risk) + '"><span class="dot"></span>' + q.risk + ' risk</span>' +
          '</div>' +
        '</div>' +
        '<div class="q-text">' + q.question + '</div>' +
        '<div class="q-why">' + DPDPA.icon('help') + '<span><b>Why we ask:</b> ' + q.explanation + '</span></div>' +
        '<div class="q-ref">' + DPDPA.icon('scale') + '<span><b>Reference:</b> ' + q.legalReference + '</span>' +
          '<span class="pill" style="margin-left:auto">' + q.controlType + '</span>' +
          '<span class="pill ' + importancePillClass(q.importance) + '">' + q.importance + ' importance</span></div>' +
        '<div class="options">' + opts + '</div>' +
        '<div class="q-flag">' + DPDPA.icon('alert') + '<span>Please choose an option — this control is required.</span></div>' +
      '</div>';
    }).join('');

    var applicNote = '';
    if (domain.applicability && !domain.applicability(state.profile)) {
      applicNote = '<div class="applic-note">' + DPDPA.icon('info') +
        '<span>Based on your profile this section may not apply. You may still answer it, or mark controls as <b>Not applicable</b>.</span></div>';
    }

    el.stepContent.innerHTML =
      '<div class="domain-header">' +
        '<div class="dh-ic">' + DPDPA.icon(domain.icon) + '</div>' +
        '<div><h2>' + domain.name + '</h2>' +
          '<p style="margin:2px 0 0">' + domain.description + '</p>' +
          '<div class="dh-meta"><span class="ref-tag">' + domain.sections + '</span>' +
            '<span class="muted" style="font-size:.82rem">' + qs.length + ' controls</span></div>' +
        '</div>' +
      '</div>' + applicNote +
      '<div>' + cards + '</div>';

    DPDPA.hydrateIcons(el.stepContent);
    wireOptions();
  }

  function wireOptions() {
    Array.prototype.forEach.call(el.stepContent.querySelectorAll('.opt'), function (node) {
      node.addEventListener('click', function () {
        var qid = node.getAttribute('data-qid'), val = node.getAttribute('data-val');
        state.answers[qid] = val;
        saveState();
        // Update selection visuals within this question group.
        Array.prototype.forEach.call(el.stepContent.querySelectorAll('.opt[data-qid="' + qid + '"]'), function (o) {
          o.classList.toggle('checked', o.getAttribute('data-val') === val);
          var input = o.querySelector('input'); if (input) input.checked = o.getAttribute('data-val') === val;
        });
        var card = document.getElementById('qc-' + qid);
        if (card) { card.classList.add('answered'); card.classList.remove('needs-answer'); }
        renderStepper();
        renderProgress();
      });
    });
  }

  /* ------------------------------ Navigation ------------------------------ */
  function renderStep() {
    var step = steps[currentStep];
    if (step.type === 'profile') renderProfileStep();
    else renderDomainStep(step);

    el.btnPrev.disabled = currentStep === 0;
    if (currentStep === steps.length - 1) {
      el.btnNext.innerHTML = 'Review &amp; Generate ' + DPDPA.icon('checkCircle');
    } else {
      el.btnNext.innerHTML = 'Next ' + DPDPA.icon('arrowRight');
    }
    DPDPA.hydrateIcons(el.btnNext);

    renderStepper();
    renderProgress();
    root.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function goToStep(i) {
    if (i < 0 || i >= steps.length) return;
    currentStep = i;
    renderStep();
  }

  function next() {
    if (!validateCurrentStep(true)) return;                 // enforce answers before advancing
    if (currentStep === steps.length - 1) { generateReport(); return; }
    goToStep(currentStep + 1);
  }

  /* Is a given step fully answered? (profile needs its basics; domains need
     every question answered). */
  function stepComplete(i) {
    var step = steps[i];
    if (step.type === 'profile') return hasProfileBasics();
    return DPDPA.getQuestionsByDomain(step.id).every(function (q) { return !!state.answers[q.id]; });
  }

  /* Validate the currently-displayed step; when `flag` is true, highlight the
     unanswered questions and scroll to the first one. */
  function validateCurrentStep(flag) {
    var step = steps[currentStep];
    if (step.type === 'profile') {
      if (!hasProfileBasics()) { if (flag) flashProfileWarning(); return false; }
      return true;
    }
    var qs = DPDPA.getQuestionsByDomain(step.id);
    var firstMissing = null;
    qs.forEach(function (q) {
      var answered = !!state.answers[q.id];
      var card = document.getElementById('qc-' + q.id);
      if (card && flag) card.classList.toggle('needs-answer', !answered);
      if (!answered && !firstMissing) firstMissing = q.id;
    });
    if (firstMissing) {
      if (flag) {
        var target = document.getElementById('qc-' + firstMissing);
        if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    return true;
  }

  function generateReport() {
    // Walk every step; jump to the first incomplete one and prompt.
    for (var i = 0; i < steps.length; i++) {
      if (!stepComplete(i)) {
        goToStep(i);
        validateCurrentStep(true);
        showBlockedBanner();
        return;
      }
    }
    state.meta.completedAt = new Date().toISOString();
    saveState();
    if (root.DPDPA && root.DPDPA.app) root.DPDPA.app.showReport();
  }

  function showBlockedBanner() {
    var b = document.createElement('div');
    b.className = 'applic-note';
    b.style.background = 'var(--red-50)';
    b.style.borderColor = '#fca5a5';
    b.style.color = 'var(--red-700)';
    b.innerHTML = DPDPA.icon('alert') +
      '<span>Every control is required. Please answer the highlighted question' +
      '(s) before generating the report.</span>';
    el.stepContent.insertBefore(b, el.stepContent.firstChild);
    DPDPA.hydrateIcons(b);
  }

  function flashProfileWarning() {
    var missingFields = missingRequiredProfileFields();
    var missing = missingFields.map(function (pq) { return pq.label; });
    var note = el.stepContent.querySelector('.applic-note');
    if (note) {
      note.style.background = 'var(--amber-50)';
      note.style.borderColor = '#fde68a';
      note.innerHTML = DPDPA.icon('alert') +
        '<span>Please complete the required profile fields before continuing: <b>' + missing.join(', ') + '</b>.</span>';
      DPDPA.hydrateIcons(note);
    }
    var firstField = missingFields.length ? missingFields[0].field : 'orgName';
    var first = el.stepContent.querySelector('[data-field="' + firstField + '"]') ||
      el.stepContent.querySelector('[data-multi="' + firstField + '"]');
    if (first) first.focus();
  }

  /* ------------------------------- Utilities ------------------------------ */
  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function resetAssessment() {
    if (!root.confirm('Reset the assessment? All answers stored in this browser will be cleared.')) return;
    try { root.localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    state = { profile: {}, answers: {}, meta: { startedAt: new Date().toISOString() } };
    steps = buildSteps();
    currentStep = 0;
    renderStep();
  }

  /* -------------------------------- Init ---------------------------------- */
  function init() {
    DPDPA.hydrateIcons();
    el.btnPrev.addEventListener('click', function () { goToStep(currentStep - 1); });
    el.btnNext.addEventListener('click', next);
    el.btnGenerate.addEventListener('click', generateReport);
    el.btnReset.addEventListener('click', resetAssessment);
    renderStep();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})(window);

export {};
