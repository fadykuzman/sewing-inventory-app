-- Up Migration

-- Rename existing 'name' to 'name_en', add 'name' for German
ALTER TABLE materials RENAME COLUMN name TO name_en;
ALTER TABLE materials ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT '';

UPDATE materials SET name = CASE id
  WHEN 1  THEN 'Baumwolle'
  WHEN 2  THEN 'Polyester'
  WHEN 3  THEN 'Seide'
  WHEN 4  THEN 'Leinen'
  WHEN 5  THEN 'Wolle'
  WHEN 6  THEN 'Nylon'
  WHEN 7  THEN 'Rayon'
  WHEN 8  THEN 'Elasthan'
  WHEN 9  THEN 'Viskose'
  WHEN 10 THEN 'Acryl'
  WHEN 11 THEN 'Modal'
  WHEN 12 THEN 'Lyocell'
  WHEN 13 THEN 'Kaschmir'
  WHEN 14 THEN 'Mohair'
  WHEN 15 THEN 'Alpaka'
  WHEN 16 THEN 'Bambus'
  WHEN 17 THEN 'Hanf'
  WHEN 18 THEN 'Jute'
  WHEN 19 THEN 'Ramie'
  WHEN 20 THEN 'Acetat'
  WHEN 21 THEN 'Triacetat'
  WHEN 22 THEN 'Cupro'
  WHEN 23 THEN 'Polypropylen'
  WHEN 24 THEN 'Angora'
  WHEN 25 THEN 'Kamelhaar'
  WHEN 26 THEN 'Yak'
  WHEN 27 THEN 'Kevlar'
  WHEN 28 THEN 'Carbonfaser'
  WHEN 29 THEN 'Latex'
  WHEN 30 THEN 'Metallfaser'
END;

ALTER TABLE materials ALTER COLUMN name DROP DEFAULT;
ALTER TABLE materials ADD CONSTRAINT materials_name_unique UNIQUE (name);

-- Down Migration
