import { ASSESSMENT_STORAGE_KEY } from '$lib/config/storage.js';

/**
 * Loads the browser-only application modules after Svelte has mounted their
 * DOM targets. Keeping this boundary explicit prevents assessment data from
 * entering SvelteKit's server runtime or load functions.
 */
export async function initializeClientApp() {
  window.DPDPA_STORAGE_KEY = ASSESSMENT_STORAGE_KEY;

  await import('$lib/domain/questions.js');
  await import('$lib/domain/rules.js');
  await import('$lib/client/assessment-controller.js');
  await import('$lib/client/report-renderer.js');
  await import('$lib/client/navigation.js');
  await import('$lib/client/hero-demo.js');
  await import('$lib/client/intro.js');
}
