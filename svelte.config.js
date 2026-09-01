import adapter from '@sveltejs/adapter-static';

const clientRenderedReportSections = new Set([
  'summary',
  'scope',
  'dashboard',
  'domains',
  'matrix',
  'risks',
  'remediation',
  'readiness'
]);

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      precompress: true,
      strict: true
    }),
    prerender: {
      handleMissingId({ id, message }) {
        // These targets are created by the client-only report renderer after
        // an assessment exists. All other broken fragment links still fail CI.
        if (!clientRenderedReportSections.has(id)) {
          throw new Error(message);
        }
      }
    }
  }
};

export default config;
