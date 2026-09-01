# DPDPA Compliance Assessment

A client-only SvelteKit application for running the existing DPDPA readiness
self-assessment and generating its report. Assessment answers remain in the
browser under the `dpdpa_assessment_v1` localStorage key; there are no API
routes, server load functions, form actions, or uploads.

## Requirements

- Node.js 20.19 or newer
- npm 10 or newer

## Development

```sh
npm install
npm run dev
```

Run the project checks and create the static production output with:

```sh
npm run check
npm run build
```

The static adapter writes the deployable site to `build/`, including Brotli
and gzip-compressed assets.

## Structure

- `src/routes` — the prerendered SvelteKit route and page composition
- `src/lib/components` — layout, landing, assessment, and report views
- `src/lib/domain` — assessment content and pure scoring/risk rules
- `src/lib/client` — browser-only controllers and UI behavior
- `src/lib/styles` — global styles split by page responsibility
- `src/lib/config` — stable client storage contracts
- `static` — files that must load before application hydration

Future sign-in and sign-up screens can be added as routes without moving
assessment answers into SvelteKit's backend. Authentication/session handling
should remain separate from the locally stored assessment payload.
