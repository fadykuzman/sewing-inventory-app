# ADR 011: Error Handling and Validation

## Status
Accepted

## Context
We need a consistent approach to error handling and input validation across all API endpoints. Without a standard, each route risks handling errors differently, leaking internal details to clients, or returning inconsistent response shapes.

## Decision

### Validation
- Validate required fields at the start of each route handler, before any DB query
- Return `400 Bad Request` for missing or malformed input
- Return a clear, user-friendly message listing what is wrong

### Error Handling
- Wrap all async route handlers in try/catch
- Use a **centralized error handling middleware** (registered last in `index.ts`) to avoid repetition
- Route handlers pass unexpected errors to the middleware via `next(err)`
- The middleware logs the full error server-side and returns a generic `500` message to the client — never expose internal error details

### HTTP Status Codes
| Scenario | Status Code |
|---|---|
| Missing or invalid input | 400 Bad Request |
| Resource not found | 404 Not Found |
| Unexpected server/DB error | 500 Internal Server Error |

### Response Shape
All error responses follow the standard response format:
```json
{
  "success": false,
  "error": "User-friendly message here"
}
```

### Logging
- All errors are logged to the backend console with context (e.g. route name)
- Never log sensitive user data (passwords, tokens)
- Never send stack traces or raw error objects to the client

## Consequences

### Positive
- Consistent error responses across all endpoints
- Internal errors never leak to clients
- Easier debugging through structured server-side logs
- Centralized middleware reduces boilerplate in each route

### Negative
- Requires discipline to always use `next(err)` instead of inline `res.status(500)`
- Validation logic per route adds some boilerplate (acceptable until complexity warrants a validation library)

## References
- [Express Error Handling Guide](https://expressjs.com/en/guide/error-handling.html)
- [Express Error Handling Patterns - Better Stack](https://betterstack.com/community/guides/scaling-nodejs/error-handling-express/)
