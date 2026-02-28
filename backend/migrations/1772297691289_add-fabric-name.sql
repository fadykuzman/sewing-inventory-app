-- Add name column to fabrics
ALTER TABLE fabrics ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT '';

-- Backfill existing rows with "TypeName #id" pattern
UPDATE fabrics f SET name = ft.name_en || ' #' || f.id
FROM fabric_types ft WHERE ft.id = f.fabric_type_id;

-- Remove the default now that existing rows are backfilled
ALTER TABLE fabrics ALTER COLUMN name DROP DEFAULT;

-- Unique constraint: no two fabrics of the same type can share a name
ALTER TABLE fabrics ADD CONSTRAINT fabrics_type_name_unique UNIQUE (fabric_type_id, name);
