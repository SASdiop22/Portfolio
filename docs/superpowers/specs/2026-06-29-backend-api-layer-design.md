# Backend API Layer — Design

Date: 2026-06-29
Branch: `feature/backend-api` (created at plan/implementation time, based on `feature/structure-projet` once `feature/ci-quality-gate` has merged)

## Context

The backend has a complete domain layer (models, repository interfaces, TypeORM entities) for 11 resources — Education, Experience, Project, Skill, SocialLink, Strength, Interest, Language, User, ContactMessage, News — but no HTTP API: `use-cases/`, `infrastructure/controllers/`, `infrastructure/routes/`, `infrastructure/repositories/`, `infrastructure/dto/`, `infrastructure/validators/`, and `infrastructure/middlewares/` are all empty directories. The frontend cannot do anything real without this layer.

This spec defines the full API slice for all 11 resources in one pass, since they share one architecture (not 11 independent designs) — only the per-resource field/query specifics differ.

## Goals

- Every resource gets a working REST API: repository implementation, use-cases, DTOs/validation, controller, route.
- Public/admin access direction matches the project spec (see `[[project-spec]]` in memory): most resources are public-read + admin-write; `User` is public-GET-profile + admin-PATCH (single record, no create/delete/list); `ContactMessage` is public-POST (contact form) + admin-read/markAsRead/delete.
- Real JWT auth protects every admin write route.
- Shared, reusable infrastructure (`BaseRepository`, exceptions, middlewares) avoids duplicating CRUD boilerplate 11 times.
- Use-cases get unit test coverage (Jest, added fresh — no test framework exists yet).

## Non-goals

- No frontend work.
- No file uploads (User photo, project images, CV) — `multer` is a dependency but wiring it up is a separate follow-up.
- No DB migrations — `synchronize: true` (dev-only) continues to handle schema for now.
- No integration/DB-backed tests for repositories or controllers — only use-cases get unit tests (mocked repositories), since standing up a test database is out of scope for this pass.
- No public user registration — the single admin account is created via a one-time seed script, not an API endpoint.

## Components

### 1. Shared infrastructure (written once, used by all 11 resources)

**`BaseRepository<TModel, TEntity>`** (`backEnd/src/infrastructure/repositories/BaseRepository.ts`): abstract class wrapping a TypeORM `Repository<TEntity>`. Provides `findAll()`, `findById(id)`, `create(data)`, `update(id, data)`, `delete(id)`. Each concrete subclass implements an abstract `toModel(entity: TEntity): TModel` mapping method and adds its own interface-specific methods (`findByOrder`, `findCurrent`, `findFeatured`, `findByCategory`, `findAllCategories`, `findRecent`, `findUnread`, `markAsRead`, `findByEmail`) using `this.repository` (TypeORM `find`/`findOne` with `where`/`order`, or `createQueryBuilder` where needed).

**Exceptions** (`backEnd/src/shared/exceptions/`): `AppException` (base, carries an HTTP status code and message) and three subclasses — `NotFoundException` (404), `ValidationException` (400, carries field-level error details), `UnauthorizedException` (401). Use-cases and middlewares throw these; nothing else in the codebase constructs an HTTP status directly.

**Error middleware** (`backEnd/src/infrastructure/middlewares/error.middleware.ts`): replaces the inline 500-handler in `server.ts`. Catches `AppException` subclasses and responds `{ success: false, message, ...details }` with the exception's status code; unrecognized errors fall back to a generic 500 with the existing dev-only stack trace behavior already in `server.ts`.

**Validation middleware** (`backEnd/src/infrastructure/middlewares/validate.middleware.ts`): a factory `validate(DtoClass)` returning Express middleware that runs `plainToInstance(DtoClass, req.body)` + `class-validator`'s `validate()`, throwing `ValidationException` with the validation errors on failure, otherwise calling `next()`. Controllers never validate manually.

**Auth middleware** (`backEnd/src/infrastructure/middlewares/auth.middleware.ts`): reads `Authorization: Bearer <token>`, verifies with `jsonwebtoken.verify` against `envConfig.jwt.secret`, attaches `{ userId, email }` to `req.user`, throws `UnauthorizedException` on missing/invalid/expired token. Applied per-route to every admin write route — not globally.

### 2. Auth

- `POST /api/v1/auth/login` (public): `{ email, password }` → looks up the user via `IUserRepository.findByEmail`, compares with `bcryptjs.compare`, returns `{ token, user: { id, email, firstName, lastName } }` on success. Throws `UnauthorizedException` on any failure (wrong email or wrong password get the same generic message — no information leak about which one was wrong).
- Implemented as its own use-case (`LoginUseCase`) + controller (`AuthController`) + route (`auth.routes.ts`), following the same use-case/controller/route shape as every other resource, just without a repository-backed CRUD set.

### 3. Seed script

`backEnd/src/infrastructure/database/seeders/admin-user.seed.ts`: standalone script (run via a new `npm run seed:admin` script, not part of `server.ts` startup), reading the admin's email/password from environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD` — new entries in `.env`/`.env.example`), hashing the password with `bcryptjs.hash`, and inserting the one `UserEntity` row via `AppDataSource`. Run once manually against the real DB; safe to re-run (checks if a user with that email already exists first, no-ops if so).

### 4. Per-resource API (repeated identically 11 times, only the specifics below vary)

For each resource, four new files plus one repository file:

```
infrastructure/repositories/<Resource>Repository.ts   (extends BaseRepository, implements I<Resource>Repository)
infrastructure/dto/<resource>/Create<Resource>Dto.ts
infrastructure/dto/<resource>/Update<Resource>Dto.ts
infrastructure/controllers/<Resource>Controller.ts
infrastructure/routes/<resource>.routes.ts
use-cases/<resource>/List<Resource>UseCase.ts
use-cases/<resource>/Get<Resource>UseCase.ts
use-cases/<resource>/Create<Resource>UseCase.ts
use-cases/<resource>/Update<Resource>UseCase.ts
use-cases/<resource>/Delete<Resource>UseCase.ts
```

(User and ContactMessage omit the use-cases/routes that don't apply to them — no `CreateUserUseCase`/`DeleteUserUseCase`/`ListUserUseCase`, no `CreateContactMessageController` admin route, etc. — per the access table below.)

**Route table** (all under `envConfig.apiPrefix`, i.e. `/api/v1`; 🔓 = public, 🔒 = `authMiddleware`):

| Resource | Public | Admin |
|---|---|---|
| Education | 🔓 `GET /education` (ordered), `GET /education/current`, `GET /education/:id` | 🔒 `POST /education`, `PUT /education/:id`, `DELETE /education/:id` |
| Experience | 🔓 `GET /experience`, `GET /experience/current`, `GET /experience/:id` | 🔒 `POST /experience`, `PUT /experience/:id`, `DELETE /experience/:id` |
| Project | 🔓 `GET /projects`, `GET /projects?featured=true`, `GET /projects/:id` | 🔒 `POST /projects`, `PUT /projects/:id`, `DELETE /projects/:id` |
| Skill | 🔓 `GET /skills`, `GET /skills/categories`, `GET /skills?category=x`, `GET /skills/:id` | 🔒 `POST /skills`, `PUT /skills/:id`, `DELETE /skills/:id` |
| SocialLink | 🔓 `GET /social-links`, `GET /social-links/:id` | 🔒 `POST /social-links`, `PUT /social-links/:id`, `DELETE /social-links/:id` |
| Strength | 🔓 `GET /strengths`, `GET /strengths/:id` | 🔒 `POST /strengths`, `PUT /strengths/:id`, `DELETE /strengths/:id` |
| Interest | 🔓 `GET /interests`, `GET /interests/:id` | 🔒 `POST /interests`, `PUT /interests/:id`, `DELETE /interests/:id` |
| Language | 🔓 `GET /languages`, `GET /languages/:id` | 🔒 `POST /languages`, `PUT /languages/:id`, `DELETE /languages/:id` |
| News | 🔓 `GET /news`, `GET /news?category=x`, `GET /news/recent?limit=n`, `GET /news/:id` | 🔒 `POST /news`, `PUT /news/:id`, `DELETE /news/:id` |
| User | 🔓 `GET /users/profile` | 🔒 `PUT /users/profile` |
| ContactMessage | 🔓 `POST /contact-messages` | 🔒 `GET /contact-messages`, `PATCH /contact-messages/:id/read`, `DELETE /contact-messages/:id` |
| Auth | 🔓 `POST /auth/login` | — |

All `*.routes.ts` files are mounted in a new aggregator, `backEnd/src/infrastructure/routes/index.ts`, which `server.ts` imports and mounts once at `envConfig.apiPrefix` (replacing the commented-out `// TODO: Ajouter les routes API ici` placeholder already in `server.ts`).

### 5. Testing

Jest + `ts-jest` added to `backEnd/package.json` (`npm test` script added — this is also what closes the gap noted in the CI quality-gate follow-ups, since the CI typecheck job doesn't run any tests today). Each use-case gets a unit test constructed with a mocked repository (jest mock implementing the relevant `I<Resource>Repository` interface) — e.g. `CreateEducationUseCase.test.ts` asserts the use-case calls `repository.create` with the right shape and returns its result; `DeleteEducationUseCase.test.ts` asserts it throws `NotFoundException` when the repository returns null. `LoginUseCase` gets the same treatment with a mocked `IUserRepository` and mocked `bcryptjs.compare`. No DB-backed or HTTP-level tests in this pass.

## Sequencing

1. Shared infrastructure first: `BaseRepository`, exceptions, the three middlewares, Jest setup — nothing resource-specific depends on anything resource-specific yet.
2. Auth (login use-case/controller/route + auth middleware wiring) + the admin seed script — needed before any admin route can be meaningfully tested end-to-end.
3. The 11 resources, each as its own self-contained batch (repository → use-cases → DTOs → controller → route → tests), in the order listed in the route table above (simplest shape first: Education, Experience, ... down to ContactMessage last, since it's the most structurally different).
4. Routes aggregator + `server.ts` wiring, once at least one resource's routes exist (could happen incrementally — each resource's routes file gets added to the aggregator as it's built, rather than all at the end).

## Open items deferred to follow-up work

- File uploads (User photo, Project images/screenshots, CV).
- DB migrations (currently relying on `synchronize: true`).
- DB-backed/integration tests, and wiring `npm test` into the CI quality-gate workflow's job list.
- Frontend integration (this spec is backend-only).
