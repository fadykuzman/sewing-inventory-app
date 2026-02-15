# ADR 005: Raw SQL Initially, Migrate to Prisma Later

## Status
Accepted

## Context
We need to interact with PostgreSQL database. We can use raw SQL queries or an ORM like Prisma. For MVP, we want to keep things simple and maintain full control over queries.

## Decision
Start with raw SQL queries using the `pg` library. Migrate to Prisma when complexity increases or when ORM benefits outweigh the simplicity of raw SQL.

## Consequences

### Positive
- Full control over SQL queries
- No abstraction layer to learn initially
- Easier to understand exactly what queries are running
- Simpler setup for MVP
- Better understanding of database operations

### Negative
- More boilerplate code
- No automatic type generation from schema
- Manual migration management
- More prone to SQL injection if not careful

### Neutral
- Clear migration path to Prisma exists when needed
- Can evaluate ORM benefits with real experience first
