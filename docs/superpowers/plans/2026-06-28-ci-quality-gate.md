# PR Quality Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a GitHub Actions quality gate that runs on every PR into `feature/structure-projet`, checking lint, formatting, type errors, architectural layering, SonarCloud code quality, a Cypress smoke test, and security (CodeQL + Dependabot).

**Architecture:** Two independent ESLint setups (backend, frontend) sharing one root Prettier config, wired into one parallelized GitHub Actions workflow (`pr-quality-gate.yml`). SonarCloud and Cypress are added as additional jobs in that same workflow once their underlying config exists. CodeQL and Dependabot are separate, self-contained GitHub-native config files.

**Tech Stack:** ESLint 8 (legacy `.eslintrc.json`, not flat config — matches frontend's existing `eslint@^8.57.0`), `@typescript-eslint`, `eslint-plugin-boundaries`, Prettier, GitHub Actions, SonarCloud, Cypress.

## Global Constraints

- CI triggers only on `pull_request` events targeting `feature/structure-projet` (spec §2).
- ESLint stays on v8 / legacy config format — frontend already depends on `eslint@^8.57.0` and `eslint-config-next@^14.2.3`, which do not support ESLint 9 flat config.
- No coverage-based Sonar gating — no test suite produces coverage data yet (spec, Non-goals).
- No auto-merge or auto-fix in CI — formatting/lint fixes stay a local developer action via `npm run format` (spec, Non-goals).
- Cypress: scaffold + one smoke test only, no comprehensive suite (spec, Non-goals).
- SonarCloud account creation, token generation, and GitHub branch-protection rules are manual steps for the user — do not attempt to automate them (spec, Open manual steps).

---

## Precondition Check

**Before starting Task 1**, verify the four prerequisite branches have been merged into `feature/structure-projet`:

```bash
git checkout feature/structure-projet && git pull
cat backEnd/package.json
cat frontEnd/package.json
```

Expected: both files print real JSON (name, scripts, dependencies) — not empty. If either is empty, **stop** — the merges described in the spec's Prerequisite section have not landed yet. Do not proceed; tell the user to complete the merges first.

Once confirmed, create the working branch:

```bash
git checkout -b feature/ci-quality-gate
```

(If `feature/ci-quality-gate` already exists locally from earlier work, run `git checkout feature/ci-quality-gate && git merge feature/structure-projet` instead, resolving any conflicts before continuing.)

---

### Task 1: Shared Prettier config

**Files:**
- Create: `.prettierrc.json`
- Create: `.prettierignore`

**Interfaces:**
- Produces: a root Prettier config that Tasks 2 and 3 reference via `eslint-config-prettier` and `prettier --check`.

- [ ] **Step 1: Create the Prettier config**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```
Save as `.prettierrc.json` at the repo root.

- [ ] **Step 2: Create the ignore file**

```
node_modules
dist
.next
coverage
*.tsbuildinfo
package-lock.json
backEnd/uploads
```
Save as `.prettierignore` at the repo root.

- [ ] **Step 3: Verify it loads**

Run: `npx --yes prettier@3 --check .prettierrc.json`
Expected: `Checking formatting...` then `All matched files use Prettier code style!` (the file itself is valid JSON Prettier can parse).

- [ ] **Step 4: Commit**

```bash
git add .prettierrc.json .prettierignore
git commit -m "Add shared Prettier config"
```

---

### Task 2: Backend ESLint + boundaries + Prettier integration

**Files:**
- Modify: `backEnd/package.json`
- Create: `backEnd/.eslintrc.json`
- Create: `backEnd/.eslintignore`

**Interfaces:**
- Consumes: `.prettierrc.json` (Task 1).
- Produces: `npm run lint`, `npm run format`, `npm run format:check` scripts in `backEnd/package.json`, consumed by Task 4's `lint-backend` / `typecheck-backend` jobs.

- [ ] **Step 1: Add devDependencies**

Open `backEnd/package.json`. In `devDependencies`, add these four entries (keep all existing ones — `@types/express`, `ts-node`, `nodemon`, etc. — untouched):

```json
"@typescript-eslint/eslint-plugin": "^7.18.0",
"@typescript-eslint/parser": "^7.18.0",
"eslint": "^8.57.0",
"eslint-config-prettier": "^9.1.0",
"eslint-plugin-boundaries": "^4.2.2",
"prettier": "^3.3.3"
```

- [ ] **Step 2: Add scripts**

In `backEnd/package.json`, in `scripts`, add (keep existing `dev`, `build`, `start`, `typeorm`, `migration:*` scripts untouched):

```json
"lint": "eslint \"src/**/*.ts\"",
"format": "prettier --write \"src/**/*.ts\"",
"format:check": "prettier --check \"src/**/*.ts\""
```

- [ ] **Step 3: Un-ignore the backend lockfile**

`backEnd/.gitignore` currently has a line `package-lock.json`, which prevents the lockfile from ever being committed. Task 4's CI job needs `backEnd/package-lock.json` committed so `npm ci` and the Actions npm cache (`cache-dependency-path: backEnd/package-lock.json`) work on a fresh checkout. Open `backEnd/.gitignore` and delete the `package-lock.json` line (keep `yarn.lock` ignored — this project uses npm).

- [ ] **Step 4: Install dependencies**

Run: `cd backEnd && npm install`
Expected: install completes with no errors, `backEnd/package-lock.json` is created/updated.

- [ ] **Step 5: Create the ESLint config with layer-boundary rules**

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2020,
    "sourceType": "module"
  },
  "plugins": ["@typescript-eslint", "boundaries"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "settings": {
    "boundaries/elements": [
      { "type": "domain", "pattern": "src/domain/**" },
      { "type": "infrastructure", "pattern": "src/infrastructure/**" },
      { "type": "config", "pattern": "src/config/**" }
    ]
  },
  "rules": {
    "boundaries/element-types": [
      "error",
      {
        "default": "allow",
        "rules": [
          {
            "from": "domain",
            "disallow": ["infrastructure"],
            "message": "src/domain/** must not import from src/infrastructure/** — domain code cannot depend on infrastructure details."
          }
        ]
      }
    ]
  }
}
```
Save as `backEnd/.eslintrc.json`.

- [ ] **Step 6: Create the ESLint ignore file**

```
dist
node_modules
uploads
```
Save as `backEnd/.eslintignore`.

- [ ] **Step 7: Run lint and fix any violations on existing code**

Run: `cd backEnd && npm run lint`

If this reports errors in existing files (e.g. unused imports, implicit `any`), open each flagged file and fix it directly per the rule message shown (remove the unused import, add the missing type, etc.) — these are real, existing issues the new config surfaces, not something to suppress. Re-run `npm run lint` after each fix until it exits with no errors.

Expected after fixes: `npm run lint` exits 0 with no output (or only warnings if any rules were configured as `"warn"` — none are in this config, so expect a clean pass).

- [ ] **Step 8: Verify the boundaries rule actually catches a violation**

Temporarily add this line to the top of `backEnd/src/domain/models/News.ts`:
```typescript
import { NewsEntity } from '../../infrastructure/entities/NewsEntity';
```
Run: `cd backEnd && npm run lint`
Expected: an error mentioning `boundaries/element-types` and the message "domain code cannot depend on infrastructure details."

Then remove that line from `backEnd/src/domain/models/News.ts` and run `npm run lint` again.
Expected: clean pass, confirming the temporary edit didn't leave a stray diff. Run `git diff backEnd/src/domain/models/News.ts` — expected: no output.

- [ ] **Step 9: Run format check**

Run: `cd backEnd && npm run format:check`
If it reports unformatted files, run `npm run format` to fix them, then re-run `format:check` to confirm it passes clean.

- [ ] **Step 10: Commit**

```bash
git add backEnd/package.json backEnd/package-lock.json backEnd/.eslintrc.json backEnd/.eslintignore
git commit -m "Add backend ESLint config with domain/infrastructure boundary rule"
```
(If Step 7 or 9 required fixes to existing files, commit those separately first: `git add -u backEnd/src && git commit -m "Fix lint/format violations surfaced by new ESLint config"`.)

---

### Task 3: Frontend ESLint + Prettier integration

**Files:**
- Modify: `frontEnd/package.json`
- Create: `frontEnd/.eslintrc.json`

**Interfaces:**
- Consumes: `.prettierrc.json` (Task 1).
- Produces: `npm run lint` (already exists as `next lint`, stays as-is), `npm run format`, `npm run format:check` scripts in `frontEnd/package.json`, consumed by Task 4's `lint-frontend` / `typecheck-frontend` jobs.

- [ ] **Step 1: Add devDependencies**

Open `frontEnd/package.json`. In `devDependencies`, add (keep `@types/node`, `@types/react`, `@types/react-dom`, `typescript`, `eslint`, `eslint-config-next` untouched):

```json
"@typescript-eslint/eslint-plugin": "^7.18.0",
"@typescript-eslint/parser": "^7.18.0",
"eslint-config-prettier": "^9.1.0",
"prettier": "^3.3.3"
```

- [ ] **Step 2: Add format scripts**

In `frontEnd/package.json`, in `scripts`, add (keep `dev`, `build`, `start`, `lint` untouched):

```json
"format": "prettier --write \"src/**/*.{ts,tsx}\"",
"format:check": "prettier --check \"src/**/*.{ts,tsx}\""
```

- [ ] **Step 3: Install dependencies**

Run: `cd frontEnd && npm install`
Expected: install completes with no errors.

- [ ] **Step 4: Create the ESLint config**

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser"
}
```
Save as `frontEnd/.eslintrc.json`.

- [ ] **Step 5: Run lint and fix any violations on existing code**

Run: `cd frontEnd && npm run lint`

If errors appear in existing files (`src/app/page.tsx`, the `(admin)` and `(public)` route files, `layout.tsx`), fix each directly per the rule message. Re-run until clean.

Expected: `npm run lint` exits with "No ESLint warnings or errors" (Next's lint runner prints this on success).

- [ ] **Step 6: Run format check**

Run: `cd frontEnd && npm run format:check`
If unformatted files are reported, run `npm run format`, then re-run `format:check` to confirm a clean pass.

- [ ] **Step 7: Commit**

```bash
git add frontEnd/package.json frontEnd/package-lock.json frontEnd/.eslintrc.json
git commit -m "Add frontend ESLint config and Prettier integration"
```
(If Step 5 or 6 required fixes to existing files, commit those separately first: `git add -u frontEnd/src && git commit -m "Fix lint/format violations surfaced by new ESLint config"`.)

---

### Task 4: GitHub Actions workflow — lint and typecheck jobs

**Files:**
- Create: `.github/workflows/pr-quality-gate.yml`

**Interfaces:**
- Consumes: `npm run lint`, `npm run format:check` from `backEnd/package.json` (Task 2) and `frontEnd/package.json` (Task 3).
- Produces: a `jobs:` block in `pr-quality-gate.yml` that Tasks 5 and 6 append to (the `sonarcloud` and `e2e` jobs).

- [ ] **Step 1: Create the workflow file**

```yaml
name: PR Quality Gate

on:
  pull_request:
    branches: [feature/structure-projet]

jobs:
  lint-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backEnd/package-lock.json
      - run: npm ci
        working-directory: backEnd
      - run: npm run lint
        working-directory: backEnd
      - run: npm run format:check
        working-directory: backEnd

  lint-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontEnd/package-lock.json
      - run: npm ci
        working-directory: frontEnd
      - run: npm run lint
        working-directory: frontEnd
      - run: npm run format:check
        working-directory: frontEnd

  typecheck-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backEnd/package-lock.json
      - run: npm ci
        working-directory: backEnd
      - run: npx tsc --noEmit
        working-directory: backEnd

  typecheck-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontEnd/package-lock.json
      - run: npm ci
        working-directory: frontEnd
      - run: npx tsc --noEmit
        working-directory: frontEnd
```
Save as `.github/workflows/pr-quality-gate.yml`.

- [ ] **Step 2: Validate YAML syntax**

Run: `ruby -ryaml -e "YAML.load_file('.github/workflows/pr-quality-gate.yml'); puts 'valid'"`
Expected: `valid`

- [ ] **Step 3: Mirror the jobs locally to confirm they'd pass**

Run:
```bash
cd backEnd && npm run lint && npm run format:check && npx tsc --noEmit && cd ..
cd frontEnd && npm run lint && npm run format:check && npx tsc --noEmit && cd ..
```
Expected: all four commands exit 0. This is the same thing the four CI jobs will run — confirming it locally now avoids discovering a broken job only after opening a PR.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/pr-quality-gate.yml
git commit -m "Add PR quality gate workflow with lint and typecheck jobs"
```

---

### Task 5: SonarCloud config and job

**Files:**
- Create: `sonar-project.properties`
- Modify: `.github/workflows/pr-quality-gate.yml`

**Interfaces:**
- Consumes: the `jobs:` block from Task 4 (appends a `sonarcloud` job that depends on the four existing jobs via `needs:`).

- [ ] **Step 1: Create the Sonar project config**

```properties
sonar.projectKey=REPLACE_WITH_YOUR_SONARCLOUD_PROJECT_KEY
sonar.organization=REPLACE_WITH_YOUR_SONARCLOUD_ORG
sonar.sources=backEnd/src,frontEnd/src
sonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/next-env.d.ts,**/cypress/**,**/*.cy.ts,**/*.d.ts
```
Save as `sonar-project.properties` at the repo root.

These two `REPLACE_WITH_...` values cannot be filled in until the user creates the SonarCloud account and links this repo (spec, Open manual steps) — leave them as literal placeholders in this file; they are a required manual edit, not a code TODO.

- [ ] **Step 2: Add the sonarcloud job to the workflow**

In `.github/workflows/pr-quality-gate.yml`, under the existing `jobs:` key, add this new job (after `typecheck-frontend`):

```yaml
  sonarcloud:
    runs-on: ubuntu-latest
    needs: [lint-backend, lint-frontend, typecheck-backend, typecheck-frontend]
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

- [ ] **Step 3: Validate YAML syntax**

Run: `ruby -ryaml -e "YAML.load_file('.github/workflows/pr-quality-gate.yml'); puts 'valid'"`
Expected: `valid`

- [ ] **Step 4: Commit**

```bash
git add sonar-project.properties .github/workflows/pr-quality-gate.yml
git commit -m "Add SonarCloud config and CI job"
```

- [ ] **Step 5: Note the manual steps for the user**

This job will fail in CI until the user: (1) creates a SonarCloud account, (2) links this GitHub repo, (3) generates a project token, (4) adds it as a repository secret named `SONAR_TOKEN`, and (5) fills in the two `REPLACE_WITH_...` values in `sonar-project.properties` with the real project key and org slug SonarCloud assigns. Tell the user this explicitly when this task completes — do not attempt any of these five steps yourself.

---

### Task 6: Cypress scaffold and e2e job

**Files:**
- Modify: `frontEnd/package.json`
- Create: `frontEnd/cypress.config.ts`
- Create: `frontEnd/cypress/e2e/smoke.cy.ts`
- Create: `frontEnd/cypress/support/e2e.ts`
- Modify: `.github/workflows/pr-quality-gate.yml`

**Interfaces:**
- Consumes: the `jobs:` block from Task 4/5 (appends an `e2e` job).
- Produces: `cypress run` command, consumed by the new `e2e` CI job.

- [ ] **Step 1: Add devDependencies**

In `frontEnd/package.json`, in `devDependencies`, add:

```json
"cypress": "^13.13.0",
"wait-on": "^7.2.0"
```

- [ ] **Step 2: Add scripts**

In `frontEnd/package.json`, in `scripts`, add:

```json
"cypress:open": "cypress open",
"cypress:run": "cypress run"
```

- [ ] **Step 3: Install dependencies**

Run: `cd frontEnd && npm install`
Expected: install completes (Cypress downloads its binary on first install — this can take a minute).

- [ ] **Step 4: Create the Cypress config**

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
  },
});
```
Save as `frontEnd/cypress.config.ts`.

- [ ] **Step 5: Create the support file**

```typescript
// Cypress support file — intentionally empty for now, required by cypress.config.ts.
```
Save as `frontEnd/cypress/support/e2e.ts`.

- [ ] **Step 6: Write the smoke test**

```typescript
describe('homepage smoke test', () => {
  it('loads without error', () => {
    cy.visit('/');
    cy.get('body').should('be.visible');
  });
});
```
Save as `frontEnd/cypress/e2e/smoke.cy.ts`.

- [ ] **Step 7: Run it locally**

Run:
```bash
cd frontEnd
npm run build
npm run start &
npx wait-on http://localhost:3000
npm run cypress:run
```
Expected: Cypress reports `1 passing`. Then stop the server: `kill %1` (or find and kill the `next start` process).

- [ ] **Step 8: Add the e2e job to the workflow**

In `.github/workflows/pr-quality-gate.yml`, under `jobs:`, add this new job (after `sonarcloud`):

```yaml
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontEnd/package-lock.json
      - run: npm ci
        working-directory: frontEnd
      - run: npm run build
        working-directory: frontEnd
      - run: npm run start &
        working-directory: frontEnd
      - run: npx wait-on http://localhost:3000
        working-directory: frontEnd
      - run: npm run cypress:run
        working-directory: frontEnd
```

- [ ] **Step 9: Validate YAML syntax**

Run: `ruby -ryaml -e "YAML.load_file('.github/workflows/pr-quality-gate.yml'); puts 'valid'"`
Expected: `valid`

- [ ] **Step 10: Commit**

```bash
git add frontEnd/package.json frontEnd/package-lock.json frontEnd/cypress.config.ts frontEnd/cypress/ .github/workflows/pr-quality-gate.yml
git commit -m "Add Cypress smoke test scaffold and CI e2e job"
```

---

### Task 7: CodeQL workflow

**Files:**
- Create: `.github/workflows/codeql.yml`

**Interfaces:**
- None — fully independent of the other tasks.

- [ ] **Step 1: Create the workflow**

```yaml
name: CodeQL

on:
  pull_request:
    branches: [feature/structure-projet]
  schedule:
    - cron: '0 6 * * 1'

jobs:
  analyze:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
      actions: read
      contents: read
    strategy:
      matrix:
        language: ['javascript-typescript']
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
      - uses: github/codeql-action/analyze@v3
```
Save as `.github/workflows/codeql.yml`.

- [ ] **Step 2: Validate YAML syntax**

Run: `ruby -ryaml -e "YAML.load_file('.github/workflows/codeql.yml'); puts 'valid'"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/codeql.yml
git commit -m "Add CodeQL security scanning workflow"
```

---

### Task 8: Dependabot config

**Files:**
- Create: `.github/dependabot.yml`

**Interfaces:**
- None — fully independent of the other tasks.

- [ ] **Step 1: Create the config**

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/backEnd"
    schedule:
      interval: "weekly"
    target-branch: "feature/structure-projet"
  - package-ecosystem: "npm"
    directory: "/frontEnd"
    schedule:
      interval: "weekly"
    target-branch: "feature/structure-projet"
```
Save as `.github/dependabot.yml`.

- [ ] **Step 2: Validate YAML syntax**

Run: `ruby -ryaml -e "YAML.load_file('.github/dependabot.yml'); puts 'valid'"`
Expected: `valid`

- [ ] **Step 3: Commit**

```bash
git add .github/dependabot.yml
git commit -m "Add Dependabot config for backend and frontend npm dependencies"
```

---

## After all tasks: remaining manual steps for the user

These cannot be done by an agent and must be done by the user before the gate is fully active:

1. Push `feature/ci-quality-gate` and open a PR into `feature/structure-projet` — this is the first real run of the workflow, and will likely surface issues the local "mirror" steps in Task 4 didn't catch (e.g. Node version mismatches, GitHub Actions cache quirks).
2. Create a SonarCloud account, link this GitHub repo, generate a project token, add it as the `SONAR_TOKEN` repository secret, and fill in the real `sonar.projectKey` / `sonar.organization` values in `sonar-project.properties`.
3. In GitHub repo Settings → Branches, add a branch protection rule for `feature/structure-projet` requiring the new status checks (`lint-backend`, `lint-frontend`, `typecheck-backend`, `typecheck-frontend`, `sonarcloud`, `e2e`) to pass before merging.
