# Observability & Logging Plan

## Requirements
- **Deployment:** Self-hosted home server (Podman)
- **Notifications:** Signal (primary), SMS & email (optional)
- **Retention:** 7 days
- **Approach:** Incremental — one layer at a time
- **Experience:** First-time observability setup

## Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Logging | **Loki** | Log aggregation and search |
| Dashboards & Alerts | **Grafana** | Unified UI for logs, metrics, traces + alerting |
| Metrics | **Prometheus** | Scrape and store time-series metrics |
| Traces | **Jaeger** | Distributed tracing (OpenTelemetry) |
| Notifications | **Alertmanager + signal-cli** | Route alerts to Signal |

## Phase 1: Structured Logging (Backend + Frontend)

### Goal
Replace `console.log` / `console.error` with structured JSON logging so logs are machine-parseable and ready for Loki.

### Backend (Express/Node.js)
- Add a logging library (e.g., **pino** — fast, JSON by default)
- Create a logger instance with app-level context (service name, environment)
- Log levels: `error`, `warn`, `info`, `debug`
- What to log:
  - Every incoming HTTP request (method, path, status, duration)
  - Request validation errors (400s)
  - Unexpected errors (500s) with stack traces
  - Database query failures
  - File storage operations (image save/delete)
- Use request-scoped context (request ID) for correlation
- Add request ID middleware (generate UUID per request, attach to all logs)

### Frontend (Expo/React Native)
- Add a lightweight logger wrapper
- What to log:
  - API call failures (URL, status, error message)
  - Navigation events (screen transitions)
  - Unhandled JS errors / promise rejections
  - User actions that trigger mutations (create/edit/delete fabric)
- Log destination: send structured logs to a backend endpoint (`POST /api/v1/logs`) for collection
- Keep `__DEV__` console output for local development

### Deliverables
- [x] Backend: pino logger with request ID middleware
- [x] Backend: HTTP request logging middleware
- [x] Backend: replace all `console.log`/`console.error` with logger calls
- [x] Frontend: logger module with severity levels
- [x] Frontend: error boundary with logging
- [x] Frontend: API error logging in the API layer
- [x] Backend: `POST /api/v1/logs` endpoint to receive frontend logs
- [x] Frontend: unhandled error/promise rejection logging
- [x] Backend: `ts-node` configured with `"files": true` for type augmentation

---

## Phase 2: Loki + Grafana

### Goal
Centralized log viewing — search and filter logs from a web UI.

### Infrastructure (Podman)
- `podman-compose.yml` with:
  - **Loki** — receives and stores logs
  - **Grafana** — web UI for querying logs
  - **Promtail** — agent that ships logs from the app containers to Loki
- Persistent volumes for Loki data (7-day retention configured)
- Grafana data source: Loki (auto-provisioned)

### Backend Integration
- Pino logs go to stdout → Promtail scrapes container stdout → ships to Loki
- No code changes needed if Phase 1 is done correctly (structured JSON to stdout)

### Frontend Logs
- Frontend logs arrive at `POST /api/v1/logs` → backend logs them via pino → same pipeline to Loki

### Deliverables
- [ ] `podman-compose.yml` with Loki, Grafana, Promtail
- [ ] Loki retention config: 7 days
- [ ] Grafana provisioned with Loki data source
- [ ] Verify backend logs appear in Grafana
- [ ] Verify frontend logs appear in Grafana
- [ ] Basic Grafana dashboard: recent errors, request log stream

---

## Phase 3: Prometheus + Grafana (Metrics)

### Goal
Track request rates, response times, error rates, and Node.js process health.

### Backend
- Add `prom-client` library to Express
- Expose `/metrics` endpoint (Prometheus scrape target)
- Default metrics: CPU, memory, event loop lag, active handles
- Custom metrics:
  - `http_requests_total` (counter) — labels: method, path, status
  - `http_request_duration_seconds` (histogram) — labels: method, path
  - `db_query_duration_seconds` (histogram) — labels: query_name
  - `active_fabrics_total` (gauge) — business metric

### Infrastructure
- Add **Prometheus** to `podman-compose.yml`
- Prometheus scrape config targeting the backend `/metrics` endpoint
- Add Prometheus as Grafana data source
- 7-day retention for Prometheus TSDB

### Deliverables
- [ ] `prom-client` integration with Express
- [ ] `/metrics` endpoint
- [ ] Request duration + count middleware
- [ ] Prometheus container + scrape config
- [ ] Grafana dashboard: request rate, error rate, p50/p95/p99 latency, Node.js health

---

## Phase 4: Distributed Tracing (Jaeger)

### Goal
Trace a request from frontend through backend to database — identify slow queries and bottlenecks.

### Backend
- Add OpenTelemetry SDK (`@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`)
- Auto-instrumentation covers: Express, HTTP, PostgreSQL (`pg`)
- Export traces to Jaeger (OTLP protocol)
- Correlate traces with logs via trace ID in pino logs

### Frontend
- Add trace context header (`traceparent`) to API requests
- Allows linking frontend-initiated requests to backend traces

### Infrastructure
- Add **Jaeger** (all-in-one) to `podman-compose.yml`
- Jaeger UI accessible via Grafana (add as data source) or standalone
- 7-day retention

### Deliverables
- [ ] OpenTelemetry SDK setup in backend
- [ ] Auto-instrumentation for Express, HTTP, pg
- [ ] Jaeger container in podman-compose
- [ ] Trace ID in pino log output (log-trace correlation)
- [ ] Frontend: `traceparent` header on API calls
- [ ] Grafana: Jaeger data source + trace exploration

---

## Phase 5: Alerting (Grafana → Signal)

### Goal
Get notified on Signal when something is wrong.

### Alert Rules (in Grafana)
- **Error rate spike** — more than 5 errors in 5 minutes
- **High response time** — p95 latency > 2s for 5 minutes
- **Service down** — no metrics scraped for 2 minutes
- **Disk space low** — if applicable via node-exporter

### Notification Pipeline
- Grafana → **Alertmanager** → **signal-cli** (REST API) → Signal message
- `signal-cli-rest-api` container: exposes REST API for sending Signal messages
- Alertmanager webhook receiver pointing to signal-cli

### Setup
- Register a Signal number with `signal-cli` (requires a phone number for registration)
- Configure Alertmanager with webhook to signal-cli REST endpoint
- Grafana alert rules with Alertmanager as contact point

### Optional: Email & SMS
- **Email:** Alertmanager has built-in SMTP support — configure with your email provider
- **SMS:** Use a free SMS gateway API or Twilio free tier via Alertmanager webhook

### Deliverables
- [ ] `signal-cli-rest-api` container in podman-compose
- [ ] Signal number registered and linked
- [ ] Alertmanager config with Signal webhook
- [ ] Grafana alert rules (error rate, latency, service down)
- [ ] Test alert → Signal message received
- [ ] (Optional) Email contact point in Alertmanager
- [ ] (Optional) SMS via webhook

---

## Appendix A: Self-Hosted Sentry (Future)

### When to Consider
- If error tracking needs outgrow Loki-based log searching
- When you want: source map support, error grouping, release tracking, breadcrumbs

### What It Provides (Beyond Loki)
- Automatic error grouping and deduplication
- Stack trace with source map resolution (useful for React Native)
- Release/deployment tracking
- User context and breadcrumbs
- Performance monitoring (overlaps with Jaeger)

### Resource Requirements
- ~3GB RAM minimum (Kafka, Clickhouse, PostgreSQL, Redis, Snuba, etc.)
- ~10GB disk for a small instance
- 20+ containers in the compose file

### Setup Overview
1. Clone `getsentry/self-hosted` repo
2. Run `./install.sh` (adapting for Podman)
3. Configure `sentry.conf.py` for retention, email, etc.
4. Install `@sentry/react-native` in frontend
5. Install `@sentry/node` in backend
6. Upload source maps as part of build pipeline

### Integration with Existing Stack
- Sentry can forward errors to Grafana via webhook
- Traces can be correlated if both use OpenTelemetry
- Consider running Sentry on a separate machine due to resource usage
