# ADR 003: PostgreSQL for Relational Database

## Status
Accepted

## Context
We need a database to store structured inventory data (fabrics, patterns, accessories, projects). The data has clear relationships and requires strong consistency, transactions, and complex querying capabilities.

## Decision
Use PostgreSQL as the primary database for all relational data.

## Consequences

### Positive
- Excellent support for relational data and complex queries
- ACID compliance ensures data integrity
- JSONB support for flexible fields (tags, notes)
- Strong full-text search capabilities
- Battle-tested and reliable
- Good performance for read-heavy workloads
- Extensive ecosystem and tooling

### Negative
- Requires more setup than NoSQL databases
- Need to design schema upfront

### Neutral
- NoSQL not needed for this use case as data is structured
- All data requirements fit well in relational model
