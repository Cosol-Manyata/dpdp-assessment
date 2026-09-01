<script>
  import { onMount } from 'svelte';
  import AppFooter from '$lib/components/layout/AppFooter.svelte';
  import AppHeader from '$lib/components/layout/AppHeader.svelte';
  import AppIntro from '$lib/components/layout/AppIntro.svelte';
  import AssessmentView from '$lib/components/assessment/AssessmentView.svelte';
  import LandingView from '$lib/components/landing/LandingView.svelte';
  import ReportView from '$lib/components/report/ReportView.svelte';
  import { initializeClientApp } from '$lib/client/bootstrap.js';

  onMount(() => {
    initializeClientApp().catch((error) => {
      console.error('Unable to initialize the DPDPA assessment application.', error);
    });
  });
</script>

<svelte:head>
  <title>DPDPA Compliance Assessment Platform</title>
  <meta
    name="description"
    content="Run an unverified DPDPA readiness self-assessment and generate a control-maturity report with prioritised remediation."
  />
</svelte:head>

<div id="app-shell">
  <AppIntro />
  <AppHeader />
  <LandingView />
  <AssessmentView />
  <ReportView />
  <AppFooter />
</div>
