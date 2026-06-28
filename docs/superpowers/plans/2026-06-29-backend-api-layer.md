# Backend API Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full HTTP API for all 11 backend resources (Education, Experience, Project, Skill, SocialLink, Strength, Interest, Language, User, ContactMessage, News) plus JWT auth and a User photo upload endpoint.

**Architecture:** Each resource gets a repository implementation (extending a shared `BaseRepository`), use-cases (one class per action), DTOs validated via `class-validator`, a controller, and a route — wired through shared exceptions and an error middleware. JWT auth protects admin write routes via a per-route `authMiddleware`.

**Tech Stack:** Express, TypeORM, `class-validator`/`class-transformer`, `jsonwebtoken`, `bcryptjs`, `multer`, Jest + `ts-jest` (added in Task 2).

## Global Constraints

- All routes mount under `envConfig.apiPrefix` (`/api/v1`).
- Public/admin access direction per resource (from the spec): most resources are public-read (`GET`) + admin-write (`POST`/`PUT`/`DELETE`); `User` is public-`GET /users/profile` + admin-`PUT /users/profile` + admin-`POST /users/photo` (no create/delete/list — single record); `ContactMessage` is public-`POST /contact-messages` (no auth) + admin-`GET`/`PATCH .../read`/`DELETE` (no public read).
- No DB migrations — `synchronize: true` (dev-only, already configured in `backEnd/src/infrastructure/database/config/data-source.ts`) handles schema.
- No DB-backed/integration tests — only use-cases get unit tests, with the repository mocked.
- No public user registration — the one admin user is created via a seed script (Task 9), not an API endpoint.
- Follow the codebase's existing import convention: relative imports (`../models/Education`), not the `@domain/*`/`@infrastructure/*` TypeScript path aliases defined in `tsconfig.json` — the codebase already hit a real bug from barrel-file aliasing earlier and moved away from it.
- Response envelope for errors matches what's already in `backEnd/src/server.ts`: `{ success: false, message, ... }`.

---

### Task 1: Fix domain model field gaps

**Files:**
- Modify: `backEnd/src/domain/models/Project.ts`
- Modify: `backEnd/src/domain/models/Skill.ts`
- Modify: `backEnd/src/domain/models/Education.ts`
- Modify: `backEnd/src/domain/models/Experience.ts`
- Modify: `backEnd/src/domain/models/SocialLink.ts`
- Modify: `backEnd/src/domain/models/Interest.ts`
- Modify: `backEnd/src/domain/models/Language.ts`
- Modify: `backEnd/src/domain/models/News.ts`

**Interfaces:**
- Produces: the exact model shapes every later task's DTOs, repository `toModel()` mappings, and use-case tests are written against. Get this task's field lists right — everything downstream copies them.

`ProjectEntity` already has a `technologies!: string[]` column and `SkillEntity` already has `level?: number`/`icon?: string` columns, but their domain models don't expose these fields — the spec requires Project's "technologies utilisées" and Skill's proficiency level, so the API can't satisfy the spec without this fix. Separately, every entity except `ContactMessageEntity` has an `@UpdateDateColumn() updatedAt`, but only `StrengthModel` exposes it on the model side — adding it everywhere lets admin UIs show a real "last modified" time.

- [ ] **Step 1: Update `ProjectModel`**

```typescript
export class ProjectModel {
    public id: string;
    public title: string;
    public description: string;
    public longDescription: string;
    public technologies: string[];
    public imageUrl: string;
    public demoUrl: string;
    public githubUrl: string;
    public featured: boolean;
    public order: number;
    public createdAt: Date;
    public updatedAt: Date;
}
```

- [ ] **Step 2: Update `SkillModel`**

```typescript
export class SkillModel {
    public id: string;
    public title: string;
    public category: string;
    public level: number;
    public icon: string;
    public order: number;
    public createdAt: Date;
    public updatedAt: Date;
}
```

- [ ] **Step 3: Add `updatedAt` to the remaining models**

`backEnd/src/domain/models/Education.ts`:
```typescript
export class EducationModel {
    public id: string;
    public institution: string;
    public city: string;
    public title: string;
    public specialization: string;
    public description: string;
    public startDate: Date;
    public endDate: Date;
    public current: boolean;
    public order: number;
    public createdAt: Date;
    public updatedAt: Date;
}
```

`backEnd/src/domain/models/Experience.ts`:
```typescript
export class ExperienceModel {
    public id: string;
    public company: string;
    public position: string;
    public city: string;
    public title: string;
    public description: string;
    public startDate: Date;
    public endDate: Date;
    public current: boolean;
    public link: string;
    public order: number;
    public createdAt: Date;
    public updatedAt: Date;
}
```

`backEnd/src/domain/models/SocialLink.ts`:
```typescript
export class SocialLinkModel {
    public id: string;
    public platform: string;
    public url: string;
    public logo: string;
    public order: number;
    public createdAt: Date;
    public updatedAt: Date;
}
```

`backEnd/src/domain/models/Interest.ts`:
```typescript
export class InterestModel {
    public id: string;
    public title: string;
    public description: string;
    public order: number;
    public createdAt: Date;
    public updatedAt: Date;
}
```

`backEnd/src/domain/models/Language.ts`:
```typescript
export class LanguageModel {
    public id: string;
    public title: string;
    public level: string;
    public order: number;
    public createdAt: Date;
    public updatedAt: Date;
}
```

`backEnd/src/domain/models/News.ts`:
```typescript
export class NewsModel {
    public id: string;
    public title: string;
    public content: string;
    public summary: string;
    public category: string;
    public imageUrl: string;
    public publishedAt: Date;
    public order: number;
    public createdAt: Date;
    public updatedAt: Date;
}
```

- [ ] **Step 4: Verify it compiles**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors (these are additive field changes; nothing currently constructs these models with required fields missing, since TypeScript classes here use public fields with no constructor — adding fields can't break existing call sites).

- [ ] **Step 5: Commit**

```bash
git add backEnd/src/domain/models/Project.ts backEnd/src/domain/models/Skill.ts backEnd/src/domain/models/Education.ts backEnd/src/domain/models/Experience.ts backEnd/src/domain/models/SocialLink.ts backEnd/src/domain/models/Interest.ts backEnd/src/domain/models/Language.ts backEnd/src/domain/models/News.ts
git commit -m "Add missing fields to domain models (technologies, level, icon, updatedAt)"
```

---

### Task 2: Jest test setup

**Files:**
- Modify: `backEnd/package.json`
- Create: `backEnd/jest.config.js`
- Create: `backEnd/src/domain/models/Education.test.ts` (throwaway smoke test, deleted at the end of this task)

**Interfaces:**
- Produces: `npm test` script; every later task's `*.test.ts` files run under this config.

- [ ] **Step 1: Add devDependencies**

In `backEnd/package.json`, in `devDependencies`, add:

```json
"jest": "^29.7.0",
"ts-jest": "^29.2.5",
"@types/jest": "^29.5.12"
```

- [ ] **Step 2: Add the test script**

In `backEnd/package.json`, in `scripts`, add:

```json
"test": "jest"
```

- [ ] **Step 3: Install dependencies**

Run: `cd backEnd && npm install`
Expected: install completes with no errors.

- [ ] **Step 4: Create the Jest config**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
};
```
Save as `backEnd/jest.config.js`.

- [ ] **Step 5: Write a throwaway smoke test to verify the setup works**

```typescript
import { EducationModel } from './Education';

describe('Jest setup smoke test', () => {
  it('can instantiate a domain model', () => {
    const model = new EducationModel();
    model.title = 'Test';
    expect(model.title).toBe('Test');
  });
});
```
Save as `backEnd/src/domain/models/Education.test.ts`.

- [ ] **Step 6: Run it**

Run: `cd backEnd && npm test`
Expected: `1 passed`, `Tests: 1 passed, 1 total`.

- [ ] **Step 7: Delete the throwaway test**

```bash
rm backEnd/src/domain/models/Education.test.ts
```
This was only to verify the Jest/ts-jest pipeline works end-to-end; real tests start in Task 6.

- [ ] **Step 8: Commit**

```bash
git add backEnd/package.json backEnd/package-lock.json backEnd/jest.config.js
git commit -m "Add Jest test setup"
```

---

### Task 3: Shared exceptions

**Files:**
- Create: `backEnd/src/shared/exceptions/AppException.ts`
- Create: `backEnd/src/shared/exceptions/NotFoundException.ts`
- Create: `backEnd/src/shared/exceptions/ValidationException.ts`
- Create: `backEnd/src/shared/exceptions/UnauthorizedException.ts`
- Test: `backEnd/src/shared/exceptions/AppException.test.ts`

**Interfaces:**
- Produces: `AppException` (base class, `statusCode: number`, `message: string`), `NotFoundException(message: string)` → statusCode 404, `ValidationException(message: string, errors: string[])` → statusCode 400, carries `errors`, `UnauthorizedException(message: string)` → statusCode 401. Every later task's use-cases throw these; Task 5's error middleware catches them.

- [ ] **Step 1: Write the failing test**

```typescript
import { AppException } from './AppException';
import { NotFoundException } from './NotFoundException';
import { ValidationException } from './ValidationException';
import { UnauthorizedException } from './UnauthorizedException';

describe('exceptions', () => {
  it('NotFoundException has statusCode 404 and is an AppException', () => {
    const err = new NotFoundException('Education not found');
    expect(err).toBeInstanceOf(AppException);
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('Education not found');
  });

  it('ValidationException has statusCode 400 and carries errors', () => {
    const err = new ValidationException('Validation failed', ['title is required']);
    expect(err.statusCode).toBe(400);
    expect(err.errors).toEqual(['title is required']);
  });

  it('UnauthorizedException has statusCode 401', () => {
    const err = new UnauthorizedException('Invalid credentials');
    expect(err.statusCode).toBe(401);
  });
});
```
Save as `backEnd/src/shared/exceptions/AppException.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backEnd && npx jest AppException.test.ts`
Expected: FAIL — `Cannot find module './AppException'` (none of the four files exist yet).

- [ ] **Step 3: Implement `AppException`**

```typescript
export abstract class AppException extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}
```
Save as `backEnd/src/shared/exceptions/AppException.ts`.

- [ ] **Step 4: Implement `NotFoundException`**

```typescript
import { AppException } from './AppException';

export class NotFoundException extends AppException {
  constructor(message: string) {
    super(message, 404);
  }
}
```
Save as `backEnd/src/shared/exceptions/NotFoundException.ts`.

- [ ] **Step 5: Implement `ValidationException`**

```typescript
import { AppException } from './AppException';

export class ValidationException extends AppException {
  public readonly errors: string[];

  constructor(message: string, errors: string[]) {
    super(message, 400);
    this.errors = errors;
  }
}
```
Save as `backEnd/src/shared/exceptions/ValidationException.ts`.

- [ ] **Step 6: Implement `UnauthorizedException`**

```typescript
import { AppException } from './AppException';

export class UnauthorizedException extends AppException {
  constructor(message: string) {
    super(message, 401);
  }
}
```
Save as `backEnd/src/shared/exceptions/UnauthorizedException.ts`.

- [ ] **Step 7: Run test to verify it passes**

Run: `cd backEnd && npx jest AppException.test.ts`
Expected: PASS — `Tests: 3 passed, 3 total`.

- [ ] **Step 8: Commit**

```bash
git add backEnd/src/shared/exceptions/
git commit -m "Add shared exception classes"
```

---

### Task 4: Error middleware

**Files:**
- Create: `backEnd/src/infrastructure/middlewares/error.middleware.ts`
- Modify: `backEnd/src/server.ts:74-85`
- Test: `backEnd/src/infrastructure/middlewares/error.middleware.test.ts`

**Interfaces:**
- Consumes: `AppException` (Task 3).
- Produces: `errorMiddleware` — an Express 4-arg error-handling middleware, mounted last in `server.ts`. Every later controller relies on uncaught `AppException`s reaching this middleware instead of crashing the process.

- [ ] **Step 1: Write the failing test**

```typescript
import { Request, Response } from 'express';
import { errorMiddleware } from './error.middleware';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

function mockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('errorMiddleware', () => {
  it('responds with the exception statusCode and message for an AppException', () => {
    const res = mockResponse();
    const err = new NotFoundException('Education not found');

    errorMiddleware(err, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Education not found' });
  });

  it('responds with 500 for an unrecognized error', () => {
    const res = mockResponse();
    const err = new Error('boom');

    errorMiddleware(err, {} as Request, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Erreur interne du serveur' }),
    );
  });
});
```
Save as `backEnd/src/infrastructure/middlewares/error.middleware.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backEnd && npx jest error.middleware.test.ts`
Expected: FAIL — `Cannot find module './error.middleware'`.

- [ ] **Step 3: Implement the middleware**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppException } from '../../shared/exceptions/AppException';
import { ValidationException } from '../../shared/exceptions/ValidationException';
import { envConfig } from '../../config/env.config';

// Express identifies error-handling middleware by its 4-argument arity, so `next`
// must stay in the signature even though it's unused.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof ValidationException) {
    res.status(err.statusCode).json({ success: false, message: err.message, errors: err.errors });
    return;
  }

  if (err instanceof AppException) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  console.error('❌ Erreur:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: envConfig.nodeEnv === 'development' ? err.message : undefined,
  });
}
```
Save as `backEnd/src/infrastructure/middlewares/error.middleware.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backEnd && npx jest error.middleware.test.ts`
Expected: PASS — `Tests: 2 passed, 2 total`.

- [ ] **Step 5: Wire it into `server.ts`**

In `backEnd/src/server.ts`, replace lines 74-85 (the `// Gestionnaire d'erreurs global` comment through the closing `});`):

```typescript
// Gestionnaire d'erreurs global
app.use(errorMiddleware);
```

And add the import near the top, after the `initializeDatabase` import (line 11):

```typescript
import { errorMiddleware } from './infrastructure/middlewares/error.middleware';
```

- [ ] **Step 6: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add backEnd/src/infrastructure/middlewares/error.middleware.ts backEnd/src/infrastructure/middlewares/error.middleware.test.ts backEnd/src/server.ts
git commit -m "Add error middleware, wire into server.ts"
```

---

### Task 5: Validation middleware

**Files:**
- Create: `backEnd/src/infrastructure/middlewares/validate.middleware.ts`
- Test: `backEnd/src/infrastructure/middlewares/validate.middleware.test.ts`

**Interfaces:**
- Consumes: `ValidationException` (Task 3).
- Produces: `validate(DtoClass: ClassConstructor<object>)` — a factory returning Express middleware `(req, res, next) => void`. Every resource's `POST`/`PUT` route (from Task 10 onward) uses `validate(CreateXDto)`/`validate(UpdateXDto)`.

- [ ] **Step 1: Write the failing test**

```typescript
import { Request, Response, NextFunction } from 'express';
import { IsString, IsNotEmpty } from 'class-validator';
import { validate } from './validate.middleware';
import { ValidationException } from '../../shared/exceptions/ValidationException';

class TestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;
}

describe('validate middleware', () => {
  it('calls next() when the body satisfies the DTO', async () => {
    const req = { body: { title: 'Hello' } } as Request;
    const next = jest.fn();

    await validate(TestDto)(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toBeInstanceOf(TestDto);
  });

  it('calls next() with a ValidationException when the body fails the DTO', async () => {
    const req = { body: { title: '' } } as Request;
    const next = jest.fn();

    await validate(TestDto)(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationException));
  });
});
```
Save as `backEnd/src/infrastructure/middlewares/validate.middleware.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backEnd && npx jest validate.middleware.test.ts`
Expected: FAIL — `Cannot find module './validate.middleware'`.

- [ ] **Step 3: Implement the middleware**

```typescript
import { Request, Response, NextFunction } from 'express';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { validate as classValidatorValidate } from 'class-validator';
import { ValidationException } from '../../shared/exceptions/ValidationException';

export function validate<T extends object>(DtoClass: ClassConstructor<T>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const instance = plainToInstance(DtoClass, req.body);
    const errors = await classValidatorValidate(instance);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
      next(new ValidationException('Validation failed', messages));
      return;
    }

    req.body = instance;
    next();
  };
}
```
Save as `backEnd/src/infrastructure/middlewares/validate.middleware.ts`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backEnd && npx jest validate.middleware.test.ts`
Expected: PASS — `Tests: 2 passed, 2 total`.

- [ ] **Step 5: Commit**

```bash
git add backEnd/src/infrastructure/middlewares/validate.middleware.ts backEnd/src/infrastructure/middlewares/validate.middleware.test.ts
git commit -m "Add request validation middleware"
```

---

### Task 6: BaseRepository

**Files:**
- Create: `backEnd/src/infrastructure/repositories/BaseRepository.ts`
- Test: `backEnd/src/infrastructure/repositories/BaseRepository.test.ts`

**Interfaces:**
- Produces: `abstract class BaseRepository<TModel, TEntity extends ObjectLiteral>` with `constructor(protected readonly repository: Repository<TEntity>)`, `protected abstract toModel(entity: TEntity): TModel`, and concrete methods `findAll(): Promise<TModel[]>`, `findById(id: string): Promise<TModel | null>`, `create(data: Partial<TModel>): Promise<TModel>`, `update(id: string, data: Partial<TModel>): Promise<TModel | null>`, `delete(id: string): Promise<boolean>`. Every resource's concrete repository (Task 10 onward) extends this and implements `toModel`.

- [ ] **Step 1: Write the failing test**

This test uses a fake TypeORM `Repository` (plain object with jest mock functions) rather than a real database — `BaseRepository` only calls a handful of `Repository` methods, so faking those is enough to test its own logic in isolation.

```typescript
import { BaseRepository } from './BaseRepository';
import { Repository } from 'typeorm';

interface FakeEntity {
  id: string;
  title: string;
}

interface FakeModel {
  id: string;
  title: string;
}

class TestRepository extends BaseRepository<FakeModel, FakeEntity> {
  protected toModel(entity: FakeEntity): FakeModel {
    return { id: entity.id, title: entity.title };
  }
}

function fakeRepository() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

describe('BaseRepository', () => {
  it('findAll maps every entity through toModel', async () => {
    const repo = fakeRepository();
    repo.find.mockResolvedValue([{ id: '1', title: 'A' }, { id: '2', title: 'B' }]);
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.findAll();

    expect(result).toEqual([{ id: '1', title: 'A' }, { id: '2', title: 'B' }]);
  });

  it('findById returns null when nothing is found', async () => {
    const repo = fakeRepository();
    repo.findOne.mockResolvedValue(null);
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.findById('missing');

    expect(result).toBeNull();
  });

  it('findById maps the found entity through toModel', async () => {
    const repo = fakeRepository();
    repo.findOne.mockResolvedValue({ id: '1', title: 'A' });
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.findById('1');

    expect(result).toEqual({ id: '1', title: 'A' });
  });

  it('create saves the entity and returns the mapped model', async () => {
    const repo = fakeRepository();
    repo.create.mockReturnValue({ id: '1', title: 'A' });
    repo.save.mockResolvedValue({ id: '1', title: 'A' });
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.create({ title: 'A' });

    expect(repo.create).toHaveBeenCalledWith({ title: 'A' });
    expect(repo.save).toHaveBeenCalledWith({ id: '1', title: 'A' });
    expect(result).toEqual({ id: '1', title: 'A' });
  });

  it('update updates then returns the re-fetched mapped model', async () => {
    const repo = fakeRepository();
    repo.update.mockResolvedValue({ affected: 1 });
    repo.findOne.mockResolvedValue({ id: '1', title: 'Updated' });
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.update('1', { title: 'Updated' });

    expect(repo.update).toHaveBeenCalledWith('1', { title: 'Updated' });
    expect(result).toEqual({ id: '1', title: 'Updated' });
  });

  it('update returns null when the entity no longer exists after updating', async () => {
    const repo = fakeRepository();
    repo.update.mockResolvedValue({ affected: 0 });
    repo.findOne.mockResolvedValue(null);
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.update('missing', { title: 'X' });

    expect(result).toBeNull();
  });

  it('delete returns true when a row was affected', async () => {
    const repo = fakeRepository();
    repo.delete.mockResolvedValue({ affected: 1 });
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.delete('1');

    expect(result).toBe(true);
  });

  it('delete returns false when no row was affected', async () => {
    const repo = fakeRepository();
    repo.delete.mockResolvedValue({ affected: 0 });
    const sut = new TestRepository(repo as unknown as Repository<FakeEntity>);

    const result = await sut.delete('missing');

    expect(result).toBe(false);
  });
});
```
Save as `backEnd/src/infrastructure/repositories/BaseRepository.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backEnd && npx jest BaseRepository.test.ts`
Expected: FAIL — `Cannot find module './BaseRepository'`.

- [ ] **Step 3: Implement `BaseRepository`**

```typescript
import { Repository, ObjectLiteral, FindOptionsWhere } from 'typeorm';

export abstract class BaseRepository<TModel, TEntity extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<TEntity>) {}

  protected abstract toModel(entity: TEntity): TModel;

  async findAll(): Promise<TModel[]> {
    const entities = await this.repository.find();
    return entities.map((entity) => this.toModel(entity));
  }

  async findById(id: string): Promise<TModel | null> {
    const entity = await this.repository.findOne({
      where: { id } as unknown as FindOptionsWhere<TEntity>,
    });
    return entity ? this.toModel(entity) : null;
  }

  async create(data: Partial<TModel>): Promise<TModel> {
    const entity = this.repository.create(data as unknown as Partial<TEntity>);
    const saved = await this.repository.save(entity);
    return this.toModel(saved);
  }

  async update(id: string, data: Partial<TModel>): Promise<TModel | null> {
    await this.repository.update(id, data as unknown as Partial<TEntity>);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
```
Save as `backEnd/src/infrastructure/repositories/BaseRepository.ts`.

Note: `update()` re-fetches via `findById` rather than trusting `result.affected` directly, since the test "update returns null when the entity no longer exists" expects a `findOne` call to happen regardless — this also means `update`'s `findOne` call in the test mocks must be set up to return the right value (already done above).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backEnd && npx jest BaseRepository.test.ts`
Expected: PASS — `Tests: 8 passed, 8 total`.

- [ ] **Step 5: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add backEnd/src/infrastructure/repositories/BaseRepository.ts backEnd/src/infrastructure/repositories/BaseRepository.test.ts
git commit -m "Add generic BaseRepository"
```

---

### Task 7: Auth middleware

**Files:**
- Create: `backEnd/src/infrastructure/middlewares/auth.middleware.ts`
- Test: `backEnd/src/infrastructure/middlewares/auth.middleware.test.ts`

**Interfaces:**
- Consumes: `UnauthorizedException` (Task 3), `envConfig.jwt.secret` (already in `backEnd/src/config/env.config.ts`).
- Produces: `authMiddleware(req, res, next)` — Express middleware. On success, sets `req.user = { userId: string; email: string }`. Every admin route (Task 8's login excepted, and every resource's write routes from Task 10 onward) chains this before the controller.
- Also produces: an Express type augmentation so `req.user` is recognized by TypeScript everywhere else in the codebase.

- [ ] **Step 1: Write the failing test**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './auth.middleware';
import { UnauthorizedException } from '../../shared/exceptions/UnauthorizedException';
import { envConfig } from '../../config/env.config';

describe('authMiddleware', () => {
  it('calls next() and sets req.user when the token is valid', () => {
    const token = jwt.sign({ userId: '1', email: 'a@b.com' }, envConfig.jwt.secret);
    const req = { headers: { authorization: `Bearer ${token}` } } as unknown as Request;
    const next = jest.fn();

    authMiddleware(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual(expect.objectContaining({ userId: '1', email: 'a@b.com' }));
  });

  it('calls next() with UnauthorizedException when no header is present', () => {
    const req = { headers: {} } as unknown as Request;
    const next = jest.fn();

    authMiddleware(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
  });

  it('calls next() with UnauthorizedException when the token is invalid', () => {
    const req = { headers: { authorization: 'Bearer not-a-real-token' } } as unknown as Request;
    const next = jest.fn();

    authMiddleware(req, {} as Response, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(UnauthorizedException));
  });
});
```
Save as `backEnd/src/infrastructure/middlewares/auth.middleware.test.ts`.

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backEnd && npx jest auth.middleware.test.ts`
Expected: FAIL — `Cannot find module './auth.middleware'`.

- [ ] **Step 3: Add the Express type augmentation**

```typescript
export interface AuthenticatedUser {
  userId: string;
  email: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
```
Save as `backEnd/src/infrastructure/middlewares/express.d.ts`.

- [ ] **Step 4: Implement the middleware**

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { envConfig } from '../../config/env.config';
import { UnauthorizedException } from '../../shared/exceptions/UnauthorizedException';
import { AuthenticatedUser } from './express.d';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    next(new UnauthorizedException('Missing or malformed Authorization header'));
    return;
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, envConfig.jwt.secret) as AuthenticatedUser;
    req.user = { userId: payload.userId, email: payload.email };
    next();
  } catch {
    next(new UnauthorizedException('Invalid or expired token'));
  }
}
```
Save as `backEnd/src/infrastructure/middlewares/auth.middleware.ts`.

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backEnd && npx jest auth.middleware.test.ts`
Expected: PASS — `Tests: 3 passed, 3 total`.

- [ ] **Step 6: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add backEnd/src/infrastructure/middlewares/auth.middleware.ts backEnd/src/infrastructure/middlewares/auth.middleware.test.ts backEnd/src/infrastructure/middlewares/express.d.ts
git commit -m "Add JWT auth middleware"
```

---

### Task 8: Auth (login)

**Files:**
- Modify: `backEnd/src/domain/interfaces/IUserRepository.ts`
- Create: `backEnd/src/infrastructure/repositories/UserRepository.ts`
- Create: `backEnd/src/infrastructure/dto/auth/LoginDto.ts`
- Create: `backEnd/src/use-cases/auth/LoginUseCase.ts`
- Create: `backEnd/src/infrastructure/controllers/AuthController.ts`
- Create: `backEnd/src/infrastructure/routes/auth.routes.ts`
- Test: `backEnd/src/use-cases/auth/LoginUseCase.test.ts`

**Interfaces:**
- Consumes: `BaseRepository` (Task 6), `UnauthorizedException` (Task 3), `validate` (Task 5).
- Produces: `UserRepository` (implements `IUserRepository`, also used by Task 18's User profile endpoints — built here because login needs it first), `LoginUseCase.execute({ email, password }): Promise<{ token: string; user: { id, email, firstName, lastName } }>`, mounted route `POST /api/v1/auth/login`.

`IUserRepository.findByEmail` is currently typed `Promise<UserModel>` (non-nullable), but "no user with this email" is an expected, normal case for a login attempt — Step 1 corrects this to `Promise<UserModel | null>` so the use-case can branch on it without a repository ever needing to fabricate a fake value or throw from inside the repository layer.

- [ ] **Step 1: Fix `IUserRepository.findByEmail` to be nullable**

```typescript
import { UserModel } from '../models/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserModel | null>;
}
```
Save as `backEnd/src/domain/interfaces/IUserRepository.ts` (replacing its current content).

- [ ] **Step 2: Implement `UserRepository`**

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { UserModel } from '../../domain/models/User';
import { UserEntity } from '../entities/UserEntity';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';

export class UserRepository extends BaseRepository<UserModel, UserEntity> implements IUserRepository {
  constructor(repository: Repository<UserEntity>) {
    super(repository);
  }

  protected toModel(entity: UserEntity): UserModel {
    const model = new UserModel();
    model.id = entity.id;
    model.firstName = entity.firstName;
    model.lastName = entity.lastName;
    model.email = entity.email;
    model.password = entity.password;
    model.birthDate = entity.birthDate;
    model.desiredPosition = entity.desiredPosition;
    model.tagline = entity.tagline;
    model.photo = entity.photo ?? '';
    model.city = entity.city ?? '';
    model.mobility = entity.mobility ?? '';
    model.phone = entity.phone ?? '';
    model.createdAt = entity.createdAt;
    return model;
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toModel(entity) : null;
  }
}
```
Save as `backEnd/src/infrastructure/repositories/UserRepository.ts`.

- [ ] **Step 3: Write the failing test for `LoginUseCase`**

```typescript
import { LoginUseCase } from './LoginUseCase';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { UserModel } from '../../domain/models/User';
import { UnauthorizedException } from '../../shared/exceptions/UnauthorizedException';
import bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

function buildUser(): UserModel {
  const user = new UserModel();
  user.id = '1';
  user.email = 'admin@example.com';
  user.password = 'hashed-password';
  user.firstName = 'Ada';
  user.lastName = 'Lovelace';
  return user;
}

describe('LoginUseCase', () => {
  it('returns a token and user info when credentials are valid', async () => {
    const repository: IUserRepository = { findByEmail: jest.fn().mockResolvedValue(buildUser()) };
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    const sut = new LoginUseCase(repository);

    const result = await sut.execute({ email: 'admin@example.com', password: 'plain-password' });

    expect(result.user).toEqual({ id: '1', email: 'admin@example.com', firstName: 'Ada', lastName: 'Lovelace' });
    expect(typeof result.token).toBe('string');
  });

  it('throws UnauthorizedException when the email is not found', async () => {
    const repository: IUserRepository = { findByEmail: jest.fn().mockResolvedValue(null) };
    const sut = new LoginUseCase(repository);

    await expect(sut.execute({ email: 'nobody@example.com', password: 'x' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when the password does not match', async () => {
    const repository: IUserRepository = { findByEmail: jest.fn().mockResolvedValue(buildUser()) };
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);
    const sut = new LoginUseCase(repository);

    await expect(sut.execute({ email: 'admin@example.com', password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
```
Save as `backEnd/src/use-cases/auth/LoginUseCase.test.ts`.

- [ ] **Step 4: Run test to verify it fails**

Run: `cd backEnd && npx jest LoginUseCase.test.ts`
Expected: FAIL — `Cannot find module './LoginUseCase'`.

- [ ] **Step 5: Implement `LoginUseCase`**

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { IUserRepository } from '../../domain/interfaces/IUserRepository';
import { UnauthorizedException } from '../../shared/exceptions/UnauthorizedException';
import { envConfig } from '../../config/env.config';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  token: string;
  user: { id: string; email: string; firstName: string; lastName: string };
}

export class LoginUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute({ email, password }: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, envConfig.jwt.secret, {
      expiresIn: envConfig.jwt.expiresIn,
    });

    return {
      token,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    };
  }
}
```
Save as `backEnd/src/use-cases/auth/LoginUseCase.ts`.

- [ ] **Step 6: Run test to verify it passes**

Run: `cd backEnd && npx jest LoginUseCase.test.ts`
Expected: PASS — `Tests: 3 passed, 3 total`.

- [ ] **Step 7: Create the login DTO**

```typescript
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
```
Save as `backEnd/src/infrastructure/dto/auth/LoginDto.ts`.

- [ ] **Step 8: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../use-cases/auth/LoginUseCase';
import { UserRepository } from '../repositories/UserRepository';
import { AppDataSource } from '../database/config/data-source';
import { UserEntity } from '../entities/UserEntity';

const userRepository = new UserRepository(AppDataSource.getRepository(UserEntity));
const loginUseCase = new LoginUseCase(userRepository);

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await loginUseCase.execute(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/AuthController.ts`.

- [ ] **Step 9: Implement the route**

```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validate } from '../middlewares/validate.middleware';
import { LoginDto } from '../dto/auth/LoginDto';

const router = Router();

router.post('/login', validate(LoginDto), AuthController.login);

export default router;
```
Save as `backEnd/src/infrastructure/routes/auth.routes.ts`.

- [ ] **Step 10: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors. (This route isn't mounted in `server.ts` yet — that happens in Task 21 once every resource's routes exist — so it isn't reachable over HTTP yet, but it must still compile cleanly.)

- [ ] **Step 11: Commit**

```bash
git add backEnd/src/domain/interfaces/IUserRepository.ts backEnd/src/infrastructure/repositories/UserRepository.ts backEnd/src/infrastructure/dto/auth/ backEnd/src/use-cases/auth/ backEnd/src/infrastructure/controllers/AuthController.ts backEnd/src/infrastructure/routes/auth.routes.ts
git commit -m "Add login use-case, controller, and route"
```

---

### Task 9: Admin user seed script

**Files:**
- Modify: `backEnd/src/config/env.config.ts`
- Modify: `backEnd/.env.example`
- Modify: `backEnd/package.json`
- Create: `backEnd/src/infrastructure/database/seeders/admin-user.seed.ts`

**Interfaces:**
- Consumes: `UserRepository` (Task 8), `AppDataSource` (already in `backEnd/src/infrastructure/database/config/data-source.ts`).
- Produces: `npm run seed:admin` script. No other task depends on this one's code, but it's the only way to create the one admin account this whole API authenticates against.

- [ ] **Step 1: Add `ADMIN_EMAIL`/`ADMIN_PASSWORD` to the env config**

In `backEnd/src/config/env.config.ts`, add to the `EnvConfig` interface (after the `jwt` block):

```typescript
  admin: {
    email: string;
    password: string;
  };
```

And add to `validateConfig()`'s returned object (after the `jwt` block):

```typescript
      admin: {
        email: this.getRequired('ADMIN_EMAIL'),
        password: this.getRequired('ADMIN_PASSWORD'),
      },
```

- [ ] **Step 2: Add the env vars to `.env.example`**

In `backEnd/.env.example`, add after the `# JWT` block:

```
# Admin seed
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-before-seeding
```

- [ ] **Step 3: Add the seed script**

In `backEnd/package.json`, in `scripts`, add:

```json
"seed:admin": "ts-node src/infrastructure/database/seeders/admin-user.seed.ts"
```

- [ ] **Step 4: Implement the seed script**

```typescript
import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/data-source';
import { UserEntity } from '../../entities/UserEntity';
import { envConfig } from '../../../config/env.config';

async function seedAdminUser(): Promise<void> {
  await AppDataSource.initialize();
  const repository = AppDataSource.getRepository(UserEntity);

  const existing = await repository.findOne({ where: { email: envConfig.admin.email } });

  if (existing) {
    console.log(`Admin user ${envConfig.admin.email} already exists — nothing to do.`);
    await AppDataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash(envConfig.admin.password, 10);

  const admin = repository.create({
    firstName: 'Admin',
    lastName: 'User',
    email: envConfig.admin.email,
    password: hashedPassword,
    birthDate: new Date('1990-01-01'),
    desiredPosition: 'N/A',
    tagline: 'N/A',
  });

  await repository.save(admin);
  console.log(`Admin user ${envConfig.admin.email} created.`);
  await AppDataSource.destroy();
}

seedAdminUser().catch((error) => {
  console.error('Failed to seed admin user:', error);
  process.exit(1);
});
```
Save as `backEnd/src/infrastructure/database/seeders/admin-user.seed.ts`.

- [ ] **Step 5: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add backEnd/src/config/env.config.ts backEnd/.env.example backEnd/package.json backEnd/src/infrastructure/database/seeders/admin-user.seed.ts
git commit -m "Add admin user seed script"
```

This task is not run automatically by anything else in this plan — once the branch is ready to test against a real database, run `npm run seed:admin` manually (with real `ADMIN_EMAIL`/`ADMIN_PASSWORD` values in `.env`) to create the one account `POST /auth/login` will authenticate.

---

### Task 10: Education resource

**Files:**
- Create: `backEnd/src/infrastructure/repositories/EducationRepository.ts`
- Create: `backEnd/src/infrastructure/dto/education/CreateEducationDto.ts`
- Create: `backEnd/src/infrastructure/dto/education/UpdateEducationDto.ts`
- Create: `backEnd/src/use-cases/education/ListEducationUseCase.ts`
- Create: `backEnd/src/use-cases/education/GetCurrentEducationUseCase.ts`
- Create: `backEnd/src/use-cases/education/GetEducationUseCase.ts`
- Create: `backEnd/src/use-cases/education/CreateEducationUseCase.ts`
- Create: `backEnd/src/use-cases/education/UpdateEducationUseCase.ts`
- Create: `backEnd/src/use-cases/education/DeleteEducationUseCase.ts`
- Create: `backEnd/src/infrastructure/controllers/EducationController.ts`
- Create: `backEnd/src/infrastructure/routes/education.routes.ts`
- Test: one `.test.ts` next to each use-case file above (6 files)

**Interfaces:**
- Consumes: `BaseRepository` (Task 6), `NotFoundException` (Task 3), `validate`/`authMiddleware` (Tasks 5/7), `EducationModel`/`updatedAt` (Task 1).
- Produces: this is the template — every later resource task (11-20) follows this exact shape (repository extends `BaseRepository`, 5-or-6 use-cases, 2 DTOs, 1 controller, 1 routes file). Mounted route prefix: `/education` (wired into the app in Task 21).

- [ ] **Step 1: Implement `EducationRepository`**

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { EducationModel } from '../../domain/models/Education';
import { EducationEntity } from '../entities/EducationEntity';
import { IEducationRepository } from '../../domain/interfaces/IEducationRepository';

export class EducationRepository
  extends BaseRepository<EducationModel, EducationEntity>
  implements IEducationRepository
{
  constructor(repository: Repository<EducationEntity>) {
    super(repository);
  }

  protected toModel(entity: EducationEntity): EducationModel {
    const model = new EducationModel();
    model.id = entity.id;
    model.institution = entity.institution;
    model.city = entity.city;
    model.title = entity.title;
    model.specialization = entity.specialization;
    model.description = entity.description;
    model.startDate = entity.startDate;
    model.endDate = entity.endDate ?? null as unknown as Date;
    model.current = entity.current;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<EducationModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findCurrent(): Promise<EducationModel[]> {
    const entities = await this.repository.find({ where: { current: true }, order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
```
Save as `backEnd/src/infrastructure/repositories/EducationRepository.ts`.

- [ ] **Step 2: Create the DTOs**

```typescript
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class CreateEducationDto {
  @IsString()
  @IsNotEmpty()
  institution!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  specialization!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/education/CreateEducationDto.ts`.

```typescript
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateEducationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  institution?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  specialization?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/education/UpdateEducationDto.ts`.

- [ ] **Step 3: Write the failing test for `ListEducationUseCase`**

```typescript
import { ListEducationUseCase } from './ListEducationUseCase';
import { IEducationRepository } from '../../domain/interfaces/IEducationRepository';
import { EducationModel } from '../../domain/models/Education';

describe('ListEducationUseCase', () => {
  it('returns every education entry ordered by the repository', async () => {
    const entries = [new EducationModel(), new EducationModel()];
    const repository: IEducationRepository = {
      findByOrder: jest.fn().mockResolvedValue(entries),
      findCurrent: jest.fn(),
    };
    const sut = new ListEducationUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/education/ListEducationUseCase.test.ts`.

- [ ] **Step 4: Run test to verify it fails, then implement `ListEducationUseCase`**

Run: `cd backEnd && npx jest ListEducationUseCase.test.ts` — expect FAIL (`Cannot find module`).

```typescript
import { IEducationRepository } from '../../domain/interfaces/IEducationRepository';
import { EducationModel } from '../../domain/models/Education';

export class ListEducationUseCase {
  constructor(private readonly repository: IEducationRepository) {}

  async execute(): Promise<EducationModel[]> {
    return this.repository.findByOrder();
  }
}
```
Save as `backEnd/src/use-cases/education/ListEducationUseCase.ts`. Re-run the same test — expect PASS.

- [ ] **Step 5: Write the failing test for `GetCurrentEducationUseCase`, then implement it**

```typescript
import { GetCurrentEducationUseCase } from './GetCurrentEducationUseCase';
import { IEducationRepository } from '../../domain/interfaces/IEducationRepository';
import { EducationModel } from '../../domain/models/Education';

describe('GetCurrentEducationUseCase', () => {
  it('returns only the current education entries', async () => {
    const entries = [new EducationModel()];
    const repository: IEducationRepository = {
      findByOrder: jest.fn(),
      findCurrent: jest.fn().mockResolvedValue(entries),
    };
    const sut = new GetCurrentEducationUseCase(repository);

    const result = await sut.execute();

    expect(repository.findCurrent).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/education/GetCurrentEducationUseCase.test.ts`. Run it (expect FAIL), then:

```typescript
import { IEducationRepository } from '../../domain/interfaces/IEducationRepository';
import { EducationModel } from '../../domain/models/Education';

export class GetCurrentEducationUseCase {
  constructor(private readonly repository: IEducationRepository) {}

  async execute(): Promise<EducationModel[]> {
    return this.repository.findCurrent();
  }
}
```
Save as `backEnd/src/use-cases/education/GetCurrentEducationUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 6: Write the failing test for `GetEducationUseCase`, then implement it**

```typescript
import { GetEducationUseCase } from './GetEducationUseCase';
import { IEducationRepository } from '../../domain/interfaces/IEducationRepository';
import { EducationModel } from '../../domain/models/Education';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface FullEducationRepository extends IEducationRepository {
  findById(id: string): Promise<EducationModel | null>;
}

describe('GetEducationUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new EducationModel();
    const repository = { findById: jest.fn().mockResolvedValue(entry) } as unknown as FullEducationRepository;
    const sut = new GetEducationUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository = { findById: jest.fn().mockResolvedValue(null) } as unknown as FullEducationRepository;
    const sut = new GetEducationUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/education/GetEducationUseCase.test.ts`. Run it (expect FAIL), then:

```typescript
import { EducationModel } from '../../domain/models/Education';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IEducationFinder {
  findById(id: string): Promise<EducationModel | null>;
}

export class GetEducationUseCase {
  constructor(private readonly repository: IEducationFinder) {}

  async execute(id: string): Promise<EducationModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Education not found');
    }

    return entry;
  }
}
```
Save as `backEnd/src/use-cases/education/GetEducationUseCase.ts`. Re-run — expect PASS.

(`findById` lives on `EducationRepository`/`BaseRepository`, not on `IEducationRepository` — that domain interface only declares the resource-specific methods, per the existing convention. `IEducationFinder` is the narrow shape this use-case actually needs, satisfied by `EducationRepository`. The same pattern repeats in `UpdateEducationUseCase` and `DeleteEducationUseCase` below.)

- [ ] **Step 7: Write the failing test for `CreateEducationUseCase`, then implement it**

```typescript
import { CreateEducationUseCase } from './CreateEducationUseCase';
import { EducationModel } from '../../domain/models/Education';

interface ICreator {
  create(data: Partial<EducationModel>): Promise<EducationModel>;
}

describe('CreateEducationUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new EducationModel();
    const repository: ICreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateEducationUseCase(repository);
    const input = { institution: 'MIT', city: 'Cambridge', title: 'BSc', specialization: 'CS', description: 'desc', startDate: '2020-01-01' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
```
Save as `backEnd/src/use-cases/education/CreateEducationUseCase.test.ts`. Run it (expect FAIL), then:

```typescript
import { EducationModel } from '../../domain/models/Education';
import { CreateEducationDto } from '../../infrastructure/dto/education/CreateEducationDto';

export interface IEducationCreator {
  create(data: Partial<EducationModel>): Promise<EducationModel>;
}

export class CreateEducationUseCase {
  constructor(private readonly repository: IEducationCreator) {}

  async execute(data: CreateEducationDto): Promise<EducationModel> {
    return this.repository.create(data);
  }
}
```
Save as `backEnd/src/use-cases/education/CreateEducationUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 8: Write the failing test for `UpdateEducationUseCase`, then implement it**

```typescript
import { UpdateEducationUseCase } from './UpdateEducationUseCase';
import { EducationModel } from '../../domain/models/Education';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IUpdater {
  update(id: string, data: Partial<EducationModel>): Promise<EducationModel | null>;
}

describe('UpdateEducationUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new EducationModel();
    const repository: IUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateEducationUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateEducationUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/education/UpdateEducationUseCase.test.ts`. Run it (expect FAIL), then:

```typescript
import { EducationModel } from '../../domain/models/Education';
import { UpdateEducationDto } from '../../infrastructure/dto/education/UpdateEducationDto';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IEducationUpdater {
  update(id: string, data: Partial<EducationModel>): Promise<EducationModel | null>;
}

export class UpdateEducationUseCase {
  constructor(private readonly repository: IEducationUpdater) {}

  async execute(id: string, data: UpdateEducationDto): Promise<EducationModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Education not found');
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/education/UpdateEducationUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 9: Write the failing test for `DeleteEducationUseCase`, then implement it**

```typescript
import { DeleteEducationUseCase } from './DeleteEducationUseCase';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteEducationUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: IDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteEducationUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteEducationUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/education/DeleteEducationUseCase.test.ts`. Run it (expect FAIL), then:

```typescript
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IEducationDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteEducationUseCase {
  constructor(private readonly repository: IEducationDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Education not found');
    }
  }
}
```
Save as `backEnd/src/use-cases/education/DeleteEducationUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 10: Run the full Education test suite**

Run: `cd backEnd && npx jest src/use-cases/education`
Expected: `Tests: 9 passed, 9 total` (1 List + 1 Current + 2 Get + 1 Create + 2 Update + 2 Delete).

- [ ] **Step 11: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { EducationEntity } from '../entities/EducationEntity';
import { EducationRepository } from '../repositories/EducationRepository';
import { ListEducationUseCase } from '../../use-cases/education/ListEducationUseCase';
import { GetCurrentEducationUseCase } from '../../use-cases/education/GetCurrentEducationUseCase';
import { GetEducationUseCase } from '../../use-cases/education/GetEducationUseCase';
import { CreateEducationUseCase } from '../../use-cases/education/CreateEducationUseCase';
import { UpdateEducationUseCase } from '../../use-cases/education/UpdateEducationUseCase';
import { DeleteEducationUseCase } from '../../use-cases/education/DeleteEducationUseCase';

const repository = new EducationRepository(AppDataSource.getRepository(EducationEntity));
const listUseCase = new ListEducationUseCase(repository);
const currentUseCase = new GetCurrentEducationUseCase(repository);
const getUseCase = new GetEducationUseCase(repository);
const createUseCase = new CreateEducationUseCase(repository);
const updateUseCase = new UpdateEducationUseCase(repository);
const deleteUseCase = new DeleteEducationUseCase(repository);

export class EducationController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await listUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async current(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await currentUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await getUseCase.execute(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await createUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await updateUseCase.execute(req.params.id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/EducationController.ts`.

- [ ] **Step 12: Implement the route**

Route order matters: `/current` must be registered before `/:id`, or Express will match `GET /education/current` as `GET /education/:id` with `id = "current"`.

```typescript
import { Router } from 'express';
import { EducationController } from '../controllers/EducationController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateEducationDto } from '../dto/education/CreateEducationDto';
import { UpdateEducationDto } from '../dto/education/UpdateEducationDto';

const router = Router();

router.get('/', EducationController.list);
router.get('/current', EducationController.current);
router.get('/:id', EducationController.get);
router.post('/', authMiddleware, validate(CreateEducationDto), EducationController.create);
router.put('/:id', authMiddleware, validate(UpdateEducationDto), EducationController.update);
router.delete('/:id', authMiddleware, EducationController.remove);

export default router;
```
Save as `backEnd/src/infrastructure/routes/education.routes.ts`.

- [ ] **Step 13: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 14: Commit**

```bash
git add backEnd/src/infrastructure/repositories/EducationRepository.ts backEnd/src/infrastructure/dto/education/ backEnd/src/use-cases/education/ backEnd/src/infrastructure/controllers/EducationController.ts backEnd/src/infrastructure/routes/education.routes.ts
git commit -m "Add Education resource (repository, use-cases, controller, route)"
```

---

### Task 11: Experience resource

Same shape as Task 10 (Education) — `findByOrder` + `findCurrent`, same six use-cases.

**Files:**
- Create: `backEnd/src/infrastructure/repositories/ExperienceRepository.ts`
- Create: `backEnd/src/infrastructure/dto/experience/CreateExperienceDto.ts`
- Create: `backEnd/src/infrastructure/dto/experience/UpdateExperienceDto.ts`
- Create: `backEnd/src/use-cases/experience/ListExperienceUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/experience/GetCurrentExperienceUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/experience/GetExperienceUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/experience/CreateExperienceUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/experience/UpdateExperienceUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/experience/DeleteExperienceUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/infrastructure/controllers/ExperienceController.ts`
- Create: `backEnd/src/infrastructure/routes/experience.routes.ts`

**Interfaces:**
- Consumes: same shared pieces as Task 10.
- Produces: mounted route prefix `/experience` (Task 21).

- [ ] **Step 1: Implement `ExperienceRepository`**

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { ExperienceModel } from '../../domain/models/Experience';
import { ExperienceEntity } from '../entities/ExperienceEntity';
import { IExperienceRepository } from '../../domain/interfaces/IExperienceRepository';

export class ExperienceRepository
  extends BaseRepository<ExperienceModel, ExperienceEntity>
  implements IExperienceRepository
{
  constructor(repository: Repository<ExperienceEntity>) {
    super(repository);
  }

  protected toModel(entity: ExperienceEntity): ExperienceModel {
    const model = new ExperienceModel();
    model.id = entity.id;
    model.company = entity.company;
    model.position = entity.position;
    model.city = entity.city;
    model.title = entity.title;
    model.description = entity.description;
    model.startDate = entity.startDate;
    model.endDate = entity.endDate ?? (null as unknown as Date);
    model.current = entity.current;
    model.link = entity.link ?? '';
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<ExperienceModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findCurrent(): Promise<ExperienceModel[]> {
    const entities = await this.repository.find({ where: { current: true }, order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
```
Save as `backEnd/src/infrastructure/repositories/ExperienceRepository.ts`.

- [ ] **Step 2: Create the DTOs**

```typescript
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean, IsInt, Min, IsUrl } from 'class-validator';

export class CreateExperienceDto {
  @IsString()
  @IsNotEmpty()
  company!: string;

  @IsString()
  @IsNotEmpty()
  position!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/experience/CreateExperienceDto.ts`.

```typescript
import { IsString, IsNotEmpty, IsDateString, IsOptional, IsBoolean, IsInt, Min, IsUrl } from 'class-validator';

export class UpdateExperienceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  company?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  position?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/experience/UpdateExperienceDto.ts`.

- [ ] **Step 3: Write the failing test for `ListExperienceUseCase`, then implement it**

```typescript
import { ListExperienceUseCase } from './ListExperienceUseCase';
import { IExperienceRepository } from '../../domain/interfaces/IExperienceRepository';
import { ExperienceModel } from '../../domain/models/Experience';

describe('ListExperienceUseCase', () => {
  it('returns every experience entry ordered by the repository', async () => {
    const entries = [new ExperienceModel(), new ExperienceModel()];
    const repository: IExperienceRepository = {
      findByOrder: jest.fn().mockResolvedValue(entries),
      findCurrent: jest.fn(),
    };
    const sut = new ListExperienceUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/experience/ListExperienceUseCase.test.ts`. Run: `cd backEnd && npx jest ListExperienceUseCase.test.ts` — expect FAIL (`Cannot find module`).

`backEnd/src/use-cases/experience/ListExperienceUseCase.ts`:
```typescript
import { IExperienceRepository } from '../../domain/interfaces/IExperienceRepository';
import { ExperienceModel } from '../../domain/models/Experience';

export class ListExperienceUseCase {
  constructor(private readonly repository: IExperienceRepository) {}

  async execute(): Promise<ExperienceModel[]> {
    return this.repository.findByOrder();
  }
}
```
Re-run the same test — expect PASS.

- [ ] **Step 4: Write the failing test for `GetCurrentExperienceUseCase`, then implement it**

```typescript
import { GetCurrentExperienceUseCase } from './GetCurrentExperienceUseCase';
import { IExperienceRepository } from '../../domain/interfaces/IExperienceRepository';
import { ExperienceModel } from '../../domain/models/Experience';

describe('GetCurrentExperienceUseCase', () => {
  it('returns only the current experience entries', async () => {
    const entries = [new ExperienceModel()];
    const repository: IExperienceRepository = {
      findByOrder: jest.fn(),
      findCurrent: jest.fn().mockResolvedValue(entries),
    };
    const sut = new GetCurrentExperienceUseCase(repository);

    const result = await sut.execute();

    expect(repository.findCurrent).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/experience/GetCurrentExperienceUseCase.test.ts`. Run it — expect FAIL.

`backEnd/src/use-cases/experience/GetCurrentExperienceUseCase.ts`:
```typescript
import { IExperienceRepository } from '../../domain/interfaces/IExperienceRepository';
import { ExperienceModel } from '../../domain/models/Experience';

export class GetCurrentExperienceUseCase {
  constructor(private readonly repository: IExperienceRepository) {}

  async execute(): Promise<ExperienceModel[]> {
    return this.repository.findCurrent();
  }
}
```
Re-run — expect PASS.

- [ ] **Step 5: Write the failing test for `GetExperienceUseCase`, then implement it**

```typescript
import { GetExperienceUseCase } from './GetExperienceUseCase';
import { ExperienceModel } from '../../domain/models/Experience';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IExperienceFinder {
  findById(id: string): Promise<ExperienceModel | null>;
}

describe('GetExperienceUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new ExperienceModel();
    const repository: IExperienceFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetExperienceUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IExperienceFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetExperienceUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/experience/GetExperienceUseCase.test.ts`. Run it — expect FAIL.

`backEnd/src/use-cases/experience/GetExperienceUseCase.ts`:
```typescript
import { ExperienceModel } from '../../domain/models/Experience';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IExperienceFinder {
  findById(id: string): Promise<ExperienceModel | null>;
}

export class GetExperienceUseCase {
  constructor(private readonly repository: IExperienceFinder) {}

  async execute(id: string): Promise<ExperienceModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Experience not found');
    }

    return entry;
  }
}
```
Re-run — expect PASS.

- [ ] **Step 6: Write the failing test for `CreateExperienceUseCase`, then implement it**

```typescript
import { CreateExperienceUseCase } from './CreateExperienceUseCase';
import { ExperienceModel } from '../../domain/models/Experience';

interface IExperienceCreator {
  create(data: Partial<ExperienceModel>): Promise<ExperienceModel>;
}

describe('CreateExperienceUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new ExperienceModel();
    const repository: IExperienceCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateExperienceUseCase(repository);
    const input = { company: 'Acme', position: 'Dev', city: 'Paris', title: 'Dev', description: 'desc', startDate: '2020-01-01' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
```
Save as `backEnd/src/use-cases/experience/CreateExperienceUseCase.test.ts`. Run it — expect FAIL.

`backEnd/src/use-cases/experience/CreateExperienceUseCase.ts`:
```typescript
import { ExperienceModel } from '../../domain/models/Experience';
import { CreateExperienceDto } from '../../infrastructure/dto/experience/CreateExperienceDto';

export interface IExperienceCreator {
  create(data: Partial<ExperienceModel>): Promise<ExperienceModel>;
}

export class CreateExperienceUseCase {
  constructor(private readonly repository: IExperienceCreator) {}

  async execute(data: CreateExperienceDto): Promise<ExperienceModel> {
    return this.repository.create(data);
  }
}
```
Re-run — expect PASS.

- [ ] **Step 7: Write the failing test for `UpdateExperienceUseCase`, then implement it**

```typescript
import { UpdateExperienceUseCase } from './UpdateExperienceUseCase';
import { ExperienceModel } from '../../domain/models/Experience';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IExperienceUpdater {
  update(id: string, data: Partial<ExperienceModel>): Promise<ExperienceModel | null>;
}

describe('UpdateExperienceUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new ExperienceModel();
    const repository: IExperienceUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateExperienceUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IExperienceUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateExperienceUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/experience/UpdateExperienceUseCase.test.ts`. Run it — expect FAIL.

`backEnd/src/use-cases/experience/UpdateExperienceUseCase.ts`:
```typescript
import { ExperienceModel } from '../../domain/models/Experience';
import { UpdateExperienceDto } from '../../infrastructure/dto/experience/UpdateExperienceDto';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IExperienceUpdater {
  update(id: string, data: Partial<ExperienceModel>): Promise<ExperienceModel | null>;
}

export class UpdateExperienceUseCase {
  constructor(private readonly repository: IExperienceUpdater) {}

  async execute(id: string, data: UpdateExperienceDto): Promise<ExperienceModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Experience not found');
    }

    return updated;
  }
}
```
Re-run — expect PASS.

- [ ] **Step 8: Write the failing test for `DeleteExperienceUseCase`, then implement it**

```typescript
import { DeleteExperienceUseCase } from './DeleteExperienceUseCase';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IExperienceDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteExperienceUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: IExperienceDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteExperienceUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IExperienceDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteExperienceUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/experience/DeleteExperienceUseCase.test.ts`. Run it — expect FAIL.

`backEnd/src/use-cases/experience/DeleteExperienceUseCase.ts`:
```typescript
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IExperienceDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteExperienceUseCase {
  constructor(private readonly repository: IExperienceDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Experience not found');
    }
  }
}
```

- [ ] **Step 9: Run the full Experience test suite**

Run: `cd backEnd && npx jest src/use-cases/experience`
Expected: `Tests: 9 passed, 9 total`.

- [ ] **Step 10: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { ExperienceEntity } from '../entities/ExperienceEntity';
import { ExperienceRepository } from '../repositories/ExperienceRepository';
import { ListExperienceUseCase } from '../../use-cases/experience/ListExperienceUseCase';
import { GetCurrentExperienceUseCase } from '../../use-cases/experience/GetCurrentExperienceUseCase';
import { GetExperienceUseCase } from '../../use-cases/experience/GetExperienceUseCase';
import { CreateExperienceUseCase } from '../../use-cases/experience/CreateExperienceUseCase';
import { UpdateExperienceUseCase } from '../../use-cases/experience/UpdateExperienceUseCase';
import { DeleteExperienceUseCase } from '../../use-cases/experience/DeleteExperienceUseCase';

const repository = new ExperienceRepository(AppDataSource.getRepository(ExperienceEntity));
const listUseCase = new ListExperienceUseCase(repository);
const currentUseCase = new GetCurrentExperienceUseCase(repository);
const getUseCase = new GetExperienceUseCase(repository);
const createUseCase = new CreateExperienceUseCase(repository);
const updateUseCase = new UpdateExperienceUseCase(repository);
const deleteUseCase = new DeleteExperienceUseCase(repository);

export class ExperienceController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await listUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async current(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await currentUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await updateUseCase.execute(req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/ExperienceController.ts`.

- [ ] **Step 11: Implement the route**

```typescript
import { Router } from 'express';
import { ExperienceController } from '../controllers/ExperienceController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateExperienceDto } from '../dto/experience/CreateExperienceDto';
import { UpdateExperienceDto } from '../dto/experience/UpdateExperienceDto';

const router = Router();

router.get('/', ExperienceController.list);
router.get('/current', ExperienceController.current);
router.get('/:id', ExperienceController.get);
router.post('/', authMiddleware, validate(CreateExperienceDto), ExperienceController.create);
router.put('/:id', authMiddleware, validate(UpdateExperienceDto), ExperienceController.update);
router.delete('/:id', authMiddleware, ExperienceController.remove);

export default router;
```
Save as `backEnd/src/infrastructure/routes/experience.routes.ts`.

- [ ] **Step 12: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 13: Commit**

```bash
git add backEnd/src/infrastructure/repositories/ExperienceRepository.ts backEnd/src/infrastructure/dto/experience/ backEnd/src/use-cases/experience/ backEnd/src/infrastructure/controllers/ExperienceController.ts backEnd/src/infrastructure/routes/experience.routes.ts
git commit -m "Add Experience resource (repository, use-cases, controller, route)"
```

---

### Task 12: Project resource

**Files:**
- Create: `backEnd/src/infrastructure/repositories/ProjectRepository.ts`
- Create: `backEnd/src/infrastructure/dto/project/CreateProjectDto.ts`
- Create: `backEnd/src/infrastructure/dto/project/UpdateProjectDto.ts`
- Create: `backEnd/src/use-cases/project/ListProjectUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/project/ListFeaturedProjectUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/project/GetProjectUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/project/CreateProjectUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/project/UpdateProjectUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/project/DeleteProjectUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/infrastructure/controllers/ProjectController.ts`
- Create: `backEnd/src/infrastructure/routes/project.routes.ts`

**Interfaces:**
- Consumes: same shared pieces as Task 10. `ProjectModel.technologies: string[]` (Task 1).
- Produces: mounted route prefix `/projects` (Task 21).

- [ ] **Step 1: Implement `ProjectRepository`**

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { ProjectModel } from '../../domain/models/Project';
import { ProjectEntity } from '../entities/ProjectEntity';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';

export class ProjectRepository
  extends BaseRepository<ProjectModel, ProjectEntity>
  implements IProjectRepository
{
  constructor(repository: Repository<ProjectEntity>) {
    super(repository);
  }

  protected toModel(entity: ProjectEntity): ProjectModel {
    const model = new ProjectModel();
    model.id = entity.id;
    model.title = entity.title;
    model.description = entity.description;
    model.longDescription = entity.longDescription ?? '';
    model.technologies = entity.technologies;
    model.imageUrl = entity.imageUrl ?? '';
    model.demoUrl = entity.demoUrl ?? '';
    model.githubUrl = entity.githubUrl ?? '';
    model.featured = entity.featured;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<ProjectModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findFeatured(): Promise<ProjectModel[]> {
    const entities = await this.repository.find({ where: { featured: true }, order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
```
Save as `backEnd/src/infrastructure/repositories/ProjectRepository.ts`.

- [ ] **Step 2: Create the DTOs**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, IsUrl, IsArray } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsArray()
  @IsString({ each: true })
  technologies!: string[];

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  demoUrl?: string;

  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/project/CreateProjectDto.ts`.

```typescript
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, IsUrl, IsArray } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsString()
  longDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  demoUrl?: string;

  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/project/UpdateProjectDto.ts`.

- [ ] **Step 3: Write the failing test for `ListProjectUseCase`, then implement it**

```typescript
import { ListProjectUseCase } from './ListProjectUseCase';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { ProjectModel } from '../../domain/models/Project';

describe('ListProjectUseCase', () => {
  it('returns every project ordered by the repository', async () => {
    const entries = [new ProjectModel(), new ProjectModel()];
    const repository: IProjectRepository = {
      findByOrder: jest.fn().mockResolvedValue(entries),
      findFeatured: jest.fn(),
    };
    const sut = new ListProjectUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/project/ListProjectUseCase.test.ts`. Run: `cd backEnd && npx jest ListProjectUseCase.test.ts` — expect FAIL.

```typescript
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { ProjectModel } from '../../domain/models/Project';

export class ListProjectUseCase {
  constructor(private readonly repository: IProjectRepository) {}

  async execute(): Promise<ProjectModel[]> {
    return this.repository.findByOrder();
  }
}
```
Save as `backEnd/src/use-cases/project/ListProjectUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 4: Write the failing test for `ListFeaturedProjectUseCase`, then implement it**

```typescript
import { ListFeaturedProjectUseCase } from './ListFeaturedProjectUseCase';
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { ProjectModel } from '../../domain/models/Project';

describe('ListFeaturedProjectUseCase', () => {
  it('returns only the featured projects', async () => {
    const entries = [new ProjectModel()];
    const repository: IProjectRepository = {
      findByOrder: jest.fn(),
      findFeatured: jest.fn().mockResolvedValue(entries),
    };
    const sut = new ListFeaturedProjectUseCase(repository);

    const result = await sut.execute();

    expect(repository.findFeatured).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/project/ListFeaturedProjectUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { IProjectRepository } from '../../domain/interfaces/IProjectRepository';
import { ProjectModel } from '../../domain/models/Project';

export class ListFeaturedProjectUseCase {
  constructor(private readonly repository: IProjectRepository) {}

  async execute(): Promise<ProjectModel[]> {
    return this.repository.findFeatured();
  }
}
```
Save as `backEnd/src/use-cases/project/ListFeaturedProjectUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 5: Write the failing test for `GetProjectUseCase`, then implement it**

```typescript
import { GetProjectUseCase } from './GetProjectUseCase';
import { ProjectModel } from '../../domain/models/Project';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IProjectFinder {
  findById(id: string): Promise<ProjectModel | null>;
}

describe('GetProjectUseCase', () => {
  it('returns the project when it exists', async () => {
    const entry = new ProjectModel();
    const repository: IProjectFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetProjectUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the project does not exist', async () => {
    const repository: IProjectFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetProjectUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/project/GetProjectUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { ProjectModel } from '../../domain/models/Project';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IProjectFinder {
  findById(id: string): Promise<ProjectModel | null>;
}

export class GetProjectUseCase {
  constructor(private readonly repository: IProjectFinder) {}

  async execute(id: string): Promise<ProjectModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Project not found');
    }

    return entry;
  }
}
```
Save as `backEnd/src/use-cases/project/GetProjectUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 6: Write the failing test for `CreateProjectUseCase`, then implement it**

```typescript
import { CreateProjectUseCase } from './CreateProjectUseCase';
import { ProjectModel } from '../../domain/models/Project';

interface IProjectCreator {
  create(data: Partial<ProjectModel>): Promise<ProjectModel>;
}

describe('CreateProjectUseCase', () => {
  it('creates and returns the new project', async () => {
    const created = new ProjectModel();
    const repository: IProjectCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateProjectUseCase(repository);
    const input = { title: 'Portfolio', description: 'desc', technologies: ['Next.js', 'TypeScript'] };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
```
Save as `backEnd/src/use-cases/project/CreateProjectUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { ProjectModel } from '../../domain/models/Project';
import { CreateProjectDto } from '../../infrastructure/dto/project/CreateProjectDto';

export interface IProjectCreator {
  create(data: Partial<ProjectModel>): Promise<ProjectModel>;
}

export class CreateProjectUseCase {
  constructor(private readonly repository: IProjectCreator) {}

  async execute(data: CreateProjectDto): Promise<ProjectModel> {
    return this.repository.create(data);
  }
}
```
Save as `backEnd/src/use-cases/project/CreateProjectUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 7: Write the failing test for `UpdateProjectUseCase`, then implement it**

```typescript
import { UpdateProjectUseCase } from './UpdateProjectUseCase';
import { ProjectModel } from '../../domain/models/Project';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IProjectUpdater {
  update(id: string, data: Partial<ProjectModel>): Promise<ProjectModel | null>;
}

describe('UpdateProjectUseCase', () => {
  it('updates and returns the project when it exists', async () => {
    const updated = new ProjectModel();
    const repository: IProjectUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateProjectUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the project does not exist', async () => {
    const repository: IProjectUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateProjectUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/project/UpdateProjectUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { ProjectModel } from '../../domain/models/Project';
import { UpdateProjectDto } from '../../infrastructure/dto/project/UpdateProjectDto';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IProjectUpdater {
  update(id: string, data: Partial<ProjectModel>): Promise<ProjectModel | null>;
}

export class UpdateProjectUseCase {
  constructor(private readonly repository: IProjectUpdater) {}

  async execute(id: string, data: UpdateProjectDto): Promise<ProjectModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Project not found');
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/project/UpdateProjectUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 8: Write the failing test for `DeleteProjectUseCase`, then implement it**

```typescript
import { DeleteProjectUseCase } from './DeleteProjectUseCase';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IProjectDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteProjectUseCase', () => {
  it('deletes when the project exists', async () => {
    const repository: IProjectDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteProjectUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the project does not exist', async () => {
    const repository: IProjectDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteProjectUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/project/DeleteProjectUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IProjectDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteProjectUseCase {
  constructor(private readonly repository: IProjectDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Project not found');
    }
  }
}
```
Save as `backEnd/src/use-cases/project/DeleteProjectUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 9: Run the full Project test suite**

Run: `cd backEnd && npx jest src/use-cases/project`
Expected: `Tests: 9 passed, 9 total`.

- [ ] **Step 10: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { ProjectEntity } from '../entities/ProjectEntity';
import { ProjectRepository } from '../repositories/ProjectRepository';
import { ListProjectUseCase } from '../../use-cases/project/ListProjectUseCase';
import { ListFeaturedProjectUseCase } from '../../use-cases/project/ListFeaturedProjectUseCase';
import { GetProjectUseCase } from '../../use-cases/project/GetProjectUseCase';
import { CreateProjectUseCase } from '../../use-cases/project/CreateProjectUseCase';
import { UpdateProjectUseCase } from '../../use-cases/project/UpdateProjectUseCase';
import { DeleteProjectUseCase } from '../../use-cases/project/DeleteProjectUseCase';

const repository = new ProjectRepository(AppDataSource.getRepository(ProjectEntity));
const listUseCase = new ListProjectUseCase(repository);
const featuredUseCase = new ListFeaturedProjectUseCase(repository);
const getUseCase = new GetProjectUseCase(repository);
const createUseCase = new CreateProjectUseCase(repository);
const updateUseCase = new UpdateProjectUseCase(repository);
const deleteUseCase = new DeleteProjectUseCase(repository);

export class ProjectController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = req.query.featured === 'true' ? await featuredUseCase.execute() : await listUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await updateUseCase.execute(req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/ProjectController.ts`.

- [ ] **Step 11: Implement the route**

Per the spec's route table, "featured" is a query param on the list endpoint (`GET /projects?featured=true`), not a separate path — `ProjectController.list` (Step 10) already branches on `req.query.featured`, so there's no extra route to register here, just `GET /`:

```typescript
import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateProjectDto } from '../dto/project/CreateProjectDto';
import { UpdateProjectDto } from '../dto/project/UpdateProjectDto';

const router = Router();

router.get('/', ProjectController.list);
router.get('/:id', ProjectController.get);
router.post('/', authMiddleware, validate(CreateProjectDto), ProjectController.create);
router.put('/:id', authMiddleware, validate(UpdateProjectDto), ProjectController.update);
router.delete('/:id', authMiddleware, ProjectController.remove);

export default router;
```
Save as `backEnd/src/infrastructure/routes/project.routes.ts`.

- [ ] **Step 12: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 13: Commit**

```bash
git add backEnd/src/infrastructure/repositories/ProjectRepository.ts backEnd/src/infrastructure/dto/project/ backEnd/src/use-cases/project/ backEnd/src/infrastructure/controllers/ProjectController.ts backEnd/src/infrastructure/routes/project.routes.ts
git commit -m "Add Project resource (repository, use-cases, controller, route)"
```

---

### Task 13: Skill resource

**Files:**
- Create: `backEnd/src/infrastructure/repositories/SkillRepository.ts`
- Create: `backEnd/src/infrastructure/dto/skill/CreateSkillDto.ts`
- Create: `backEnd/src/infrastructure/dto/skill/UpdateSkillDto.ts`
- Create: `backEnd/src/use-cases/skill/ListSkillUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/skill/ListSkillByCategoryUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/skill/ListSkillCategoriesUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/skill/GetSkillUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/skill/CreateSkillUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/skill/UpdateSkillUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/skill/DeleteSkillUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/infrastructure/controllers/SkillController.ts`
- Create: `backEnd/src/infrastructure/routes/skill.routes.ts`

**Interfaces:**
- Consumes: same shared pieces as Task 10. `SkillModel.level: number`, `SkillModel.icon: string` (Task 1).
- Produces: mounted route prefix `/skills` (Task 21).

- [ ] **Step 1: Implement `SkillRepository`**

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { SkillModel } from '../../domain/models/Skill';
import { SkillEntity } from '../entities/SkillEntity';
import { ISkillRepository } from '../../domain/interfaces/ISkillRepository';

export class SkillRepository extends BaseRepository<SkillModel, SkillEntity> implements ISkillRepository {
  constructor(repository: Repository<SkillEntity>) {
    super(repository);
  }

  protected toModel(entity: SkillEntity): SkillModel {
    const model = new SkillModel();
    model.id = entity.id;
    model.title = entity.title;
    model.category = entity.category;
    model.level = entity.level ?? 0;
    model.icon = entity.icon ?? '';
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<SkillModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findByCategory(category: string): Promise<SkillModel[]> {
    const entities = await this.repository.find({ where: { category }, order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findAllCategories(): Promise<string[]> {
    const rows = await this.repository
      .createQueryBuilder('skill')
      .select('DISTINCT skill.category', 'category')
      .getRawMany<{ category: string }>();
    return rows.map((row) => row.category);
  }
}
```
Save as `backEnd/src/infrastructure/repositories/SkillRepository.ts`.

- [ ] **Step 2: Create the DTOs**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  level?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/skill/CreateSkillDto.ts`.

```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  level?: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/skill/UpdateSkillDto.ts`.

- [ ] **Step 3: Write the failing test for `ListSkillUseCase`, then implement it**

```typescript
import { ListSkillUseCase } from './ListSkillUseCase';
import { ISkillRepository } from '../../domain/interfaces/ISkillRepository';
import { SkillModel } from '../../domain/models/Skill';

describe('ListSkillUseCase', () => {
  it('returns every skill ordered by the repository', async () => {
    const entries = [new SkillModel(), new SkillModel()];
    const repository: ISkillRepository = {
      findByOrder: jest.fn().mockResolvedValue(entries),
      findByCategory: jest.fn(),
      findAllCategories: jest.fn(),
    };
    const sut = new ListSkillUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/skill/ListSkillUseCase.test.ts`. Run: `cd backEnd && npx jest ListSkillUseCase.test.ts` — expect FAIL.

```typescript
import { ISkillRepository } from '../../domain/interfaces/ISkillRepository';
import { SkillModel } from '../../domain/models/Skill';

export class ListSkillUseCase {
  constructor(private readonly repository: ISkillRepository) {}

  async execute(): Promise<SkillModel[]> {
    return this.repository.findByOrder();
  }
}
```
Save as `backEnd/src/use-cases/skill/ListSkillUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 4: Write the failing test for `ListSkillByCategoryUseCase`, then implement it**

```typescript
import { ListSkillByCategoryUseCase } from './ListSkillByCategoryUseCase';
import { ISkillRepository } from '../../domain/interfaces/ISkillRepository';
import { SkillModel } from '../../domain/models/Skill';

describe('ListSkillByCategoryUseCase', () => {
  it('returns skills filtered by category', async () => {
    const entries = [new SkillModel()];
    const repository: ISkillRepository = {
      findByOrder: jest.fn(),
      findByCategory: jest.fn().mockResolvedValue(entries),
      findAllCategories: jest.fn(),
    };
    const sut = new ListSkillByCategoryUseCase(repository);

    const result = await sut.execute('tools');

    expect(repository.findByCategory).toHaveBeenCalledWith('tools');
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/skill/ListSkillByCategoryUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { ISkillRepository } from '../../domain/interfaces/ISkillRepository';
import { SkillModel } from '../../domain/models/Skill';

export class ListSkillByCategoryUseCase {
  constructor(private readonly repository: ISkillRepository) {}

  async execute(category: string): Promise<SkillModel[]> {
    return this.repository.findByCategory(category);
  }
}
```
Save as `backEnd/src/use-cases/skill/ListSkillByCategoryUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 5: Write the failing test for `ListSkillCategoriesUseCase`, then implement it**

```typescript
import { ListSkillCategoriesUseCase } from './ListSkillCategoriesUseCase';
import { ISkillRepository } from '../../domain/interfaces/ISkillRepository';

describe('ListSkillCategoriesUseCase', () => {
  it('returns the distinct category list', async () => {
    const repository: ISkillRepository = {
      findByOrder: jest.fn(),
      findByCategory: jest.fn(),
      findAllCategories: jest.fn().mockResolvedValue(['technical', 'tools']),
    };
    const sut = new ListSkillCategoriesUseCase(repository);

    const result = await sut.execute();

    expect(repository.findAllCategories).toHaveBeenCalled();
    expect(result).toEqual(['technical', 'tools']);
  });
});
```
Save as `backEnd/src/use-cases/skill/ListSkillCategoriesUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { ISkillRepository } from '../../domain/interfaces/ISkillRepository';

export class ListSkillCategoriesUseCase {
  constructor(private readonly repository: ISkillRepository) {}

  async execute(): Promise<string[]> {
    return this.repository.findAllCategories();
  }
}
```
Save as `backEnd/src/use-cases/skill/ListSkillCategoriesUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 6: Write the failing test for `GetSkillUseCase`, then implement it**

```typescript
import { GetSkillUseCase } from './GetSkillUseCase';
import { SkillModel } from '../../domain/models/Skill';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface ISkillFinder {
  findById(id: string): Promise<SkillModel | null>;
}

describe('GetSkillUseCase', () => {
  it('returns the skill when it exists', async () => {
    const entry = new SkillModel();
    const repository: ISkillFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetSkillUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the skill does not exist', async () => {
    const repository: ISkillFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetSkillUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/skill/GetSkillUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { SkillModel } from '../../domain/models/Skill';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface ISkillFinder {
  findById(id: string): Promise<SkillModel | null>;
}

export class GetSkillUseCase {
  constructor(private readonly repository: ISkillFinder) {}

  async execute(id: string): Promise<SkillModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Skill not found');
    }

    return entry;
  }
}
```
Save as `backEnd/src/use-cases/skill/GetSkillUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 7: Write the failing test for `CreateSkillUseCase`, then implement it**

```typescript
import { CreateSkillUseCase } from './CreateSkillUseCase';
import { SkillModel } from '../../domain/models/Skill';

interface ISkillCreator {
  create(data: Partial<SkillModel>): Promise<SkillModel>;
}

describe('CreateSkillUseCase', () => {
  it('creates and returns the new skill', async () => {
    const created = new SkillModel();
    const repository: ISkillCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateSkillUseCase(repository);
    const input = { title: 'TypeScript', category: 'technical' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
```
Save as `backEnd/src/use-cases/skill/CreateSkillUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { SkillModel } from '../../domain/models/Skill';
import { CreateSkillDto } from '../../infrastructure/dto/skill/CreateSkillDto';

export interface ISkillCreator {
  create(data: Partial<SkillModel>): Promise<SkillModel>;
}

export class CreateSkillUseCase {
  constructor(private readonly repository: ISkillCreator) {}

  async execute(data: CreateSkillDto): Promise<SkillModel> {
    return this.repository.create(data);
  }
}
```
Save as `backEnd/src/use-cases/skill/CreateSkillUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 8: Write the failing test for `UpdateSkillUseCase`, then implement it**

```typescript
import { UpdateSkillUseCase } from './UpdateSkillUseCase';
import { SkillModel } from '../../domain/models/Skill';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface ISkillUpdater {
  update(id: string, data: Partial<SkillModel>): Promise<SkillModel | null>;
}

describe('UpdateSkillUseCase', () => {
  it('updates and returns the skill when it exists', async () => {
    const updated = new SkillModel();
    const repository: ISkillUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateSkillUseCase(repository);

    const result = await sut.execute('1', { level: 80 });

    expect(repository.update).toHaveBeenCalledWith('1', { level: 80 });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the skill does not exist', async () => {
    const repository: ISkillUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateSkillUseCase(repository);

    await expect(sut.execute('missing', { level: 50 })).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/skill/UpdateSkillUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { SkillModel } from '../../domain/models/Skill';
import { UpdateSkillDto } from '../../infrastructure/dto/skill/UpdateSkillDto';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface ISkillUpdater {
  update(id: string, data: Partial<SkillModel>): Promise<SkillModel | null>;
}

export class UpdateSkillUseCase {
  constructor(private readonly repository: ISkillUpdater) {}

  async execute(id: string, data: UpdateSkillDto): Promise<SkillModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Skill not found');
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/skill/UpdateSkillUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 9: Write the failing test for `DeleteSkillUseCase`, then implement it**

```typescript
import { DeleteSkillUseCase } from './DeleteSkillUseCase';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface ISkillDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteSkillUseCase', () => {
  it('deletes when the skill exists', async () => {
    const repository: ISkillDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteSkillUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the skill does not exist', async () => {
    const repository: ISkillDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteSkillUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/skill/DeleteSkillUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface ISkillDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteSkillUseCase {
  constructor(private readonly repository: ISkillDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Skill not found');
    }
  }
}
```
Save as `backEnd/src/use-cases/skill/DeleteSkillUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 10: Run the full Skill test suite**

Run: `cd backEnd && npx jest src/use-cases/skill`
Expected: `Tests: 10 passed, 10 total`.

- [ ] **Step 11: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { SkillEntity } from '../entities/SkillEntity';
import { SkillRepository } from '../repositories/SkillRepository';
import { ListSkillUseCase } from '../../use-cases/skill/ListSkillUseCase';
import { ListSkillByCategoryUseCase } from '../../use-cases/skill/ListSkillByCategoryUseCase';
import { ListSkillCategoriesUseCase } from '../../use-cases/skill/ListSkillCategoriesUseCase';
import { GetSkillUseCase } from '../../use-cases/skill/GetSkillUseCase';
import { CreateSkillUseCase } from '../../use-cases/skill/CreateSkillUseCase';
import { UpdateSkillUseCase } from '../../use-cases/skill/UpdateSkillUseCase';
import { DeleteSkillUseCase } from '../../use-cases/skill/DeleteSkillUseCase';

const repository = new SkillRepository(AppDataSource.getRepository(SkillEntity));
const listUseCase = new ListSkillUseCase(repository);
const byCategoryUseCase = new ListSkillByCategoryUseCase(repository);
const categoriesUseCase = new ListSkillCategoriesUseCase(repository);
const getUseCase = new GetSkillUseCase(repository);
const createUseCase = new CreateSkillUseCase(repository);
const updateUseCase = new UpdateSkillUseCase(repository);
const deleteUseCase = new DeleteSkillUseCase(repository);

export class SkillController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const result = category ? await byCategoryUseCase.execute(category) : await listUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async categories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await categoriesUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await updateUseCase.execute(req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/SkillController.ts`.

- [ ] **Step 12: Implement the route**

`/categories` is a fixed path and must be registered before `/:id`:

```typescript
import { Router } from 'express';
import { SkillController } from '../controllers/SkillController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateSkillDto } from '../dto/skill/CreateSkillDto';
import { UpdateSkillDto } from '../dto/skill/UpdateSkillDto';

const router = Router();

router.get('/', SkillController.list);
router.get('/categories', SkillController.categories);
router.get('/:id', SkillController.get);
router.post('/', authMiddleware, validate(CreateSkillDto), SkillController.create);
router.put('/:id', authMiddleware, validate(UpdateSkillDto), SkillController.update);
router.delete('/:id', authMiddleware, SkillController.remove);

export default router;
```
Save as `backEnd/src/infrastructure/routes/skill.routes.ts`.

- [ ] **Step 13: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 14: Commit**

```bash
git add backEnd/src/infrastructure/repositories/SkillRepository.ts backEnd/src/infrastructure/dto/skill/ backEnd/src/use-cases/skill/ backEnd/src/infrastructure/controllers/SkillController.ts backEnd/src/infrastructure/routes/skill.routes.ts
git commit -m "Add Skill resource (repository, use-cases, controller, route)"
```

---

### Task 14: SocialLink resource

Simplest shape in this plan — only `findByOrder`, five use-cases (no extra query method).

**Files:**
- Create: `backEnd/src/infrastructure/repositories/SocialLinkRepository.ts`
- Create: `backEnd/src/infrastructure/dto/social-link/CreateSocialLinkDto.ts`
- Create: `backEnd/src/infrastructure/dto/social-link/UpdateSocialLinkDto.ts`
- Create: `backEnd/src/use-cases/social-link/ListSocialLinkUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/social-link/GetSocialLinkUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/social-link/CreateSocialLinkUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/social-link/UpdateSocialLinkUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/social-link/DeleteSocialLinkUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/infrastructure/controllers/SocialLinkController.ts`
- Create: `backEnd/src/infrastructure/routes/social-link.routes.ts`

**Interfaces:**
- Consumes: same shared pieces as Task 10.
- Produces: mounted route prefix `/social-links` (Task 21).

- [ ] **Step 1: Implement `SocialLinkRepository`**

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { SocialLinkModel } from '../../domain/models/SocialLink';
import { SocialLinkEntity } from '../entities/SocialLinkEntity';
import { ISocialLinkRepository } from '../../domain/interfaces/ISocialLinkRepository';

export class SocialLinkRepository
  extends BaseRepository<SocialLinkModel, SocialLinkEntity>
  implements ISocialLinkRepository
{
  constructor(repository: Repository<SocialLinkEntity>) {
    super(repository);
  }

  protected toModel(entity: SocialLinkEntity): SocialLinkModel {
    const model = new SocialLinkModel();
    model.id = entity.id;
    model.platform = entity.platform;
    model.url = entity.url;
    model.logo = entity.logo ?? '';
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<SocialLinkModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
```
Save as `backEnd/src/infrastructure/repositories/SocialLinkRepository.ts`.

- [ ] **Step 2: Create the DTOs**

```typescript
import { IsString, IsNotEmpty, IsUrl, IsOptional, IsInt, Min } from 'class-validator';

export class CreateSocialLinkDto {
  @IsString()
  @IsNotEmpty()
  platform!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/social-link/CreateSocialLinkDto.ts`.

```typescript
import { IsString, IsNotEmpty, IsUrl, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateSocialLinkDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  platform?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/social-link/UpdateSocialLinkDto.ts`.

- [ ] **Step 3: Write the failing test for `ListSocialLinkUseCase`, then implement it**

```typescript
import { ListSocialLinkUseCase } from './ListSocialLinkUseCase';
import { ISocialLinkRepository } from '../../domain/interfaces/ISocialLinkRepository';
import { SocialLinkModel } from '../../domain/models/SocialLink';

describe('ListSocialLinkUseCase', () => {
  it('returns every social link ordered by the repository', async () => {
    const entries = [new SocialLinkModel(), new SocialLinkModel()];
    const repository: ISocialLinkRepository = { findByOrder: jest.fn().mockResolvedValue(entries) };
    const sut = new ListSocialLinkUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/social-link/ListSocialLinkUseCase.test.ts`. Run: `cd backEnd && npx jest ListSocialLinkUseCase.test.ts` — expect FAIL.

```typescript
import { ISocialLinkRepository } from '../../domain/interfaces/ISocialLinkRepository';
import { SocialLinkModel } from '../../domain/models/SocialLink';

export class ListSocialLinkUseCase {
  constructor(private readonly repository: ISocialLinkRepository) {}

  async execute(): Promise<SocialLinkModel[]> {
    return this.repository.findByOrder();
  }
}
```
Save as `backEnd/src/use-cases/social-link/ListSocialLinkUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 4: Write the failing test for `GetSocialLinkUseCase`, then implement it**

```typescript
import { GetSocialLinkUseCase } from './GetSocialLinkUseCase';
import { SocialLinkModel } from '../../domain/models/SocialLink';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface ISocialLinkFinder {
  findById(id: string): Promise<SocialLinkModel | null>;
}

describe('GetSocialLinkUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new SocialLinkModel();
    const repository: ISocialLinkFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetSocialLinkUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ISocialLinkFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetSocialLinkUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/social-link/GetSocialLinkUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { SocialLinkModel } from '../../domain/models/SocialLink';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface ISocialLinkFinder {
  findById(id: string): Promise<SocialLinkModel | null>;
}

export class GetSocialLinkUseCase {
  constructor(private readonly repository: ISocialLinkFinder) {}

  async execute(id: string): Promise<SocialLinkModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Social link not found');
    }

    return entry;
  }
}
```
Save as `backEnd/src/use-cases/social-link/GetSocialLinkUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 5: Write the failing test for `CreateSocialLinkUseCase`, then implement it**

```typescript
import { CreateSocialLinkUseCase } from './CreateSocialLinkUseCase';
import { SocialLinkModel } from '../../domain/models/SocialLink';

interface ISocialLinkCreator {
  create(data: Partial<SocialLinkModel>): Promise<SocialLinkModel>;
}

describe('CreateSocialLinkUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new SocialLinkModel();
    const repository: ISocialLinkCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateSocialLinkUseCase(repository);
    const input = { platform: 'GitHub', url: 'https://github.com/example' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
```
Save as `backEnd/src/use-cases/social-link/CreateSocialLinkUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { SocialLinkModel } from '../../domain/models/SocialLink';
import { CreateSocialLinkDto } from '../../infrastructure/dto/social-link/CreateSocialLinkDto';

export interface ISocialLinkCreator {
  create(data: Partial<SocialLinkModel>): Promise<SocialLinkModel>;
}

export class CreateSocialLinkUseCase {
  constructor(private readonly repository: ISocialLinkCreator) {}

  async execute(data: CreateSocialLinkDto): Promise<SocialLinkModel> {
    return this.repository.create(data);
  }
}
```
Save as `backEnd/src/use-cases/social-link/CreateSocialLinkUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 6: Write the failing test for `UpdateSocialLinkUseCase`, then implement it**

```typescript
import { UpdateSocialLinkUseCase } from './UpdateSocialLinkUseCase';
import { SocialLinkModel } from '../../domain/models/SocialLink';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface ISocialLinkUpdater {
  update(id: string, data: Partial<SocialLinkModel>): Promise<SocialLinkModel | null>;
}

describe('UpdateSocialLinkUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new SocialLinkModel();
    const repository: ISocialLinkUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateSocialLinkUseCase(repository);

    const result = await sut.execute('1', { url: 'https://new-url.com' });

    expect(repository.update).toHaveBeenCalledWith('1', { url: 'https://new-url.com' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ISocialLinkUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateSocialLinkUseCase(repository);

    await expect(sut.execute('missing', { url: 'https://x.com' })).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/social-link/UpdateSocialLinkUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { SocialLinkModel } from '../../domain/models/SocialLink';
import { UpdateSocialLinkDto } from '../../infrastructure/dto/social-link/UpdateSocialLinkDto';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface ISocialLinkUpdater {
  update(id: string, data: Partial<SocialLinkModel>): Promise<SocialLinkModel | null>;
}

export class UpdateSocialLinkUseCase {
  constructor(private readonly repository: ISocialLinkUpdater) {}

  async execute(id: string, data: UpdateSocialLinkDto): Promise<SocialLinkModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Social link not found');
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/social-link/UpdateSocialLinkUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 7: Write the failing test for `DeleteSocialLinkUseCase`, then implement it**

```typescript
import { DeleteSocialLinkUseCase } from './DeleteSocialLinkUseCase';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface ISocialLinkDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteSocialLinkUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: ISocialLinkDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteSocialLinkUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ISocialLinkDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteSocialLinkUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/social-link/DeleteSocialLinkUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface ISocialLinkDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteSocialLinkUseCase {
  constructor(private readonly repository: ISocialLinkDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Social link not found');
    }
  }
}
```
Save as `backEnd/src/use-cases/social-link/DeleteSocialLinkUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 8: Run the full SocialLink test suite**

Run: `cd backEnd && npx jest src/use-cases/social-link`
Expected: `Tests: 7 passed, 7 total`.

- [ ] **Step 9: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { SocialLinkEntity } from '../entities/SocialLinkEntity';
import { SocialLinkRepository } from '../repositories/SocialLinkRepository';
import { ListSocialLinkUseCase } from '../../use-cases/social-link/ListSocialLinkUseCase';
import { GetSocialLinkUseCase } from '../../use-cases/social-link/GetSocialLinkUseCase';
import { CreateSocialLinkUseCase } from '../../use-cases/social-link/CreateSocialLinkUseCase';
import { UpdateSocialLinkUseCase } from '../../use-cases/social-link/UpdateSocialLinkUseCase';
import { DeleteSocialLinkUseCase } from '../../use-cases/social-link/DeleteSocialLinkUseCase';

const repository = new SocialLinkRepository(AppDataSource.getRepository(SocialLinkEntity));
const listUseCase = new ListSocialLinkUseCase(repository);
const getUseCase = new GetSocialLinkUseCase(repository);
const createUseCase = new CreateSocialLinkUseCase(repository);
const updateUseCase = new UpdateSocialLinkUseCase(repository);
const deleteUseCase = new DeleteSocialLinkUseCase(repository);

export class SocialLinkController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await listUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await updateUseCase.execute(req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/SocialLinkController.ts`.

- [ ] **Step 10: Implement the route**

```typescript
import { Router } from 'express';
import { SocialLinkController } from '../controllers/SocialLinkController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateSocialLinkDto } from '../dto/social-link/CreateSocialLinkDto';
import { UpdateSocialLinkDto } from '../dto/social-link/UpdateSocialLinkDto';

const router = Router();

router.get('/', SocialLinkController.list);
router.get('/:id', SocialLinkController.get);
router.post('/', authMiddleware, validate(CreateSocialLinkDto), SocialLinkController.create);
router.put('/:id', authMiddleware, validate(UpdateSocialLinkDto), SocialLinkController.update);
router.delete('/:id', authMiddleware, SocialLinkController.remove);

export default router;
```
Save as `backEnd/src/infrastructure/routes/social-link.routes.ts`.

- [ ] **Step 11: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add backEnd/src/infrastructure/repositories/SocialLinkRepository.ts backEnd/src/infrastructure/dto/social-link/ backEnd/src/use-cases/social-link/ backEnd/src/infrastructure/controllers/SocialLinkController.ts backEnd/src/infrastructure/routes/social-link.routes.ts
git commit -m "Add SocialLink resource (repository, use-cases, controller, route)"
```

---

### Task 15: Strength resource

Same simple shape as Task 14 (SocialLink) — only `findByOrder`, five use-cases.

**Files:**
- Create: `backEnd/src/infrastructure/repositories/StrengthRepository.ts`
- Create: `backEnd/src/infrastructure/dto/strength/CreateStrengthDto.ts`
- Create: `backEnd/src/infrastructure/dto/strength/UpdateStrengthDto.ts`
- Create: `backEnd/src/use-cases/strength/ListStrengthUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/strength/GetStrengthUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/strength/CreateStrengthUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/strength/UpdateStrengthUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/strength/DeleteStrengthUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/infrastructure/controllers/StrengthController.ts`
- Create: `backEnd/src/infrastructure/routes/strength.routes.ts`

**Interfaces:**
- Consumes: same shared pieces as Task 10.
- Produces: mounted route prefix `/strengths` (Task 21).

- [ ] **Step 1: Implement `StrengthRepository`**

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { StrengthModel } from '../../domain/models/Strength';
import { StrengthEntity } from '../entities/StrengthEntity';
import { IStrengthRepository } from '../../domain/interfaces/IStrengthRepository';

export class StrengthRepository
  extends BaseRepository<StrengthModel, StrengthEntity>
  implements IStrengthRepository
{
  constructor(repository: Repository<StrengthEntity>) {
    super(repository);
  }

  protected toModel(entity: StrengthEntity): StrengthModel {
    const model = new StrengthModel();
    model.id = entity.id;
    model.title = entity.title;
    model.description = entity.description;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<StrengthModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
```
Save as `backEnd/src/infrastructure/repositories/StrengthRepository.ts`.

- [ ] **Step 2: Create the DTOs**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateStrengthDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/strength/CreateStrengthDto.ts`.

```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateStrengthDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/strength/UpdateStrengthDto.ts`.

- [ ] **Step 3: Write the failing test for `ListStrengthUseCase`, then implement it**

```typescript
import { ListStrengthUseCase } from './ListStrengthUseCase';
import { IStrengthRepository } from '../../domain/interfaces/IStrengthRepository';
import { StrengthModel } from '../../domain/models/Strength';

describe('ListStrengthUseCase', () => {
  it('returns every strength ordered by the repository', async () => {
    const entries = [new StrengthModel(), new StrengthModel()];
    const repository: IStrengthRepository = { findByOrder: jest.fn().mockResolvedValue(entries) };
    const sut = new ListStrengthUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/strength/ListStrengthUseCase.test.ts`. Run: `cd backEnd && npx jest ListStrengthUseCase.test.ts` — expect FAIL.

```typescript
import { IStrengthRepository } from '../../domain/interfaces/IStrengthRepository';
import { StrengthModel } from '../../domain/models/Strength';

export class ListStrengthUseCase {
  constructor(private readonly repository: IStrengthRepository) {}

  async execute(): Promise<StrengthModel[]> {
    return this.repository.findByOrder();
  }
}
```
Save as `backEnd/src/use-cases/strength/ListStrengthUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 4: Write the failing test for `GetStrengthUseCase`, then implement it**

```typescript
import { GetStrengthUseCase } from './GetStrengthUseCase';
import { StrengthModel } from '../../domain/models/Strength';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IStrengthFinder {
  findById(id: string): Promise<StrengthModel | null>;
}

describe('GetStrengthUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new StrengthModel();
    const repository: IStrengthFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetStrengthUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IStrengthFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetStrengthUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/strength/GetStrengthUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { StrengthModel } from '../../domain/models/Strength';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IStrengthFinder {
  findById(id: string): Promise<StrengthModel | null>;
}

export class GetStrengthUseCase {
  constructor(private readonly repository: IStrengthFinder) {}

  async execute(id: string): Promise<StrengthModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Strength not found');
    }

    return entry;
  }
}
```
Save as `backEnd/src/use-cases/strength/GetStrengthUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 5: Write the failing test for `CreateStrengthUseCase`, then implement it**

```typescript
import { CreateStrengthUseCase } from './CreateStrengthUseCase';
import { StrengthModel } from '../../domain/models/Strength';

interface IStrengthCreator {
  create(data: Partial<StrengthModel>): Promise<StrengthModel>;
}

describe('CreateStrengthUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new StrengthModel();
    const repository: IStrengthCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateStrengthUseCase(repository);
    const input = { title: 'Adaptability', description: 'desc' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
```
Save as `backEnd/src/use-cases/strength/CreateStrengthUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { StrengthModel } from '../../domain/models/Strength';
import { CreateStrengthDto } from '../../infrastructure/dto/strength/CreateStrengthDto';

export interface IStrengthCreator {
  create(data: Partial<StrengthModel>): Promise<StrengthModel>;
}

export class CreateStrengthUseCase {
  constructor(private readonly repository: IStrengthCreator) {}

  async execute(data: CreateStrengthDto): Promise<StrengthModel> {
    return this.repository.create(data);
  }
}
```
Save as `backEnd/src/use-cases/strength/CreateStrengthUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 6: Write the failing test for `UpdateStrengthUseCase`, then implement it**

```typescript
import { UpdateStrengthUseCase } from './UpdateStrengthUseCase';
import { StrengthModel } from '../../domain/models/Strength';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IStrengthUpdater {
  update(id: string, data: Partial<StrengthModel>): Promise<StrengthModel | null>;
}

describe('UpdateStrengthUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new StrengthModel();
    const repository: IStrengthUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateStrengthUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IStrengthUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateStrengthUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/strength/UpdateStrengthUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { StrengthModel } from '../../domain/models/Strength';
import { UpdateStrengthDto } from '../../infrastructure/dto/strength/UpdateStrengthDto';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IStrengthUpdater {
  update(id: string, data: Partial<StrengthModel>): Promise<StrengthModel | null>;
}

export class UpdateStrengthUseCase {
  constructor(private readonly repository: IStrengthUpdater) {}

  async execute(id: string, data: UpdateStrengthDto): Promise<StrengthModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Strength not found');
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/strength/UpdateStrengthUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 7: Write the failing test for `DeleteStrengthUseCase`, then implement it**

```typescript
import { DeleteStrengthUseCase } from './DeleteStrengthUseCase';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IStrengthDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteStrengthUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: IStrengthDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteStrengthUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IStrengthDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteStrengthUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/strength/DeleteStrengthUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IStrengthDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteStrengthUseCase {
  constructor(private readonly repository: IStrengthDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Strength not found');
    }
  }
}
```
Save as `backEnd/src/use-cases/strength/DeleteStrengthUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 8: Run the full Strength test suite**

Run: `cd backEnd && npx jest src/use-cases/strength`
Expected: `Tests: 7 passed, 7 total`.

- [ ] **Step 9: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { StrengthEntity } from '../entities/StrengthEntity';
import { StrengthRepository } from '../repositories/StrengthRepository';
import { ListStrengthUseCase } from '../../use-cases/strength/ListStrengthUseCase';
import { GetStrengthUseCase } from '../../use-cases/strength/GetStrengthUseCase';
import { CreateStrengthUseCase } from '../../use-cases/strength/CreateStrengthUseCase';
import { UpdateStrengthUseCase } from '../../use-cases/strength/UpdateStrengthUseCase';
import { DeleteStrengthUseCase } from '../../use-cases/strength/DeleteStrengthUseCase';

const repository = new StrengthRepository(AppDataSource.getRepository(StrengthEntity));
const listUseCase = new ListStrengthUseCase(repository);
const getUseCase = new GetStrengthUseCase(repository);
const createUseCase = new CreateStrengthUseCase(repository);
const updateUseCase = new UpdateStrengthUseCase(repository);
const deleteUseCase = new DeleteStrengthUseCase(repository);

export class StrengthController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await listUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await updateUseCase.execute(req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/StrengthController.ts`.

- [ ] **Step 10: Implement the route**

```typescript
import { Router } from 'express';
import { StrengthController } from '../controllers/StrengthController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateStrengthDto } from '../dto/strength/CreateStrengthDto';
import { UpdateStrengthDto } from '../dto/strength/UpdateStrengthDto';

const router = Router();

router.get('/', StrengthController.list);
router.get('/:id', StrengthController.get);
router.post('/', authMiddleware, validate(CreateStrengthDto), StrengthController.create);
router.put('/:id', authMiddleware, validate(UpdateStrengthDto), StrengthController.update);
router.delete('/:id', authMiddleware, StrengthController.remove);

export default router;
```
Save as `backEnd/src/infrastructure/routes/strength.routes.ts`.

- [ ] **Step 11: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add backEnd/src/infrastructure/repositories/StrengthRepository.ts backEnd/src/infrastructure/dto/strength/ backEnd/src/use-cases/strength/ backEnd/src/infrastructure/controllers/StrengthController.ts backEnd/src/infrastructure/routes/strength.routes.ts
git commit -m "Add Strength resource (repository, use-cases, controller, route)"
```

---

### Task 16: Interest resource

Same simple shape as Task 15 (Strength) — `title`, `description`, `order`, only `findByOrder`, five use-cases.

**Files:**
- Create: `backEnd/src/infrastructure/repositories/InterestRepository.ts`
- Create: `backEnd/src/infrastructure/dto/interest/CreateInterestDto.ts`
- Create: `backEnd/src/infrastructure/dto/interest/UpdateInterestDto.ts`
- Create: `backEnd/src/use-cases/interest/ListInterestUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/interest/GetInterestUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/interest/CreateInterestUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/interest/UpdateInterestUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/interest/DeleteInterestUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/infrastructure/controllers/InterestController.ts`
- Create: `backEnd/src/infrastructure/routes/interest.routes.ts`

**Interfaces:**
- Consumes: same shared pieces as Task 10.
- Produces: mounted route prefix `/interests` (Task 21).

- [ ] **Step 1: Implement `InterestRepository`**

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { InterestModel } from '../../domain/models/Interest';
import { InterestEntity } from '../entities/InterestEntity';
import { IInterestRepository } from '../../domain/interfaces/IInterestRepository';

export class InterestRepository
  extends BaseRepository<InterestModel, InterestEntity>
  implements IInterestRepository
{
  constructor(repository: Repository<InterestEntity>) {
    super(repository);
  }

  protected toModel(entity: InterestEntity): InterestModel {
    const model = new InterestModel();
    model.id = entity.id;
    model.title = entity.title;
    model.description = entity.description;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<InterestModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
```
Save as `backEnd/src/infrastructure/repositories/InterestRepository.ts`.

- [ ] **Step 2: Create the DTOs**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateInterestDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/interest/CreateInterestDto.ts`.

```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateInterestDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/interest/UpdateInterestDto.ts`.

- [ ] **Step 3: Write the failing test for `ListInterestUseCase`, then implement it**

```typescript
import { ListInterestUseCase } from './ListInterestUseCase';
import { IInterestRepository } from '../../domain/interfaces/IInterestRepository';
import { InterestModel } from '../../domain/models/Interest';

describe('ListInterestUseCase', () => {
  it('returns every interest ordered by the repository', async () => {
    const entries = [new InterestModel(), new InterestModel()];
    const repository: IInterestRepository = { findByOrder: jest.fn().mockResolvedValue(entries) };
    const sut = new ListInterestUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/interest/ListInterestUseCase.test.ts`. Run: `cd backEnd && npx jest ListInterestUseCase.test.ts` — expect FAIL.

```typescript
import { IInterestRepository } from '../../domain/interfaces/IInterestRepository';
import { InterestModel } from '../../domain/models/Interest';

export class ListInterestUseCase {
  constructor(private readonly repository: IInterestRepository) {}

  async execute(): Promise<InterestModel[]> {
    return this.repository.findByOrder();
  }
}
```
Save as `backEnd/src/use-cases/interest/ListInterestUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 4: Write the failing test for `GetInterestUseCase`, then implement it**

```typescript
import { GetInterestUseCase } from './GetInterestUseCase';
import { InterestModel } from '../../domain/models/Interest';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IInterestFinder {
  findById(id: string): Promise<InterestModel | null>;
}

describe('GetInterestUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new InterestModel();
    const repository: IInterestFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetInterestUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IInterestFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetInterestUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/interest/GetInterestUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { InterestModel } from '../../domain/models/Interest';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IInterestFinder {
  findById(id: string): Promise<InterestModel | null>;
}

export class GetInterestUseCase {
  constructor(private readonly repository: IInterestFinder) {}

  async execute(id: string): Promise<InterestModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Interest not found');
    }

    return entry;
  }
}
```
Save as `backEnd/src/use-cases/interest/GetInterestUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 5: Write the failing test for `CreateInterestUseCase`, then implement it**

```typescript
import { CreateInterestUseCase } from './CreateInterestUseCase';
import { InterestModel } from '../../domain/models/Interest';

interface IInterestCreator {
  create(data: Partial<InterestModel>): Promise<InterestModel>;
}

describe('CreateInterestUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new InterestModel();
    const repository: IInterestCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateInterestUseCase(repository);
    const input = { title: 'Chess', description: 'desc' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
```
Save as `backEnd/src/use-cases/interest/CreateInterestUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { InterestModel } from '../../domain/models/Interest';
import { CreateInterestDto } from '../../infrastructure/dto/interest/CreateInterestDto';

export interface IInterestCreator {
  create(data: Partial<InterestModel>): Promise<InterestModel>;
}

export class CreateInterestUseCase {
  constructor(private readonly repository: IInterestCreator) {}

  async execute(data: CreateInterestDto): Promise<InterestModel> {
    return this.repository.create(data);
  }
}
```
Save as `backEnd/src/use-cases/interest/CreateInterestUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 6: Write the failing test for `UpdateInterestUseCase`, then implement it**

```typescript
import { UpdateInterestUseCase } from './UpdateInterestUseCase';
import { InterestModel } from '../../domain/models/Interest';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IInterestUpdater {
  update(id: string, data: Partial<InterestModel>): Promise<InterestModel | null>;
}

describe('UpdateInterestUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new InterestModel();
    const repository: IInterestUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateInterestUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IInterestUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateInterestUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/interest/UpdateInterestUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { InterestModel } from '../../domain/models/Interest';
import { UpdateInterestDto } from '../../infrastructure/dto/interest/UpdateInterestDto';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IInterestUpdater {
  update(id: string, data: Partial<InterestModel>): Promise<InterestModel | null>;
}

export class UpdateInterestUseCase {
  constructor(private readonly repository: IInterestUpdater) {}

  async execute(id: string, data: UpdateInterestDto): Promise<InterestModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Interest not found');
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/interest/UpdateInterestUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 7: Write the failing test for `DeleteInterestUseCase`, then implement it**

```typescript
import { DeleteInterestUseCase } from './DeleteInterestUseCase';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IInterestDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteInterestUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: IInterestDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteInterestUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: IInterestDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteInterestUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/interest/DeleteInterestUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IInterestDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteInterestUseCase {
  constructor(private readonly repository: IInterestDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Interest not found');
    }
  }
}
```
Save as `backEnd/src/use-cases/interest/DeleteInterestUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 8: Run the full Interest test suite**

Run: `cd backEnd && npx jest src/use-cases/interest`
Expected: `Tests: 7 passed, 7 total`.

- [ ] **Step 9: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { InterestEntity } from '../entities/InterestEntity';
import { InterestRepository } from '../repositories/InterestRepository';
import { ListInterestUseCase } from '../../use-cases/interest/ListInterestUseCase';
import { GetInterestUseCase } from '../../use-cases/interest/GetInterestUseCase';
import { CreateInterestUseCase } from '../../use-cases/interest/CreateInterestUseCase';
import { UpdateInterestUseCase } from '../../use-cases/interest/UpdateInterestUseCase';
import { DeleteInterestUseCase } from '../../use-cases/interest/DeleteInterestUseCase';

const repository = new InterestRepository(AppDataSource.getRepository(InterestEntity));
const listUseCase = new ListInterestUseCase(repository);
const getUseCase = new GetInterestUseCase(repository);
const createUseCase = new CreateInterestUseCase(repository);
const updateUseCase = new UpdateInterestUseCase(repository);
const deleteUseCase = new DeleteInterestUseCase(repository);

export class InterestController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await listUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await updateUseCase.execute(req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/InterestController.ts`.

- [ ] **Step 10: Implement the route**

```typescript
import { Router } from 'express';
import { InterestController } from '../controllers/InterestController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateInterestDto } from '../dto/interest/CreateInterestDto';
import { UpdateInterestDto } from '../dto/interest/UpdateInterestDto';

const router = Router();

router.get('/', InterestController.list);
router.get('/:id', InterestController.get);
router.post('/', authMiddleware, validate(CreateInterestDto), InterestController.create);
router.put('/:id', authMiddleware, validate(UpdateInterestDto), InterestController.update);
router.delete('/:id', authMiddleware, InterestController.remove);

export default router;
```
Save as `backEnd/src/infrastructure/routes/interest.routes.ts`.

- [ ] **Step 11: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add backEnd/src/infrastructure/repositories/InterestRepository.ts backEnd/src/infrastructure/dto/interest/ backEnd/src/use-cases/interest/ backEnd/src/infrastructure/controllers/InterestController.ts backEnd/src/infrastructure/routes/interest.routes.ts
git commit -m "Add Interest resource (repository, use-cases, controller, route)"
```

---

### Task 17: Language resource

Same simple shape as Task 15/16 — `title`, `level` (string, e.g. "native"/"fluent"), `order`, only `findByOrder`, five use-cases.

**Files:**
- Create: `backEnd/src/infrastructure/repositories/LanguageRepository.ts`
- Create: `backEnd/src/infrastructure/dto/language/CreateLanguageDto.ts`
- Create: `backEnd/src/infrastructure/dto/language/UpdateLanguageDto.ts`
- Create: `backEnd/src/use-cases/language/ListLanguageUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/language/GetLanguageUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/language/CreateLanguageUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/language/UpdateLanguageUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/language/DeleteLanguageUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/infrastructure/controllers/LanguageController.ts`
- Create: `backEnd/src/infrastructure/routes/language.routes.ts`

**Interfaces:**
- Consumes: same shared pieces as Task 10.
- Produces: mounted route prefix `/languages` (Task 21).

- [ ] **Step 1: Implement `LanguageRepository`**

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { LanguageModel } from '../../domain/models/Language';
import { LanguageEntity } from '../entities/LanguageEntity';
import { ILanguageRepository } from '../../domain/interfaces/ILanguageRepository';

export class LanguageRepository
  extends BaseRepository<LanguageModel, LanguageEntity>
  implements ILanguageRepository
{
  constructor(repository: Repository<LanguageEntity>) {
    super(repository);
  }

  protected toModel(entity: LanguageEntity): LanguageModel {
    const model = new LanguageModel();
    model.id = entity.id;
    model.title = entity.title;
    model.level = entity.level;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<LanguageModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }
}
```
Save as `backEnd/src/infrastructure/repositories/LanguageRepository.ts`.

- [ ] **Step 2: Create the DTOs**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateLanguageDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  level!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/language/CreateLanguageDto.ts`.

```typescript
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateLanguageDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  level?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/language/UpdateLanguageDto.ts`.

- [ ] **Step 3: Write the failing test for `ListLanguageUseCase`, then implement it**

```typescript
import { ListLanguageUseCase } from './ListLanguageUseCase';
import { ILanguageRepository } from '../../domain/interfaces/ILanguageRepository';
import { LanguageModel } from '../../domain/models/Language';

describe('ListLanguageUseCase', () => {
  it('returns every language ordered by the repository', async () => {
    const entries = [new LanguageModel(), new LanguageModel()];
    const repository: ILanguageRepository = { findByOrder: jest.fn().mockResolvedValue(entries) };
    const sut = new ListLanguageUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/language/ListLanguageUseCase.test.ts`. Run: `cd backEnd && npx jest ListLanguageUseCase.test.ts` — expect FAIL.

```typescript
import { ILanguageRepository } from '../../domain/interfaces/ILanguageRepository';
import { LanguageModel } from '../../domain/models/Language';

export class ListLanguageUseCase {
  constructor(private readonly repository: ILanguageRepository) {}

  async execute(): Promise<LanguageModel[]> {
    return this.repository.findByOrder();
  }
}
```
Save as `backEnd/src/use-cases/language/ListLanguageUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 4: Write the failing test for `GetLanguageUseCase`, then implement it**

```typescript
import { GetLanguageUseCase } from './GetLanguageUseCase';
import { LanguageModel } from '../../domain/models/Language';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface ILanguageFinder {
  findById(id: string): Promise<LanguageModel | null>;
}

describe('GetLanguageUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new LanguageModel();
    const repository: ILanguageFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetLanguageUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ILanguageFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetLanguageUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/language/GetLanguageUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { LanguageModel } from '../../domain/models/Language';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface ILanguageFinder {
  findById(id: string): Promise<LanguageModel | null>;
}

export class GetLanguageUseCase {
  constructor(private readonly repository: ILanguageFinder) {}

  async execute(id: string): Promise<LanguageModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('Language not found');
    }

    return entry;
  }
}
```
Save as `backEnd/src/use-cases/language/GetLanguageUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 5: Write the failing test for `CreateLanguageUseCase`, then implement it**

```typescript
import { CreateLanguageUseCase } from './CreateLanguageUseCase';
import { LanguageModel } from '../../domain/models/Language';

interface ILanguageCreator {
  create(data: Partial<LanguageModel>): Promise<LanguageModel>;
}

describe('CreateLanguageUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new LanguageModel();
    const repository: ILanguageCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateLanguageUseCase(repository);
    const input = { title: 'English', level: 'fluent' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
```
Save as `backEnd/src/use-cases/language/CreateLanguageUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { LanguageModel } from '../../domain/models/Language';
import { CreateLanguageDto } from '../../infrastructure/dto/language/CreateLanguageDto';

export interface ILanguageCreator {
  create(data: Partial<LanguageModel>): Promise<LanguageModel>;
}

export class CreateLanguageUseCase {
  constructor(private readonly repository: ILanguageCreator) {}

  async execute(data: CreateLanguageDto): Promise<LanguageModel> {
    return this.repository.create(data);
  }
}
```
Save as `backEnd/src/use-cases/language/CreateLanguageUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 6: Write the failing test for `UpdateLanguageUseCase`, then implement it**

```typescript
import { UpdateLanguageUseCase } from './UpdateLanguageUseCase';
import { LanguageModel } from '../../domain/models/Language';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface ILanguageUpdater {
  update(id: string, data: Partial<LanguageModel>): Promise<LanguageModel | null>;
}

describe('UpdateLanguageUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new LanguageModel();
    const repository: ILanguageUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateLanguageUseCase(repository);

    const result = await sut.execute('1', { level: 'native' });

    expect(repository.update).toHaveBeenCalledWith('1', { level: 'native' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ILanguageUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateLanguageUseCase(repository);

    await expect(sut.execute('missing', { level: 'native' })).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/language/UpdateLanguageUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { LanguageModel } from '../../domain/models/Language';
import { UpdateLanguageDto } from '../../infrastructure/dto/language/UpdateLanguageDto';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface ILanguageUpdater {
  update(id: string, data: Partial<LanguageModel>): Promise<LanguageModel | null>;
}

export class UpdateLanguageUseCase {
  constructor(private readonly repository: ILanguageUpdater) {}

  async execute(id: string, data: UpdateLanguageDto): Promise<LanguageModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Language not found');
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/language/UpdateLanguageUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 7: Write the failing test for `DeleteLanguageUseCase`, then implement it**

```typescript
import { DeleteLanguageUseCase } from './DeleteLanguageUseCase';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface ILanguageDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteLanguageUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: ILanguageDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteLanguageUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: ILanguageDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteLanguageUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/language/DeleteLanguageUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface ILanguageDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteLanguageUseCase {
  constructor(private readonly repository: ILanguageDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Language not found');
    }
  }
}
```
Save as `backEnd/src/use-cases/language/DeleteLanguageUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 8: Run the full Language test suite**

Run: `cd backEnd && npx jest src/use-cases/language`
Expected: `Tests: 7 passed, 7 total`.

- [ ] **Step 9: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { LanguageEntity } from '../entities/LanguageEntity';
import { LanguageRepository } from '../repositories/LanguageRepository';
import { ListLanguageUseCase } from '../../use-cases/language/ListLanguageUseCase';
import { GetLanguageUseCase } from '../../use-cases/language/GetLanguageUseCase';
import { CreateLanguageUseCase } from '../../use-cases/language/CreateLanguageUseCase';
import { UpdateLanguageUseCase } from '../../use-cases/language/UpdateLanguageUseCase';
import { DeleteLanguageUseCase } from '../../use-cases/language/DeleteLanguageUseCase';

const repository = new LanguageRepository(AppDataSource.getRepository(LanguageEntity));
const listUseCase = new ListLanguageUseCase(repository);
const getUseCase = new GetLanguageUseCase(repository);
const createUseCase = new CreateLanguageUseCase(repository);
const updateUseCase = new UpdateLanguageUseCase(repository);
const deleteUseCase = new DeleteLanguageUseCase(repository);

export class LanguageController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await listUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await updateUseCase.execute(req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/LanguageController.ts`.

- [ ] **Step 10: Implement the route**

```typescript
import { Router } from 'express';
import { LanguageController } from '../controllers/LanguageController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateLanguageDto } from '../dto/language/CreateLanguageDto';
import { UpdateLanguageDto } from '../dto/language/UpdateLanguageDto';

const router = Router();

router.get('/', LanguageController.list);
router.get('/:id', LanguageController.get);
router.post('/', authMiddleware, validate(CreateLanguageDto), LanguageController.create);
router.put('/:id', authMiddleware, validate(UpdateLanguageDto), LanguageController.update);
router.delete('/:id', authMiddleware, LanguageController.remove);

export default router;
```
Save as `backEnd/src/infrastructure/routes/language.routes.ts`.

- [ ] **Step 11: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add backEnd/src/infrastructure/repositories/LanguageRepository.ts backEnd/src/infrastructure/dto/language/ backEnd/src/use-cases/language/ backEnd/src/infrastructure/controllers/LanguageController.ts backEnd/src/infrastructure/routes/language.routes.ts
git commit -m "Add Language resource (repository, use-cases, controller, route)"
```

---

### Task 18: News resource

**Files:**
- Create: `backEnd/src/infrastructure/repositories/NewsRepository.ts`
- Create: `backEnd/src/infrastructure/dto/news/CreateNewsDto.ts`
- Create: `backEnd/src/infrastructure/dto/news/UpdateNewsDto.ts`
- Create: `backEnd/src/use-cases/news/ListNewsUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/news/ListNewsByCategoryUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/news/ListRecentNewsUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/news/GetNewsUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/news/CreateNewsUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/news/UpdateNewsUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/news/DeleteNewsUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/infrastructure/controllers/NewsController.ts`
- Create: `backEnd/src/infrastructure/routes/news.routes.ts`

**Interfaces:**
- Consumes: same shared pieces as Task 10.
- Produces: mounted route prefix `/news` (Task 21).

- [ ] **Step 1: Implement `NewsRepository`**

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { NewsModel } from '../../domain/models/News';
import { NewsEntity } from '../entities/NewsEntity';
import { INewsRepository } from '../../domain/interfaces/INewsRepository';

export class NewsRepository extends BaseRepository<NewsModel, NewsEntity> implements INewsRepository {
  constructor(repository: Repository<NewsEntity>) {
    super(repository);
  }

  protected toModel(entity: NewsEntity): NewsModel {
    const model = new NewsModel();
    model.id = entity.id;
    model.title = entity.title;
    model.content = entity.content;
    model.summary = entity.summary;
    model.category = entity.category;
    model.imageUrl = entity.imageUrl ?? '';
    model.publishedAt = entity.publishedAt;
    model.order = entity.order;
    model.createdAt = entity.createdAt;
    model.updatedAt = entity.updatedAt;
    return model;
  }

  async findByOrder(): Promise<NewsModel[]> {
    const entities = await this.repository.find({ order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findByCategory(category: string): Promise<NewsModel[]> {
    const entities = await this.repository.find({ where: { category }, order: { order: 'ASC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async findRecent(limit: number): Promise<NewsModel[]> {
    const entities = await this.repository.find({ order: { publishedAt: 'DESC' }, take: limit });
    return entities.map((entity) => this.toModel(entity));
  }
}
```
Save as `backEnd/src/infrastructure/repositories/NewsRepository.ts`.

- [ ] **Step 2: Create the DTOs**

```typescript
import { IsString, IsNotEmpty, IsOptional, IsUrl, IsDateString, IsInt, Min } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/news/CreateNewsDto.ts`.

```typescript
import { IsString, IsNotEmpty, IsOptional, IsUrl, IsDateString, IsInt, Min } from 'class-validator';

export class UpdateNewsDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  summary?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  category?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
```
Save as `backEnd/src/infrastructure/dto/news/UpdateNewsDto.ts`.

- [ ] **Step 3: Write the failing test for `ListNewsUseCase`, then implement it**

```typescript
import { ListNewsUseCase } from './ListNewsUseCase';
import { INewsRepository } from '../../domain/interfaces/INewsRepository';
import { NewsModel } from '../../domain/models/News';

describe('ListNewsUseCase', () => {
  it('returns every news entry ordered by the repository', async () => {
    const entries = [new NewsModel(), new NewsModel()];
    const repository: INewsRepository = {
      findByOrder: jest.fn().mockResolvedValue(entries),
      findByCategory: jest.fn(),
      findRecent: jest.fn(),
    };
    const sut = new ListNewsUseCase(repository);

    const result = await sut.execute();

    expect(repository.findByOrder).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/news/ListNewsUseCase.test.ts`. Run: `cd backEnd && npx jest ListNewsUseCase.test.ts` — expect FAIL.

```typescript
import { INewsRepository } from '../../domain/interfaces/INewsRepository';
import { NewsModel } from '../../domain/models/News';

export class ListNewsUseCase {
  constructor(private readonly repository: INewsRepository) {}

  async execute(): Promise<NewsModel[]> {
    return this.repository.findByOrder();
  }
}
```
Save as `backEnd/src/use-cases/news/ListNewsUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 4: Write the failing test for `ListNewsByCategoryUseCase`, then implement it**

```typescript
import { ListNewsByCategoryUseCase } from './ListNewsByCategoryUseCase';
import { INewsRepository } from '../../domain/interfaces/INewsRepository';
import { NewsModel } from '../../domain/models/News';

describe('ListNewsByCategoryUseCase', () => {
  it('returns news filtered by category', async () => {
    const entries = [new NewsModel()];
    const repository: INewsRepository = {
      findByOrder: jest.fn(),
      findByCategory: jest.fn().mockResolvedValue(entries),
      findRecent: jest.fn(),
    };
    const sut = new ListNewsByCategoryUseCase(repository);

    const result = await sut.execute('career');

    expect(repository.findByCategory).toHaveBeenCalledWith('career');
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/news/ListNewsByCategoryUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { INewsRepository } from '../../domain/interfaces/INewsRepository';
import { NewsModel } from '../../domain/models/News';

export class ListNewsByCategoryUseCase {
  constructor(private readonly repository: INewsRepository) {}

  async execute(category: string): Promise<NewsModel[]> {
    return this.repository.findByCategory(category);
  }
}
```
Save as `backEnd/src/use-cases/news/ListNewsByCategoryUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 5: Write the failing test for `ListRecentNewsUseCase`, then implement it**

```typescript
import { ListRecentNewsUseCase } from './ListRecentNewsUseCase';
import { INewsRepository } from '../../domain/interfaces/INewsRepository';
import { NewsModel } from '../../domain/models/News';

describe('ListRecentNewsUseCase', () => {
  it('returns the most recent news up to the given limit', async () => {
    const entries = [new NewsModel()];
    const repository: INewsRepository = {
      findByOrder: jest.fn(),
      findByCategory: jest.fn(),
      findRecent: jest.fn().mockResolvedValue(entries),
    };
    const sut = new ListRecentNewsUseCase(repository);

    const result = await sut.execute(5);

    expect(repository.findRecent).toHaveBeenCalledWith(5);
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/news/ListRecentNewsUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { INewsRepository } from '../../domain/interfaces/INewsRepository';
import { NewsModel } from '../../domain/models/News';

export class ListRecentNewsUseCase {
  constructor(private readonly repository: INewsRepository) {}

  async execute(limit: number): Promise<NewsModel[]> {
    return this.repository.findRecent(limit);
  }
}
```
Save as `backEnd/src/use-cases/news/ListRecentNewsUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 6: Write the failing test for `GetNewsUseCase`, then implement it**

```typescript
import { GetNewsUseCase } from './GetNewsUseCase';
import { NewsModel } from '../../domain/models/News';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface INewsFinder {
  findById(id: string): Promise<NewsModel | null>;
}

describe('GetNewsUseCase', () => {
  it('returns the entry when it exists', async () => {
    const entry = new NewsModel();
    const repository: INewsFinder = { findById: jest.fn().mockResolvedValue(entry) };
    const sut = new GetNewsUseCase(repository);

    const result = await sut.execute('1');

    expect(result).toBe(entry);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: INewsFinder = { findById: jest.fn().mockResolvedValue(null) };
    const sut = new GetNewsUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/news/GetNewsUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NewsModel } from '../../domain/models/News';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface INewsFinder {
  findById(id: string): Promise<NewsModel | null>;
}

export class GetNewsUseCase {
  constructor(private readonly repository: INewsFinder) {}

  async execute(id: string): Promise<NewsModel> {
    const entry = await this.repository.findById(id);

    if (!entry) {
      throw new NotFoundException('News not found');
    }

    return entry;
  }
}
```
Save as `backEnd/src/use-cases/news/GetNewsUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 7: Write the failing test for `CreateNewsUseCase`, then implement it**

```typescript
import { CreateNewsUseCase } from './CreateNewsUseCase';
import { NewsModel } from '../../domain/models/News';

interface INewsCreator {
  create(data: Partial<NewsModel>): Promise<NewsModel>;
}

describe('CreateNewsUseCase', () => {
  it('creates and returns the new entry', async () => {
    const created = new NewsModel();
    const repository: INewsCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateNewsUseCase(repository);
    const input = { title: 'New milestone', content: 'content', summary: 'summary', category: 'career' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
```
Save as `backEnd/src/use-cases/news/CreateNewsUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NewsModel } from '../../domain/models/News';
import { CreateNewsDto } from '../../infrastructure/dto/news/CreateNewsDto';

export interface INewsCreator {
  create(data: Partial<NewsModel>): Promise<NewsModel>;
}

export class CreateNewsUseCase {
  constructor(private readonly repository: INewsCreator) {}

  async execute(data: CreateNewsDto): Promise<NewsModel> {
    return this.repository.create(data);
  }
}
```
Save as `backEnd/src/use-cases/news/CreateNewsUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 8: Write the failing test for `UpdateNewsUseCase`, then implement it**

```typescript
import { UpdateNewsUseCase } from './UpdateNewsUseCase';
import { NewsModel } from '../../domain/models/News';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface INewsUpdater {
  update(id: string, data: Partial<NewsModel>): Promise<NewsModel | null>;
}

describe('UpdateNewsUseCase', () => {
  it('updates and returns the entry when it exists', async () => {
    const updated = new NewsModel();
    const repository: INewsUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateNewsUseCase(repository);

    const result = await sut.execute('1', { title: 'New title' });

    expect(repository.update).toHaveBeenCalledWith('1', { title: 'New title' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: INewsUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateNewsUseCase(repository);

    await expect(sut.execute('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/news/UpdateNewsUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NewsModel } from '../../domain/models/News';
import { UpdateNewsDto } from '../../infrastructure/dto/news/UpdateNewsDto';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface INewsUpdater {
  update(id: string, data: Partial<NewsModel>): Promise<NewsModel | null>;
}

export class UpdateNewsUseCase {
  constructor(private readonly repository: INewsUpdater) {}

  async execute(id: string, data: UpdateNewsDto): Promise<NewsModel> {
    const updated = await this.repository.update(id, data);

    if (!updated) {
      throw new NotFoundException('News not found');
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/news/UpdateNewsUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 9: Write the failing test for `DeleteNewsUseCase`, then implement it**

```typescript
import { DeleteNewsUseCase } from './DeleteNewsUseCase';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface INewsDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteNewsUseCase', () => {
  it('deletes when the entry exists', async () => {
    const repository: INewsDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteNewsUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the entry does not exist', async () => {
    const repository: INewsDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteNewsUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/news/DeleteNewsUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface INewsDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteNewsUseCase {
  constructor(private readonly repository: INewsDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('News not found');
    }
  }
}
```
Save as `backEnd/src/use-cases/news/DeleteNewsUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 10: Run the full News test suite**

Run: `cd backEnd && npx jest src/use-cases/news`
Expected: `Tests: 10 passed, 10 total`.

- [ ] **Step 11: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { NewsEntity } from '../entities/NewsEntity';
import { NewsRepository } from '../repositories/NewsRepository';
import { ListNewsUseCase } from '../../use-cases/news/ListNewsUseCase';
import { ListNewsByCategoryUseCase } from '../../use-cases/news/ListNewsByCategoryUseCase';
import { ListRecentNewsUseCase } from '../../use-cases/news/ListRecentNewsUseCase';
import { GetNewsUseCase } from '../../use-cases/news/GetNewsUseCase';
import { CreateNewsUseCase } from '../../use-cases/news/CreateNewsUseCase';
import { UpdateNewsUseCase } from '../../use-cases/news/UpdateNewsUseCase';
import { DeleteNewsUseCase } from '../../use-cases/news/DeleteNewsUseCase';

const repository = new NewsRepository(AppDataSource.getRepository(NewsEntity));
const listUseCase = new ListNewsUseCase(repository);
const byCategoryUseCase = new ListNewsByCategoryUseCase(repository);
const recentUseCase = new ListRecentNewsUseCase(repository);
const getUseCase = new GetNewsUseCase(repository);
const createUseCase = new CreateNewsUseCase(repository);
const updateUseCase = new UpdateNewsUseCase(repository);
const deleteUseCase = new DeleteNewsUseCase(repository);

export class NewsController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const result = category ? await byCategoryUseCase.execute(category) : await listUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async recent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 5;
      res.status(200).json({ success: true, data: await recentUseCase.execute(limit) });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await updateUseCase.execute(req.params.id, req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/NewsController.ts`.

- [ ] **Step 12: Implement the route**

`/recent` is a fixed path and must be registered before `/:id`:

```typescript
import { Router } from 'express';
import { NewsController } from '../controllers/NewsController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateNewsDto } from '../dto/news/CreateNewsDto';
import { UpdateNewsDto } from '../dto/news/UpdateNewsDto';

const router = Router();

router.get('/', NewsController.list);
router.get('/recent', NewsController.recent);
router.get('/:id', NewsController.get);
router.post('/', authMiddleware, validate(CreateNewsDto), NewsController.create);
router.put('/:id', authMiddleware, validate(UpdateNewsDto), NewsController.update);
router.delete('/:id', authMiddleware, NewsController.remove);

export default router;
```
Save as `backEnd/src/infrastructure/routes/news.routes.ts`.

- [ ] **Step 13: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 14: Commit**

```bash
git add backEnd/src/infrastructure/repositories/NewsRepository.ts backEnd/src/infrastructure/dto/news/ backEnd/src/use-cases/news/ backEnd/src/infrastructure/controllers/NewsController.ts backEnd/src/infrastructure/routes/news.routes.ts
git commit -m "Add News resource (repository, use-cases, controller, route)"
```

---

### Task 19: User resource (profile + photo upload)

Structurally different from every other resource: no list/create/delete, just a profile read/update plus a photo upload. `UserRepository` already exists (Task 8, built early because login needed it) — this task adds the profile/photo use-cases, controller, and route on top of it.

`GET /users/profile` is **public** (no auth), so its use-case can't rely on a JWT-derived user ID — it fetches the one existing user record directly (there's exactly one, the seeded admin). `PUT /users/profile` and `POST /users/photo` are **admin-protected**, so their controller methods read the authenticated user's ID from `req.user!.userId` (set by `authMiddleware`) and pass it to their use-cases.

**Files:**
- Modify: `backEnd/.env.example` (already has `UPLOAD_PATH`/`MAX_FILE_SIZE` — nothing new needed here, just confirming no changes required)
- Create: `backEnd/src/infrastructure/dto/user/UpdateUserProfileDto.ts`
- Create: `backEnd/src/use-cases/user/GetUserProfileUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/user/UpdateUserProfileUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/user/UploadUserPhotoUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/infrastructure/middlewares/upload.middleware.ts`
- Create: `backEnd/src/infrastructure/controllers/UserController.ts`
- Create: `backEnd/src/infrastructure/routes/user.routes.ts`

**Interfaces:**
- Consumes: `UserRepository` (Task 8, via its inherited `BaseRepository.findAll`/`update`), `authMiddleware` (Task 7, for `req.user.userId`), `envConfig.upload` (existing).
- Produces: mounted route prefix `/users` (Task 21).

- [ ] **Step 1: Create the profile update DTO**

Email and password are intentionally excluded — this endpoint only edits the public-facing profile fields the spec's "Présentation" section covers; changing credentials is out of scope for this plan.

```typescript
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  desiredPosition?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  tagline?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  mobility?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
```
Save as `backEnd/src/infrastructure/dto/user/UpdateUserProfileDto.ts`.

- [ ] **Step 2: Write the failing test for `GetUserProfileUseCase`, then implement it**

```typescript
import { GetUserProfileUseCase } from './GetUserProfileUseCase';
import { UserModel } from '../../domain/models/User';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IUserLister {
  findAll(): Promise<UserModel[]>;
}

describe('GetUserProfileUseCase', () => {
  it('returns the one existing user', async () => {
    const user = new UserModel();
    const repository: IUserLister = { findAll: jest.fn().mockResolvedValue([user]) };
    const sut = new GetUserProfileUseCase(repository);

    const result = await sut.execute();

    expect(result).toBe(user);
  });

  it('throws NotFoundException when no user exists yet', async () => {
    const repository: IUserLister = { findAll: jest.fn().mockResolvedValue([]) };
    const sut = new GetUserProfileUseCase(repository);

    await expect(sut.execute()).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/user/GetUserProfileUseCase.test.ts`. Run: `cd backEnd && npx jest GetUserProfileUseCase.test.ts` — expect FAIL.

```typescript
import { UserModel } from '../../domain/models/User';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IUserLister {
  findAll(): Promise<UserModel[]>;
}

export class GetUserProfileUseCase {
  constructor(private readonly repository: IUserLister) {}

  async execute(): Promise<UserModel> {
    const users = await this.repository.findAll();

    if (users.length === 0) {
      throw new NotFoundException('No profile has been set up yet');
    }

    return users[0];
  }
}
```
Save as `backEnd/src/use-cases/user/GetUserProfileUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 3: Write the failing test for `UpdateUserProfileUseCase`, then implement it**

```typescript
import { UpdateUserProfileUseCase } from './UpdateUserProfileUseCase';
import { UserModel } from '../../domain/models/User';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IUserUpdater {
  update(id: string, data: Partial<UserModel>): Promise<UserModel | null>;
}

describe('UpdateUserProfileUseCase', () => {
  it('updates and returns the user when it exists', async () => {
    const updated = new UserModel();
    const repository: IUserUpdater = { update: jest.fn().mockResolvedValue(updated) };
    const sut = new UpdateUserProfileUseCase(repository);

    const result = await sut.execute('1', { tagline: 'New tagline' });

    expect(repository.update).toHaveBeenCalledWith('1', { tagline: 'New tagline' });
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the user does not exist', async () => {
    const repository: IUserUpdater = { update: jest.fn().mockResolvedValue(null) };
    const sut = new UpdateUserProfileUseCase(repository);

    await expect(sut.execute('missing', { tagline: 'X' })).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/user/UpdateUserProfileUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { UserModel } from '../../domain/models/User';
import { UpdateUserProfileDto } from '../../infrastructure/dto/user/UpdateUserProfileDto';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IUserUpdater {
  update(id: string, data: Partial<UserModel>): Promise<UserModel | null>;
}

export class UpdateUserProfileUseCase {
  constructor(private readonly repository: IUserUpdater) {}

  async execute(userId: string, data: UpdateUserProfileDto): Promise<UserModel> {
    const updated = await this.repository.update(userId, data);

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/user/UpdateUserProfileUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 4: Write the failing test for `UploadUserPhotoUseCase`, then implement it**

Per the design spec, a previous photo file is deleted from disk after the new one is saved, best-effort (a deletion failure must not fail the request).

```typescript
import { UploadUserPhotoUseCase } from './UploadUserPhotoUseCase';
import { UserModel } from '../../domain/models/User';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';
import * as fs from 'fs';

jest.mock('fs');

interface IUserPhotoStore {
  findById(id: string): Promise<UserModel | null>;
  update(id: string, data: Partial<UserModel>): Promise<UserModel | null>;
}

function buildUser(photo: string): UserModel {
  const user = new UserModel();
  user.photo = photo;
  return user;
}

describe('UploadUserPhotoUseCase', () => {
  it('updates the user photo path and deletes the old file', async () => {
    const existing = buildUser('/uploads/old.jpg');
    const updated = buildUser('/uploads/new.jpg');
    const repository: IUserPhotoStore = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockImplementation(() => undefined);
    const sut = new UploadUserPhotoUseCase(repository, '/uploads');

    const result = await sut.execute('1', 'new.jpg');

    expect(repository.update).toHaveBeenCalledWith('1', { photo: '/uploads/new.jpg' });
    expect(fs.unlinkSync).toHaveBeenCalled();
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the user does not exist', async () => {
    const repository: IUserPhotoStore = {
      findById: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };
    const sut = new UploadUserPhotoUseCase(repository, '/uploads');

    await expect(sut.execute('missing', 'new.jpg')).rejects.toThrow(NotFoundException);
  });

  it('does not throw when deleting the old photo fails', async () => {
    const existing = buildUser('/uploads/old.jpg');
    const updated = buildUser('/uploads/new.jpg');
    const repository: IUserPhotoStore = {
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    };
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {
      throw new Error('disk error');
    });
    const sut = new UploadUserPhotoUseCase(repository, '/uploads');

    const result = await sut.execute('1', 'new.jpg');

    expect(result).toBe(updated);
  });
});
```
Save as `backEnd/src/use-cases/user/UploadUserPhotoUseCase.test.ts`. Run it — expect FAIL.

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { UserModel } from '../../domain/models/User';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IUserPhotoStore {
  findById(id: string): Promise<UserModel | null>;
  update(id: string, data: Partial<UserModel>): Promise<UserModel | null>;
}

export class UploadUserPhotoUseCase {
  constructor(
    private readonly repository: IUserPhotoStore,
    private readonly uploadPath: string,
  ) {}

  async execute(userId: string, filename: string): Promise<UserModel> {
    const existing = await this.repository.findById(userId);

    if (!existing) {
      throw new NotFoundException('User not found');
    }

    const newPhotoPath = `/uploads/${filename}`;
    const updated = await this.repository.update(userId, { photo: newPhotoPath });

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    if (existing.photo) {
      const oldFilePath = path.join(this.uploadPath, path.basename(existing.photo));
      try {
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } catch {
        // Best-effort cleanup — a failure to delete the old file must not fail the request.
      }
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/user/UploadUserPhotoUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 5: Run the full User test suite**

Run: `cd backEnd && npx jest src/use-cases/user`
Expected: `Tests: 7 passed, 7 total`.

- [ ] **Step 6: Implement the upload middleware**

```typescript
import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { envConfig } from '../../config/env.config';

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, envConfig.upload.uploadPath);
  },
  filename: (req: Request, file, callback) => {
    const userId = req.user?.userId ?? 'unknown';
    const extension = path.extname(file.originalname);
    callback(null, `${userId}-${Date.now()}${extension}`);
  },
});

function fileFilter(req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback): void {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowed.includes(file.mimetype)) {
    callback(null, true);
    return;
  }

  callback(new Error('Only JPEG, PNG, or WEBP images are allowed'));
}

export const uploadUserPhoto = multer({
  storage,
  limits: { fileSize: envConfig.upload.maxFileSize },
  fileFilter,
});
```
Save as `backEnd/src/infrastructure/middlewares/upload.middleware.ts`.

- [ ] **Step 7: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { UserEntity } from '../entities/UserEntity';
import { UserRepository } from '../repositories/UserRepository';
import { GetUserProfileUseCase } from '../../use-cases/user/GetUserProfileUseCase';
import { UpdateUserProfileUseCase } from '../../use-cases/user/UpdateUserProfileUseCase';
import { UploadUserPhotoUseCase } from '../../use-cases/user/UploadUserPhotoUseCase';
import { envConfig } from '../../config/env.config';

const repository = new UserRepository(AppDataSource.getRepository(UserEntity));
const getProfileUseCase = new GetUserProfileUseCase(repository);
const updateProfileUseCase = new UpdateUserProfileUseCase(repository);
const uploadPhotoUseCase = new UploadUserPhotoUseCase(repository, envConfig.upload.uploadPath);

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await getProfileUseCase.execute() });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await updateProfileUseCase.execute(req.user!.userId, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async uploadPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await uploadPhotoUseCase.execute(req.user!.userId, req.file!.filename);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/UserController.ts`.

- [ ] **Step 8: Implement the route**

```typescript
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { uploadUserPhoto } from '../middlewares/upload.middleware';
import { UpdateUserProfileDto } from '../dto/user/UpdateUserProfileDto';

const router = Router();

router.get('/profile', UserController.getProfile);
router.put('/profile', authMiddleware, validate(UpdateUserProfileDto), UserController.updateProfile);
router.post('/photo', authMiddleware, uploadUserPhoto.single('photo'), UserController.uploadPhoto);

export default router;
```
Save as `backEnd/src/infrastructure/routes/user.routes.ts`.

- [ ] **Step 9: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add backEnd/src/infrastructure/dto/user/ backEnd/src/use-cases/user/ backEnd/src/infrastructure/middlewares/upload.middleware.ts backEnd/src/infrastructure/controllers/UserController.ts backEnd/src/infrastructure/routes/user.routes.ts
git commit -m "Add User profile and photo upload (use-cases, controller, route)"
```

---

### Task 20: ContactMessage resource

Inverted direction from every other resource: `POST /contact-messages` is **public** (anyone can submit the contact form, no auth), and `GET`/mark-as-read/`DELETE` are **admin-protected** (no public read, no admin create, no `GET /:id` detail — the spec only calls for list + mark-read + delete on the admin side).

**Files:**
- Create: `backEnd/src/infrastructure/repositories/ContactMessageRepository.ts`
- Create: `backEnd/src/infrastructure/dto/contact-message/CreateContactMessageDto.ts`
- Create: `backEnd/src/use-cases/contact-message/CreateContactMessageUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/contact-message/ListContactMessageUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/contact-message/ListUnreadContactMessageUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/contact-message/MarkContactMessageAsReadUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/use-cases/contact-message/DeleteContactMessageUseCase.ts` (+ `.test.ts`)
- Create: `backEnd/src/infrastructure/controllers/ContactMessageController.ts`
- Create: `backEnd/src/infrastructure/routes/contact-message.routes.ts`

**Interfaces:**
- Consumes: `BaseRepository` (Task 6, for inherited `findAll`/`update`/`delete`/`create`), `NotFoundException` (Task 3).
- Produces: mounted route prefix `/contact-messages` (Task 21).

- [ ] **Step 1: Implement `ContactMessageRepository`**

`markAsRead` reuses the inherited `update()` from `BaseRepository` rather than reimplementing the update-then-refetch logic.

```typescript
import { Repository } from 'typeorm';
import { BaseRepository } from './BaseRepository';
import { ContactMessageModel } from '../../domain/models/ContactMessage';
import { ContactMessageEntity } from '../entities/ContactMessageEntity';
import { IContactMessageRepository } from '../../domain/interfaces/IContactMessageRepository';

export class ContactMessageRepository
  extends BaseRepository<ContactMessageModel, ContactMessageEntity>
  implements IContactMessageRepository
{
  constructor(repository: Repository<ContactMessageEntity>) {
    super(repository);
  }

  protected toModel(entity: ContactMessageEntity): ContactMessageModel {
    const model = new ContactMessageModel();
    model.id = entity.id;
    model.name = entity.name;
    model.email = entity.email;
    model.subject = entity.subject;
    model.message = entity.message;
    model.read = entity.read;
    model.createdAt = entity.createdAt;
    return model;
  }

  async findUnread(): Promise<ContactMessageModel[]> {
    const entities = await this.repository.find({ where: { read: false }, order: { createdAt: 'DESC' } });
    return entities.map((entity) => this.toModel(entity));
  }

  async markAsRead(id: string): Promise<ContactMessageModel | null> {
    return this.update(id, { read: true });
  }
}
```
Save as `backEnd/src/infrastructure/repositories/ContactMessageRepository.ts`.

- [ ] **Step 2: Create the DTO**

Only the public submission needs a DTO — there's no admin create, and `markAsRead`/`delete` take just an `id` param, no body.

```typescript
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateContactMessageDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  subject!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
```
Save as `backEnd/src/infrastructure/dto/contact-message/CreateContactMessageDto.ts`.

- [ ] **Step 3: Write the failing test for `CreateContactMessageUseCase`, then implement it**

```typescript
import { CreateContactMessageUseCase } from './CreateContactMessageUseCase';
import { ContactMessageModel } from '../../domain/models/ContactMessage';

interface IContactMessageCreator {
  create(data: Partial<ContactMessageModel>): Promise<ContactMessageModel>;
}

describe('CreateContactMessageUseCase', () => {
  it('creates and returns the new message', async () => {
    const created = new ContactMessageModel();
    const repository: IContactMessageCreator = { create: jest.fn().mockResolvedValue(created) };
    const sut = new CreateContactMessageUseCase(repository);
    const input = { name: 'Jane', email: 'jane@example.com', subject: 'Hello', message: 'Hi there' };

    const result = await sut.execute(input);

    expect(repository.create).toHaveBeenCalledWith(input);
    expect(result).toBe(created);
  });
});
```
Save as `backEnd/src/use-cases/contact-message/CreateContactMessageUseCase.test.ts`. Run: `cd backEnd && npx jest CreateContactMessageUseCase.test.ts` — expect FAIL.

```typescript
import { ContactMessageModel } from '../../domain/models/ContactMessage';
import { CreateContactMessageDto } from '../../infrastructure/dto/contact-message/CreateContactMessageDto';

export interface IContactMessageCreator {
  create(data: Partial<ContactMessageModel>): Promise<ContactMessageModel>;
}

export class CreateContactMessageUseCase {
  constructor(private readonly repository: IContactMessageCreator) {}

  async execute(data: CreateContactMessageDto): Promise<ContactMessageModel> {
    return this.repository.create(data);
  }
}
```
Save as `backEnd/src/use-cases/contact-message/CreateContactMessageUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 4: Write the failing test for `ListContactMessageUseCase`, then implement it**

```typescript
import { ListContactMessageUseCase } from './ListContactMessageUseCase';
import { ContactMessageModel } from '../../domain/models/ContactMessage';

interface IContactMessageLister {
  findAll(): Promise<ContactMessageModel[]>;
}

describe('ListContactMessageUseCase', () => {
  it('returns every message', async () => {
    const entries = [new ContactMessageModel(), new ContactMessageModel()];
    const repository: IContactMessageLister = { findAll: jest.fn().mockResolvedValue(entries) };
    const sut = new ListContactMessageUseCase(repository);

    const result = await sut.execute();

    expect(repository.findAll).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/contact-message/ListContactMessageUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { ContactMessageModel } from '../../domain/models/ContactMessage';

export interface IContactMessageLister {
  findAll(): Promise<ContactMessageModel[]>;
}

export class ListContactMessageUseCase {
  constructor(private readonly repository: IContactMessageLister) {}

  async execute(): Promise<ContactMessageModel[]> {
    return this.repository.findAll();
  }
}
```
Save as `backEnd/src/use-cases/contact-message/ListContactMessageUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 5: Write the failing test for `ListUnreadContactMessageUseCase`, then implement it**

```typescript
import { ListUnreadContactMessageUseCase } from './ListUnreadContactMessageUseCase';
import { IContactMessageRepository } from '../../domain/interfaces/IContactMessageRepository';
import { ContactMessageModel } from '../../domain/models/ContactMessage';

describe('ListUnreadContactMessageUseCase', () => {
  it('returns only unread messages', async () => {
    const entries = [new ContactMessageModel()];
    const repository: IContactMessageRepository = {
      findUnread: jest.fn().mockResolvedValue(entries),
      markAsRead: jest.fn(),
    };
    const sut = new ListUnreadContactMessageUseCase(repository);

    const result = await sut.execute();

    expect(repository.findUnread).toHaveBeenCalled();
    expect(result).toBe(entries);
  });
});
```
Save as `backEnd/src/use-cases/contact-message/ListUnreadContactMessageUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { IContactMessageRepository } from '../../domain/interfaces/IContactMessageRepository';
import { ContactMessageModel } from '../../domain/models/ContactMessage';

export class ListUnreadContactMessageUseCase {
  constructor(private readonly repository: IContactMessageRepository) {}

  async execute(): Promise<ContactMessageModel[]> {
    return this.repository.findUnread();
  }
}
```
Save as `backEnd/src/use-cases/contact-message/ListUnreadContactMessageUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 6: Write the failing test for `MarkContactMessageAsReadUseCase`, then implement it**

```typescript
import { MarkContactMessageAsReadUseCase } from './MarkContactMessageAsReadUseCase';
import { IContactMessageRepository } from '../../domain/interfaces/IContactMessageRepository';
import { ContactMessageModel } from '../../domain/models/ContactMessage';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

describe('MarkContactMessageAsReadUseCase', () => {
  it('marks the message as read and returns it', async () => {
    const updated = new ContactMessageModel();
    const repository: IContactMessageRepository = {
      findUnread: jest.fn(),
      markAsRead: jest.fn().mockResolvedValue(updated),
    };
    const sut = new MarkContactMessageAsReadUseCase(repository);

    const result = await sut.execute('1');

    expect(repository.markAsRead).toHaveBeenCalledWith('1');
    expect(result).toBe(updated);
  });

  it('throws NotFoundException when the message does not exist', async () => {
    const repository: IContactMessageRepository = {
      findUnread: jest.fn(),
      markAsRead: jest.fn().mockResolvedValue(null),
    };
    const sut = new MarkContactMessageAsReadUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/contact-message/MarkContactMessageAsReadUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { IContactMessageRepository } from '../../domain/interfaces/IContactMessageRepository';
import { ContactMessageModel } from '../../domain/models/ContactMessage';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export class MarkContactMessageAsReadUseCase {
  constructor(private readonly repository: IContactMessageRepository) {}

  async execute(id: string): Promise<ContactMessageModel> {
    const updated = await this.repository.markAsRead(id);

    if (!updated) {
      throw new NotFoundException('Contact message not found');
    }

    return updated;
  }
}
```
Save as `backEnd/src/use-cases/contact-message/MarkContactMessageAsReadUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 7: Write the failing test for `DeleteContactMessageUseCase`, then implement it**

```typescript
import { DeleteContactMessageUseCase } from './DeleteContactMessageUseCase';
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

interface IContactMessageDeleter {
  delete(id: string): Promise<boolean>;
}

describe('DeleteContactMessageUseCase', () => {
  it('deletes when the message exists', async () => {
    const repository: IContactMessageDeleter = { delete: jest.fn().mockResolvedValue(true) };
    const sut = new DeleteContactMessageUseCase(repository);

    await sut.execute('1');

    expect(repository.delete).toHaveBeenCalledWith('1');
  });

  it('throws NotFoundException when the message does not exist', async () => {
    const repository: IContactMessageDeleter = { delete: jest.fn().mockResolvedValue(false) };
    const sut = new DeleteContactMessageUseCase(repository);

    await expect(sut.execute('missing')).rejects.toThrow(NotFoundException);
  });
});
```
Save as `backEnd/src/use-cases/contact-message/DeleteContactMessageUseCase.test.ts`. Run it — expect FAIL.

```typescript
import { NotFoundException } from '../../shared/exceptions/NotFoundException';

export interface IContactMessageDeleter {
  delete(id: string): Promise<boolean>;
}

export class DeleteContactMessageUseCase {
  constructor(private readonly repository: IContactMessageDeleter) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);

    if (!deleted) {
      throw new NotFoundException('Contact message not found');
    }
  }
}
```
Save as `backEnd/src/use-cases/contact-message/DeleteContactMessageUseCase.ts`. Re-run — expect PASS.

- [ ] **Step 8: Run the full ContactMessage test suite**

Run: `cd backEnd && npx jest src/use-cases/contact-message`
Expected: `Tests: 8 passed, 8 total`.

- [ ] **Step 9: Implement the controller**

```typescript
import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../database/config/data-source';
import { ContactMessageEntity } from '../entities/ContactMessageEntity';
import { ContactMessageRepository } from '../repositories/ContactMessageRepository';
import { CreateContactMessageUseCase } from '../../use-cases/contact-message/CreateContactMessageUseCase';
import { ListContactMessageUseCase } from '../../use-cases/contact-message/ListContactMessageUseCase';
import { ListUnreadContactMessageUseCase } from '../../use-cases/contact-message/ListUnreadContactMessageUseCase';
import { MarkContactMessageAsReadUseCase } from '../../use-cases/contact-message/MarkContactMessageAsReadUseCase';
import { DeleteContactMessageUseCase } from '../../use-cases/contact-message/DeleteContactMessageUseCase';

const repository = new ContactMessageRepository(AppDataSource.getRepository(ContactMessageEntity));
const createUseCase = new CreateContactMessageUseCase(repository);
const listUseCase = new ListContactMessageUseCase(repository);
const unreadUseCase = new ListUnreadContactMessageUseCase(repository);
const markAsReadUseCase = new MarkContactMessageAsReadUseCase(repository);
const deleteUseCase = new DeleteContactMessageUseCase(repository);

export class ContactMessageController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json({ success: true, data: await createUseCase.execute(req.body) });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = req.query.unread === 'true' ? await unreadUseCase.execute() : await listUseCase.execute();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({ success: true, data: await markAsReadUseCase.execute(req.params.id) });
    } catch (error) {
      next(error);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await deleteUseCase.execute(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
```
Save as `backEnd/src/infrastructure/controllers/ContactMessageController.ts`.

- [ ] **Step 10: Implement the route**

```typescript
import { Router } from 'express';
import { ContactMessageController } from '../controllers/ContactMessageController';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateContactMessageDto } from '../dto/contact-message/CreateContactMessageDto';

const router = Router();

router.post('/', validate(CreateContactMessageDto), ContactMessageController.create);
router.get('/', authMiddleware, ContactMessageController.list);
router.patch('/:id/read', authMiddleware, ContactMessageController.markAsRead);
router.delete('/:id', authMiddleware, ContactMessageController.remove);

export default router;
```
Save as `backEnd/src/infrastructure/routes/contact-message.routes.ts`.

- [ ] **Step 11: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git add backEnd/src/infrastructure/repositories/ContactMessageRepository.ts backEnd/src/infrastructure/dto/contact-message/ backEnd/src/use-cases/contact-message/ backEnd/src/infrastructure/controllers/ContactMessageController.ts backEnd/src/infrastructure/routes/contact-message.routes.ts
git commit -m "Add ContactMessage resource (repository, use-cases, controller, route)"
```

---

### Task 21: Routes aggregator and server wiring

**Files:**
- Create: `backEnd/src/infrastructure/routes/index.ts`
- Modify: `backEnd/src/server.ts:56-59`

**Interfaces:**
- Consumes: every `*.routes.ts` file from Tasks 8 and 10-20 (12 route modules total: auth, education, experience, projects, skills, social-links, strengths, interests, languages, news, users, contact-messages).
- Produces: a single mounted router consumed only by `server.ts` — nothing in this plan depends on anything after this task.

- [ ] **Step 1: Implement the aggregator**

```typescript
import { Router } from 'express';
import authRoutes from './auth.routes';
import educationRoutes from './education.routes';
import experienceRoutes from './experience.routes';
import projectRoutes from './project.routes';
import skillRoutes from './skill.routes';
import socialLinkRoutes from './social-link.routes';
import strengthRoutes from './strength.routes';
import interestRoutes from './interest.routes';
import languageRoutes from './language.routes';
import newsRoutes from './news.routes';
import userRoutes from './user.routes';
import contactMessageRoutes from './contact-message.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/education', educationRoutes);
router.use('/experience', experienceRoutes);
router.use('/projects', projectRoutes);
router.use('/skills', skillRoutes);
router.use('/social-links', socialLinkRoutes);
router.use('/strengths', strengthRoutes);
router.use('/interests', interestRoutes);
router.use('/languages', languageRoutes);
router.use('/news', newsRoutes);
router.use('/users', userRoutes);
router.use('/contact-messages', contactMessageRoutes);

export default router;
```
Save as `backEnd/src/infrastructure/routes/index.ts`.

- [ ] **Step 2: Mount it in `server.ts`**

In `backEnd/src/server.ts`, replace lines 56-59 (the `// TODO: Ajouter les routes API ici` block):

```typescript
app.use(envConfig.apiPrefix, apiRoutes);
```

And add the import near the top, alongside the other imports (after the `errorMiddleware` import added in Task 4):

```typescript
import apiRoutes from './infrastructure/routes';
```

- [ ] **Step 3: Verify the backend still builds**

Run: `cd backEnd && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Run the entire backend test suite**

Run: `cd backEnd && npm test`
Expected: every `.test.ts` file across `shared/exceptions`, `infrastructure/middlewares`, `infrastructure/repositories`, and all 11 `use-cases/<resource>` directories passes. No failures.

- [ ] **Step 5: Run lint and format checks**

Run: `cd backEnd && npm run lint && npm run format:check`
Expected: both exit 0. If either reports issues in files this plan created, fix them directly (per the existing convention from the CI quality-gate work — these are real issues the tooling correctly catches, not false positives).

- [ ] **Step 6: Commit**

```bash
git add backEnd/src/infrastructure/routes/index.ts backEnd/src/server.ts
git commit -m "Mount all API routes in server.ts"
```

---

## After all tasks: manual steps for the user

These cannot be done by an agent and must be done by the user before the API is actually usable end-to-end:

1. Set up a real PostgreSQL database and a real `.env` file (the `.env.example` additions from Task 9 — `ADMIN_EMAIL`/`ADMIN_PASSWORD` — need real values, not the placeholders).
2. Run `npm run seed:admin` once against that real database to create the one admin user `POST /auth/login` authenticates against.
3. Manually exercise the API end-to-end (e.g. with `curl` or Postman) — this plan's tests are all unit tests against mocked repositories, per the design spec's explicit non-goal of DB-backed/integration tests. Nothing in this plan has run a real HTTP request against a real database.
4. Decide whether/when to wire `npm test` into the CI quality-gate workflow's job list (noted as a deferred follow-up in the design spec) — it isn't part of `pr-quality-gate.yml` yet.
5. Frontend integration is a separate, future plan — this one is backend-only.
