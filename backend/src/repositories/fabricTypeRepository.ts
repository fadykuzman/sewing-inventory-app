import { Pool } from 'pg';
import { FabricType } from '../types/fabric';

export class FabricTypeRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<FabricType[]> {
    const result = await this.pool.query(
      `SELECT * FROM fabric_types ORDER BY name_en ASC`
    );
    return result.rows;
  }

  async findById(id: number): Promise<FabricType | null> {
    const result = await this.pool.query(
      `SELECT * FROM fabric_types WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }
}
