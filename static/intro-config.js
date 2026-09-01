/* Loaded before the app renders so the launch screen never flashes in late. */
window.DPDPA_INTRO_CONFIG = Object.assign(
  {
    enabled: true,
    durationMs: 7200,
    deadline: '2027-05-13T23:59:59+05:30',
    deadlineLabel: '13 May 2027',
    allowSkip: true
  },
  window.DPDPA_INTRO_CONFIG || {}
);

if (window.DPDPA_INTRO_CONFIG.enabled) {
  document.body.classList.add('intro-active');
}
