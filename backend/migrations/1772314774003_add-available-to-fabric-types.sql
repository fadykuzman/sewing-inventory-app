-- Up Migration
ALTER TABLE fabric_types
  ADD COLUMN available BOOLEAN NOT NULL DEFAULT TRUE;
