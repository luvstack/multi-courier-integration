# Design

## Architecture

The platform is a single Node.js process with three active subsystems:

1. **HTTP server (Express 5)** — handles API requests synchronously.
2. **BullMQ worker** — processes webhook jobs from a Redis queue asynchronously.
3. **Infrastructure connections** — PostgreSQL (Sequelize) and Redis (ioredis), initialised once at boot and shut down gracefully on SIGINT/SIGTERM.

```
Client
  │
  ▼
Express ──► OrderController ──► OrderService ──► CourierFactory ──► Provider (Urbanebolt / Mock)
                                             └──► OrderModel / TrackingHistoryModel ──► PostgreSQL

  │
  ▼
Express ──► WebhookController ──► WebhookService.handle() ──► BullMQ Queue ──► Redis
                                                                    │
                                                              BullMQ Worker
                                                                    │
                                                         WebhookService.process()
                                                                    │
                                                     OrderModel / TrackingHistoryModel
```

---

## Design Patterns

### Provider / Strategy pattern

Every courier is behind two interfaces:

- **`ICourier`** — `createOrder`, `trackOrder`, `cancelOrder`. One class per provider implements this; the `CourierFactory` returns the right instance at runtime based on `courierProvider` in the request.
- **`ICourierMapper<TShipment, TOrderResp, TTrackResp, TCancelResp>`** — generic interface that maps between the generic domain payload and provider-specific wire formats. The `ShipmentMapper` facade routes to the correct mapper via a `getMapper(provider)` factory.

Adding a new courier requires touching the following (all changes are additive — no existing code is modified):

| File | Change |
|---|---|
| `src/libs/providers/types.ts` | Add name to `CourierProvider` union and `COURIER_PROVIDERS` map |
| `src/libs/providers/<name>/` | New folder: `types.ts`, `mapper.ts`, `order.ts`, `index.ts` |
| `src/libs/providers/index.ts` | Export the new namespace |
| `src/libs/providers/factory/courier-factory.ts` | Add a `case` to `getProvider()` |
| `src/libs/providers/mappers/shipment-mapper.ts` | Add a `case` to `getMapper()` |
| `src/validators/order.ts` + `webhook.ts` | Add the new name to the `Joi.valid()` list |

Controllers, routes, services, and existing provider implementations are untouched.

### Unified error response

All endpoints — validation errors, business errors, and unexpected failures — return the same JSON envelope:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable description",
  "details": [{ "field": "orderId", "message": "..." }],
  "requestId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
}
```

- `code` is a machine-readable constant (`VALIDATION_ERROR`, `NOT_FOUND`, `CONFLICT`, `COURIER_ERROR`, `INTERNAL_SERVER_ERROR`, …).
- `details` is only present on validation errors.
- `requestId` is echoed from the incoming `X-Request-Id` header, or auto-generated if absent, and returned in the `X-Request-Id` response header. This lets clients and logs correlate a request end-to-end.

### Repository-free service layer

Services (`OrderService`, `WebhookService`) call Sequelize models directly. A dedicated repository layer was considered but rejected: for this domain the queries are simple point lookups and inserts, and the extra indirection would add boilerplate without testability gains that could not be achieved by mocking Sequelize directly.

### Fire-and-forget webhook ingestion

Webhook handlers do not block on processing. The controller enqueues the job (`< 5 ms`) and returns `{ success: true }` immediately. The worker processes asynchronously with configurable retries (3 attempts, exponential backoff). This decouples partner latency from our response time and protects against DB slowness causing webhook re-delivery storms from the courier side.

---

## Database Schema

### `orders`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | internal identifier |
| `order_id` | VARCHAR, unique | business-facing order reference |
| `customer_id` | VARCHAR | tenant/customer identifier |
| `courier_provider` | VARCHAR | `urbanebolt`, `mock`, … |
| `courier_order_id` | VARCHAR, nullable | shipment ID returned by the partner |
| `awb_number` | VARCHAR, nullable | air waybill / tracking number |
| `status` | ENUM(`PENDING`,`CREATED`,`PICKED_UP`,`IN_TRANSIT`,`DELIVERED`,`CANCELLED`,`FAILED`) | `PENDING` → `CREATED` → `IN_TRANSIT` → `DELIVERED` / `CANCELLED` / `FAILED` |
| `created_at` / `updated_at` | TIMESTAMPTZ | managed by Sequelize |

Indexes on `customer_id`, `courier_provider`, `awb_number`.

### `tracking_history`

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `order_id` | UUID FK → `orders.id` | cascade delete |
| `action` | ENUM(`CREATE`,`UPDATE`,`CANCEL`,`STATUS_UPDATE`) | action that triggered this entry |
| `request_payload` | JSONB, nullable | outbound payload sent to courier |
| `response_payload` | JSONB, nullable | raw partner response or inbound webhook body |
| `status` | ENUM(`OrderStatus`) | order status at the time of this event |
| `error_message` | TEXT, nullable | populated on failure |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

`tracking_history` is an append-only audit log. Every state transition (order creation, cancellation, webhook status update) writes one row. `request_payload` / `response_payload` are JSONB so partner-specific fields are preserved without schema migrations.

Schema is managed via **Sequelize CLI migrations** — `sequelize.sync()` is intentionally absent so production schema changes are always explicit and reversible.

---

## Trade-offs

| Decision | Benefit | Cost |
|---|---|---|
| Async webhooks via BullMQ | Instant `200` to courier; built-in retries | Requires Redis; eventual consistency for status updates |
| JSONB for payloads | No schema change when partner API evolves | Harder to query individual fields |
| ENUM for status / action | DB enforces valid values at the constraint level | Adding new values requires a migration (`ALTER TYPE ... ADD VALUE`) |
| Single Redis for token cache + BullMQ (separate connections) | Simple ops | BullMQ needs `maxRetriesPerRequest: null`; cannot share the app connection |
| No repository layer | Less indirection, faster to read | Services are harder to unit-test in isolation without mocking Sequelize |
| Migrations over `sync()` | Safe for production; schema is version-controlled | Requires running `npm run db:migrate:up` on deploy |
