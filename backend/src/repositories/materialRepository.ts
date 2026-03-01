import { Pool } from 'pg';
import { Material } from '../types/fabric';

export class MaterialRepository {
  constructor(private pool: Pool) {}

  async findAll(): Promise<Material[]> {
    const result = await this.pool.query(
      `SELECT id, name, name_en FROM materials ORDER BY name ASC`
    );
    return result.rows;
  }
}
