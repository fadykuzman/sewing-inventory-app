-- Up Migration
CREATE TABLE IF NOT EXISTS fabrics (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type              VARCHAR(100)  NOT NULL,
  color             VARCHAR(100),
  pattern           VARCHAR(100),
  amount_meters     NUMERIC(10,2) NOT NULL,
  label             VARCHAR(150),
  purchase_location VARCHAR(255),
  cost              NUMERIC(10,2),
  project_ideas     TEXT,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fabric_images (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fabric_id  UUID        NOT NULL REFERENCES fabrics(id) ON DELETE CASCADE,
  file_path  VARCHAR(500) NOT NULL,
  "order"    SMALLINT    NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Down Migration
