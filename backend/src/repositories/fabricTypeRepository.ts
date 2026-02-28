import { Pool } from 'pg';
import { FabricType } from '../types/fabric';

interface FindAllOptions {
  available?: boolean;
}

export class FabricTypeRepository {
  constructor(private pool: Pool) {}

  async findAll(options?: FindAllOptions): Promise<FabricType[]> {
    let query = `SELECT ft.*, COUNT(f.id)::int AS fabric_count
       FROM fabric_types ft
       LEFT JOIN fabrics f ON f.fabric_type_id = ft.id`;
    const params: unknown[] = [];

    if (options?.available !== undefined) {
      params.push(options.available);
      query += ` WHERE ft.available = $1`;
    }

    query += ` GROUP BY ft.id ORDER BY ft.name_en ASC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async findById(id: number): Promise<FabricType | null> {
    const result = await this.pool.query(
      `SELECT * FROM fabric_types WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  async updateAvailable(id: number, available: boolean): Promise<FabricType | null> {
    const result = await this.pool.query(
      `UPDATE fabric_types SET available = $1 WHERE id = $2 RETURNING *`,
      [available, id]
    );
    return result.rows[0] ?? null;
  }
}
