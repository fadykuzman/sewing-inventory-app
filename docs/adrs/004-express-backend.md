# ADR 004: Express for Backend Framework

## Status
Accepted

## Context
We need a Node.js backend framework to build our REST API. The framework should be easy to learn, well-documented, and sufficient for our CRUD operations, file uploads, and authentication needs.

## Decision
Use Express.js as the backend framework.

## Consequences

### Positive
- Easiest Node.js framework to learn
- Huge community and extensive resources
- Minimal and unopinionated - full control over architecture
- Excellent middleware ecosystem
- Well-suited for REST APIs
- Battle-tested and stable
- Great TypeScript support

### Negative
- Less structure than opinionated frameworks (NestJS)
- Need to make more architectural decisions ourselves

### Neutral
- Sufficient for all MVP requirements
- Can migrate to more opinionated framework later if needed
