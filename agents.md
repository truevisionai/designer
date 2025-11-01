# Agent Enablement Guide

## Project Overview
- `src/` holds an Angular 12 application bundled with Electron for desktop delivery; key feature areas live in `src/app/**`.
- Rendering and 3D interactions rely on `three`, while road-network logic is concentrated under `src/app/map`.
- Build artifacts target Windows, macOS, and Linux through `electron-builder`; CI/CD scripts live in `buildspec.yml`, `release.sh`, and `scripts/`.
- OpenDRIVE samples (for acceptance/regression) are under `src/assets/open-drive/`, and Cypress scenarios sit in `cypress/`.
- Node.js 14+ is required; use `npm ci` to reproduce the exact dependency graph pinned by `package-lock.json`.

## Build and Test Commands
- `npm ci` — install dependencies (prefer over `npm install` for deterministic builds).
- `npm run start` — launch Angular in watch mode for rapid iteration.
- `npm run build:dev` / `npm run build:prod` — emit renderer bundles for development or production.
- `npm run dist` — produce distribution-ready Electron packages (runs Angular build first).
- `npm run test` — Karma/Jasmine unit tests with coverage; artifacts stored under `coverage/`.
- `npm run e2e` — Cypress end-to-end suite (ensure Electron app is built first when running headlessly).
- `npm run lint` — ESLint checks via the Angular CLI integration.

## Code Style Guidelines
- Favor SOLID, OO design: keep services small, inject dependencies, and isolate side effects behind interfaces in `src/app/core/` or feature-level service folders.
- Enforce DRY and lean code: reuse existing utilities and models, refactor duplicated 3D math or OpenDRIVE parsing into shared helpers, and delete dead code promptly.
- Follow Angular conventions: use `PascalCase` for components, colocate templates/styles, and prefer `OnPush` change detection when feasible.
- Keep TypeScript strict: respect existing ESLint rules, favor explicit types for public APIs, and document complex geometric transformations inline with concise comments.
- Ensure new modules export via an `index.ts` barrel only when it improves clarity; avoid broad re-exports that obscure ownership.

## Testing Instructions
- Write unit tests alongside the code under `*.spec.ts`; mock heavy Three.js dependencies using existing test utilities in `src/testing/`.
- For geometry or lane-model changes, add regression scenarios using fixtures in `src/assets/open-drive/` or snapshot expectations in Cypress to prevent visual regressions.
- Use `npm run test -- --watch` during development; ensure CI stability with `npm run test-headless` before submitting changes.
- When altering Electron main-process logic (`main.js`, `preload.js`), add integration smoke tests or manual checklists since automation coverage is lighter there.
- Track coverage deltas; raise thresholds cautiously and prefer meaningful assertions over superficial coverage.

## Security Considerations
- Never commit credentials or tokens; rely on environment variables loaded at runtime by Electron (see `electron-builder.json` for publish config).
- Validate all OpenDRIVE imports: sanitize user-supplied file paths and guard against malformed geometry to prevent crashes or memory pressure.
- Keep dependencies current within the Angular/Electron compatibility window; document any required pinning in `agents.md`.
- Review IPC bridges in `preload.js` to ensure only explicit, typed channels are exposed to the renderer, and prefer request/response patterns over unbounded event streams.
- Sentry integrations (`sentry-cli`) require release version alignment; verify `npm_package_version` before uploading source maps.

## Operational Checklist
- Before opening a PR, run `npm run lint`, `npm run test-headless`, and, for release-affecting changes, `npm run build:prod`.
- Document new commands or scripts here so the next agent inherits the latest workflow knowledge.
- Coordinate with product owners on large refactors; sequence them into small, reviewable slices that maintain SOLID boundaries and keep the codebase lean.
