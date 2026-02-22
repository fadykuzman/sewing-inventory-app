# Backend - Development Guide

## Database Migrations

Migrations use [node-pg-migrate](https://github.com/salsita/node-pg-migrate) with plain SQL files.

### Prerequisites

- PostgreSQL running (via `docker compose up -d` from project root)
- `DATABASE_URL` set in root `.env`

### Creating a migration

```bash
npm run migrate:create -- descriptive-name
```

This generates a timestamped SQL file in `migrations/`:

```
migrations/1771771852000_descriptive-name.sql
```

The file has two sections separated by `-- Down Migration`:

```sql
-- Up Migration
CREATE TABLE IF NOT EXISTS example (...);

-- Down Migration
DROP TABLE IF EXISTS example;
```

Write your forward schema change under `Up Migration` and the rollback under `Down Migration`.

### Running migrations

```bash
# Apply all pending migrations
npm run migrate:up

# Rollback the last migration
npm run migrate:down
```

### Naming conventions

- Use kebab-case: `create-fabrics`, `add-user-id-to-fabrics`
- Be descriptive: prefer `add-cost-column-to-fabrics` over `update-fabrics`
