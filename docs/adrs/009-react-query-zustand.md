# ADR 009: React Query + Zustand for State Management

## Status
Accepted

## Context
We need state management solutions for the React Native frontend. The app has two types of state: server state (fetched data) and client state (UI state, forms). We want simple, effective solutions with minimal boilerplate.

## Decision
Use React Query (TanStack Query) for server state management and Zustand for local UI state.

## Consequences

### Positive
- React Query handles all server state complexity (caching, refetching, loading states)
- Automatic background refetching and cache invalidation
- Zustand is minimal and easy to learn for local state
- No Redux boilerplate
- Both libraries have excellent TypeScript support
- React Query works perfectly with REST APIs
- Separation of concerns between server and client state

### Negative
- Two libraries instead of one comprehensive solution
- Need to understand which state goes where

### Neutral
- Both libraries are modern and well-maintained
- Much simpler than Redux for this use case
- Good documentation and community support
