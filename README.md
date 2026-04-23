# Nest Test

A task management API built with NestJS, featuring JWT authentication, role-based access control, and PostgreSQL persistence.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** NestJS 11
- **Database:** PostgreSQL + TypeORM
- **Auth:** JWT (passport-jwt), bcrypt
- **Validation:** class-validator, class-transformer
- **Config:** @nestjs/config with Joi schema validation

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
PORT=3000
MESSAGE_PREFIX=Hello

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=tasks_db
DB_SYNC=1

JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRES_IN=3600
```

### 3. Database

Create the PostgreSQL database:

```bash
createdb tasks_db
```

## Running the app

```bash
# Development (watch mode)
npm run start:dev

# Production build
npm run build
npm run start:prod

# Debug
npm run start:debug
```

The API runs at `http://localhost:3000` (or the configured `PORT`).

## API Overview

### Public routes

| Method | Path             | Description          |
| ------ | ---------------- | -------------------- |
| GET    | `/`             | Health check         |
| POST   | `/auth/register`| Register new user    |
| POST   | `/auth/login`   | Login (returns JWT)  |

### Protected routes (require `Authorization: Bearer <token>`)

**Auth**

| Method | Path          | Description       |
| ------ | ------------- | ----------------- |
| GET    | `/auth/profile` | Current user profile |
| GET    | `/auth/admin`  | Admin-only (roles)   |

**Tasks**

| Method | Path                    | Description             |
| ------ | ----------------------- | ----------------------- |
| GET    | `/tasks`                | List tasks (paginated)  |
| GET    | `/tasks/:id`            | Get task by ID          |
| POST   | `/tasks`                | Create task             |
| PATCH  | `/tasks/:id`            | Update task             |
| PATCH  | `/tasks/:id/status`     | Update task status      |
| PATCH  | `/tasks/:id/labels`     | Add labels              |
| DELETE | `/tasks/:id/labels`     | Remove labels           |
| DELETE | `/tasks/:id`            | Delete task             |

### Query parameters (GET /tasks)

| Param     | Type   | Description                     |
| --------- | ------ | ------------------------------- |
| status    | enum   | Filter by `OPEN`, `IN_PROGRESS`, `DONE` |
| search    | string | Search in title/description     |
| labels    | string | Comma-separated label names      |
| sortBy    | string | `createdAt`, `updatedAt`, `title`, `status` |
| sortOrder | string | `ASC` or `DESC`                  |
| limit     | number | Page size (1–100, default 10)    |
| offset    | number | Pagination offset                |

### Example requests

**Register**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!","name":"John Doe"}'
```

**Login**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Password123!"}'
```

**Create task**

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt>" \
  -d '{"title":"My Task","description":"Task description","labels":[{"name":"urgent"}]}'
```

## Testing

```bash
# Unit tests
npm test

# E2E tests (requires PostgreSQL with database `tasks_e2e`)
npm run test:e2e

# Coverage
npm run test:cov
```

E2E tests use `tasks_e2e` by default; see `test/setup-env.ts` for environment overrides.

## Scripts

| Script        | Description                 |
| ------------- | --------------------------- |
| `npm run build`      | Compile TypeScript          |
| `npm run start`     | Start app                   |
| `npm run start:dev` | Start in watch mode         |
| `npm run start:prod`| Run compiled build         |
| `npm run lint`      | Run ESLint                  |
| `npm run format`     | Format with Prettier        |
| `npm run typeorm:generate` | Generate migration |
| `npm run typeorm:migrate`  | Run migrations      |

## Project structure

```
src/
├── common/           # Pagination DTOs, shared types
├── configs/          # App, DB, auth config + validation
├── tasks/            # Task CRUD, labels, status
├── users/            # Auth, JWT, guards, roles
├── app.module.ts
└── main.ts
test/
├── config/           # E2E test config
├── *.e2e-spec.ts
└── test-setup.ts     # E2E bootstrap
```

## License

UNLICENSED
