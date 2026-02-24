import { Pool } from 'pg';

interface InsertFabricData {
  type: string;
  color?: string;
  pattern?: string;
  amount_meters: number;
  label?: string;
  purchase_location?: string;
  cost?: number;
  project_ideas?: string;
}

export class FabricRepository {
  constructor(private pool: Pool) {}

  async insert(data: InsertFabricData) {
    const { type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas } = data;

    const result = await this.pool.query(
      `INSERT INTO fabrics (type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas]
    );

    return result.rows[0];
  }

  async insertImage(fabricId: number, filePath: string, order: number) {
    const result = await this.pool.query(
      `INSERT INTO fabric_images (fabric_id, file_path, "order") VALUES ($1, $2, $3) RETURNING *`,
      [fabricId, filePath, order]
    );

    return result.rows[0];
  }
}
