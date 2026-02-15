# ADR 008: Local File Storage, Migrate to Cloud Later

## Status
Accepted

## Context
The application needs to store images (fabric photos, pattern images) and PDF files (sewing patterns). We need a storage solution that is simple for MVP but can scale later.

## Decision
Use local file system storage for MVP with file paths stored in PostgreSQL. Plan to migrate to cloud blob storage (S3, Azure Blob, etc.) when scaling requirements emerge.

## Consequences

### Positive
- Simplest implementation for MVP
- No external dependencies or costs
- Fast access during development
- Easy backup with database
- File paths in database make migration straightforward

### Negative
- Not suitable for distributed/scaled deployments
- No CDN integration
- Manual backup management
- File system space limitations

### Neutral
- Clear migration path to cloud storage exists
- Database stores file paths, not binary data
- Cloud provider choice deferred until needed
- Good enough for personal/family use MVP
