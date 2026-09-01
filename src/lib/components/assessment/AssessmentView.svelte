  <div id="view-assessment" class="view" hidden>


  <!-- ============================ HEADER ============================ -->
  

  <main class="container">
    <div class="assess-layout">

      <!-- ========================= STEPPER ========================= -->
      <aside class="stepper">
        <div class="card">
          <div class="card-pad">
            <h4>Assessment sections</h4>
            <div id="stepper-list"><!-- JS --></div>
          </div>
          <div style="border-top:1px solid var(--border);padding:16px">
            <div class="flex between aic" style="margin-bottom:10px">
              <span class="muted" style="font-size:.8rem">Overall completion</span>
              <b id="side-pct" style="color:var(--navy);font-size:.9rem">0%</b>
            </div>
            <div class="progress" id="side-progress"><span style="width:0%"></span></div>
            <button class="btn btn-primary" id="btn-generate" style="width:100%;justify-content:center;margin-top:16px">
              Generate Report <span data-icon="arrowRight"></span>
            </button>
            <button class="btn btn-ghost" id="btn-reset" style="width:100%;justify-content:center;margin-top:6px;font-size:.85rem">
              Reset assessment
            </button>
          </div>
        </div>
      </aside>

      <!-- ========================== MAIN =========================== -->
      <section>
        <div class="assess-topbar">
          <div class="assess-progress-wrap">
            <div class="labels">
              <span>Step <b id="step-current">1</b> of <b id="step-total">1</b></span>
              <span id="answered-summary" class="save-hint"></span>
            </div>
            <div class="progress" id="top-progress"><span style="width:0%"></span></div>
          </div>
        </div>

        <div id="step-content"><!-- JS renders profile form or a domain's questions --></div>

        <div class="assess-nav">
          <button class="btn btn-secondary" id="btn-prev"><span data-icon="arrowLeft"></span> Previous</button>
          <div class="spacer"></div>
          <button class="btn btn-primary" id="btn-next">Next <span data-icon="arrowRight"></span></button>
        </div>
      </section>

    </div>
  </main>

  
  
  

  </div>
