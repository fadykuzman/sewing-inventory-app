import { Pool } from 'pg';

export function createUserRepository(pool: Pool) {
  return {
    async upsert(uid: string, email: string) {
      await pool.query(
        `INSERT INTO users (id, email) VALUES ($1, $2)
         ON CONFLICT (id) DO UPDATE SET email = $2`,
        [uid, email]
      );
    },
  };
}
