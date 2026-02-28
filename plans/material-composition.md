# Issue #21: Add Material Composition Field to Fabric Entries

## Overview
Add an optional material composition field to fabric entries, allowing users to specify up to 3 materials with percentages (e.g., 80% Cotton, 20% Polyester). Materials stored in a DB table with FK references.

## Step 1: Database Migration
- Create `materials` table (id SERIAL PK, name VARCHAR UNIQUE) seeded from `shared/resources/materials.json` (30 materials)
- Create `fabric_materials` junction table:
  - id UUID PK DEFAULT gen_random_uuid()
  - fabric_id UUID FK → fabrics(id) ON DELETE CASCADE
  - material_id INTEGER FK → materials(id)
  - percentage INTEGER NOT NULL CHECK (1-100)
  - UNIQUE(fabric_id, material_id)

## Step 2: Shared Validation
- Add `validateMaterialComposition()` to `@sewing/shared`
- Rules: max 3 entries, percentage 1-100 integer, material_id positive integer, no duplicate material_ids
- Optional field — empty array or undefined is valid

## Step 3: Backend
- **MaterialRepository** — `findAll()` to list materials ordered by name
- **GET /api/v1/materials** — endpoint to return all materials for dropdown
- **FabricRepository updates:**
  - `findMaterialsByFabricId(fabricId)` — get composition for a fabric
  - `insertFabricMaterials(fabricId, materials[])` — bulk insert junction rows
  - `deleteFabricMaterials(fabricId)` — clear existing before re-inserting on update
  - `findById()` / `findAllWithImages()` — include materials in response
- **FabricService** — orchestrate saving/updating composition alongside fabric CRUD
- **Router** — validate composition in POST/PUT, pass to service

## Step 4: Types
- `Material` — { id: number, name: string }
- `FabricMaterial` — { id: string, fabric_id: string, material_id: number, material_name: string, percentage: number }
- Extend `FabricWithImages` to include `materials: FabricMaterial[]`
- Add to both backend and frontend type files

## Step 5: Frontend
- **api/materials.ts** — `getMaterials()` API call
- **Detail view** — display composition (e.g. "80% Cotton, 20% Polyester")
- **Add/Edit forms** — dynamic rows: dropdown for material + percentage input, add/remove row buttons, max 3 rows

## Decisions
- Materials list: database table (not static constant)
- Storage: FK to materials table (not string)
- Percentages do NOT need to sum to 100%
- Max 3 materials per fabric
