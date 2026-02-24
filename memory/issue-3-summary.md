# Issue #3 Summary: View and Browse Fabrics

## What Was Done

### Backend
- Added `findAll()`, `findById()`, `findImagesByFabricId()` to `FabricRepository`
- Added `getAllFabrics()`, `getFabricById()` to `FabricService`
- Added `GET /api/fabrics` and `GET /api/fabrics/:id` routes to the fabrics router
- Served `backend/uploads/` as static files at `/uploads` via `express.static`

### Frontend
- Added `getFabrics()` and `getFabricById()` to `frontend/src/api/fabrics.ts`; also exported `API_URL`
- Created `FabricListScreen`: FlatList of fabric cards with thumbnail, pull-to-refresh
- Created `FabricDetailScreen`: all fabric fields + all images
- Set up React Navigation stack in `App.tsx`: FabricList → FabricDetail → AddFabric
- Added "+ Add" button in the list screen header

## Key Decisions
- Image URLs are constructed as `API_URL.replace('/api/v1', '') + '/' + file_path`
- `file_path` in DB is stored without leading slash (e.g. `uploads/fabrics/filename.jpg`)
- Static files served from `backend/uploads/`, path resolved with `path.join(__dirname, '../uploads')`

## Bugs Fixed During Implementation
- `file_path` stored without leading `/` → URL construction needed an explicit `/` separator
- Multer filename config used `path.extname(file.originalname)` which returned empty for files without extension → fallback added: `path.extname(file.originalname) || '.' + file.mimetype.split('/')[1]`
- `index.ts` was missing `cors`, `path`, `express.static`, and error handler middleware after accidental revert

## Current State
- Issue #3 complete and working on both web and Android (via `EXPO_PUBLIC_API_URL` set to machine IP in `frontend/.env`)
- Existing images uploaded before the extension fix have no extension in their filename and won't display — re-upload needed for those
- Navigation: list → detail working; AddFabric accessible from header button
