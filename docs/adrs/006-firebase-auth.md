# ADR 006: Firebase Authentication

## Status
Accepted

## Context
The application requires user authentication for personal inventory management and read-only sharing with family members. We need a secure, reliable authentication system without building it from scratch.

## Decision
Use Firebase Authentication for user management and authentication.

## Consequences

### Positive
- Managed authentication service - no need to build from scratch
- Multiple authentication providers (email/password, Google, etc.)
- Secure token-based authentication
- Easy integration with React Native
- User management handled by Firebase
- Free tier available for MVP
- Well-documented with good SDKs

### Negative
- Vendor lock-in to Firebase
- Requires internet connectivity for auth operations
- Additional external dependency

### Neutral
- Backend verifies Firebase tokens
- User data stored in PostgreSQL using Firebase UID as identifier
- Need to handle token refresh and expiration
