import { Pool } from 'pg';
import { CreateFabricInput, Fabric, FabricImage, FabricWithImages } from '../types/fabric';

export class FabricRepository {
  constructor(private pool: Pool) { }

  async insert(data: CreateFabricInput): Promise<Fabric> {
    const { fabric_type_id, color, pattern, amount_meters, label, purchase_location, cost, project_ideas } = data;

    const result = await this.pool.query(
      `INSERT INTO fabrics (fabric_type_id, color, pattern, amount_meters, label, purchase_location, cost, project_ideas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [fabric_type_id, color, pattern, amount_meters, label, purchase_location, cost, project_ideas]
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

  async findAllWithImages(limit: number, offset: number, search?: string, fabricTypeId?: number): Promise<FabricWithImages[]> {
    const params: (string | number)[] = [];
    const conditions: string[] = [];

    if (search) {
      params.push(`%${search}%`);
      const searchIdx = params.length;
      conditions.push(
        `(ft.name_en ILIKE $${searchIdx} OR ft.name ILIKE $${searchIdx} OR color ILIKE $${searchIdx} OR pattern ILIKE $${searchIdx} OR label ILIKE $${searchIdx} OR purchase_location ILIKE $${searchIdx})`
      );
    }

    if (fabricTypeId) {
      params.push(fabricTypeId);
      conditions.push(`fabric_type_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;
    params.push(limit, offset);

    const result = await this.pool.query(
      `SELECT f.*, ft.name_en AS fabric_type_name,
              fi.id AS image_id, fi.file_path, fi."order", fi.created_at AS image_created_at
       FROM fabrics f
       JOIN fabric_types ft ON f.fabric_type_id = ft.id
       LEFT JOIN fabric_images fi ON f.id = fi.fabric_id
       WHERE f.id IN (
         SELECT f2.id FROM fabrics f2
         JOIN fabric_types ft2 ON f2.fabric_type_id = ft2.id
         ${whereClause} ORDER BY f2.created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}
       )
       ORDER BY f.created_at DESC, fi."order" ASC`,
      params
    );

    const fabricMap = new Map<string, FabricWithImages>();

    for (const row of result.rows) {
      if (!fabricMap.has(row.id)) {
        fabricMap.set(row.id, {
          id: row.id,
          fabric_type_id: row.fabric_type_id,
          fabric_type_name: row.fabric_type_name,
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

  async getMaxImageOrder(fabricId: string): Promise<number> {
    const result = await this.pool.query(
      `SELECT COALESCE(MAX("order"), -1) AS max_order FROM fabric_images WHERE fabric_id = $1`,
      [fabricId]
    );
    return result.rows[0].max_order;
  }

  async deleteImagesByIds(fabricId: string, imageIds: string[]): Promise<FabricImage[]> {
    const placeholders = imageIds.map((_, i) => `$${i + 2}`).join(', ');
    const result = await this.pool.query(
      `DELETE FROM fabric_images WHERE fabric_id = $1 AND id IN (${placeholders}) RETURNING *`,
      [fabricId, ...imageIds]
    );
    return result.rows;
  }

  async update(id: string, data: CreateFabricInput): Promise<Fabric | null> {
    const { fabric_type_id, color, pattern, amount_meters, label, purchase_location, cost, project_ideas } = data;

    const result = await this.pool.query(
      `UPDATE fabrics
       SET fabric_type_id = $1, color = $2, pattern = $3, amount_meters = $4,
           label = $5, purchase_location = $6, cost = $7, project_ideas = $8,
           updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [fabric_type_id, color, pattern, amount_meters, label, purchase_location, cost, project_ideas, id]
    );

    return result.rows[0] ?? null;
  }
}
