  <!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
  <section class="app-intro" id="app-intro" role="dialog" aria-modal="true" aria-label="DPDPA compliance countdown" data-state="visible">
    <div class="intro-shell">
      <div class="intro-top">
        <div class="intro-brand" aria-label="Connectivity Solutions DPDPA Compliance">
          <span class="intro-mark">CS</span>
          <span><b>DPDPA Compliance</b><small>Connectivity Solutions</small></span>
        </div>
        <button class="intro-skip" type="button" data-intro-skip>Skip intro <span data-icon="arrowRight"></span></button>
      </div>

      <div class="intro-main">
        <div class="intro-copy">
          <h1 class="intro-title">Know your <span>DPDPA readiness</span> before the deadline.</h1>
          <div class="intro-deadline">
            <strong data-intro-deadline>13 May 2027</strong>
            <span>Readiness target<br>Substantive obligations commence the next day</span>
          </div>
          <ol class="intro-path" aria-label="Assessment journey">
            <li><i>01</i><b>Scope</b></li>
            <li><i>02</i><b>Assess</b></li>
            <li><i>03</i><b>Report</b></li>
          </ol>
        </div>

        <div class="intro-visual" aria-hidden="true">
          <div class="intro-dial"></div>
          <div class="intro-count-card">
            <div class="intro-count-head">
              <span class="intro-count-icon" data-icon="shield"></span>
              <span class="intro-count-heading"><b>Readiness countdown</b><span>DPDPA compliance workspace</span></span>
              <span class="intro-live">LIVE</span>
            </div>
            <div class="intro-countdown">
              <div class="intro-unit"><b data-intro-weeks>—</b><span>Weeks</span></div>
              <div class="intro-unit"><b data-intro-days>—</b><span>Days</span></div>
              <div class="intro-unit"><b data-intro-hours>—</b><span>Hours</span></div>
            </div>
            <p class="intro-count-note">Time remaining until the configured readiness target</p>
          </div>
        </div>
        <p class="visually-hidden" data-intro-summary>Countdown to the DPDPA readiness target.</p>
      </div>

      <div class="intro-foot" aria-hidden="true">
        <span>Preparing your readiness workspace</span>
        <div class="intro-progress"><span></span></div>
      </div>
    </div>
  </section>
