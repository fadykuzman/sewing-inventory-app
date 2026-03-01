-- Up Migration

CREATE TABLE IF NOT EXISTS materials (
  id   SERIAL       PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

INSERT INTO materials (id, name) VALUES
  (1, 'Cotton'),
  (2, 'Polyester'),
  (3, 'Silk'),
  (4, 'Linen'),
  (5, 'Wool'),
  (6, 'Nylon'),
  (7, 'Rayon'),
  (8, 'Elastane'),
  (9, 'Viscose'),
  (10, 'Acrylic'),
  (11, 'Modal'),
  (12, 'Lyocell'),
  (13, 'Cashmere'),
  (14, 'Mohair'),
  (15, 'Alpaca'),
  (16, 'Bamboo'),
  (17, 'Hemp'),
  (18, 'Jute'),
  (19, 'Ramie'),
  (20, 'Acetate'),
  (21, 'Triacetate'),
  (22, 'Cupro'),
  (23, 'Polypropylene'),
  (24, 'Angora'),
  (25, 'Camel Hair'),
  (26, 'Yak'),
  (27, 'Kevlar'),
  (28, 'Carbon Fiber'),
  (29, 'Latex'),
  (30, 'Metallic');

SELECT setval('materials_id_seq', 30);

CREATE TABLE IF NOT EXISTS fabric_materials (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  fabric_id   UUID    NOT NULL REFERENCES fabrics(id) ON DELETE CASCADE,
  material_id INTEGER NOT NULL REFERENCES materials(id),
  percentage  INTEGER NOT NULL CHECK (percentage >= 1 AND percentage <= 100),
  UNIQUE(fabric_id, material_id)
);

-- Down Migration
