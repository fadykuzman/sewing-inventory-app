-- Up Migration

-- Users table (Firebase UID as primary key)
CREATE TABLE IF NOT EXISTS users (
  id         TEXT        PRIMARY KEY,
  email      TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Per-user fabric type visibility preferences
-- No row = visible (default for all 93 types)
CREATE TABLE IF NOT EXISTS user_fabric_type_preferences (
  user_id        TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fabric_type_id INTEGER NOT NULL REFERENCES fabric_types(id) ON DELETE CASCADE,
  hidden         BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (user_id, fabric_type_id)
);

-- Viewer invite tokens (one per user, revocable)
CREATE TABLE IF NOT EXISTS viewer_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token      TEXT        UNIQUE NOT NULL,
  owner_id   TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  revoked    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add user_id to fabrics (nullable for now, NOT NULL added after data migration)
ALTER TABLE fabrics ADD COLUMN user_id TEXT REFERENCES users(id);

-- Drop available column from fabric_types (visibility now driven by user_fabric_type_preferences)
ALTER TABLE fabric_types DROP COLUMN available;

-- Down Migration
