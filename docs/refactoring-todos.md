# Refactoring TODOs — Maintainability, Modularity & Testability

## Completed

- [x] **Task 1: Add test framework setup**
  - Backend: Jest + ts-jest + supertest
  - Frontend: jest-expo + @testing-library/react-native
  - Shared: Jest + ts-jest
  - Root package.json has shared devDependencies (jest, ts-jest, @types/jest, typescript)
  - Root tsconfig.base.json with shared compiler options, extended by backend/ and shared/

- [x] **Task 2: Extract FileStorageService from FabricService**
  - Created `FileStorageService` interface in `backend/src/services/fileStorageService.ts`
  - Created `LocalFileStorageService` implementation (uses fs.unlink + path.join)
  - FabricService now depends on the interface, not fs directly
  - Wired up in `routers/fabrics.ts` via dependency injection
  - Behavioral tests in `backend/src/__tests__/services/fileStorageService.test.ts`

- [x] **Task 3: Fix N+1 query in getAllFabrics**
  - Added `findAllWithImages()` to FabricRepository using LEFT JOIN
  - Uses subquery for pagination-safe JOIN
  - Groups flat rows into nested FabricWithImages[] in code
  - Replaced N+1 pattern in FabricService.getAllFabrics()

- [x] **Task 4: Add pagination to GET /fabrics**
  - Created `parsePagination()` in `backend/src/validation/paginationValidation.ts`
  - Defaults: limit=20, offset=0, max limit=100, negative values reset to defaults
  - Tests in `backend/src/__tests__/validation/paginationValidation.test.ts`
  - Wired into GET /fabrics route
  - Frontend uses `useInfiniteQuery` with `onEndReached` for infinite scroll
  - Added `getFabricsPaginated()` to frontend API layer

- [x] **Task 5: Deduplicate validation rules**
  - Set up npm workspaces (root package.json with workspaces: shared, backend, frontend)
  - Created `@sewing/shared` package with `validateCreateFabric()` and `VALIDATION_CONSTANTS`
  - Backend and frontend both import from `@sewing/shared`
  - Deleted `backend/src/validation/fabricValidation.ts` (kept paginationValidation)
  - Frontend `useFabricForm.validate()` maps camelCase fields to snake_case for shared validator
  - Full test suite in `shared/src/__tests__/validation/fabricValidation.test.ts`

---

## Remaining

### Task 6: Deduplicate shared types to single source
**Priority:** Medium
**Description:** `types/fabric.ts` is duplicated in both `backend/src/types/` and `frontend/src/types/`. Move shared types (`Fabric`, `FabricImage`, `FabricWithImages`, `CreateFabricInput`, `ApiResponse`) to `@sewing/shared` package and import from there in both backend and frontend. The `@sewing/shared` workspace is already set up from Task 5.

### Task 7: Extract baseUrl helper in frontend API
**Priority:** Low
**Description:** `API_URL.replace('/api/v1', '')` appears in both `FabricListScreen.tsx` and `FabricDetailScreen.tsx` for constructing image URLs. Extract a `BASE_URL` constant in `frontend/src/api/fabrics.ts` and export it, or create a helper like `getImageUrl(filePath: string): string`.

### Task 8: Extract Multer config from router
**Priority:** Medium
**Description:** Upload configuration (diskStorage, MIME type filter, size limits, max image count) is defined inside `backend/src/routers/fabrics.ts`. Extract to a separate middleware file like `backend/src/middleware/upload.ts` for reuse (patterns phase will also need uploads) and testability.

### Task 9: Add database indexes
**Priority:** Medium
**Description:** Create a migration to add indexes:
- `fabric_images.fabric_id` — used in JOIN queries and lookups
- `fabrics.created_at` — used for ORDER BY in list queries
Run: `npm run migrate:create -- add-indexes` in backend, then write the SQL.

### Task 10: Add request logging middleware
**Priority:** Low
**Description:** No visibility into incoming HTTP requests. Add Morgan or a custom logging middleware to the Express app in `backend/src/index.ts`. Keep it simple — method, path, status code, response time.

### Task 11: Validate environment variables at startup
**Priority:** Low
**Description:** No schema check on required env vars (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, PORT). A missing variable fails at runtime with a cryptic error. Add a startup check in `backend/src/index.ts` (or extract to `backend/src/config.ts`) that validates all required vars are present and throws a clear error message if not.

### Task 12: Add error handling in useImagePicker.appendToFormData
**Priority:** Medium
**Description:** In `frontend/src/hooks/useImagePicker.ts`, the `appendToFormData` method calls `fetch(asset.uri)` without try/catch. If an image fetch fails, the entire form submission crashes. Wrap in try/catch, skip failed images, and return a warning to the user.

### Task 13: Wrap delete operation in DB transaction
**Priority:** Medium
**Description:** In `backend/src/services/fabricService.ts`, `deleteFabric()` calls `deleteImagesByFabricId()` then `deleteById()` sequentially without a transaction. If the second call fails, image records are deleted but the fabric remains (orphaned state). Wrap in a PostgreSQL transaction (BEGIN/COMMIT/ROLLBACK). May need to pass a client from the pool rather than the pool itself to the repository methods for transaction support.
