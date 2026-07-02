# PR Quality Gate — Design

Date: 2026-06-28
Branch: `feature/ci-quality-gate` (based on `feature/structure-projet`)

## Context

The repository has no lint configuration (despite `eslint` being a frontend
dependency), no CI pipeline, no code-quality gate, and no automated tests.
This spec defines a quality gate that runs on every pull request targeting
`feature/structure-projet`.

**Prerequisite:** the four pending feature branches (`feature/project-setup`,
`feature/domain-refactor`, `feature/news`, `feature/frontend-init`) must be
merged into `feature/structure-projet` before implementation starts — they
populate `backEnd/package.json` and `frontEnd/package.json`, which this work
depends on.

## Goals

- Every PR into `feature/structure-projet` is automatically checked for:
  lint errors, formatting violations, type errors, architectural layering
  violations, code smells/duplication (SonarCloud), a frontend smoke test
  (Cypress), and known security vulnerabilities (CodeQL + Dependabot).
- Checks run in parallel where independent, to keep PR feedback fast.
- Manual account/secret setup (SonarCloud, branch protection rules) is
  called out explicitly rather than assumed done.

## Non-goals

- No comprehensive Cypress test suite — the frontend has almost no pages
  yet, so this round adds scaffolding plus one smoke test only.
- No coverage-based Sonar gating — no test suite produces coverage data yet.
- No auto-merge or auto-fix in CI — formatting/lint fixes stay a local
  developer action (`npm run format`).

## Components

### 1. Lint & Format

**Backend** (`backEnd/`):
- `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`,
  `recommended` ruleset.
- `eslint-plugin-boundaries` configured so `src/domain/**` cannot import
  from `src/infrastructure/**` or `src/use-cases/**` — enforces the
  existing DDD layering (e.g. `domain/interfaces/IEducationRepository.ts`
  must not import a TypeORM entity from `infrastructure/entities`).
- New file: `backEnd/.eslintrc.json`.

**Frontend** (`frontEnd/`):
- Extends existing `eslint-config-next` dependency with
  `@typescript-eslint/recommended`.
- New file: `frontEnd/.eslintrc.json`.

**Formatting:**
- One shared `.prettierrc` at repo root.
- `eslint-config-prettier` in both ESLint configs, to disable rules that
  conflict with Prettier.
- CI runs `prettier --check` (fails on unformatted code); does not auto-fix.

**New package.json scripts** (both packages): `lint`, `format`,
`format:check`.

### 2. CI Pipeline (GitHub Actions)

New file: `.github/workflows/pr-quality-gate.yml`.

- Trigger: `pull_request` targeting `feature/structure-projet` only.
- Jobs (parallel except where noted):
  - `lint-backend`, `lint-frontend` — `npm ci`, `npm run lint`,
    `npm run format:check`
  - `typecheck-backend`, `typecheck-frontend` — `tsc --noEmit`
  - `sonarcloud` — runs after lint/typecheck jobs succeed; uses
    `SonarSource/sonarcloud-github-action`; reads `SONAR_TOKEN` from repo
    secrets
  - `e2e` — installs Cypress, builds and starts the frontend, runs
    `cypress run` against it
- `codeql` runs as a **separate** workflow (different trigger semantics),
  see Security section.
- Required status checks on the branch protection rule for
  `feature/structure-projet` must be configured manually in GitHub repo
  settings (not something this spec automates).

### 3. SonarCloud

- New file: `sonar-project.properties` at repo root. Source roots:
  `backEnd/src`, `frontEnd/src`. Exclusions: `node_modules`, `dist`,
  `.next`, `next-env.d.ts`, test/spec files.
- No coverage upload wired in yet (no test suite produces coverage).
- **Manual steps required (not automatable from this repo):**
  1. Create a SonarCloud account and link this GitHub repository.
  2. Generate a project token.
  3. Add it as a repository secret named `SONAR_TOKEN`.

### 4. Cypress (scaffold only)

- New directory: `frontEnd/cypress/`.
- `frontEnd/cypress.config.ts` pointing at `http://localhost:3000`.
- One spec: `frontEnd/cypress/e2e/smoke.cy.ts` — visits `/`, asserts the
  page renders without error.
- CI `e2e` job: `npm run build && npm run start &`, then `cypress run`.
- No backend API tests — there is currently no HTTP route layer in the
  backend (only domain models), so there's nothing meaningful to hit yet.

### 5. Security Scanning

- New file: `.github/workflows/codeql.yml` — CodeQL analysis for
  JavaScript/TypeScript across `backEnd/` and `frontEnd/`. Triggers: PRs
  into `feature/structure-projet`, plus a weekly schedule.
- New file: `.github/dependabot.yml` — two `npm` ecosystems
  (`/backEnd`, `/frontEnd`), weekly check, opens PRs automatically against
  `feature/structure-projet`. No auto-merge; PRs are reviewed manually.

## Sequencing

1. Merge the 4 pending feature branches into `feature/structure-projet`
   (user-driven, outside this spec).
2. Branch `feature/ci-quality-gate` off the updated
   `feature/structure-projet`.
3. Add lint/Prettier configs to both packages; fix any violations surfaced
   on existing code.
4. Add the GitHub Actions workflow, Sonar config, Cypress scaffold,
   CodeQL workflow, and Dependabot config.
5. User creates the SonarCloud account/project and adds `SONAR_TOKEN`.
6. User configures branch protection rules requiring the new status
   checks before merge.

## Open manual steps (cannot be automated by Claude)

- SonarCloud account creation, repo linking, token generation.
- Adding `SONAR_TOKEN` as a GitHub repository secret.
- Configuring branch protection / required status checks in GitHub repo
  settings.
