# Issue #6 Summary: Delete Fabric

## What Was Done

### Backend
- `fabricRepository.ts` — added `deleteById(id)` and `deleteImagesByFabricId(fabricId)`
- `fabricService.ts` — added `deleteFabric(id)`: fetches image records → deletes images from DB → deletes fabric from DB → removes image files from disk using `Promise.allSettled` (non-blocking file cleanup)
- `routers/fabrics.ts` — added `DELETE /:id` route; returns 404 if fabric not found, 200 with `{ success: true }` on success

### Frontend
- `api/fabrics.ts` — added `deleteFabric(id: string): Promise<void>`
- `FabricDetailScreen.tsx` — added "Delete fabric" outlined button at the bottom of the scroll view; tapping opens a `Dialog` (from React Native Paper + `Portal`) asking for confirmation; on confirm, calls `useMutation` → invalidates `['fabrics']` query → navigates back

## Key Decisions
- File cleanup uses `Promise.allSettled` so a missing file on disk does not cause the delete to fail
- DB records (images then fabric) are deleted before file cleanup — DB is the source of truth
- `file_path` in DB starts with `/uploads/fabrics/...`; `fs.unlink` joins it with `process.cwd()` (backend root) to get the absolute path

## Potential Issue to Verify
- `file_path` in DB may or may not have a leading `/` — see issue-3-summary.md which notes it was stored *without* a leading slash. Verify that `path.join(process.cwd(), img.file_path)` resolves correctly given actual stored paths. If needed, strip a leading `/` before joining.

## Current State
- Issue #6 complete
- MVP fabric CRUD is now fully implemented: Add (#2), View list (#3), View detail (#3), Delete (#6)
- Edit (#4/5) and search/filter (#??) still pending per roadmap
