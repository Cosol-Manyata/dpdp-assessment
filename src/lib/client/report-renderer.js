// @ts-nocheck -- migrated browser module; typed conversion is intentionally deferred.
/* =============================================================================
 * report.js
 * -----------------------------------------------------------------------------
 * Reads the saved assessment, runs the rules engine and renders an insight-led
 * executive report. It focuses on DOMAINS, not individual questions, and every
 * finding leads with the consequence ("what breaks and what it costs you"),
 * not a restatement of the control.
 *
 * Sections: Summary · Dashboard · Domain Verdicts · Priorities · Risk Register
 *           · Remediation Roadmap · Readiness
 * ========================================================================== */
(function (root) {
  'use strict';

  var DPDPA = root.DPDPA;
  var STORAGE_KEY = root.DPDPA_STORAGE_KEY || 'dpdpa_assessment_v1';
  var mount = document.getElementById('report-root');

  /* ------------------------------ Load data ------------------------------- */
  function loadAssessment() {
    try {
      var raw = root.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed.answers && Object.keys(parsed.answers).length) return parsed;
      }
    } catch (e) { /* localStorage may be blocked on file:// */ }
    var mem = root.DPDPA && root.DPDPA.currentAssessment;
    if (mem && mem.answers && Object.keys(mem.answers).length) return mem;
    return null;
  }

  /* ------------------------------ Formatting ------------------------------ */
  function fmtDate(iso) {
    var d = iso ? new Date(iso) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function levelBadgeClass(key) {
    var map = { excellent: 'badge-good', good: 'badge-good', moderate: 'badge-moderate',
      high: 'badge-high', critical: 'badge-critical', na: 'badge-na' };
    return map[key] || 'badge-na';
  }
  function levelColor(key) {
    var map = { excellent: '#10b981', good: '#10b981', moderate: '#f59e0b',
      high: '#f97316', critical: '#ef4444', na: '#94a3b8' };
    return map[key] || '#94a3b8';
  }
  function levelColorLight(key) {
    var map = { excellent: '#34d399', good: '#34d399', moderate: '#fbbf24',
      high: '#fb923c', critical: '#f87171', na: '#cbd5e1' };
    return map[key] || '#cbd5e1';
  }
  function barClass(score) {
    if (score >= 80) return 'bar-good';
    if (score >= 60) return 'bar-moderate';
    if (score >= 40) return 'bar-high';
    return 'bar-critical';
  }
  function likePill(level) {
    return level === 'High' ? 'pill-high' : (level === 'Medium' ? 'pill-medium' : 'pill-low');
  }

  /* ------------------------------ Empty state ----------------------------- */
  function renderEmpty() {
    document.getElementById('report-toolbar').style.display = 'none';
    mount.innerHTML =
      '<div class="empty" style="margin-top:40px">' +
        '<div class="e-ic">' + DPDPA.icon('file') + '</div>' +
        '<h2>No assessment found</h2>' +
        '<p style="max-width:44ch;margin:0 auto 24px">Complete the DPDPA assessment to generate your executive ' +
          'readiness report. Your answers stay in this browser.</p>' +
        '<a href="#" data-view="assessment" class="btn btn-primary btn-lg">Start the assessment ' + DPDPA.icon('arrowRight') + '</a>' +
      '</div>';
    DPDPA.hydrateIcons();
  }

  function profileComplete(profile) {
    profile = profile || {};
    return DPDPA.profileQuestions.every(function (pq) {
      if (!pq.required) return true;
      var value = profile[pq.field];
      return pq.type === 'multi-select' ? Array.isArray(value) && value.length > 0 : !!value;
    });
  }

  function renderIncomplete(model) {
    document.getElementById('report-toolbar').style.display = 'none';
    var ev = model.evaluation;
    mount.innerHTML = '<div class="empty" style="margin-top:40px">' +
      '<div class="e-ic">' + DPDPA.icon('alert') + '</div>' +
      '<h2>Assessment incomplete</h2>' +
      '<p style="max-width:52ch;margin:0 auto 10px">A readiness score is withheld until the required profile and every applicable control are complete.</p>' +
      '<p class="muted" style="margin:0 auto 24px">' + ev.answeredCount + ' of ' + ev.totalApplicable +
        ' applicable controls answered (' + ev.completion + '%).</p>' +
      '<a href="#" data-view="assessment" class="btn btn-primary btn-lg">Return to assessment ' + DPDPA.icon('arrowRight') + '</a>' +
      '</div>';
    DPDPA.hydrateIcons();
  }

  /* =========================================================================
   * 1. Executive summary — gauge, one-line verdict, key numbers, top findings
   * ====================================================================== */
  function sectionSummary(model) {
    var ev = model.evaluation, lvl = ev.level;
    var color = levelColor(lvl.key), colorLight = levelColorLight(lvl.key);
    var C = 2 * Math.PI * 78, offset = C * (1 - ev.overallScore / 100);
    var orgName = model.profile.orgName || 'Your organization';

    return '<section id="summary" class="section" style="padding-top:0">' +
      '<div class="report-hero">' +
        '<div class="rh-grid">' +
          '<div class="gauge">' +
            '<svg viewBox="0 0 180 180">' +
              '<defs><linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
                '<stop offset="0%" stop-color="' + colorLight + '"/>' +
                '<stop offset="100%" stop-color="' + color + '"/>' +
              '</linearGradient></defs>' +
              '<circle class="g-track" cx="90" cy="90" r="78"></circle>' +
              '<circle class="g-fill" cx="90" cy="90" r="78" stroke="url(#gaugeGrad)" ' +
                'stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '" ' +
                'style="filter: drop-shadow(0 2px 6px ' + color + '66)"></circle>' +
            '</svg>' +
            '<div class="g-center"><b>' + ev.overallScore + '<small>%</small></b><span>control maturity</span></div>' +
          '</div>' +
          '<div class="rh-info">' +
            '<h1>DPDPA Readiness Report</h1>' +
            '<div class="rh-org">' + esc(orgName) + (model.profile.industry ? ' · ' + esc(model.profile.industry) : '') + '</div>' +
            '<div class="rh-level" style="border-color:' + color + '55"><span class="dot" style="background:' + color + '"></span>' + lvl.label + '</div>' +
            '<p class="rh-headline">' + esc(model.headline) + '</p>' +
            '<div class="rh-foot">Assessed on ' + fmtDate(model.metaDate) + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      criticalFindingsBlock(model) +
    '</section>';
  }

  /* Critical findings — lead with the CONSEQUENCE, tag with domain + section. */
  function criticalFindingsBlock(model) {
    if (!model.criticalFindings.length) {
      var high = model.riskRegister.filter(function (r) { return r.priority === 'High'; }).length;
      if (high) return '<div class="card card-pad mt-3" style="border-left:4px solid var(--amber-500)">' +
        '<div class="flex aic gap">' + DPDPA.icon('alert') + '<div><b style="color:var(--navy)">No immediate-priority gap.</b> ' +
        '<span class="muted">There are still ' + high + ' high-priority control ' + (high === 1 ? 'gap' : 'gaps') + ' to address.</span></div></div></div>';
      return '<div class="card card-pad mt-3" style="border-left:4px solid var(--green-500)">' +
        '<div class="flex aic gap">' + DPDPA.icon('checkCircle') +
        '<div><b style="color:var(--navy)">No immediate or high-priority gap identified.</b> ' +
        '<span class="muted">Continue periodic self-assessment and control maintenance.</span></div></div></div>';
    }
    var items = model.criticalFindings.slice(0, 5).map(function (r) {
      return '<li>' +
        '<span class="cf-ic">' + DPDPA.icon('alert') + '</span>' +
        '<div class="cf-body"><b>' + esc(r.exposure) + '</b>' +
        '<span>' + esc(r.domainName) + ' &middot; ' + esc(r.section) + '</span></div></li>';
    }).join('');
    var more = model.criticalFindings.length > 5
      ? '<div class="cf-more">+ ' + (model.criticalFindings.length - 5) + ' more critical findings in the control gap register below</div>' : '';
    return '<div class="card critical-card mt-3">' +
      '<h3 class="cf-head">' + DPDPA.icon('zap') + 'Fix these first</h3>' +
      '<ul class="cf-list">' + items + '</ul>' + more + '</div>';
  }

  function sectionScope(model) {
    var ev = model.evaluation, p = model.profile || {}, legal = DPDPA.legalStatus || {};
    var roles = Array.isArray(p.role) && p.role.length ? p.role.join('; ') : 'Not stated';
    var exemptions = Array.isArray(p.exemptions) && p.exemptions.length ? p.exemptions.join('; ') : 'None stated';
    var applicable = ev.applicableDomains.map(function (d) { return d.name; }).join(', ');
    var excluded = ev.excludedDomains.length ? ev.excludedDomains.map(function (d) { return d.name; }).join(', ') : 'None';
    var scopeWarning = p.territorialScope !== 'Yes'
      ? '<div class="disclaimer mt-2">' + DPDPA.icon('alert') + '<span><b>Scope requires confirmation:</b> territorial applicability was answered “' + esc(p.territorialScope || 'Not stated') + '”. The controls below are presented as readiness guidance, not a conclusion that the Act applies.</span></div>' : '';
    return '<section id="scope" class="section">' +
      sectionHead('info', 'Assessment Scope & Status', 'The assumptions behind this self-assessed readiness report.') +
      '<div class="card card-pad"><div class="grid grid-2">' +
        '<div><h3>Self-assessed profile</h3><p><b>Role:</b> ' + esc(roles) + '<br><b>Territorial scope:</b> ' + esc(p.territorialScope || 'Not stated') +
        '<br><b>State/public-service processing:</b> ' + esc(p.stateProcessing || 'Not stated') + '<br><b>Exemptions indicated:</b> ' + esc(exemptions) + '</p></div>' +
        '<div><h3>Coverage</h3><p><b>Applicable domains:</b> ' + esc(applicable) + '<br><b>Excluded by profile:</b> ' + esc(excluded) + '</p></div>' +
      '</div><p class="muted" style="margin:8px 0 0"><b>Content version:</b> ' + esc(legal.contentVersion || '') +
        '. ' + esc(legal.currentPhase || '') + '. Consent Manager provisions are scheduled for ' + esc(legal.consentManagerEffective || '') +
        '; most substantive obligations are scheduled for ' + esc(legal.substantiveEffective || '') + '.</p></div>' +
      scopeWarning + '</section>';
  }

  /* =========================================================================
   * 2. Compliance dashboard  (unchanged — KPIs + per-domain score cards)
   * ====================================================================== */
  function sectionDashboard(model) {
    var ev = model.evaluation;
    var highGaps = model.gapAnalysis.filter(function (g) { return g.priority === 'Immediate' || g.priority === 'High'; }).length;

    var kpis =
      kpi('blue', 'dashboard', ev.overallScore + '%', 'Control maturity') +
      kpi('red', 'alert', ev.mandatoryFailures, 'Failed critical statutory controls') +
      kpi('amber', 'target', highGaps, 'High-priority gaps') +
      kpi('green', 'list', model.remediationPlan.length, 'Actions to close');

    var domainCards = ev.domainScores.map(function (d) {
      if (d.score === null) {
        return '<div class="card dom-score"><div class="ds-top">' +
          '<div class="ds-ic">' + DPDPA.icon(d.icon) + '</div>' +
          '<div class="ds-name"><b>' + d.name + '</b><span>' + d.sections + '</span></div>' +
          '<div class="ds-val" style="font-size:.9rem;color:var(--slate-400)">—</div></div>' +
          '<div class="ds-foot"><span class="badge badge-na">Not assessed</span></div></div>';
      }
      return '<div class="card dom-score card-hover">' +
        '<div class="ds-top">' +
          '<div class="ds-ic">' + DPDPA.icon(d.icon) + '</div>' +
          '<div class="ds-name"><b>' + d.name + '</b><span>' + d.sections + '</span></div>' +
          '<div class="ds-val">' + d.score + '<small>%</small></div>' +
        '</div>' +
        '<div class="progress ' + barClass(d.score) + '"><span style="width:' + d.score + '%"></span></div>' +
        '<div class="ds-foot">' +
          '<span class="badge ' + levelBadgeClass(d.status.key) + '">' + d.status.label + '</span>' +
          '<span>' + d.answered + '/' + d.total + ' controls</span>' +
        '</div>' +
      '</div>';
    }).join('');

    return '<section id="dashboard" class="section">' +
      sectionHead('dashboard', 'Compliance Dashboard', 'Headline metrics and a score for every applicable domain.') +
      '<div class="grid grid-4 mb-3">' + kpis + '</div>' +
      '<div class="grid grid-3">' + domainCards + '</div>' +
    '</section>';
  }
  function kpi(color, icon, value, label) {
    return '<div class="card kpi card-hover"><div class="kpi-top">' +
      '<div><b>' + value + '</b></div>' +
      '<div class="kpi-ic ' + color + '">' + DPDPA.icon(icon) + '</div></div>' +
      '<span>' + label + '</span></div>';
  }

  /* =========================================================================
   * 3. Domain verdicts — synthesised per-domain read (replaces the old
   *    per-question analysis). One tight card per domain.
   * ====================================================================== */
  function sectionVerdicts(model) {
    var cards = model.domainVerdicts.map(function (v) {
      if (v.score === null) {
        return '<div class="card verdict verdict-na">' +
          '<div class="v-top"><div class="v-ic">' + DPDPA.icon(v.icon) + '</div>' +
          '<div class="v-name"><b>' + v.name + '</b><span>' + v.sections + '</span></div>' +
          '<span class="badge badge-na">N/A</span></div>' +
          '<p class="v-headline muted">' + esc(v.headline) + '</p></div>';
      }
      var exposure = v.exposure
        ? '<div class="v-line neg">' + DPDPA.icon('alert') + '<span><b>Exposed:</b> ' + esc(v.exposure) + '</span></div>' : '';
      var win = v.win
        ? '<div class="v-line pos">' + DPDPA.icon('check') + '<span><b>Working:</b> ' + esc(v.win) + '</span></div>' : '';
      return '<div class="card verdict card-hover">' +
        '<div class="v-top">' +
          '<div class="v-ic">' + DPDPA.icon(v.icon) + '</div>' +
          '<div class="v-name"><b>' + v.name + '</b><span>' + v.sections + '</span></div>' +
          '<div class="v-score" style="color:' + levelColor(v.status.key) + '">' + v.score + '<small>%</small></div>' +
        '</div>' +
        '<div class="progress ' + barClass(v.score) + '"><span style="width:' + v.score + '%"></span></div>' +
        '<p class="v-headline">' + esc(v.headline) + '</p>' +
        exposure + win +
      '</div>';
    }).join('');

    return '<section id="domains" class="section">' +
      sectionHead('layers', 'Domain Verdicts', 'A straight read on each domain — where you stand, what’s exposed, and what’s already working.') +
      '<div class="grid grid-2" style="align-items:start">' + cards + '</div>' +
    '</section>';
  }

  /* =========================================================================
   * 4. Priority matrix
   * ====================================================================== */
  function sectionMatrix(model) {
    var m = model.priorityMatrix;
    return '<section id="matrix" class="section">' +
      sectionHead('activity', 'Priority Matrix', 'How the findings distribute across remediation urgency.') +
      '<div class="matrix">' +
        matrixCell('immediate', m.Immediate, 'Immediate', '0–2 weeks') +
        matrixCell('high', m.High, 'High', '2–6 weeks') +
        matrixCell('medium', m.Medium, 'Medium', '1–3 months') +
        matrixCell('low', m.Low, 'Low', '3–6 months') +
      '</div>' +
    '</section>';
  }
  function matrixCell(cls, n, label, time) {
    return '<div class="m-cell ' + cls + '"><b>' + n + '</b><span>' + label + '</span>' +
      '<div class="muted" style="font-size:.76rem;margin-top:4px">' + time + '</div></div>';
  }

  /* =========================================================================
   * 5. Risk register — reference table, but the "Risk" is the CONSEQUENCE.
   * ====================================================================== */
  function sectionRisks(model) {
    if (!model.riskRegister.length) {
      return '<section id="risks" class="section">' +
        sectionHead('alert', 'Control Gap Register', 'Self-identified implementation gaps requiring attention.') +
        emptyCard('No open control gaps — every assessed control is fully implemented.') + '</section>';
    }
    var rows = model.riskRegister.map(function (r) {
      return '<tr>' +
        '<td><strong>' + esc(r.exposure) + '</strong></td>' +
        '<td>' + esc(r.domainName) + '<br><span class="muted" style="font-size:.76rem">' + esc(r.section) + '</span></td>' +
        '<td>' + esc(r.currentState) + '</td>' +
        '<td><span class="pill ' + likePill(r.inherentRisk) + '">' + r.inherentRisk + '</span><br><span class="muted" style="font-size:.72rem">' + esc(r.controlType) + '</span></td>' +
        '<td><span class="badge badge-' + r.badge + '">' + r.priority + '</span></td>' +
        '<td>' + esc(r.mitigation) + '</td>' +
        '<td>' + esc(r.owner) + '</td>' +
      '</tr>';
    }).join('');
    return '<section id="risks" class="section">' +
      sectionHead('alert', 'Control Gap Register', 'Every self-identified gap, framed by exposure and sorted by remediation urgency.') +
      '<div class="table-wrap"><table class="grc"><thead><tr>' +
        '<th style="min-width:260px">Exposure</th><th>Where</th><th>Current state</th><th>Significance</th>' +
        '<th>Priority</th><th style="min-width:220px">Fix</th><th>Owner</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '</section>';
  }

  /* =========================================================================
   * 6. Remediation roadmap — the priority moves as a timeline + lean table.
   * ====================================================================== */
  function sectionRemediation(model) {
    if (!model.remediationPlan.length) {
      return '<section id="remediation" class="section">' +
        sectionHead('list', 'Remediation Roadmap', 'Prioritised actions to close gaps.') +
        emptyCard('Nothing to remediate — controls are fully implemented.') + '</section>';
    }
    var plan = model.remediationPlan;
    var topN = Math.min(8, plan.length);
    var timeline = plan.slice(0, topN).map(function (t) {
      return '<div class="tl-item p-' + t.badge + '">' +
        '<div class="card card-pad" style="padding:15px 18px">' +
          '<div class="flex between aic wrap" style="gap:8px;margin-bottom:6px">' +
            '<b style="color:var(--navy)">' + esc(t.task) + '</b>' +
            '<div class="flex gap aic wrap">' +
              (t.quickWin ? '<span class="badge badge-good">' + DPDPA.icon('zap') + ' Quick win</span>' : '') +
              '<span class="badge badge-' + t.badge + '">' + t.priority + '</span></div>' +
          '</div>' +
          '<p style="margin:0 0 8px;font-size:.86rem">' + esc(t.reason) + '</p>' +
          '<div class="flex gap wrap" style="font-size:.8rem;color:var(--text-mut)">' +
            '<span>' + DPDPA.icon('clock') + ' Start within ' + t.timeline + '</span>' +
            '<span>' + DPDPA.icon('activity') + ' ' + t.effort + ' effort</span>' +
            '<span>' + DPDPA.icon('rights') + ' ' + esc(t.owner) + '</span>' +
            '<span>' + DPDPA.icon('scale') + ' ' + esc(t.section) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');

    var rest = plan.slice(topN);
    var restBlock = '';
    if (rest.length) {
      var rows = rest.map(function (t) {
        return '<tr>' +
          '<td><strong>' + esc(t.task) + '</strong></td>' +
          '<td><span class="badge badge-' + t.badge + '">' + t.priority + '</span></td>' +
          '<td>' + t.timeline + '</td>' +
          '<td><span class="pill ' + likePill(t.effort) + '">' + t.effort + '</span></td>' +
          '<td>' + esc(t.owner) + '</td>' +
          '<td>' + (t.quickWin ? '<span class="badge badge-good">Yes</span>' : '<span class="pill">No</span>') + '</td>' +
        '</tr>';
      }).join('');
      restBlock = '<h3 style="margin:26px 0 14px">The rest of the backlog (' + rest.length + ')</h3>' +
        '<div class="table-wrap"><table class="grc"><thead><tr>' +
          '<th>Action</th><th>Priority</th><th>Start within</th><th>Effort</th><th>Owner</th><th>Quick win</th>' +
        '</tr></thead><tbody>' + rows + '</tbody></table></div>';
    }

    return '<section id="remediation" class="section">' +
      sectionHead('list', 'Remediation Roadmap', 'Your next ' + topN + ' moves, sequenced by urgency — then the rest of the backlog.') +
      '<div class="timeline">' + timeline + '</div>' + restBlock +
    '</section>';
  }

  /* =========================================================================
   * 7. Overall readiness
   * ====================================================================== */
  function sectionReadiness(model) {
    var ev = model.evaluation, color = levelColor(ev.level.key);
    return '<section id="readiness" class="section">' +
      sectionHead('flag', 'The Bottom Line', 'Where you stand and what it takes to move up.') +
      '<div class="card card-pad" style="border-left:4px solid ' + color + '">' +
        '<div class="flex between aic wrap mb-2" style="gap:12px">' +
          '<div class="flex aic gap"><div class="kpi-ic blue" style="width:44px;height:44px">' + DPDPA.icon('shield') + '</div>' +
            '<div><b style="color:var(--navy);font-size:1.05rem">' + ev.level.label + '</b>' +
            '<div class="muted" style="font-size:.85rem">' + ev.level.summary + '</div></div></div>' +
          '<div class="rh-level" style="background:' + color + '18;color:' + color + ';border:1px solid ' + color + '55">' + ev.overallScore + '% control maturity</div>' +
        '</div>' +
        '<p style="font-size:.98rem;line-height:1.7;color:var(--slate-700);margin:0">' + esc(model.readiness) + '</p>' +
      '</div>' +
      '<div class="disclaimer mt-3">' + DPDPA.icon('info') +
        '<span>This is an unverified self-assessment for readiness planning; it does not collect or validate evidence and is not a certification or legal advice. ' +
        'References cite the Digital Personal Data Protection Act, 2023 and the final DPDP Rules, 2025.</span></div>' +
    '</section>';
  }

  /* ------------------------------ Shared bits ----------------------------- */
  function sectionHead(icon, title, sub) {
    return '<div class="section-head"><span class="eyebrow">' +
      '<span style="width:14px;height:14px;display:inline-flex">' + DPDPA.icon(icon) + '</span> Report</span>' +
      '<h2>' + title + '</h2><p>' + sub + '</p></div>';
  }
  function emptyCard(text) {
    return '<div class="card card-pad" style="border-left:4px solid var(--green-500)">' +
      '<div class="flex aic gap">' + DPDPA.icon('checkCircle') +
      '<span style="color:var(--navy);font-weight:600">' + text + '</span></div></div>';
  }

  /* ------------------------------ Export ---------------------------------- */
  function exportData(assessment, model) {
    var payload = {
      generatedAt: new Date().toISOString(),
      assessmentType: 'Unverified self-assessment — no evidence collected',
      legalStatus: DPDPA.legalStatus,
      profile: assessment.profile,
      completion: model.evaluation.completion,
      answeredControls: model.evaluation.answeredCount,
      applicableControls: model.evaluation.totalApplicable,
      overallScore: model.evaluation.overallScore,
      metricName: 'Self-assessed control maturity',
      readinessStatus: model.evaluation.level.label,
      mandatoryFailures: model.evaluation.mandatoryFailures,
      headline: model.headline,
      applicableDomains: model.evaluation.applicableDomains.map(function (d) { return d.name; }),
      excludedDomains: model.evaluation.excludedDomains.map(function (d) { return d.name; }),
      domainScores: model.evaluation.domainScores.map(function (d) {
        return { domain: d.name, score: d.score, status: d.status.label, answered: d.answered, total: d.total };
      }),
      domainVerdicts: model.domainVerdicts.map(function (v) {
        return { domain: v.name, score: v.score, status: v.status.label, exposure: v.exposure, working: v.win };
      }),
      riskRegister: model.riskRegister.map(function (r) {
        return { exposure: r.exposure, currentState: r.currentState, significance: r.inherentRisk,
          controlType: r.controlType, priority: r.priority, section: r.section, fix: r.mitigation, suggestedOwner: r.owner };
      }),
      gapAnalysis: model.gapAnalysis,
      criticalFindings: model.criticalFindings,
      remediationPlan: model.remediationPlan,
      answers: assessment.answers
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var safe = (assessment.profile.orgName || 'organization').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    a.href = url; a.download = 'dpdpa-readiness-report-' + safe + '.json';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* -------------------------------- Render -------------------------------- */
  function render() {
    var assessment = loadAssessment();
    if (!assessment) { renderEmpty(); return; }

    var model = DPDPA.rules.buildReport(assessment.answers, assessment.profile);
    model.metaDate = assessment.meta && (assessment.meta.completedAt || assessment.meta.updatedAt);

    if (!model.evaluation.complete || !profileComplete(assessment.profile)) {
      renderIncomplete(model);
      return;
    }

    document.getElementById('report-toolbar').style.display = '';

    mount.innerHTML =
      sectionSummary(model) +
      sectionScope(model) +
      sectionDashboard(model) +
      sectionVerdicts(model) +
      sectionMatrix(model) +
      sectionRisks(model) +
      sectionRemediation(model) +
      sectionReadiness(model);

    DPDPA.hydrateIcons();

    var gen = document.getElementById('footer-generated');
    if (gen) gen.textContent = 'Report generated ' + fmtDate(model.metaDate);

    // Animate the gauge fill on load (start from empty).
    requestAnimationFrame(function () {
      var fill = mount.querySelector('.gauge .g-fill');
      if (fill) {
        var target = fill.getAttribute('stroke-dashoffset');
        var dash = fill.getAttribute('stroke-dasharray');
        fill.style.strokeDashoffset = dash;
        requestAnimationFrame(function () { fill.style.strokeDashoffset = target; });
      }
    });

    var pr = document.getElementById('btn-print');
    var ex = document.getElementById('btn-export');
    if (pr) pr.onclick = function () { root.print(); };
    if (ex) ex.onclick = function () { exportData(assessment, model); };
  }

  DPDPA.report = { render: render };

})(window);

export {};
