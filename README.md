# Courier Platform

A multi-provider courier integration API. Exposes a unified REST interface for creating, tracking and cancelling shipments across courier partners. Incoming webhook events are accepted immediately and processed asynchronously via BullMQ.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js ≥ 16, TypeScript |
| HTTP | Express 5 |
| Database | PostgreSQL (Sequelize 6, migrations) |
| Cache / Queue | Redis (ioredis + BullMQ) |
| Validation | Joi |
| Tests | Vitest + supertest |

---

## Setup

### Prerequisites

- Node.js ≥ 16
- PostgreSQL database
- Redis server

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

See the [Environment Variables](#environment-variables) section below for a full reference.

### 3. Run database migrations

```bash
npm run db:migrate:up
```

To check migration status:

```bash
npm run db:migrate:status
```

### 4. Start the development server

```bash
npm run dev
```

The API is available at `http://localhost:3000/api/v1`.

---

## Environment Variables

All variables live in `.env` (development) or the corresponding `config/.env.*` file.

### Server

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | `development` | `development` \| `production` \| `test` |
| `PORT` | `3000` | HTTP port |

### PostgreSQL

Use either `DATABASE_URL` **or** the individual `DB_*` variables. If both are set, `DATABASE_URL` takes priority.

| Variable | Description |
|---|---|
| `DATABASE_URL` | Full connection string, e.g. `postgresql://user:pass@host/db?sslmode=require` |
| `DB_HOST` | Fallback host (default `localhost`) |
| `DB_PORT` | Fallback port (default `5432`) |
| `DB_NAME` | Database name (default `courier_platform`) |
| `DB_USER` | Database user (default `postgres`) |
| `DB_PASSWORD` | Database password |
| `DB_DIALECT` | Always `postgres` |
| `DB_LOGGING` | `true` to log SQL queries (default `false`) |
| `DB_SSL` | `true` to force SSL. Auto-enabled when `DATABASE_URL` contains `sslmode=require` |

### Redis

Use either `REDIS_URL` **or** the individual `REDIS_*` variables.

| Variable | Description |
|---|---|
| `REDIS_URL` | Full connection string, e.g. `redis://localhost:6379` or `rediss://...` for TLS |
| `REDIS_HOST` | Fallback host (default `localhost`) |
| `REDIS_PORT` | Fallback port (default `6379`) |
| `REDIS_PASSWORD` | Optional password |
| `REDIS_TLS` | `true` to force TLS. Auto-enabled when `REDIS_URL` starts with `rediss://` |

### Urbanebolt

| Variable | Description |
|---|---|
| `URBANEBOLT_BASE_URL` | API base URL, e.g. `https://uat.urbanebolt.in` |
| `URBANEBOLT_API_VERSION` | API version, e.g. `v1` |
| `URBANEBOLT_USERNAME` | API username |
| `URBANEBOLT_PASSWORD` | API password |
| `URBANEBOLT_TIMEOUT` | Request timeout in ms (default `10000`) |

### Retry

| Variable | Default | Description |
|---|---|---|
| `COURIER_RETRY_COUNT` | `3` | Maximum retry attempts for courier API failures (used by BullMQ webhook worker) |

---

## API Reference

Base path: `/api/v1`

### Orders

| Method | Path | Description |
|---|---|---|
| `POST` | `/orders` | Create a single shipment |
| `POST` | `/orders/bulk` | Bulk-create shipments (max 100) |
| `GET` | `/orders/:orderId/track` | Track a shipment |
| `POST` | `/orders/:orderId/cancel` | Cancel a shipment |

> `:orderId` is the internal database UUID returned on creation.

### Webhooks

| Method | Path | Description |
|---|---|---|
| `POST` | `/webhooks/:courierPartner` | Receive a status-update event from a courier |

`:courierPartner` must be `urbanebolt` or `mock`. The webhook is enqueued immediately — processing is asynchronous.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with hot reload (uses `swc`, no type checking) |
| `npm run type-check` | TypeScript type check without emitting |
| `npm run lint` | ESLint |
| `npm run format` | Format all files with Prettier |
| `npm run build` | Compile to `dist/` for production |
| `npm start` | Run production build |
| `npm test` | Run tests with Vitest |
| `npm run db:migrate:up` | Run pending migrations |
| `npm run db:migrate:down` | Undo the last migration |
| `npm run db:migrate:down:all` | Undo all migrations |
| `npm run db:migrate:status` | Show migration status |
| `npm run db:migration:new -- --name <name>` | Generate a new migration file |

---

## Adding a New Courier

Follow these steps to add a new courier partner (e.g. `delhivery`).

### 1. Register the provider name

In `src/libs/providers/types.ts`, add the new name to the union type and `COURIER_PROVIDERS`:

```typescript
export type CourierProvider = 'urbanebolt' | 'mock' | 'delhivery';

export const COURIER_PROVIDERS = {
  urbanebolt: 'urbanebolt',
  mock: 'mock',
  delhivery: 'delhivery',
} as const;
```

### 2. Create the provider folder

```
src/libs/providers/delhivery/
├── types.ts      — provider-specific request/response interfaces
├── mapper.ts     — implements ICourierMapper<TShipment, TOrder, TTrack, TCancel>
├── order.ts      — implements ICourier (createOrder / trackOrder / cancelOrder)
└── index.ts      — barrel exports
```

### 3. Export from the providers barrel

In `src/libs/providers/index.ts`:

```typescript
export * as Delhivery from './delhivery';
```

### 4. Wire into the factory and mapper

**`src/libs/providers/factory/courier-factory.ts`** — add a `case`:

```typescript
case Types.COURIER_PROVIDERS.delhivery: {
  return new CourierProvider.Delhivery.DelhiveryOrder();
}
```

**`src/libs/providers/mappers/shipment-mapper.ts`** — add a `case` in `getMapper()`:

```typescript
case COURIER_PROVIDERS.delhivery:
  return new DelhiveryMapper.Mapper();
```

### 5. Add a migration (if the provider needs new columns)

```bash
npm run db:migration:new -- --name add-delhivery-fields
```
