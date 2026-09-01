// @ts-nocheck -- migrated browser module; typed conversion is intentionally deferred.
/* =============================================================================
 * rules.js
 * -----------------------------------------------------------------------------
 * The scoring, risk and remediation engine. This is the "consultant brain":
 * it consumes the question bank (questions.js) plus a saved answer set and
 * derives scores, compliance levels, a risk register, gap analysis and a
 * prioritised remediation plan.
 *
 * All logic is pure (no DOM). It is designed so it could run server-side later.
 *
 * Global namespace: window.DPDPA.rules
 * ========================================================================== */
(function (root) {
  'use strict';

  var DPDPA = root.DPDPA = root.DPDPA || {};
  var rules = DPDPA.rules = {};

  /* ---------------------------------------------------------------------------
   * Compliance levels
   * ------------------------------------------------------------------------ */
  rules.LEVELS = [
    { min: 95, max: 100, label: 'Highly Ready', key: 'excellent', color: 'green',
      summary: 'A mature self-assessed control programme with no identified critical statutory gap.' },
    { min: 80, max: 94, label: 'Substantially Ready', key: 'good', color: 'teal',
      summary: 'Strong self-assessed readiness with focused improvements remaining.' },
    { min: 60, max: 79, label: 'Needs Improvement', key: 'moderate', color: 'amber',
      summary: 'Foundational controls exist but material gaps require remediation.' },
    { min: 40, max: 59, label: 'High Risk', key: 'high', color: 'orange',
      summary: 'Significant non-compliance exposing the organization to regulatory risk.' },
    { min: 0, max: 39, label: 'Critical Gaps', key: 'critical', color: 'red',
      summary: 'Core controls are not ready; urgent, structured remediation is required.' }
  ];

  rules.levelForScore = function (score) {
    for (var i = 0; i < rules.LEVELS.length; i++) {
      if (score >= rules.LEVELS[i].min) return rules.LEVELS[i];
    }
    return rules.LEVELS[rules.LEVELS.length - 1];
  };

  /* Domain-level status uses the same bands but a shorter label set. */
  rules.statusForScore = function (score) {
    if (score >= 80) return { label: 'Strong', key: 'good' };
    if (score >= 60) return { label: 'Needs Improvement', key: 'moderate' };
    if (score >= 40) return { label: 'High Risk', key: 'high' };
    return { label: 'Critical', key: 'critical' };
  };

  function levelForEvaluation(score, complete, mandatoryFailures) {
    if (!complete) return { label: 'Incomplete Assessment', key: 'na', color: 'slate',
      summary: 'A readiness conclusion is unavailable until every applicable control is answered.' };
    if (mandatoryFailures > 0) return { label: 'High Risk — Critical Statutory Gap', key: 'high', color: 'orange',
      summary: 'The maturity score is overridden by one or more failed high-significance statutory controls.' };
    return rules.levelForScore(score);
  }

  /* ---------------------------------------------------------------------------
   * Owner & timeline heuristics used by the remediation plan
   * ------------------------------------------------------------------------ */
  var DOMAIN_OWNER = {
    governance: 'DPO / Privacy Office',
    notice: 'Legal / Marketing',
    consent: 'Product / Engineering',
    processing: 'Data Governance',
    rights: 'DPO / Customer Operations',
    children: 'Product / Legal',
    security: 'Information Security',
    breach: 'Information Security / DPO',
    vendors: 'Procurement / Legal',
    processor: 'Service Delivery / Security / Legal',
    retention: 'Data Governance / IT',
    crossborder: 'Legal / IT Infrastructure',
    sdf: 'DPO / Board',
    state: 'Programme Owner / Legal / IT',
    exemptions: 'Legal / Privacy Office',
    records: 'DPO / Compliance'
  };

  var PRIORITY_META = {
    Immediate: { rank: 0, timeline: '0–2 weeks', badge: 'critical' },
    High: { rank: 1, timeline: '2–6 weeks', badge: 'high' },
    Medium: { rank: 2, timeline: '1–3 months', badge: 'moderate' },
    Low: { rank: 3, timeline: '3–6 months', badge: 'low' }
  };
  rules.PRIORITY_META = PRIORITY_META;

  /* ---------------------------------------------------------------------------
   * Answer helpers
   * ------------------------------------------------------------------------ */
  function findOption(question, value) {
    if (!question.options) return null;
    for (var i = 0; i < question.options.length; i++) {
      if (question.options[i].value === value) return question.options[i];
    }
    return null;
  }

  /* Is a scored question "answered" with a scoring value (not N/A, not blank)? */
  function isScored(option) {
    return option && option.score !== null && option.score !== undefined;
  }

  /* ---------------------------------------------------------------------------
   * Core scoring
   *   answers: { questionId: optionValue }
   *   profile: organization profile object (for applicability)
   * ------------------------------------------------------------------------ */
  rules.evaluate = function (answers, profile) {
    answers = answers || {};
    profile = profile || {};

    var applicableDomains = DPDPA.domains.filter(function (d) {
      return !d.applicability || d.applicability(profile);
    });
    var applicableIds = {};
    applicableDomains.forEach(function (d) { applicableIds[d.id] = true; });

    var domainAgg = {};   // id -> { weighted, weight, answered, applicable, na, questions:[] }
    applicableDomains.forEach(function (d) {
      domainAgg[d.id] = { weighted: 0, weight: 0, answered: 0, na: 0, total: 0, evaluated: [] };
    });

    var totalWeighted = 0, totalWeight = 0, answeredCount = 0, naCount = 0, totalApplicable = 0;

    DPDPA.questions.forEach(function (question) {
      if (!applicableIds[question.domain]) return;      // skip non-applicable domains
      var agg = domainAgg[question.domain];
      agg.total++;
      totalApplicable++;

      var value = answers[question.id];
      var option = findOption(question, value);
      var scored = isScored(option);

      var record = {
        question: question,
        value: value || null,
        optionLabel: option ? option.label : null,
        score: scored ? option.score : null,
        answered: !!option,
        na: !!(option && option.score === null && option.value === 'na'),
        scored: scored
      };
      agg.evaluated.push(record);

      if (record.na) { agg.na++; naCount++; }
      if (record.answered) answeredCount++;

      if (scored) {
        agg.weighted += option.score * question.weight;
        agg.weight += question.weight;
        agg.answered++;
        totalWeighted += option.score * question.weight;
        totalWeight += question.weight;
      }
    });

    var domainScores = applicableDomains.map(function (d) {
      var agg = domainAgg[d.id];
      var score = agg.weight > 0 ? Math.round(agg.weighted / agg.weight) : null;
      return {
        id: d.id,
        name: d.name,
        icon: d.icon,
        sections: d.sections,
        description: d.description,
        score: score,
        status: score === null ? { label: 'Not Assessed', key: 'na' } : rules.statusForScore(score),
        answered: agg.answered,
        total: agg.total,
        na: agg.na,
        evaluated: agg.evaluated
      };
    });

    var overall = totalWeight > 0 ? Math.round(totalWeighted / totalWeight) : 0;
    var completion = totalApplicable > 0 ? Math.round((answeredCount / totalApplicable) * 100) : 0;
    var complete = totalApplicable > 0 && answeredCount === totalApplicable;
    var mandatoryFailures = 0;
    Object.keys(domainAgg).forEach(function (id) {
      domainAgg[id].evaluated.forEach(function (record) {
        if (record.scored && record.score <= 30 && record.question.risk === 'High' &&
            record.question.controlType === 'Statutory / prescribed control') mandatoryFailures++;
      });
    });
    var excludedDomains = DPDPA.domains.filter(function (d) { return !applicableIds[d.id]; });

    return {
      overallScore: overall,
      controlMaturityScore: overall,
      rawLevel: rules.levelForScore(overall),
      level: levelForEvaluation(overall, complete, mandatoryFailures),
      domainScores: domainScores,
      answeredCount: answeredCount,
      naCount: naCount,
      totalApplicable: totalApplicable,
      completion: completion,
      complete: complete,
      unansweredCount: Math.max(0, totalApplicable - answeredCount),
      mandatoryFailures: mandatoryFailures,
      applicableDomains: applicableDomains,
      excludedDomains: excludedDomains
    };
  };

  /* ---------------------------------------------------------------------------
   * Risk classification for a single evaluated question
   * Combines the answer score with the question's inherent risk rating.
   * ------------------------------------------------------------------------ */
  function priorityFor(score, inherentRisk, controlType) {
    // score is 0..100 (lower = worse). inherentRisk: High/Medium/Low
    if (inherentRisk === 'High') {
      if (score <= 30) return controlType === 'Supporting practice' ? 'High' : 'Immediate';
      if (score < 100) return 'High';
    } else if (inherentRisk === 'Medium') {
      if (score <= 30) return 'High';
      if (score < 100) return 'Medium';
    } else { // Low
      if (score <= 30) return 'Medium';
      if (score < 100) return 'Low';
    }
    return 'Low';
  }

  function likelihoodFor(score) {
    if (score <= 30) return 'High';
    if (score <= 60) return 'Medium';
    return 'Low';
  }

  /* Potential impacts inferred from the domain — used when a control fails. */
  var DOMAIN_IMPACT = {
    governance: ['Unclear accountability', 'Inconsistent control operation', 'Regulatory scrutiny'],
    notice: ['Invalid consent', 'Transparency violation', 'Data Principal complaints'],
    consent: ['Consent invalidity', 'Unlawful processing', 'Regulatory penalties'],
    processing: ['Purpose creep', 'Unlawful processing', 'Loss of trust'],
    rights: ['Unmet statutory rights', 'Grievances & complaints', 'Board proceedings'],
    children: ['Prohibited processing of children’s data', 'Severe penalties', 'Reputational harm'],
    security: ['Personal data breach', 'Financial penalty up to ₹250 crore', 'Operational disruption'],
    breach: ['Missed notification deadlines', 'Regulatory penalty', 'Escalated harm to individuals'],
    vendors: ['Uncontrolled third-party risk', 'Breach via processor', 'Contractual liability'],
    processor: ['Contractual non-performance', 'Unauthorised processing', 'Downstream breach exposure'],
    retention: ['Excess data exposure', 'Erasure-right violation', 'Larger breach blast radius'],
    crossborder: ['Non-compliant transfer', 'Regulatory restriction', 'Sectoral law breach'],
    sdf: ['Breach of enhanced SDF duties', 'Regulatory penalty', 'Audit findings'],
    state: ['Unlawful public-service processing', 'Rights and transparency failure', 'Accountability gap'],
    exemptions: ['Invalid exemption reliance', 'Uncontrolled processing scope', 'Regulatory challenge'],
    records: ['Inability to demonstrate compliance', 'Weak audit posture', 'Accountability gap']
  };

  rules.riskFromRecord = function (record) {
    var q = record.question;
    // Only failing/partial scored controls generate risk (100 = no gap).
    if (!record.scored || record.score >= 100) return null;
    var priority = priorityFor(record.score, q.risk, q.controlType);
    var meta = PRIORITY_META[priority];
    return {
      id: q.id,
      title: q.question,
      shortTitle: shortTitle(q),
      domain: q.domain,
      domainName: (DPDPA.getDomainById(q.domain) || {}).name || q.domain,
      exposure: q.exposure || describeGap(record),
      description: q.exposure || describeGap(record),
      currentState: record.optionLabel || 'Not answered',
      score: record.score,
      inherentRisk: q.risk,
      likelihood: likelihoodFor(record.score),
      impact: q.risk,
      controlType: q.controlType,
      impacts: DOMAIN_IMPACT[q.domain] || [],
      priority: priority,
      timeline: meta.timeline,
      badge: meta.badge,
      section: q.legalReference,
      mitigation: q.recommendation,
      owner: DOMAIN_OWNER[q.domain] || 'DPO',
      quickWin: isQuickWin(record)
    };
  };

  function shortTitle(q) {
    // A compact, noun-phrase-ish label derived from the question for tables.
    var t = q.question
      .replace(/^Do you\s+/i, '')
      .replace(/^Do your\s+/i, '')
      .replace(/^Does your organization\s+/i, '')
      .replace(/^Have you\s+/i, '')
      .replace(/^Has your organization\s+/i, '')
      .replace(/^Has\s+/i, '')
      .replace(/^How mature is your\s+/i, '')
      .replace(/^How mature is\s+/i, '')
      .replace(/^Where you\b[^,]*,\s*/i, '')
      .replace(/^Can a Data Principal\s+/i, 'Data Principals can ')
      .replace(/^Can\s+/i, '')
      .replace(/^Is there (?:a|an)\s+/i, '')
      .replace(/^Is there\s+/i, '')
      .replace(/^Is\s+/i, '')
      .replace(/^Are\s+/i, '');
    t = t.charAt(0).toUpperCase() + t.slice(1);
    if (t.length > 90) t = t.slice(0, 87) + '…';
    return t.replace(/\?$/, '');
  }
  rules.shortLabel = shortTitle;   // exposed so the report layer reuses one source of truth

  function describeGap(record) {
    var q = record.question;
    if (record.score === 0) return 'Control is absent — ' + shortTitle(q).toLowerCase() + '.';
    if (record.score <= 30) return 'Only planned, not operational — ' + shortTitle(q).toLowerCase() + '.';
    return 'Partially implemented — ' + shortTitle(q).toLowerCase() + '.';
  }

  /* Quick win = LOW effort AND HIGH impact — the classic low-hanging fruit.
     Effort comes from effortFor(); impact = an Immediate/High remediation priority.
     This ties the flag to the same effort/priority the rest of the report uses,
     rather than a hand-picked list of domains. */
  function isQuickWin(record) {
    if (!record.scored || record.score >= 100) return false;
    var priority = priorityFor(record.score, record.question.risk, record.question.controlType);
    return effortFor(record) === 'Low' && (priority === 'Immediate' || priority === 'High');
  }

  /* ---------------------------------------------------------------------------
   * Aggregate builders: risk register, gap analysis, remediation, strengths…
   * ------------------------------------------------------------------------ */
  rules.buildRiskRegister = function (evaluation) {
    var risks = [];
    evaluation.domainScores.forEach(function (d) {
      d.evaluated.forEach(function (record) {
        var r = rules.riskFromRecord(record);
        if (r) risks.push(r);
      });
    });
    risks.sort(function (a, b) {
      var pa = PRIORITY_META[a.priority].rank, pb = PRIORITY_META[b.priority].rank;
      if (pa !== pb) return pa - pb;
      return a.score - b.score;
    });
    return risks;
  };

  rules.buildGapAnalysis = function (evaluation) {
    var gaps = [];
    evaluation.domainScores.forEach(function (d) {
      d.evaluated.forEach(function (record) {
        if (!record.scored || record.score >= 100) return;
        var q = record.question;
        var priority = priorityFor(record.score, q.risk, q.controlType);
        gaps.push({
          id: q.id,
          domain: q.domain,
          domainName: d.name,
          area: shortTitle(q),
          currentState: record.optionLabel || 'Not implemented',
          requiredState: 'Fully implemented and operational',
          gap: q.exposure || describeGap(record),
          priority: priority,
          badge: PRIORITY_META[priority].badge,
          action: q.recommendation,
          effort: effortFor(record),
          section: q.legalReference
        });
      });
    });
    gaps.sort(function (a, b) {
      return PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank;
    });
    return gaps;
  };

  function effortFor(record) {
    // Effort to COMPLETE the control from where it stands today.
    var d = record.question.domain;
    // Domains whose remediation typically needs engineering, contracts or audit.
    var heavy = { security: 1, consent: 1, children: 1, vendors: 1, processor: 1,
      crossborder: 1, sdf: 1, state: 1 };
    if (record.score >= 60) return 'Low';                        // already partial -> just finish it
    if (record.score >= 30) return heavy[d] ? 'Medium' : 'Low';  // planned -> execute the plan
    return heavy[d] ? 'High' : 'Medium';                         // absent -> build from scratch
  }

  rules.buildRemediationPlan = function (evaluation) {
    var tasks = [];
    evaluation.domainScores.forEach(function (d) {
      d.evaluated.forEach(function (record) {
        if (!record.scored || record.score >= 100) return;
        var q = record.question;
        var priority = priorityFor(record.score, q.risk, q.controlType);
        var meta = PRIORITY_META[priority];
        tasks.push({
          id: q.id,
          task: q.recommendation,
          reason: q.exposure || describeGap(record),
          priority: priority,
          badge: meta.badge,
          timeline: meta.timeline,
          section: q.legalReference,
          owner: DOMAIN_OWNER[q.domain] || 'DPO',
          domainName: d.name,
          effort: effortFor(record),
          quickWin: isQuickWin(record)
        });
      });
    });
    tasks.sort(function (a, b) {
      var pa = PRIORITY_META[a.priority].rank, pb = PRIORITY_META[b.priority].rank;
      if (pa !== pb) return pa - pb;
      return (b.quickWin ? 1 : 0) - (a.quickWin ? 1 : 0);
    });
    return tasks;
  };

  /* Strengths: fully implemented controls (score 100). */
  rules.buildStrengths = function (evaluation) {
    var out = [];
    evaluation.domainScores.forEach(function (d) {
      d.evaluated.forEach(function (record) {
        if (record.scored && record.score >= 100) {
          out.push({ text: shortTitle(record.question), domain: d.name, section: record.question.legalReference });
        }
      });
    });
    return out;
  };

  /* Weaknesses: absent controls (score 0), highest-risk first. */
  rules.buildWeaknesses = function (evaluation) {
    var out = [];
    evaluation.domainScores.forEach(function (d) {
      d.evaluated.forEach(function (record) {
        if (record.scored && record.score === 0) {
          out.push({
            text: shortTitle(record.question),
            domain: d.name,
            risk: record.question.risk,
            section: record.question.legalReference
          });
        }
      });
    });
    var order = { High: 0, Medium: 1, Low: 2 };
    out.sort(function (a, b) { return order[a.risk] - order[b.risk]; });
    return out;
  };

  /* Critical findings for the executive summary (Immediate-priority risks). */
  rules.buildCriticalFindings = function (riskRegister) {
    return riskRegister.filter(function (r) { return r.priority === 'Immediate'; });
  };

  /* Priority matrix counts. */
  rules.buildPriorityMatrix = function (riskRegister) {
    var counts = { Immediate: 0, High: 0, Medium: 0, Low: 0 };
    riskRegister.forEach(function (r) { counts[r.priority]++; });
    return counts;
  };

  /* ---------------------------------------------------------------------------
   * Intelligent recommendations — curated, de-duplicated, prioritised.
   * Picks the highest-impact remediation per domain plus cross-cutting advice.
   * ------------------------------------------------------------------------ */
  rules.buildRecommendations = function (evaluation) {
    var byDomain = {};
    evaluation.domainScores.forEach(function (d) {
      if (d.score === null) return;
      var worst = null;
      d.evaluated.forEach(function (record) {
        if (!record.scored || record.score >= 100) return;
        if (!worst || record.score < worst.score) worst = record;
      });
      if (worst) {
        byDomain[d.id] = {
          domain: d.name,
          score: d.score,
          text: worst.question.recommendation,
          section: worst.question.legalReference,
          priority: priorityFor(worst.score, worst.question.risk, worst.question.controlType)
        };
      }
    });
    var recs = Object.keys(byDomain).map(function (k) { return byDomain[k]; });
    recs.sort(function (a, b) {
      return PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank || a.score - b.score;
    });
    return recs;
  };

  /* ---------------------------------------------------------------------------
   * Domain verdicts — a synthesised, per-domain read instead of a per-question
   * walk. Each verdict has a punchy headline plus the single biggest exposure
   * and the strongest control, so the report focuses on the domain, not the Qs.
   * ------------------------------------------------------------------------ */
  function stableIndex(seed, n) {
    var h = 0;
    for (var i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return h % n;
  }
  function gapWord(n) { return n === 1 ? 'control' : 'controls'; }

  function verdictHeadline(d, wins, gaps, total) {
    var s = d.score, pick = function (arr) { return arr[stableIndex(d.id, arr.length)]; };
    if (s >= 80) return pick([
      'Pulling its weight — ' + wins + ' of ' + total + ' controls are solid.',
      'A genuine strength; ' + wins + ' of ' + total + ' controls here hold up.'
    ]);
    if (s >= 60) return pick([
      'Functional but leaky — ' + gaps + ' ' + gapWord(gaps) + ' still need shoring up.',
      'The bones are here, but ' + gaps + ' ' + gapWord(gaps) + ' keep it from holding up.'
    ]);
    if (s >= 40) return pick([
      'Exposed — ' + gaps + ' of ' + total + ' controls are missing or half-built.',
      'Thin cover; most of this domain isn’t operational yet.'
    ]);
    return pick([
      'Effectively absent — this is where a regulator would start looking.',
      'Near-zero protection today; treat this as ground zero.'
    ]);
  }

  rules.buildDomainVerdicts = function (evaluation) {
    return evaluation.domainScores.map(function (d) {
      if (d.score === null) {
        return { id: d.id, name: d.name, icon: d.icon, sections: d.sections, score: null,
          status: d.status, headline: 'Not applicable to your profile.', exposure: null,
          win: null, gaps: 0, wins: 0, total: 0 };
      }
      var scored = d.evaluated.filter(function (r) { return r.scored; });
      var wins = scored.filter(function (r) { return r.score >= 80; });
      var gaps = scored.filter(function (r) { return r.score < 80; });
      var worst = null, best = null;
      gaps.forEach(function (r) { if (!worst || r.score < worst.score) worst = r; });
      wins.forEach(function (r) { if (!best || r.score > best.score) best = r; });
      return {
        id: d.id, name: d.name, icon: d.icon, sections: d.sections, score: d.score, status: d.status,
        headline: verdictHeadline(d, wins.length, gaps.length, scored.length),
        exposure: worst ? (worst.question.exposure || describeGap(worst)) : null,
        win: best ? shortTitle(best.question) : null,
        gaps: gaps.length, wins: wins.length, total: scored.length
      };
    });
  };

  /* A single punchy headline for the executive summary. */
  rules.buildHeadline = function (evaluation, criticalCount) {
    var s = evaluation.overallScore;
    if (!evaluation.complete) return 'Assessment incomplete — answer every applicable control before drawing a readiness conclusion.';
    if (evaluation.mandatoryFailures > 0) return 'The maturity score is overridden by critical statutory gaps. Fix the mandatory controls flagged below first.';
    if (s >= 95) return 'A mature self-assessed programme. Sustain, review and prepare for the phased commencement dates.';
    if (s >= 80) return 'You’re most of the way there — tighten the remaining controls and continue readiness review.';
    if (s >= 60) return 'A real foundation with real gaps. The roadmap below closes them in priority order.';
    if (s >= 40) return 'Significant exposure: several core DPDPA obligations aren’t operational yet.'
      + (criticalCount ? ' Start with the critical findings flagged below.' : '');
    return 'Critical gaps across the board — this is a build-from-here situation, and the roadmap shows where to start.';
  };

  /* ---------------------------------------------------------------------------
   * Overall readiness narrative — a consultant-style paragraph.
   * ------------------------------------------------------------------------ */
  rules.buildReadinessNarrative = function (evaluation, riskRegister) {
    var level = evaluation.level;
    var strong = evaluation.domainScores.filter(function (d) { return d.score !== null && d.score >= 80; });
    var weak = evaluation.domainScores.filter(function (d) { return d.score !== null && d.score < 60; })
      .sort(function (a, b) { return a.score - b.score; });
    var critical = riskRegister.filter(function (r) { return r.priority === 'Immediate'; }).length;

    var parts = [];
    if (!evaluation.complete) return 'The assessment is incomplete. No readiness conclusion should be used until all applicable controls are answered.';
    parts.push('With a self-assessed control maturity score of ' + evaluation.overallScore + '% and a readiness status of ' + level.label +
      ', the organization ' + readinessVerb(evaluation.overallScore) + '.');

    if (evaluation.mandatoryFailures > 0) {
      parts.push('The percentage does not override the ' + evaluation.mandatoryFailures +
        ' failed high-significance statutory ' + (evaluation.mandatoryFailures === 1 ? 'control' : 'controls') + '.');
    }

    if (strong.length) {
      parts.push('It demonstrates relative strength in ' + listNames(strong.slice(0, 3)) + '.');
    }
    if (weak.length) {
      parts.push('The most material gaps lie in ' + listNames(weak.slice(0, 3)) +
        ', which require prioritised remediation.');
    }
    if (critical > 0) {
      parts.push('There ' + (critical === 1 ? 'is 1 finding' : 'are ' + critical + ' findings') +
        ' rated for immediate action, exposing the organization to regulatory and reputational risk under the DPDPA.');
    } else if (evaluation.overallScore >= 80) {
      parts.push('No finding requires immediate action; focus should shift to sustaining and periodically reviewing existing controls.');
    }
    if (riskRegister.length) {
      parts.push('The remediation roadmap below sequences the remaining self-identified gaps by urgency.');
    } else {
      parts.push('No remediation item was generated from the responses; periodic reassessment remains appropriate.');
    }
    return parts.join(' ');
  };

  function readinessVerb(score) {
    if (score >= 95) return 'operates a mature, well-governed privacy programme';
    if (score >= 80) return 'shows substantial readiness across the assessed controls';
    if (score >= 60) return 'has a functioning foundation but material readiness gaps remain';
    if (score >= 40) return 'faces significant readiness exposure';
    return 'has critical control gaps requiring urgent intervention';
  }

  function listNames(domains) {
    var names = domains.map(function (d) { return d.name; });
    if (names.length === 1) return names[0];
    if (names.length === 2) return names[0] + ' and ' + names[1];
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  }

  /* ---------------------------------------------------------------------------
   * One-call report model builder — everything the report page needs.
   * ------------------------------------------------------------------------ */
  rules.buildReport = function (answers, profile) {
    var evaluation = rules.evaluate(answers, profile);
    var riskRegister = rules.buildRiskRegister(evaluation);
    var criticalFindings = rules.buildCriticalFindings(riskRegister);
    return {
      profile: profile || {},
      evaluation: evaluation,
      headline: rules.buildHeadline(evaluation, criticalFindings.length),
      domainVerdicts: rules.buildDomainVerdicts(evaluation),
      riskRegister: riskRegister,
      gapAnalysis: rules.buildGapAnalysis(evaluation),
      remediationPlan: rules.buildRemediationPlan(evaluation),
      recommendations: rules.buildRecommendations(evaluation),
      strengths: rules.buildStrengths(evaluation),
      weaknesses: rules.buildWeaknesses(evaluation),
      criticalFindings: criticalFindings,
      priorityMatrix: rules.buildPriorityMatrix(riskRegister),
      readiness: rules.buildReadinessNarrative(evaluation, riskRegister)
    };
  };

})(window);

export {};
