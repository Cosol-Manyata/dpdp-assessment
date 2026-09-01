// @ts-nocheck -- migrated browser module; typed conversion is intentionally deferred.
/* =============================================================================
 * questions.js
 * -----------------------------------------------------------------------------
 * DPDPA 2023 assessment content: organization profile, compliance domains and
 * the structured question bank. This module is deliberately data-only so that
 * it can later be swapped for a REST/JSON API without touching UI or scoring.
 *
 * Legal references cite the Digital Personal Data Protection Act, 2023 (DPDPA)
 * and the Digital Personal Data Protection Rules, 2025 (DPDP Rules) where the
 * rules add operational detail. References are not invented; where a control is
 * best-practice supporting the accountability principle it is labelled as such.
 *
 * Global namespace: window.DPDPA
 * ========================================================================== */
(function (root) {
  'use strict';

  var DPDPA = root.DPDPA = root.DPDPA || {};

  /* ---------------------------------------------------------------------------
   * Standard answer option sets (reused across scored questions)
   * ------------------------------------------------------------------------ */
  // Scored answers are mandatory — there is no per-question "Not applicable".
  // Whole non-applicable domains are removed via each domain's applicability().
  // A very small number of genuinely-optional controls opt back in via
  // `allowNA: true`, which appends NA_OPTION to their choices.
  var IMPLEMENTATION_OPTIONS = [
    { label: 'Yes, fully implemented', value: 'yes', score: 100 },
    { label: 'Partially implemented', value: 'partial', score: 60 },
    { label: 'Planned / in progress', value: 'planned', score: 30 },
    { label: 'No / not implemented', value: 'no', score: 0 }
  ];

  var YES_NO_OPTIONS = [
    { label: 'Yes', value: 'yes', score: 100 },
    { label: 'No', value: 'no', score: 0 }
  ];

  var MATURITY_OPTIONS = [
    { label: '1 — Absent (no control in place)', value: '1', score: 0 },
    { label: '2 — Initial (ad-hoc, undocumented)', value: '2', score: 25 },
    { label: '3 — Defined (documented, inconsistent)', value: '3', score: 50 },
    { label: '4 — Managed (operational, monitored)', value: '4', score: 75 },
    { label: '5 — Optimised (audited, continually improved)', value: '5', score: 100 }
  ];

  var NA_OPTION = { label: 'Not applicable', value: 'na', score: null };

  DPDPA.optionSets = {
    implementation: IMPLEMENTATION_OPTIONS,
    yesNo: YES_NO_OPTIONS,
    maturity: MATURITY_OPTIONS,
    na: NA_OPTION
  };

  DPDPA.legalStatus = {
    contentVersion: '7 August 2026',
    act: 'Digital Personal Data Protection Act, 2023',
    rules: 'Digital Personal Data Protection Rules, 2025 (final)',
    currentPhase: 'Readiness assessment during phased commencement',
    consentManagerEffective: '14 November 2026',
    substantiveEffective: '14 May 2027',
    note: 'Most substantive Data Fiduciary obligations and Rules 3, 5–16, 22 and 23 commence eighteen months after Gazette publication. Rule 4 commences after one year.'
  };

  /* ---------------------------------------------------------------------------
   * Organization profile (not scored — drives applicability & report context)
   * ------------------------------------------------------------------------ */
  DPDPA.profileQuestions = [
    {
      id: 'P-01', field: 'orgName', type: 'text', label: 'Organization name',
      placeholder: 'e.g. Acme Technologies Pvt. Ltd.', required: true
    },
    {
      id: 'P-02', field: 'industry', type: 'dropdown', label: 'Industry sector',
      required: true,
      options: ['Banking & Financial Services', 'Insurance', 'Healthcare & Pharma',
        'Information Technology / SaaS', 'E-commerce & Retail', 'Telecom',
        'EdTech / Education', 'Online Gaming', 'Manufacturing', 'Media & Advertising',
        'Government / PSU', 'Professional Services', 'Other']
    },
    {
      id: 'P-03', field: 'employees', type: 'dropdown', label: 'Number of employees',
      options: ['1–50', '51–200', '201–1,000', '1,001–5,000', 'More than 5,000']
    },
    {
      id: 'P-04', field: 'turnover', type: 'dropdown', label: 'Annual turnover',
      options: ['Below ₹5 crore', '₹5–50 crore', '₹50–250 crore', '₹250–1,000 crore', 'Above ₹1,000 crore']
    },
    {
      id: 'P-05', field: 'dataPrincipals', type: 'dropdown',
      label: 'Approximate number of Data Principals (individuals) whose data you process',
      options: ['Under 10,000', '10,000–1 lakh', '1–10 lakh', '10 lakh–1 crore', 'Over 1 crore']
    },
    {
      id: 'P-06', field: 'dataCategories', type: 'multi-select',
      label: 'Categories of personal data processed',
      options: ['Contact & identity details', 'Financial / payment data', 'Health data',
        'Biometric data', 'Location data', 'Behavioural / usage data',
        'Government identifiers (Aadhaar, PAN, etc.)', 'Children’s data', 'Employee data']
    },
    {
      id: 'P-07', field: 'role', type: 'multi-select',
      label: 'In what capacity does your organization process personal data?',
      required: true,
      options: ['Data Fiduciary (you determine purpose & means)',
        'Data Processor (you process on behalf of another entity)']
    },
    {
      id: 'P-08', field: 'childrenData', type: 'dropdown',
      label: 'Do you knowingly process the personal data of children (under 18) or persons with disability?',
      required: true,
      options: ['Yes, regularly', 'Occasionally / possibly', 'No']
    },
    {
      id: 'P-09', field: 'crossBorder', type: 'dropdown',
      label: 'Do you transfer or store personal data outside India?',
      required: true,
      options: ['Yes', 'No', 'Not sure']
    },
    {
      id: 'P-10', field: 'sdf', type: 'dropdown',
      label: 'Have you been notified as — or do you expect to be classified as — a Significant Data Fiduciary?',
      required: true,
      options: ['Yes, notified', 'Likely (large volume / sensitive processing)', 'No / unlikely']
    },
    {
      id: 'P-11', field: 'territorialScope', type: 'dropdown',
      label: 'Does your processing fall within the territorial scope of the DPDPA (including offering goods or services to individuals in India from outside India)?',
      required: true,
      options: ['Yes', 'No', 'Not sure']
    },
    {
      id: 'P-12', field: 'stateProcessing', type: 'dropdown',
      label: 'Are you the State or a State instrumentality processing data for a subsidy, benefit, service, certificate, licence or permit?',
      required: true,
      options: ['Yes', 'No', 'Not sure']
    },
    {
      id: 'P-13', field: 'exemptions', type: 'multi-select',
      label: 'Are any exclusions or exemptions being relied on? Select all that may apply.',
      options: ['Publicly available personal data', 'Legal claims / judicial or regulatory functions',
        'Prevention, detection or investigation of offences', 'Corporate restructuring / insolvency',
        'Research, archiving or statistical purposes', 'None identified', 'Not sure']
    }
  ];

  /* ---------------------------------------------------------------------------
   * Compliance domains (order defines the assessment flow & report sections)
   * `applicability` is a function of the profile object; undefined = always on.
   * ------------------------------------------------------------------------ */
  function hasRole(profile, prefix) {
    var roles = profile && Array.isArray(profile.role) ? profile.role : [];
    if (!roles.length) return prefix === 'Data Fiduciary'; // safe default for unfinished profiles
    return roles.some(function (role) { return role.indexOf(prefix) === 0; });
  }
  function isFiduciary(profile) { return hasRole(profile, 'Data Fiduciary'); }
  function isProcessor(profile) { return hasRole(profile, 'Data Processor'); }
  function hasExemptionClaim(profile) {
    var values = profile && Array.isArray(profile.exemptions) ? profile.exemptions : [];
    return values.length > 0 && values.indexOf('None identified') === -1;
  }

  DPDPA.domains = [
    { id: 'governance', name: 'Governance & Accountability', icon: 'governance',
      sections: 'S.8',
      description: 'Leadership ownership, policies and the accountability framework required of a Data Fiduciary.',
      applicability: isFiduciary },
    { id: 'notice', name: 'Notice & Transparency', icon: 'notice',
      sections: 'S.5',
      description: 'Whether Data Principals receive clear, itemised notice before their data is processed.',
      applicability: isFiduciary },
    { id: 'consent', name: 'Consent Management', icon: 'consent',
      sections: 'S.6',
      description: 'How valid consent is obtained, recorded, and withdrawn.',
      applicability: isFiduciary },
    { id: 'processing', name: 'Lawful Processing & Purpose Limitation', icon: 'processing',
      sections: 'S.4, S.7, S.8',
      description: 'Lawful basis, purpose limitation, data minimisation and accuracy of processing.',
      applicability: isFiduciary },
    { id: 'rights', name: 'Rights of Data Principals', icon: 'rights',
      sections: 'S.11–S.14',
      description: 'Operationalisation of access, correction, erasure, grievance and nomination rights.',
      applicability: isFiduciary },
    { id: 'children', name: 'Children’s & Vulnerable Data', icon: 'children',
      sections: 'S.9',
      description: 'Parental/guardian consent and protection against tracking and targeted advertising.',
      applicability: function (p) { return isFiduciary(p) && (!p || p.childrenData !== 'No'); } },
    { id: 'security', name: 'Data Security Safeguards', icon: 'security',
      sections: 'S.8(5), Rule 6',
      description: 'Reasonable security safeguards protecting personal data from breach.',
      applicability: function (p) { return isFiduciary(p) || isProcessor(p); } },
    { id: 'breach', name: 'Personal Data Breach Management', icon: 'breach',
      sections: 'S.8(6), Rule 7',
      description: 'Detection, response and mandatory notification of personal data breaches.',
      applicability: isFiduciary },
    { id: 'vendors', name: 'Processor & Vendor Management', icon: 'vendors',
      sections: 'S.8(1)–(2)',
      description: 'Contractual control and oversight of processors and third parties.',
      applicability: isFiduciary },
    { id: 'processor', name: 'Data Processor Contractual Readiness', icon: 'vendors',
      sections: 'S.8(1)–(2), Rules 6–8',
      description: 'Contractual and operational controls for organisations processing personal data on behalf of a Data Fiduciary.',
      applicability: isProcessor },
    { id: 'retention', name: 'Data Retention & Erasure', icon: 'retention',
      sections: 'S.8(7), Rule 8',
      description: 'Retention limits, timely erasure and secure disposal of personal data.',
      applicability: isFiduciary },
    { id: 'crossborder', name: 'Cross-Border Data Transfer', icon: 'crossborder',
      sections: 'S.16',
      description: 'Governance of personal data transferred or stored outside India.',
      applicability: function (p) { return isFiduciary(p) && (!p || p.crossBorder !== 'No'); } },
    { id: 'sdf', name: 'Significant Data Fiduciary Obligations', icon: 'sdf',
      sections: 'S.10, Rule 13',
      description: 'Enhanced obligations — DPO, independent audit and Data Protection Impact Assessment.',
      applicability: function (p) { return isFiduciary(p) && (!p || p.sdf !== 'No / unlikely'); } },
    { id: 'state', name: 'State & Public-Service Processing', icon: 'governance',
      sections: 'S.7(b), Rule 5 & Second Schedule',
      description: 'Special standards for State and State-instrumentality processing connected with public benefits and services.',
      applicability: function (p) { return isFiduciary(p) && p && p.stateProcessing !== 'No'; } },
    { id: 'exemptions', name: 'Scope & Exemption Governance', icon: 'scale',
      sections: 'S.3, S.17, Rule 16',
      description: 'Governance of claimed exclusions and exemptions, including research, archiving and statistical processing.',
      applicability: hasExemptionClaim },
    { id: 'records', name: 'Records, Training & Audit', icon: 'records',
      sections: 'S.8 (accountability)',
      description: 'Records of processing, staff training and periodic review supporting reliable self-assessment.',
      applicability: function (p) { return isFiduciary(p) || isProcessor(p); } }
  ];

  /* ---------------------------------------------------------------------------
   * Helper to build a scored question with the standard implementation options.
   * ------------------------------------------------------------------------ */
  function q(cfg) {
    if (!cfg.type) cfg.type = 'single-select';
    if (!cfg.controlType) cfg.controlType = /good practice/i.test(cfg.legalReference || '')
      ? 'Supporting practice' : 'Statutory / prescribed control';
    if (!cfg.options) {
      var base = cfg.type === 'maturity'
        ? MATURITY_OPTIONS
        : (cfg.type === 'yes-no' ? YES_NO_OPTIONS : IMPLEMENTATION_OPTIONS);
      // Append "Not applicable" only for controls explicitly flagged optional.
      cfg.options = cfg.allowNA ? base.concat([NA_OPTION]) : base;
    }
    return cfg;
  }

  /* ---------------------------------------------------------------------------
   * The question bank
   * ------------------------------------------------------------------------ */
  DPDPA.questions = [

    /* ---- Governance & Accountability -------------------------------------- */
    q({ id: 'GOV-01', domain: 'governance',
      question: 'Has your organization published a privacy / personal data protection policy?',
      explanation: 'A published policy is useful supporting governance for the obligations placed on a Data Fiduciary.',
      legalReference: 'DPDPA Section 8 – Supporting governance (good practice)',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Draft, obtain management approval for, and publish a DPDPA-aligned privacy policy covering purposes, rights and grievance channels.' }),
    q({ id: 'GOV-02', domain: 'governance',
      question: 'Is there a documented privacy governance framework assigning clear roles and responsibilities?',
      explanation: 'Accountability requires an internal structure that assigns who owns privacy decisions and controls.',
      legalReference: 'DPDPA Section 8(1) – Governance structure (good practice)',
      importance: 'High', weight: 7, risk: 'Medium',
      recommendation: 'Establish a privacy governance framework (RACI) approved by senior management, defining ownership across functions.' }),
    q({ id: 'GOV-03', domain: 'governance',
      question: 'Has senior management formally approved and resourced privacy responsibilities?',
      explanation: 'The Act holds the Data Fiduciary — not individuals — accountable, making board/leadership ownership essential.',
      legalReference: 'DPDPA Section 8(1) – Leadership oversight (good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Secure documented leadership sign-off on the privacy programme, budget and reporting line.' }),
    q({ id: 'GOV-04', domain: 'governance',
      question: 'Have you prominently published the business contact details of the DPO or responsible person on your website/app and included them in every response to a rights communication?',
      explanation: 'The Act and final Rules require an accessible business contact for questions about processing, including in rights responses.',
      legalReference: 'DPDPA Section 8(9) with DPDP Rules 2025 Rule 9',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Appoint a responsible contact, publish the business contact prominently on the website/app, and include it in every rights response.' }),
    q({ id: 'GOV-05', domain: 'governance', type: 'maturity',
      question: 'How mature is your overall privacy management programme?',
      explanation: 'Indicates whether privacy controls are ad-hoc or a managed, continually improved programme.',
      legalReference: 'DPDPA Section 8 – Accountability (good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Move the programme toward a "Managed" maturity level with documented, monitored and periodically reviewed controls.' }),

    /* ---- Notice & Transparency -------------------------------------------- */
    q({ id: 'NOT-01', domain: 'notice',
      question: 'Do you provide a privacy notice to Data Principals at or before the point of collecting their personal data?',
      explanation: 'Verifies the core obligation that notice accompanies or precedes the request for consent.',
      legalReference: 'DPDPA Section 5(1) – Notice',
      importance: 'High', weight: 9, risk: 'High',
      recommendation: 'Implement a notice that is presented at or before every collection point (web, app, forms, call centre).' }),
    q({ id: 'NOT-02', domain: 'notice',
      question: 'Is the notice independently understandable and does it itemise the personal data, specific purposes, and the goods, services or uses enabled by the processing?',
      explanation: 'Rule 3 requires a standalone, clear account of the data, purposes and the goods, services or uses enabled.',
      legalReference: 'DPDPA Section 5(1)(i) with DPDP Rules 2025 Rule 3(a)–(b)',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Revise notices so they stand alone and itemise each data category, purpose and related good, service or enabled use.' }),
    q({ id: 'NOT-03', domain: 'notice',
      question: 'Does the notice provide a specific website/app link and any other means for withdrawing consent, exercising rights and complaining to the Board?',
      explanation: 'The final Rules require a particular communication link plus a description of any other available means.',
      legalReference: 'DPDPA Section 5(1)(ii)–(iii) with DPDP Rules 2025 Rule 3(c)',
      importance: 'High', weight: 6, risk: 'Medium',
      recommendation: 'Add clear instructions and links for exercising rights and for complaining to the Data Protection Board of India.' }),
    q({ id: 'NOT-04', domain: 'notice',
      question: 'Can the Data Principal choose to access the consent request and notice in English or any language specified in the Eighth Schedule to the Constitution?',
      explanation: 'The Act gives the Data Principal the option to access the request and notice in English or any scheduled language.',
      legalReference: 'DPDPA Section 5(3) – Language of notice',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Offer notices in English plus relevant Eighth Schedule languages based on your Data Principal base.' }),
    q({ id: 'NOT-05', domain: 'notice',
      question: 'For personal data collected before the Act, have you provided (or planned) notice to those existing Data Principals?',
      explanation: 'Where consent was obtained before commencement, notice must still be given as soon as reasonably practicable.',
      legalReference: 'DPDPA Section 5(2) – Notice for pre-existing consent',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Run a notice campaign to your legacy database explaining processing and rights.' }),

    /* ---- Consent Management ----------------------------------------------- */
    q({ id: 'CON-01', domain: 'consent',
      question: 'Is consent obtained through a free, specific, informed, unconditional and unambiguous action (clear affirmative action)?',
      explanation: 'Confirms consent meets the statutory quality standard rather than relying on pre-ticked boxes or bundling.',
      legalReference: 'DPDPA Section 6(1) – Consent',
      importance: 'High', weight: 9, risk: 'High',
      recommendation: 'Redesign consent flows to use unbundled, opt-in affirmative actions with no pre-selected choices.' }),
    q({ id: 'CON-02', domain: 'consent',
      question: 'Is consent limited to the personal data necessary for the specified purpose?',
      explanation: 'Consent may not extend beyond the data actually needed for the stated purpose.',
      legalReference: 'DPDPA Section 6(1) – Limited to necessary data',
      importance: 'High', weight: 6, risk: 'Medium',
      recommendation: 'Map each consent to only the data required for its purpose and remove excess collection.' }),
    q({ id: 'CON-03', domain: 'consent',
      question: 'Can a Data Principal withdraw consent as easily as it was given, through an accessible mechanism?',
      explanation: 'The ease of withdrawing consent must be comparable to the ease of giving it.',
      legalReference: 'DPDPA Section 6(4)–(6) – Withdrawal of consent',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Provide a self-service withdrawal mechanism as simple as the original consent capture.' }),
    q({ id: 'CON-04', domain: 'consent',
      question: 'Do you cease processing (and instruct processors to cease) within a reasonable time after consent is withdrawn?',
      explanation: 'Withdrawal must stop processing for that purpose within a reasonable period, including at processors.',
      legalReference: 'DPDPA Section 6(6) – Effect of withdrawal',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Automate downstream stop-processing signals to internal systems and processors on withdrawal.' }),
    q({ id: 'CON-05', domain: 'consent',
      question: 'Do you maintain auditable records of consent (what, when, how and the version of notice shown)?',
      explanation: 'Records evidence that valid consent existed — the Data Fiduciary bears the burden of proof.',
      legalReference: 'DPDPA Section 6(10) – Burden of proving notice and consent',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Implement a consent ledger capturing purpose, timestamp, method and notice version for every consent.' }),
    q({ id: 'CON-06', domain: 'consent', allowNA: true,
      question: 'Where you use a Consent Manager, is it a registered Consent Manager and integrated with your consent flows?',
      explanation: 'The Act enables Data Principals to give, manage and withdraw consent through registered Consent Managers.',
      legalReference: 'DPDPA Section 6(7)–(9) with DPDP Rules 2025 (Consent Manager)',
      importance: 'Medium', weight: 4, risk: 'Low',
      recommendation: 'If relying on a Consent Manager, verify registration with the Board and complete technical integration.' }),

    /* ---- Lawful Processing & Purpose Limitation --------------------------- */
    q({ id: 'PRO-01', domain: 'processing',
      question: 'Have you identified and documented a lawful basis (consent or a legitimate use) for each processing purpose?',
      explanation: 'Personal data may only be processed for a lawful purpose on the basis of consent or a listed legitimate use.',
      legalReference: 'DPDPA Section 4 – Grounds for processing',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Build a processing register mapping every purpose to its lawful basis under Section 4/7.' }),
    q({ id: 'PRO-02', domain: 'processing',
      question: 'Where you rely on "certain legitimate uses" (e.g. employment, voluntarily provided data), is this documented and justified?',
      explanation: 'Legitimate uses are narrowly defined and must be correctly identified rather than assumed.',
      legalReference: 'DPDPA Section 7 – Certain legitimate uses',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Document each legitimate-use reliance with the specific Section 7 clause and its justification.' }),
    q({ id: 'PRO-03', domain: 'processing',
      question: 'Is processing limited strictly to the purpose for which the data was collected (purpose limitation)?',
      explanation: 'Data must not be used for purposes beyond those notified and consented to.',
      legalReference: 'DPDPA Section 6(1) with Section 5 – Purpose limitation',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Introduce controls preventing re-use of personal data for un-notified purposes.' }),
    q({ id: 'PRO-04', domain: 'processing',
      question: 'Do you apply data minimisation — collecting only the personal data necessary for each purpose?',
      explanation: 'Collecting more than needed increases risk and conflicts with the necessity principle.',
      legalReference: 'DPDPA Section 6(1) – Necessity / minimisation',
      importance: 'Medium', weight: 6, risk: 'Medium',
      recommendation: 'Review collection forms and data flows to eliminate unnecessary fields.' }),
    q({ id: 'PRO-05', domain: 'processing',
      question: 'Do you ensure personal data is accurate and complete, especially where used to make decisions affecting the individual or shared with others?',
      explanation: 'The Act requires accuracy and completeness where data drives decisions or is disclosed onward.',
      legalReference: 'DPDPA Section 8(3) – Accuracy & completeness',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Implement data-quality checks and update processes for decision-relevant and shared data.' }),

    /* ---- Rights of Data Principals ---------------------------------------- */
    q({ id: 'RTS-01', domain: 'rights',
      question: 'Can Data Principals obtain a summary of their personal data being processed and the entities it is shared with?',
      explanation: 'Operationalises the right to access information about one’s personal data.',
      legalReference: 'DPDPA Section 11 – Right to access information',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Build an access-request workflow returning a data summary, processing activities and sharing details.' }),
    q({ id: 'RTS-02', domain: 'rights',
      question: 'Can Data Principals request correction, completion, updating and erasure of their personal data?',
      explanation: 'Operationalises the statutory right to correct and erase personal data.',
      legalReference: 'DPDPA Section 12 – Right to correction and erasure',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Provide correction/erasure request channels and fulfil them within defined timelines.' }),
    q({ id: 'RTS-03', domain: 'rights',
      question: 'Is there a published, readily available grievance redressal mechanism with a response period not exceeding 90 days?',
      explanation: 'Data Fiduciaries must publish and operate an effective grievance mechanism with a period of no more than 90 days.',
      legalReference: 'DPDPA Sections 8(10) & 13 with DPDP Rules 2025 Rule 14(3)',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Publish a grievance channel, assign ownership and commit to (and track) response timelines.' }),
    q({ id: 'RTS-04', domain: 'rights',
      question: 'Can a Data Principal nominate another individual to exercise their rights in the event of death or incapacity?',
      explanation: 'The Act grants a right to nominate, which fiduciaries must be able to honour.',
      legalReference: 'DPDPA Section 14 – Right to nominate',
      importance: 'Medium', weight: 4, risk: 'Low',
      recommendation: 'Add a nomination capability and process for acting on a valid nominee’s request.' }),
    q({ id: 'RTS-05', domain: 'rights',
      question: 'Have you published the means and identifiers required for rights requests, and do you track requests through fulfilment?',
      explanation: 'Rule 14 requires clear request channels and identification particulars; tracking supports consistent fulfilment.',
      legalReference: 'DPDP Rules 2025 Rule 14(1)–(2) (tracking is good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Deploy a request register with SLAs, reminders and audit trail for every rights request.' }),

    /* ---- Children's & Vulnerable Data ------------------------------------- */
    q({ id: 'CHD-01', domain: 'children', allowNA: true,
      question: 'Before processing a child’s data, do you verify parental consent using reliable identity/age details or an authorised virtual token, unless a Rule 12 exemption applies?',
      explanation: 'Rule 10 requires due diligence to establish that the person identifying as parent is an identifiable adult.',
      legalReference: 'DPDPA Section 9(1) with DPDP Rules 2025 Rules 10 & 12',
      importance: 'High', weight: 9, risk: 'High',
      recommendation: 'Implement age determination and a verifiable parental-consent mechanism before processing children’s data.' }),
    q({ id: 'CHD-02', domain: 'children', allowNA: true,
      question: 'Where consent is given by a lawful guardian for a person with disability, do you verify the guardian’s appointment by a court, designated authority or local level committee?',
      explanation: 'Rule 11 requires due diligence to verify the legal appointment of the person claiming to be the guardian.',
      legalReference: 'DPDPA Section 9(1) with DPDP Rules 2025 Rule 11',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Extend guardian-consent verification to processing involving persons with disability.' }),
    q({ id: 'CHD-03', domain: 'children',
      question: 'Do you avoid processing that is likely to cause any detrimental effect on the well-being of a child?',
      explanation: 'The Act prohibits processing likely to harm a child’s well-being.',
      legalReference: 'DPDPA Section 9(2) – Detrimental processing',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Assess children-facing features for well-being impact and remove harmful processing.' }),
    q({ id: 'CHD-04', domain: 'children', allowNA: true,
      question: 'Do you refrain from tracking, behavioural monitoring or targeted advertising directed at children, except where a documented Rule 12 exemption applies?',
      explanation: 'Section 9(3) prohibits these activities, subject to the limited classes and purposes exempted under Rule 12.',
      legalReference: 'DPDPA Section 9(3) with DPDP Rules 2025 Rule 12',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Disable child tracking, behavioural profiling and targeted advertising unless a documented Rule 12 condition is satisfied.' }),
    q({ id: 'CHD-05', domain: 'children', allowNA: true,
      question: 'Where you rely on a Rule 12 child-processing exemption, have you documented the applicable class or purpose and enforced every stated condition?',
      explanation: 'Rule 12 exemptions are narrow and apply only to listed classes or purposes subject to specified conditions.',
      legalReference: 'DPDP Rules 2025 Rule 12 & Fourth Schedule',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Create an exemption register linking each child-processing activity to the exact Fourth Schedule entry and its operating conditions.' }),

    /* ---- Data Security Safeguards ----------------------------------------- */
    q({ id: 'SEC-01', domain: 'security',
      question: 'Have you implemented reasonable security safeguards to protect personal data in your possession or control?',
      explanation: 'The Act mandates reasonable security safeguards to prevent personal data breaches.',
      legalReference: 'DPDPA Section 8(5) with DPDP Rules 2025 Rule 6',
      importance: 'High', weight: 9, risk: 'High',
      recommendation: 'Adopt the Rule 6 safeguard set: encryption, access control, monitoring, logging and backups.' }),
    q({ id: 'SEC-02', domain: 'security',
      question: 'Is personal data protected by encryption, tokenisation, masking or equivalent obfuscation at rest and in transit?',
      explanation: 'Encryption/masking is a named reasonable safeguard reducing breach impact.',
      legalReference: 'DPDP Rules 2025 Rule 6 – Reasonable security safeguards',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Encrypt personal data at rest and in transit and mask it in non-production environments.' }),
    q({ id: 'SEC-03', domain: 'security',
      question: 'Do you enforce access control and authorisation so only authorised personnel access personal data?',
      explanation: 'Restricting access is a core safeguard limiting exposure and misuse.',
      legalReference: 'DPDP Rules 2025 Rule 6 – Access control',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Implement role-based access control, least privilege and periodic access reviews.' }),
    q({ id: 'SEC-04', domain: 'security', type: 'maturity',
      question: 'How mature is your logging and monitoring capability for detecting unauthorised access to personal data?',
      explanation: 'Logs and monitoring enable detection and investigation of breaches, as expected by the rules.',
      legalReference: 'DPDP Rules 2025 Rule 6 – Logging & monitoring',
      importance: 'High', weight: 6, risk: 'High',
      recommendation: 'Enable centralised logging and alerting on access to personal data with retained, reviewed logs.' }),
    q({ id: 'SEC-05', domain: 'security',
      question: 'Do you maintain backups and a tested recovery capability for personal data?',
      explanation: 'Backup and recovery maintain availability and continuity of processing after an incident.',
      legalReference: 'DPDP Rules 2025 Rule 6 – Backup & continuity',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Establish regular backups with periodic restore testing and documented recovery objectives.' }),
    q({ id: 'SEC-06', domain: 'security', type: 'maturity',
      question: 'How mature is your vulnerability and patch management for systems holding personal data?',
      explanation: 'Proactive vulnerability management reduces the likelihood of exploitable breaches.',
      legalReference: 'DPDP Rules 2025 Rule 6 – Reasonable safeguards (good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Run periodic vulnerability scans, timely patching and remediation tracking.' }),
    q({ id: 'SEC-07', domain: 'security',
      question: 'Do you retain the logs and personal data needed to detect, investigate, remediate and recover from unauthorised access for at least one year, unless another law requires otherwise?',
      explanation: 'Rule 6(e) sets a minimum one-year retention period for the information needed to investigate and recover from security compromise.',
      legalReference: 'DPDP Rules 2025 Rule 6(e)',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Configure a documented one-year minimum retention baseline for security logs and associated personal data, reconciled with longer legal holds.' }),

    /* ---- Personal Data Breach Management ---------------------------------- */
    q({ id: 'BRC-01', domain: 'breach',
      question: 'Do you have the capability to detect and identify a personal data breach promptly?',
      explanation: 'Timely detection is the precondition for meeting mandatory notification duties.',
      legalReference: 'DPDPA Section 8(6) with DPDP Rules 2025 Rule 7',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Deploy monitoring/alerting and define what constitutes a reportable personal data breach.' }),
    q({ id: 'BRC-02', domain: 'breach',
      question: 'Do you have a documented breach response plan / standard operating procedure with defined roles?',
      explanation: 'A documented plan ensures a consistent, timely response and evidences preparedness.',
      legalReference: 'DPDPA Section 8(6) – Breach obligations (good practice)',
      importance: 'High', weight: 6, risk: 'High',
      recommendation: 'Create a breach response SOP covering triage, containment, notification and roles.' }),
    q({ id: 'BRC-03', domain: 'breach',
      question: 'Can you notify every affected Data Principal without delay, using a registered communication channel and all content prescribed by Rule 7?',
      explanation: 'Affected individuals must receive clear information on the breach, likely consequences, mitigation, protective steps and a contact person.',
      legalReference: 'DPDPA Section 8(6) with DPDP Rules 2025 Rule 7(1)',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Prepare notification templates and channels to inform affected individuals of a breach.' }),
    q({ id: 'BRC-04', domain: 'breach',
      question: 'Can you give the Board an initial breach intimation without delay and a detailed report within 72 hours, unless the Board allows longer?',
      explanation: 'Rule 7 requires an immediate initial description followed by the prescribed detailed information within 72 hours.',
      legalReference: 'DPDPA Section 8(6) with DPDP Rules 2025 Rule 7(2)',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Define a Board-notification workflow that meets the without-delay and detailed-report timelines.' }),
    q({ id: 'BRC-05', domain: 'breach',
      question: 'Do you maintain a breach register and conduct post-incident reviews to prevent recurrence?',
      explanation: 'Documentation and lessons-learned demonstrate accountability and drive improvement.',
      legalReference: 'DPDPA Section 8 – Accountability (good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Log all incidents in a breach register and run structured post-incident reviews.' }),

    /* ---- Processor & Vendor Management ------------------------------------ */
    q({ id: 'VEN-01', domain: 'vendors',
      question: 'Do you engage data processors only under a valid, written contract?',
      explanation: 'A Data Fiduciary may engage a processor only under a valid contract.',
      legalReference: 'DPDPA Section 8(2) – Engagement of processors',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Ensure every processor is covered by a data processing agreement before any data is shared.' }),
    q({ id: 'VEN-02', domain: 'vendors',
      question: 'Do your processor contracts impose security, purpose-limitation and breach-support obligations?',
      explanation: 'The fiduciary remains accountable, so contracts must flow down protective obligations.',
      legalReference: 'DPDPA Section 8(1)–(2) – Continued responsibility',
      importance: 'High', weight: 6, risk: 'High',
      recommendation: 'Standardise DPA clauses on security, purpose limitation, sub-processing, breach and deletion.' }),
    q({ id: 'VEN-03', domain: 'vendors',
      question: 'Do you perform due diligence / risk assessment on vendors before and during engagement?',
      explanation: 'Assessing vendor safeguards manages the risk you remain accountable for.',
      legalReference: 'DPDPA Section 8(1) – Accountability (good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Introduce a vendor risk-assessment questionnaire and periodic re-assessment.' }),
    q({ id: 'VEN-04', domain: 'vendors',
      question: 'Do you control the use of sub-processors and ensure obligations flow down to them?',
      explanation: 'Uncontrolled sub-processing can break the chain of accountability and security.',
      legalReference: 'DPDPA Section 8(1) – Continued responsibility',
      importance: 'Medium', weight: 4, risk: 'Medium',
      recommendation: 'Require prior approval and equivalent obligations for any sub-processors.' }),

    /* ---- Data Processor Contractual Readiness ---------------------------- */
    q({ id: 'DPR-01', domain: 'processor',
      question: 'Is every processing engagement governed by a valid contract that clearly defines scope, purpose, duration and documented instructions?',
      explanation: 'The Data Fiduciary may engage a processor only under a valid contract; clear instructions prevent independent or incompatible use.',
      legalReference: 'DPDPA Section 8(1)–(2)',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Use a standard processing schedule documenting scope, purposes, duration, data categories, instructions and return/deletion obligations.' }),
    q({ id: 'DPR-02', domain: 'processor',
      question: 'Do you process personal data only on the Data Fiduciary’s documented instructions and prevent use for your own unrelated purposes?',
      explanation: 'A processor acts on behalf of the Data Fiduciary; deciding independent purposes may change the organisation’s legal role.',
      legalReference: 'DPDPA Sections 2(i), 2(k) & 8(1) (contractual control)',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Implement instruction registers, purpose restrictions and escalation where an instruction appears unlawful or exceeds contract scope.' }),
    q({ id: 'DPR-03', domain: 'processor',
      question: 'Do your contracts and operations implement the Rule 6 safeguards required for processing performed on behalf of a Data Fiduciary?',
      explanation: 'Rule 6 expressly extends safeguards to processing undertaken on behalf of the Data Fiduciary and requires appropriate processor contract provisions.',
      legalReference: 'DPDP Rules 2025 Rule 6(1)(f)–(g)',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Map the Rule 6 safeguards into contracts and operating controls, including access, logging, monitoring, continuity and one-year retention.' }),
    q({ id: 'DPR-04', domain: 'processor',
      question: 'Can you promptly notify and support the Data Fiduciary with the facts, containment and records needed for Rule 7 breach notifications?',
      explanation: 'The Data Fiduciary remains responsible for notification and depends on timely processor cooperation.',
      legalReference: 'DPDPA Section 8(1), Section 8(6) & DPDP Rules 2025 Rule 7',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Define processor-to-fiduciary incident notification SLAs, escalation contacts and a standard fact pack aligned with Rule 7.' }),
    q({ id: 'DPR-05', domain: 'processor',
      question: 'Can you return or erase personal data, including copies held by approved sub-processors, when instructed or when the engagement ends?',
      explanation: 'The Data Fiduciary must cause processors to erase data when the statutory conditions are met.',
      legalReference: 'DPDPA Section 8(7)(b) with DPDP Rules 2025 Rule 8',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Implement deletion workflows, sub-processor propagation and completion confirmation, subject to documented legal retention duties.' }),
    q({ id: 'DPR-06', domain: 'processor',
      question: 'Are sub-processors approved, contractually bound to equivalent controls and included in security, breach and deletion workflows?',
      explanation: 'Flow-down controls preserve the Data Fiduciary’s accountability through the processing chain.',
      legalReference: 'DPDPA Section 8(1)–(2) (contractual good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Maintain a sub-processor register, approval workflow and equivalent contractual obligations with change notification.' }),

    /* ---- Data Retention & Erasure ----------------------------------------- */
    q({ id: 'RET-01', domain: 'retention',
      question: 'Have you defined a documented data retention schedule for personal data?',
      explanation: 'Retention limits are needed to erase data once the purpose is served.',
      legalReference: 'DPDPA Section 8(7) with DPDP Rules 2025 Rule 8',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Publish a retention schedule specifying retention periods per data category and purpose.' }),
    q({ id: 'RET-02', domain: 'retention',
      question: 'Do you erase personal data once consent is withdrawn or the purpose is no longer served (unless retention is legally required)?',
      explanation: 'The Act requires erasure when the purpose ends or consent is withdrawn, absent a legal retention duty.',
      legalReference: 'DPDPA Section 8(7) – Erasure obligation',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Automate purpose-end and withdrawal-triggered erasure, retaining only where law requires.' }),
    q({ id: 'RET-03', domain: 'retention',
      question: 'Do you securely and irreversibly dispose of personal data at the end of its retention period?',
      explanation: 'Secure disposal prevents recovery of data that should no longer exist.',
      legalReference: 'DPDPA Section 8(7) – Secure disposal (good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Adopt secure deletion / destruction standards for digital and physical media.' }),
    q({ id: 'RET-04', domain: 'retention',
      question: 'Do you ensure processors also erase personal data on instruction and at end of retention?',
      explanation: 'Erasure must propagate to processors, who hold copies on your behalf.',
      legalReference: 'DPDPA Section 8(2)–(7) – Erasure by processors',
      importance: 'Medium', weight: 4, risk: 'Medium',
      recommendation: 'Contractually require and verify processor deletion on instruction and at retention end.' }),
    q({ id: 'RET-05', domain: 'retention',
      question: 'Do you retain the personal data, associated traffic data and processing logs covered by Rule 8(3) for at least one year and erase them afterwards unless longer retention is legally required?',
      explanation: 'Rule 8(3) establishes a one-year minimum followed by erasure, subject to other legal retention requirements.',
      legalReference: 'DPDP Rules 2025 Rule 8(3) & Seventh Schedule',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Map Rule 8(3) data and logs, implement the one-year minimum, then automate erasure unless a documented legal basis requires longer retention.' }),
    q({ id: 'RET-06', domain: 'retention', allowNA: true,
      question: 'If you fall within a class in the Third Schedule, do you apply the prescribed inactivity period and notify the Data Principal at least 48 hours before erasure?',
      explanation: 'Rule 8 sets special purpose-expiry periods for specified large platforms and requires advance erasure notification.',
      legalReference: 'DPDP Rules 2025 Rule 8(1)–(2) & Third Schedule',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Identify whether a Third Schedule threshold applies, configure the prescribed inactivity period and send the 48-hour pre-erasure notice.' }),

    /* ---- Cross-Border Data Transfer --------------------------------------- */
    q({ id: 'CBT-01', domain: 'crossborder',
      question: 'Do you monitor and comply with Central Government restrictions and requirements concerning overseas transfers and availability of data to a foreign State or its controlled entities?',
      explanation: 'Section 16 and Rule 15 permit restrictions and additional requirements, including when data may be made available to foreign State bodies or controlled entities.',
      legalReference: 'DPDPA Section 16 with DPDP Rules 2025 Rule 15',
      importance: 'High', weight: 6, risk: 'High',
      recommendation: 'Maintain a regulatory watch and transfer-control process covering destinations, foreign-government access and applicable Government orders.' }),
    q({ id: 'CBT-02', domain: 'crossborder',
      question: 'Do you maintain an inventory mapping where personal data is stored and transferred internationally?',
      explanation: 'You cannot govern cross-border transfers you have not mapped.',
      legalReference: 'DPDPA Section 16 with Section 8(1) – Accountability',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Build a data-transfer map covering destinations, processors and hosting locations.' }),
    q({ id: 'CBT-03', domain: 'crossborder',
      question: 'Do you comply with any sector-specific law that imposes higher localisation or transfer restrictions than the Act?',
      explanation: 'Section 16 preserves stricter transfer restrictions under other Indian laws (e.g. RBI, sectoral rules).',
      legalReference: 'DPDPA Section 16(2) – Effect of other laws',
      importance: 'Medium', weight: 4, risk: 'Medium',
      recommendation: 'Identify applicable sectoral localisation rules and reconcile them with your transfer practices.' }),

    /* ---- Significant Data Fiduciary --------------------------------------- */
    q({ id: 'SDF-01', domain: 'sdf',
      question: 'Have you appointed a Data Protection Officer based in India who is responsible to the board / governing body?',
      explanation: 'A Significant Data Fiduciary must appoint a DPO based in India.',
      legalReference: 'DPDPA Section 10(2)(a) – DPO appointment',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Appoint an India-based DPO reporting to the board, and publish their details.' }),
    q({ id: 'SDF-02', domain: 'sdf',
      question: 'Have you appointed an independent data auditor to evaluate DPDPA compliance?',
      explanation: 'SDFs must appoint an independent data auditor.',
      legalReference: 'DPDPA Section 10(2)(b) – Independent data auditor',
      importance: 'High', weight: 6, risk: 'High',
      recommendation: 'Engage an independent data auditor and define an audit scope and cadence.' }),
    q({ id: 'SDF-03', domain: 'sdf',
      question: 'Do you complete a Data Protection Impact Assessment and compliance audit at least once in every 12-month period after SDF notification?',
      explanation: 'Rule 13 fixes an annual minimum cadence for both the DPIA and audit.',
      legalReference: 'DPDPA Section 10(2)(c) with DPDP Rules 2025 Rule 13(1)',
      importance: 'High', weight: 6, risk: 'High',
      recommendation: 'Schedule and complete a DPIA and compliance audit within every 12-month SDF cycle.' }),
    q({ id: 'SDF-04', domain: 'sdf',
      question: 'Does the person conducting the DPIA and audit furnish the Board with a report containing significant observations?',
      explanation: 'Rule 13 requires significant DPIA and audit observations to be furnished to the Board.',
      legalReference: 'DPDP Rules 2025 Rule 13(2)',
      importance: 'High', weight: 6, risk: 'High',
      recommendation: 'Define a governed process for identifying significant observations and furnishing the required report to the Board.' }),
    q({ id: 'SDF-05', domain: 'sdf',
      question: 'Do you verify that technical measures, including algorithmic software, are not likely to pose a risk to Data Principal rights?',
      explanation: 'Rule 13 requires due diligence over technical and algorithmic measures used to process personal data.',
      legalReference: 'DPDP Rules 2025 Rule 13(3)',
      importance: 'High', weight: 6, risk: 'High',
      recommendation: 'Introduce documented algorithmic and technical-risk review before deployment and after material changes.' }),
    q({ id: 'SDF-06', domain: 'sdf', allowNA: true,
      question: 'Where the Government specifies personal data for localisation, can you keep that data and traffic data relating to its flow within India?',
      explanation: 'Rule 13 enables notified localisation restrictions for specified personal data and related traffic data.',
      legalReference: 'DPDP Rules 2025 Rule 13(4)',
      importance: 'High', weight: 6, risk: 'High',
      recommendation: 'Maintain data-location controls capable of enforcing any notified SDF localisation requirement.' }),

    /* ---- State & Public-Service Processing ------------------------------- */
    q({ id: 'STA-01', domain: 'state',
      question: 'Is public-benefit or service processing limited to the uses permitted by Section 7(b) and Rule 5?',
      explanation: 'State processing for subsidies, benefits, services, certificates, licences or permits must remain within the permitted legal or policy basis.',
      legalReference: 'DPDPA Section 7(b) with DPDP Rules 2025 Rule 5',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Map every public-service processing activity to the specific law, policy or public-fund basis and permitted use.' }),
    q({ id: 'STA-02', domain: 'state',
      question: 'Are necessity, accuracy, retention, security and accountability controls implemented for this public-service processing?',
      explanation: 'The Second Schedule prescribes operational standards for State and State-instrumentality processing.',
      legalReference: 'DPDP Rules 2025 Rule 5 & Second Schedule',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Assess public-service processing against every Second Schedule standard and assign accountable owners.' }),
    q({ id: 'STA-03', domain: 'state',
      question: 'Where Section 7(b) is relied on, do you give the required intimation, responsible-person contact and rights link?',
      explanation: 'The Second Schedule requires transparency and rights access for this legitimate-use processing.',
      legalReference: 'DPDP Rules 2025 Second Schedule paragraph (g)',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Issue the prescribed intimation with processing details, a responsible contact and an accessible rights link.' }),

    /* ---- Scope & Exemption Governance ------------------------------------ */
    q({ id: 'EXM-01', domain: 'exemptions',
      question: 'For every exclusion or exemption relied on, have you mapped the processing activity to the exact statutory provision and its conditions?',
      explanation: 'DPDPA exclusions and exemptions are activity- and purpose-specific; they should not be applied to an organisation or dataset wholesale.',
      legalReference: 'DPDPA Sections 3(c) & 17 (governance good practice)',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Maintain an exemption register recording the provision, processing activity, purpose, conditions, owner and review date.' }),
    q({ id: 'EXM-02', domain: 'exemptions',
      question: 'Do controls prevent exempt processing from expanding beyond the permitted purpose, data and duration?',
      explanation: 'A valid exemption for one activity does not automatically cover other processing or secondary use.',
      legalReference: 'DPDPA Section 17 (scope-control good practice)',
      importance: 'High', weight: 7, risk: 'High',
      recommendation: 'Segregate exempt workflows and enforce purpose, access, sharing and retention boundaries.' }),
    q({ id: 'EXM-03', domain: 'exemptions', allowNA: true,
      question: 'For research, archiving or statistical processing under Rule 16, do you implement every standard in the Second Schedule?',
      explanation: 'The research, archiving and statistical exemption applies only where the prescribed Second Schedule standards are met.',
      legalReference: 'DPDPA Section 17(2)(b) with DPDP Rules 2025 Rule 16 & Second Schedule',
      importance: 'High', weight: 8, risk: 'High',
      recommendation: 'Assess the processing against each Second Schedule standard and close any condition that is not operational.' }),
    q({ id: 'EXM-04', domain: 'exemptions',
      question: 'Are claimed exclusions and exemptions periodically reviewed when purposes, datasets, recipients or law change?',
      explanation: 'Changes to processing can invalidate the assumptions on which an exclusion or exemption was based.',
      legalReference: 'DPDPA Sections 3 & 17 (review good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Trigger exemption reassessment on material processing changes and at a defined periodic cadence.' }),

    /* ---- Records, Training & Audit ---------------------------------------- */
    q({ id: 'REC-01', domain: 'records',
      question: 'Do you maintain a Record of Processing Activities (ROPA) / data inventory?',
      explanation: 'A processing record underpins accountability and evidences lawful processing.',
      legalReference: 'DPDPA Section 8(1) – Accountability (good practice)',
      importance: 'High', weight: 6, risk: 'High',
      recommendation: 'Maintain a living ROPA covering purposes, categories, recipients, retention and safeguards.' }),
    q({ id: 'REC-02', domain: 'records',
      question: 'Are your privacy policies, SOPs and processes documented and version-controlled?',
      explanation: 'Documented, current procedures make compliance repeatable and auditable.',
      legalReference: 'DPDPA Section 8 – Accountability (good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Document and version-control all privacy policies and operating procedures.' }),
    q({ id: 'REC-03', domain: 'records',
      question: 'Do you provide periodic privacy and data protection training and awareness to staff?',
      explanation: 'Trained staff are essential to operating controls and preventing breaches.',
      legalReference: 'DPDPA Section 8(1) – Accountability (good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Deliver role-based privacy training at onboarding and at least annually.' }),
    q({ id: 'REC-04', domain: 'records', type: 'maturity',
      question: 'How mature is your programme of periodic internal review / audit of DPDPA compliance?',
      explanation: 'Regular review detects drift and evidences ongoing accountability.',
      legalReference: 'DPDPA Section 8 – Accountability (good practice)',
      importance: 'Medium', weight: 5, risk: 'Medium',
      recommendation: 'Establish scheduled internal compliance reviews with tracked corrective actions.' })
  ];

  /* ---------------------------------------------------------------------------
   * Exposure copy — the consequence when a control is weak or missing.
   * This is the report's insight layer: plain-English "what breaks and what it
   * costs you", not a restatement of the question. Merged onto each question.
   * ------------------------------------------------------------------------ */
  var EXPOSURES = {
    // Governance
    'GOV-01': 'With no published policy, you have nothing to point to when a customer — or the Board — asks how you handle their data.',
    'GOV-02': 'Without clear ownership, privacy becomes everyone’s job and no one’s — controls quietly drift and gaps go unnoticed.',
    'GOV-03': 'If leadership hasn’t signed off, privacy has no budget and no teeth — yet the Act holds the organisation, not an individual, accountable.',
    'GOV-04': 'If people can’t find who to ask, their questions become complaints — and their complaints go straight to the regulator.',
    'GOV-05': 'An ad-hoc programme works right up until it’s tested — a breach or audit is a bad time to discover the gaps.',
    // Notice
    'NOT-01': 'Collecting data without notice means the consent behind it never truly existed — the foundation of your processing is missing.',
    'NOT-02': 'Vague notices make every consent challengeable — a regulator can treat your entire consent base as invalid.',
    'NOT-03': 'If the notice doesn’t say how to complain, people skip you and find the Board’s number instead.',
    'NOT-04': 'A notice a Data Principal can’t read isn’t notice at all — the Act expects English or their scheduled language, their choice.',
    'NOT-05': 'Every pre-Act record you hold without fresh notice is a silent liability sitting in your database.',
    // Consent
    'CON-01': 'Pre-ticked boxes and bundled consent don’t count — if it isn’t a clear yes, the processing behind it is unlawful.',
    'CON-02': 'Consent that grabs more than you need turns minor over-collection into a consent-validity problem.',
    'CON-03': 'If opting out is harder than opting in, you’re holding consent the Act already considers defective.',
    'CON-04': 'If “unsubscribe” doesn’t actually stop processing, you’re processing with no lawful basis the moment someone opts out.',
    'CON-05': 'When the Board asks “prove they agreed,” a missing consent trail means you lose by default — the burden is on you.',
    'CON-06': 'Without a registered Consent Manager route, you’re cut off from the channel the Act built for people to manage consent at scale.',
    // Processing
    'PRO-01': 'Processing with no identified lawful basis is unlawful by definition — and “we’ve always done it” isn’t one of the grounds.',
    'PRO-02': 'Leaning on a legitimate use you can’t point to in Section 7 is a bet you’ll lose in an audit.',
    'PRO-03': 'Quietly reusing data for new purposes is how a data programme becomes a data scandal.',
    'PRO-04': 'Every extra field you collect is more data to secure, justify, and eventually explain in a breach.',
    'PRO-05': 'Wrong data driving real decisions means real harm to real people — exactly what Section 8(3) exists to prevent.',
    // Rights
    'RTS-01': 'If people can’t see what you hold on them, they can’t trust you with it — and the Act gives them the right to look.',
    'RTS-02': 'With no way to fix or delete data, errors and stale records pile up — and every ignored request is a Section 12 breach.',
    'RTS-03': 'With no grievance channel, complaints skip you entirely and land straight at the Data Protection Board.',
    'RTS-04': 'When a Data Principal dies or is incapacitated, you have no lawful way to act on their data without a nomination path.',
    'RTS-05': 'Rights that exist on paper but aren’t answered on time are the fastest route from customer to complainant.',
    // Children
    'CHD-01': 'Processing a child’s data without verifiable parental consent is a bright-line breach — one the Act treats as non-negotiable.',
    'CHD-02': 'Skipping guardian consent for a person with disability exposes your most vulnerable users — and you — to the harshest scrutiny.',
    'CHD-03': 'A feature that could harm a child’s well-being isn’t just a design flaw here — it’s a statutory violation.',
    'CHD-04': 'Tracking or advertising to children without a valid Rule 12 exemption creates a direct statutory exposure.',
    'CHD-05': 'An undocumented exemption is difficult to defend and may leave prohibited child processing operating without its required conditions.',
    // Security
    'SEC-01': 'Without reasonable safeguards, a breach isn’t bad luck — it’s negligence the Act can penalise up to ₹250 crore.',
    'SEC-02': 'Unencrypted personal data turns a stolen laptop or a leaked backup into a full-blown reportable breach.',
    'SEC-03': 'Every person who can see data they don’t need is a breach waiting to happen — from the inside.',
    'SEC-04': 'If you can’t see who touched personal data, you can’t detect a breach — or prove one didn’t happen.',
    'SEC-05': 'Untested backups are a promise you discover is broken at the exact moment you need them.',
    'SEC-06': 'Unpatched systems are the unlocked door most breaches simply walk through.',
    'SEC-07': 'If required security logs and related data disappear too early, you may be unable to investigate a breach or meet Rule 6.',
    // Breach
    'BRC-01': 'A breach you can’t detect is a breach you can’t report — and the clock is already running.',
    'BRC-02': 'Improvising during a breach burns the hours that matter most and turns an incident into a crisis.',
    'BRC-03': 'Failing to tell affected people isn’t just a Section 8(6) breach — it’s how a contained incident becomes a headline.',
    'BRC-04': 'Miss the Board notification window and one breach becomes two — the leak, and the failure to report it.',
    'BRC-05': 'With no breach log or post-mortem, the same incident happens twice — and you can’t show you learned.',
    // Vendors
    'VEN-01': 'Sharing data with a processor on a handshake means their mistakes become your unlawful processing.',
    'VEN-02': 'A contract that doesn’t flow down security and deletion duties leaves you accountable for controls you can’t enforce.',
    'VEN-03': 'You inherit your weakest vendor’s security — without checking, you have no idea how weak that is.',
    'VEN-04': 'Data quietly handed to a fourth party you never vetted is a breach chain you can’t even see.',
    // Processor
    'DPR-01': 'Without a clear processing contract, instructions, purposes and responsibilities are open to dispute.',
    'DPR-02': 'Independent or incompatible use can move you beyond the processor role and create unplanned Data Fiduciary exposure.',
    'DPR-03': 'Weak processor safeguards become the Data Fiduciary’s breach exposure and a contractual failure for you.',
    'DPR-04': 'Late processor escalation can make it impossible for the Data Fiduciary to meet the breach notification clock.',
    'DPR-05': 'Copies that remain with you or a sub-processor can defeat the Data Fiduciary’s statutory erasure obligation.',
    'DPR-06': 'An unmanaged sub-processor creates an unseen processing chain with controls the contracting Data Fiduciary cannot rely on.',
    // Retention
    'RET-01': 'With no retention limits, data never leaves — and every extra year is extra breach exposure and extra liability.',
    'RET-02': 'Keeping data after the purpose ends or consent is withdrawn is unlawful hoarding under Section 8(7).',
    'RET-03': '“Deleted” data that’s actually recoverable is data you’ll still have to answer for in a breach.',
    'RET-04': 'If your processors don’t delete when you do, your erasure is a fiction and the copies live on.',
    'RET-05': 'Retaining Rule 8 data for too little or too long can breach the prescribed minimum-and-erasure lifecycle.',
    'RET-06': 'A missed Third Schedule period or 48-hour notice leaves large-platform erasure out of step with Rule 8.',
    // Cross-border
    'CBT-01': 'A transfer or foreign-government access path that ignores a Government restriction or requirement can breach Section 16 and Rule 15.',
    'CBT-02': 'You can’t govern transfers you can’t see — and “we didn’t know it went there” is not a defence.',
    'CBT-03': 'Sector rules (like RBI’s) can trump the Act — meeting DPDPA isn’t enough if localisation law says otherwise.',
    // SDF
    'SDF-01': 'As a Significant Data Fiduciary, no India-based DPO answerable to the board is a structural gap the Board notices first.',
    'SDF-02': 'Without independent audit, you’re grading your own homework — exactly what SDF status is meant to prevent.',
    'SDF-03': 'Skipping DPIAs on high-risk processing means you discover the risk after it lands, not before.',
    'SDF-04': 'Significant observations that never reach the Board leave a direct Rule 13 reporting obligation unmet.',
    'SDF-05': 'Unchecked algorithmic or technical measures can scale harm to Data Principal rights before anyone notices.',
    'SDF-06': 'Without localisation capability, a future Government specification can make existing data architecture non-compliant.',
    // State processing
    'STA-01': 'Public-service processing outside Section 7(b) and Rule 5 may lack the legitimate-use basis being relied on.',
    'STA-02': 'Missing Second Schedule controls weaken necessity, accuracy, retention, security and accountability across public processing.',
    'STA-03': 'Without the required intimation and rights route, individuals cannot understand or challenge public-service processing.',
    // Exemptions
    'EXM-01': 'A blanket or undocumented exemption claim can leave ordinary processing outside the controls that still apply to it.',
    'EXM-02': 'Purpose or data creep can carry processing beyond the legal boundary of an otherwise valid exemption.',
    'EXM-03': 'Research, archiving or statistical processing that misses a Second Schedule condition may lose the Rule 16 exemption.',
    'EXM-04': 'An exemption that is never revisited can remain in use after the underlying facts or law have changed.',
    // Records
    'REC-01': 'No record of processing means that when anyone asks what you do with data, your honest answer is “we’re not sure.”',
    'REC-02': 'Undocumented processes walk out the door when people do — and can’t be audited or trusted.',
    'REC-03': 'Your controls are only as strong as the least-trained person who can click “export.”',
    'REC-04': 'Without periodic review, compliance quietly decays until an incident reveals how far it has drifted.'
  };
  DPDPA.questions.forEach(function (q) { q.exposure = EXPOSURES[q.id] || ''; });

  /* ---------------------------------------------------------------------------
   * Icon library (feather-style inline SVG paths, 24x24, currentColor stroke).
   * Kept here because it is shared data used by every page.
   * ------------------------------------------------------------------------ */
  var P = 'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  var ICON_PATHS = {
    shield:      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" ' + P + '/>',
    governance:  '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 11h.01M15 11h.01" ' + P + '/>',
    notice:      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M9 13h6 M9 17h6" ' + P + '/>',
    consent:     '<path d="M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" ' + P + '/>',
    processing:  '<path d="M12 2C6.5 2 4 3.5 4 5s2.5 3 8 3 8-1.5 8-3-2.5-3-8-3z M4 5v7c0 1.5 2.5 3 8 3s8-1.5 8-3V5 M4 12v7c0 1.5 2.5 3 8 3s8-1.5 8-3v-7" ' + P + '/>',
    rights:      '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" ' + P + '/>',
    children:    '<path d="M18 20a6 6 0 0 0-12 0 M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M8.5 8.5c1 1 2 1.5 3.5 1.5s2.5-.5 3.5-1.5" ' + P + '/>',
    security:    '<path d="M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M8 11V7a4 4 0 0 1 8 0v4 M12 16v2" ' + P + '/>',
    breach:      '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01" ' + P + '/>',
    vendors:     '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" ' + P + '/>',
    retention:   '<path d="M21 8v13H3V8 M1 3h22v5H1z M10 12h4" ' + P + '/>',
    crossborder: '<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z" ' + P + '/>',
    sdf:         '<path d="M12 15a7 7 0 1 0 0-14 7 7 0 0 0 0 14z M8.2 13.3 7 22l5-3 5 3-1.2-8.7" ' + P + '/>',
    records:     '<path d="M9 2h6a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1z M8 4h8 M9 12h6 M9 16h6" ' + P + '/>',

    info:        '<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 16v-4 M12 8h.01" ' + P + '/>',
    help:        '<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3 M12 17h.01" ' + P + '/>',
    check:       '<path d="M20 6 9 17l-5-5" ' + P + '/>',
    checkCircle: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1 M22 4 12 14.01l-3-3" ' + P + '/>',
    x:           '<path d="M18 6 6 18 M6 6l12 12" ' + P + '/>',
    xCircle:     '<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M15 9l-6 6 M9 9l6 6" ' + P + '/>',
    alert:       '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z M12 9v4 M12 17h.01" ' + P + '/>',
    arrowRight:  '<path d="M5 12h14 M12 5l7 7-7 7" ' + P + '/>',
    arrowLeft:   '<path d="M19 12H5 M12 19l-7-7 7-7" ' + P + '/>',
    download:    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3" ' + P + '/>',
    printer:     '<path d="M6 9V2h12v7 M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2 M6 14h12v8H6z" ' + P + '/>',
    target:      '<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" ' + P + '/>',
    trending:    '<path d="M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6" ' + P + '/>',
    list:        '<path d="M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01" ' + P + '/>',
    activity:    '<path d="M22 12h-4l-3 9L9 3l-3 9H2" ' + P + '/>',
    flag:        '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z M4 22v-7" ' + P + '/>',
    clock:       '<path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2" ' + P + '/>',
    zap:         '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" ' + P + '/>',
    layers:      '<path d="M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5" ' + P + '/>',
    file:        '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6" ' + P + '/>',
    lock:        '<path d="M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z M8 11V7a4 4 0 0 1 8 0v4" ' + P + '/>',
    dashboard:   '<path d="M3 3h8v8H3z M13 3h8v5h-8z M13 12h8v9h-8z M3 15h8v6H3z" ' + P + '/>',
    scale:       '<path d="M12 3v18 M5 21h14 M7 7 3 13h8L7 7z M17 7l-4 6h8l-4-6z M12 3 7 7 M12 3l5 4" ' + P + '/>'
  };

  DPDPA.icon = function (name, cls) {
    var path = ICON_PATHS[name] || ICON_PATHS.info;
    // Always carry the low-specificity `ico` class so icons have a sane default
    // size everywhere; any container-specific `svg` rule overrides it.
    var klass = 'ico' + (cls ? ' ' + cls : '');
    return '<svg viewBox="0 0 24 24" class="' + klass + '"' +
      ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + path + '</svg>';
  };

  /* Fill any element carrying data-icon="name" with its inline SVG. */
  DPDPA.hydrateIcons = function (root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-icon]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].innerHTML = DPDPA.icon(nodes[i].getAttribute('data-icon'));
    }
  };

  /* ---------------------------------------------------------------------------
   * Convenience lookups
   * ------------------------------------------------------------------------ */
  DPDPA.getDomainById = function (id) {
    for (var i = 0; i < DPDPA.domains.length; i++) {
      if (DPDPA.domains[i].id === id) return DPDPA.domains[i];
    }
    return null;
  };

  DPDPA.getQuestionsByDomain = function (domainId) {
    return DPDPA.questions.filter(function (q) { return q.domain === domainId; });
  };

})(window);

export {};
