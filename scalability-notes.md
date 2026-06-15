# Scalability Notes

The current architecture is a functional, monorepo-based prototype suited for demonstration and initial MVPs. To scale this to a production-level CRM processing millions of communications, the architecture would need to evolve significantly.

## Event Driven Architecture (EDA) & Message Queues

Currently, the `Channel Service` simulates webhook callbacks via direct HTTP requests (`axios.post`). 
**Production Evolution**:
- **Kafka / RabbitMQ**: Instead of direct HTTP calls, the Channel Service would publish events to a message broker (e.g., Apache Kafka). The backend would consume these events asynchronously. This decouples the systems, guarantees at-least-once delivery, and handles traffic spikes without overwhelming the backend database.
- **Worker Queues**: The campaign dispatch loop (in `campaigns.controller.js`) currently iterates over customers linearly in memory. In production, we would push dispatch jobs to a queue like **Redis + BullMQ**. A pool of worker instances would consume these jobs and send them to the actual channel providers (Twilio, WhatsApp Business API).

## Database Scaling

Currently, analytics funnel queries use MongoDB aggregations over the `Event` collection.
**Production Evolution**:
- As the `Event` table grows to hundreds of millions of rows, real-time aggregations will degrade performance.
- We would implement **ClickHouse** or **Snowflake** to store analytics events. ClickHouse is a columnar database highly optimized for the type of `GROUP BY` analytics we need for the funnel charts.
- The `Event` consumer (from Kafka) would pipe data into ClickHouse rather than MongoDB.

## Caching

Currently, no caching is implemented.
**Production Evolution**:
- **Redis** would be introduced to cache:
  1. Frequently accessed segments (Audience Counts).
  2. Aggregated dashboard metrics to prevent recalculating KPI cards on every page load.
  3. Session and API rate limiting state.

## Microservices Architecture

- The system is already somewhat decoupled by having a separate `channel-service`. 
- In production, we would further decouple `backend` into:
  - `Core API Service` (CRUD for customers, segments, campaigns)
  - `AI Service` (Isolated environment for LLM interactions, allowing independent scaling and potentially moving to Python/FastAPI for better ML ecosystem support)
  - `Analytics Service` (Querying ClickHouse)
  - `Ingestion Service` (Handling webhooks from providers and pushing to Kafka).

## Current Tradeoffs
1. **Memory Risks**: The `customers.find()` during campaign dispatch pulls all documents into memory. Fine for 1,000 users, crashes for 1,000,000 users. We'd need cursor-based pagination or batch processing.
2. **Missing Retries**: Webhook failures are currently dropped. We need exponential backoff.
