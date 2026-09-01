  <!-- ============================= HERO ============================= -->
  <section class="hero">
    <div class="container">
      <div class="hero-grid">
        <div>
          <span class="tag" data-icon-prefix>
            <span data-icon="scale" style="width:16px;height:16px;display:inline-flex"></span>
            Aligned to the DPDP Act, 2023 &amp; DPDP Rules, 2025
          </span>
          <h1>Know your <span class="accent">DPDPA</span> compliance posture — before the regulator does.</h1>
          <p class="lead">A professional, consultant-grade assessment that evaluates your organization
            against the Digital Personal Data Protection Act, 2023 and produces an executive
            readiness report with control-maturity scoring, a control gap register and a prioritised remediation roadmap.</p>
          <div class="btn-row">
            <!-- svelte-ignore a11y_invalid_attribute -->
            <a href="#" data-view="assessment" class="btn btn-primary btn-lg">Begin free assessment
              <span data-icon="arrowRight"></span></a>
            <a href="#flow" class="btn btn-secondary btn-lg">See how it works</a>
          </div>
          <div class="hero-stats">
            <div class="stat"><b>50+</b><span>Control questions</span></div>
            <div class="stat"><b>15+</b><span>Compliance domains</span></div>
            <div class="stat"><b>16+</b><span>DPDPA sections mapped</span></div>
          </div>
        </div>

        <!-- Animated product story: Scope -> Assess -> Report -->
        <div class="product-demo" id="demo" aria-label="Illustrative DPDPA assessment product walkthrough">
          <div class="demo-head">
            <div class="demo-acts" aria-label="Product walkthrough chapters">
              <button class="demo-act-btn" type="button" data-demo-act="scope" data-current="true" aria-pressed="true"><span>01</span>Scope</button>
              <button class="demo-act-btn" type="button" data-demo-act="assess" data-current="false" aria-pressed="false"><span>02</span>Assess</button>
              <button class="demo-act-btn" type="button" data-demo-act="report" data-current="false" aria-pressed="false"><span>03</span>Report</button>
            </div>
            <span class="demo-sample">SAMPLE</span>
          </div>

          <div class="demo-stage" aria-hidden="true">
            <section class="demo-panel demo-scope" data-demo-panel="scope" data-active="true">
              <div class="demo-profile-chips">
                <span class="demo-profile-chip" data-demo-chip="fiduciary"><span data-icon="check"></span>Data Fiduciary</span>
                <span class="demo-profile-chip" data-demo-chip="state"><span data-icon="check"></span>Not a State body</span>
                <span class="demo-profile-chip" data-demo-chip="exemptions"><span data-icon="check"></span>No exemptions claimed</span>
                <span class="demo-profile-chip" data-demo-chip="children"><span data-icon="check"></span>Children's data</span>
                <span class="demo-profile-chip" data-demo-chip="crossborder"><span data-icon="check"></span>Data leaves India</span>
                <span class="demo-profile-chip" data-demo-chip="sdf"><span data-icon="check"></span>Likely an SDF</span>
              </div>
              <div class="demo-scope-counter" data-state="skel">
                <span class="demo-counter-skel"></span>
                <span class="demo-counter-real"><b data-demo-domains>16</b><span>domains</span><i>·</i><b data-demo-controls>79</b><span>controls</span></span>
              </div>
              <div class="demo-domain-grid" data-demo-domain-grid></div>
            </section>

            <section class="demo-panel demo-assess" data-demo-panel="assess" data-active="false">
              <div class="demo-assess-head">
                <span>5 of 13 applicable domains</span>
                <div class="demo-assess-count"><b data-demo-assess-count>0</b><small> / <span data-demo-assess-total>66</span></small></div>
              </div>
              <div class="demo-domain-rows">
                <div class="demo-domain-row" data-state="skel" data-score="73" data-band="amber" style="--score:73%"><span>Data Security Safeguards</span><div class="demo-score-track"><div class="demo-score-fill"></div></div><b>73%</b></div>
                <div class="demo-domain-row" data-state="skel" data-score="61" data-band="amber" style="--score:61%"><span>Consent Management</span><div class="demo-score-track"><div class="demo-score-fill"></div></div><b>61%</b></div>
                <div class="demo-domain-row" data-state="skel" data-score="59" data-band="orange" style="--score:59%"><span>Cross-Border Data Transfer</span><div class="demo-score-track"><div class="demo-score-fill"></div></div><b>59%</b></div>
                <div class="demo-domain-row" data-state="skel" data-score="57" data-band="orange" style="--score:57%"><span>Significant Data Fiduciary</span><div class="demo-score-track"><div class="demo-score-fill"></div></div><b>57%</b></div>
                <div class="demo-domain-row" data-state="skel" data-score="47" data-band="orange" style="--score:47%"><span>Records, Training &amp; Audit</span><div class="demo-score-track"><div class="demo-score-fill"></div></div><b>47%</b></div>
              </div>
            </section>

            <section class="demo-panel demo-report" data-demo-panel="report" data-active="false">
              <div class="demo-report-summary">
                <div class="demo-gauge">
                  <svg viewBox="0 0 120 120" focusable="false">
                    <circle class="demo-gauge-track" cx="60" cy="60" r="52"></circle>
                    <circle class="demo-gauge-fill" data-demo-gauge cx="60" cy="60" r="52"></circle>
                  </svg>
                  <span class="demo-gauge-number"><b data-demo-score>0</b><small>%</small></span>
                </div>
                <div class="demo-report-copy">
                  <div class="demo-report-kicker">Control maturity</div>
                  <span class="demo-band" data-demo-band>High Risk — Critical Statutory Gap</span>
                  <div class="demo-report-stats">
                    <span class="demo-report-stat" data-demo-stat="0">11 immediate</span>
                    <span class="demo-report-stat" data-demo-stat="1">41 actions</span>
                    <span class="demo-report-stat" data-demo-stat="2">13 domains</span>
                  </div>
                </div>
              </div>
              <div class="demo-roadmaps">
                <article class="demo-roadmap" data-demo-roadmap="0" data-state="hidden">
                  <div class="demo-roadmap-skeleton"><span></span><span></span><span></span></div>
                  <div class="demo-roadmap-content">
                    <div class="demo-roadmap-top"><span class="demo-roadmap-tag quick"><span data-icon="zap"></span>Quick win</span><span class="demo-roadmap-tag">Immediate</span></div>
                    <p class="demo-roadmap-task">Appoint a responsible contact and publish it prominently on the website and app</p>
                    <div class="demo-roadmap-meta"><span><span data-icon="clock"></span>0–2 weeks</span><span>DPO / Privacy Office</span><span>S.8(9), Rule 9</span></div>
                  </div>
                </article>
                <article class="demo-roadmap" data-demo-roadmap="1" data-state="hidden">
                  <div class="demo-roadmap-skeleton"><span></span><span></span><span></span></div>
                  <div class="demo-roadmap-content">
                    <div class="demo-roadmap-top"><span class="demo-roadmap-tag">Immediate</span></div>
                    <p class="demo-roadmap-task">Implement a consent ledger capturing purpose, timestamp, method and notice version</p>
                    <div class="demo-roadmap-meta"><span><span data-icon="clock"></span>0–2 weeks</span><span>Product / Engineering</span><span>S.6</span></div>
                  </div>
                </article>
              </div>
            </section>
          </div>

          <p class="demo-caption" data-demo-caption>Tell us who you are. The assessment works out what applies.</p>
          <div class="demo-foot"><span data-icon="lock"></span><span>Illustrative demo. Your answers stay in your browser.</span></div>
          <p class="visually-hidden">The assessment adapts sixteen DPDPA domains to your organisation, applies weighted scoring to applicable controls, and produces a prioritised remediation roadmap with an owner and deadline for every action.</p>
        </div>
      </div>
    </div>
  </section>
