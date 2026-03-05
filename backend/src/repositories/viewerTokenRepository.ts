import { Pool } from 'pg';
import crypto from 'crypto';

export interface ViewerToken {
  id: string;
  token: string;
  owner_id: string;
  revoked: boolean;
  created_at: string;
}

export function createViewerTokenRepository(pool: Pool) {
  return {
    async findByToken(token: string): Promise<ViewerToken | null> {
      const result = await pool.query(
        `SELECT * FROM viewer_tokens WHERE token = $1 AND revoked = false`,
        [token]
      );
      return result.rows[0] ?? null;
    },

    async findActiveByOwner(ownerId: string): Promise<ViewerToken | null> {
      const result = await pool.query(
        `SELECT * FROM viewer_tokens WHERE owner_id = $1 AND revoked = false ORDER BY created_at DESC LIMIT 1`,
        [ownerId]
      );
      return result.rows[0] ?? null;
    },

    async create(ownerId: string): Promise<ViewerToken> {
      const token = crypto.randomBytes(32).toString('hex');
      const result = await pool.query(
        `INSERT INTO viewer_tokens (token, owner_id) VALUES ($1, $2) RETURNING *`,
        [token, ownerId]
      );
      return result.rows[0];
    },

    async revokeAllByOwner(ownerId: string): Promise<void> {
      await pool.query(
        `UPDATE viewer_tokens SET revoked = true WHERE owner_id = $1 AND revoked = false`,
        [ownerId]
      );
    },
  };
}
