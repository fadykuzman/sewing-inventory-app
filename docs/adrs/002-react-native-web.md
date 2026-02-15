# ADR 002: React Native Web for Cross-Platform Development

## Status
Accepted

## Context
The application needs to run on both web and mobile platforms (Android first, then iOS). We want to maximize code reuse while maintaining a native feel on each platform.

## Decision
Use React Native Web to build a single codebase that works across web and mobile platforms.

## Consequences

### Positive
- Single codebase for web and mobile reduces development time
- Shared business logic and components
- Consistent user experience across platforms
- Lower maintenance overhead
- Strong community support

### Negative
- May require platform-specific code for some features
- Web performance may not match pure web frameworks
- Some React Native libraries may not support web

### Neutral
- Need to test on all target platforms regularly
- Requires understanding of platform-specific differences
