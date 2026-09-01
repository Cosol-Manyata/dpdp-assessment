  <header class="site-header">
    <div class="container">
      <!-- svelte-ignore a11y_invalid_attribute -->
      <a class="brand" data-view="landing" href="#">
        <img class="brand-logo" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgMTcwIiBmaWxsPSJub25lIiByb2xlPSJpbWciIGFyaWEtbGFiZWw9IkNvbm5lY3Rpdml0eSBTb2x1dGlvbnMiPgogIDwhLS0gTW9ub2dyYW06IHdoaXRlIHJvdW5kZWQgc3F1YXJlIHdpdGggQ1MgbWFyayAtLT4KICA8cmVjdCB4PSIxMiIgeT0iMTQiIHdpZHRoPSIxNDIiIGhlaWdodD0iMTQyIiByeD0iMzIiIGZpbGw9IiNmZmZmZmYiLz4KICA8dGV4dCB4PSI4MyIgeT0iODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJjZW50cmFsIgogICAgICAgIGZvbnQtZmFtaWx5PSInU2Vnb2UgVUknLCdIZWx2ZXRpY2EgTmV1ZScsQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSI4MiIKICAgICAgICBmb250LXdlaWdodD0iODAwIiBsZXR0ZXItc3BhY2luZz0iLTMiIGZpbGw9IiMwZjE3MmEiPkNTPC90ZXh0PgogIDwhLS0gV29yZG1hcmsgLS0+CiAgPHRleHQgeD0iMTg0IiB5PSI3MiIgZm9udC1mYW1pbHk9IidTZWdvZSBVSScsJ0hlbHZldGljYSBOZXVlJyxBcmlhbCxzYW5zLXNlcmlmIgogICAgICAgIGZvbnQtc2l6ZT0iNTIiIGZvbnQtd2VpZ2h0PSI2MDAiIGxldHRlci1zcGFjaW5nPSItMC41IiBmaWxsPSIjZmZmZmZmIj5Db25uZWN0aXZpdHk8L3RleHQ+CiAgPHRleHQgeD0iMTg0IiB5PSIxMzIiIGZvbnQtZmFtaWx5PSInU2Vnb2UgVUknLCdIZWx2ZXRpY2EgTmV1ZScsQXJpYWwsc2Fucy1zZXJpZiIKICAgICAgICBmb250LXNpemU9IjUyIiBmb250LXdlaWdodD0iNjAwIiBsZXR0ZXItc3BhY2luZz0iLTAuNSIgZmlsbD0iI2ZmZmZmZiI+U29sdXRpb25zPC90ZXh0Pgo8L3N2Zz4K" alt="Connectivity Solutions" />
        <span class="brand-text">DPDPA <span style="color:var(--blue-600)">Compliance</span><span class="sub">Data Protection Readiness</span></span>
      </a>
      <nav class="nav">
        <!-- svelte-ignore a11y_invalid_attribute -->
        <a data-view="landing" href="#">Overview</a>
        <a data-nav="landing" href="#flow">How it works</a>
        <a data-nav="landing" href="#coverage">Coverage</a>
        <!-- svelte-ignore a11y_invalid_attribute -->
        <a data-nav="app" data-view="assessment" href="#">Assessment</a>
        <!-- svelte-ignore a11y_invalid_attribute -->
        <a data-nav="app" data-view="report" href="#">Report</a>
        <!-- svelte-ignore a11y_invalid_attribute -->
        <a data-nav="landing" data-view="assessment" href="#" class="btn btn-primary" style="color:#fff">Start Assessment <span data-icon="arrowRight"></span></a>
      </nav>
    </div>
  </header>

  <section class="countdown-banner" id="countdown-banner" aria-label="DPDPA readiness countdown" aria-hidden="true" hidden>
    <div class="container">
      <div class="countdown-banner-inner">
        <div class="cb-intro">
          <span class="cb-icon" data-icon="shield"></span>
          <div><b>DPDPA readiness countdown</b><span>Your assessment workspace is ready</span></div>
        </div>
        <div class="cb-timer" aria-hidden="true">
          <div class="cb-unit"><b data-banner-weeks>—</b><span>Weeks</span></div>
          <div class="cb-unit"><b data-banner-days>—</b><span>Days</span></div>
          <div class="cb-unit"><b data-banner-hours>—</b><span>Hours</span></div>
        </div>
        <div class="cb-deadline"><span>Readiness target</span><b data-banner-deadline>13 May 2027</b></div>
        <p class="visually-hidden" data-banner-summary>Countdown to the DPDPA readiness target.</p>
      </div>
    </div>
  </section>
