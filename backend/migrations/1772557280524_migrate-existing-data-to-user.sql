-- Up Migration

-- Create the owner user
INSERT INTO users (id, email) VALUES ('wdoAZCCP1wOVp35s5tjwIBf9h0W2', 'owner@placeholder.com')
  ON CONFLICT (id) DO NOTHING;

-- Assign all existing fabrics to this user
UPDATE fabrics SET user_id = 'wdoAZCCP1wOVp35s5tjwIBf9h0W2' WHERE user_id IS NULL;

-- Down Migration
