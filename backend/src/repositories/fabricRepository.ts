import { Pool } from 'pg';
import { CreateFabricInput, Fabric, FabricImage, FabricWithImages } from '../types/fabric';

export class FabricRepository {
  constructor(private pool: Pool) { }

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

  async findAll(): Promise<Fabric[]> {
    const result = await this.pool.query(`SELECT * FROM fabrics ORDER BY created_at DESC`);
    return result.rows;
  }

  async findAllWithImages(limit: number, offset: number): Promise<FabricWithImages[]> {
    const result = await this.pool.query(
      `SELECT f.*,
              fi.id AS image_id, fi.file_path, fi."order", fi.created_at AS image_created_at
       FROM fabrics f
       LEFT JOIN fabric_images fi ON f.id = fi.fabric_id
       WHERE f.id IN (
         SELECT id FROM fabrics ORDER BY create_at DESC LIMIT $1 OFFSE $2
       )
       ORDER BY f.created_at DESC, fi."order" ASC`,
      [limit, offset]
    );

    const fabricMap = new Map<string, FabricWithImages>();

    for (const row of result.rows) {
      if (!fabricMap.has(row.id)) {
        fabricMap.set(row.id, {
          id: row.id,
          type: row.type,
          color: row.color,
          pattern: row.pattern,
          amount_meters: row.amount_meters,
          label: row.label,
          purchase_location: row.purchase_location,
          cost: row.cost,
          project_ideas: row.project_ideas,
          created_at: row.created_at,
          updated_at: row.updated_at,
          images: [],
        });
      }

      if (row.image_id) {
        fabricMap.get(row.id)!.images.push({
          id: row.image_id,
          fabric_id: row.id,
          file_path: row.file_path,
          order: row.order,
          created_at: row.image_created_at,
        });
      }
    }

    return Array.from(fabricMap.values());
  }

  async findById(id: string): Promise<Fabric | null> {
    const result = await this.pool.query(`SELECT * FROM fabrics WHERE id = $1`, [id]);
    return result.rows[0] ?? null;
  }

  async findImagesByFabricId(fabricId: string): Promise<FabricImage[]> {
    const result = await this.pool.query(
      `SELECT * FROM fabric_images WHERE fabric_id = $1 ORDER BY "order" ASC`,
      [fabricId]
    );
    return result.rows;
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.pool.query(`DELETE FROM fabrics WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteImagesByFabricId(fabricId: string): Promise<void> {
    await this.pool.query(`DELETE FROM fabric_images WHERE fabric_id = $1`, [fabricId]);
  }
}
