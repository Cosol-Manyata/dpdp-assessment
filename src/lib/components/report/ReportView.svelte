  <div id="view-report" class="view" hidden>


  <!-- ============================ HEADER ============================ -->
  

  <!-- Sticky in-report navigation + export controls (hidden when empty) -->
  <div class="report-toolbar no-print" id="report-toolbar" style="display:none">
    <div class="container">
      <nav class="report-nav">
        <a href="#summary">Summary</a>
        <a href="#scope">Scope</a>
        <a href="#dashboard">Dashboard</a>
        <a href="#domains">Domain Verdicts</a>
        <a href="#matrix">Priorities</a>
        <a href="#risks">Control Gaps</a>
        <a href="#remediation">Roadmap</a>
        <a href="#readiness">Bottom Line</a>
      </nav>
      <div class="btn-row">
        <button class="btn btn-secondary" id="btn-export"><span data-icon="download"></span> Export data</button>
        <button class="btn btn-primary" id="btn-print"><span data-icon="printer"></span> Print / Save as PDF</button>
      </div>
    </div>
  </div>

  <main class="container" id="report-root"><!-- JS renders the full report or an empty state --></main>

  

  
  
  

  </div>
