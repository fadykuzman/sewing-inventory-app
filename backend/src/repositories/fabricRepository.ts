import { Pool } from 'pg';
import { CreateFabricInput, Fabric, FabricImage } from '../types/fabric';

export class FabricRepository {
  constructor(private pool: Pool) {}

  async insert(data: CreateFabricInput): Promise<Fabric> {
    const { type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas } = data;

    const result = await this.pool.query(
      `INSERT INTO fabrics (type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas]
    );

    return result.rows[0];
  }

  async insertImage(fabricId: string, filePath: string, order: number): Promise<FabricImage> {
    const result = await this.pool.query(
      `INSERT INTO fabric_images (fabric_id, file_path, "order") VALUES ($1, $2, $3) RETURNING *`,
      [fabricId, filePath, order]
    );

    return result.rows[0];
  }
}
