# ADR 007: REST API Design

## Status
Accepted

## Context
We need to define the API architecture between frontend and backend. Options include REST, GraphQL, and tRPC. The API needs to be simple to implement and work well with our chosen frontend state management.

## Decision
Use REST API with standard HTTP methods and JSON responses.

## Consequences

### Positive
- Simplest to implement and understand
- Extensive documentation and tutorials available
- Works perfectly with React Query
- Easy to test with standard tools (Postman, curl)
- Standard HTTP status codes and methods
- Cacheable responses
- Well-understood patterns

### Negative
- May require multiple requests for related data
- No automatic type safety between frontend and backend
- Can lead to over-fetching or under-fetching data

### Neutral
- Sufficient for all MVP CRUD operations
- Can migrate to tRPC later if end-to-end type safety becomes important
- RESTful conventions make API predictable
