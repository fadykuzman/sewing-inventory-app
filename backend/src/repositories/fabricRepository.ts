import { Pool } from 'pg';
import { CreateFabricInput, Fabric, FabricImage, FabricMaterial, FabricWithImages } from '../types/fabric';

export class FabricRepository {
  constructor(private pool: Pool) { }

  async insert(data: CreateFabricInput): Promise<Fabric> {
    const { name, fabric_type_id, color, pattern, amount_meters, label, purchase_location, cost, project_ideas } = data;

    const result = await this.pool.query(
      `INSERT INTO fabrics (name, fabric_type_id, color, pattern, amount_meters, label, purchase_location, cost, project_ideas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [name, fabric_type_id, color, pattern, amount_meters, label, purchase_location, cost, project_ideas]
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
        `(f.name ILIKE $${searchIdx} OR ft.name_en ILIKE $${searchIdx} OR ft.name ILIKE $${searchIdx} OR color ILIKE $${searchIdx} OR pattern ILIKE $${searchIdx} OR label ILIKE $${searchIdx} OR purchase_location ILIKE $${searchIdx})`
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

    const subquery = `SELECT f2.id FROM fabrics f2
         JOIN fabric_types ft2 ON f2.fabric_type_id = ft2.id
         ${whereClause} ORDER BY f2.created_at DESC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

    const result = await this.pool.query(
      `SELECT f.*, ft.name_en AS fabric_type_name,
              fi.id AS image_id, fi.file_path, fi."order", fi.created_at AS image_created_at
       FROM fabrics f
       JOIN fabric_types ft ON f.fabric_type_id = ft.id
       LEFT JOIN fabric_images fi ON f.id = fi.fabric_id
       WHERE f.id IN (${subquery})
       ORDER BY f.created_at DESC, fi."order" ASC`,
      params
    );

    const fabricMap = new Map<string, FabricWithImages>();

    for (const row of result.rows) {
      if (!fabricMap.has(row.id)) {
        fabricMap.set(row.id, {
          id: row.id,
          name: row.name,
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
          materials: [],
        });
      }

      if (row.image_id) {
        const fabric = fabricMap.get(row.id)!;
        if (!fabric.images.some(img => img.id === row.image_id)) {
          fabric.images.push({
            id: row.image_id,
            fabric_id: row.id,
            file_path: row.file_path,
            order: row.order,
            created_at: row.image_created_at,
          });
        }
      }
    }

    // Fetch materials for all fabrics in one query
    const fabricIds = Array.from(fabricMap.keys());
    if (fabricIds.length > 0) {
      const placeholders = fabricIds.map((_, i) => `$${i + 1}`).join(', ');
      const matResult = await this.pool.query(
        `SELECT fm.id, fm.fabric_id, fm.material_id, m.name AS material_name, m.name_en AS material_name_en, fm.percentage
         FROM fabric_materials fm
         JOIN materials m ON fm.material_id = m.id
         WHERE fm.fabric_id IN (${placeholders})
         ORDER BY fm.percentage DESC`,
        fabricIds
      );

      for (const row of matResult.rows) {
        fabricMap.get(row.fabric_id)?.materials.push({
          id: row.id,
          fabric_id: row.fabric_id,
          material_id: row.material_id,
          material_name: row.material_name,
          material_name_en: row.material_name_en,
          percentage: row.percentage,
        });
      }
    }

    return Array.from(fabricMap.values());
  }

  async findById(id: string): Promise<Fabric | null> {
    const result = await this.pool.query(
      `SELECT f.*, ft.name_en AS fabric_type_name
       FROM fabrics f
       JOIN fabric_types ft ON f.fabric_type_id = ft.id
       WHERE f.id = $1`,
      [id]
    );
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

  async findByTypeAndName(fabricTypeId: number, name: string, excludeId?: string): Promise<Fabric | null> {
    const params: (string | number)[] = [fabricTypeId, name];
    let sql = `SELECT * FROM fabrics WHERE fabric_type_id = $1 AND name = $2`;
    if (excludeId) {
      params.push(excludeId);
      sql += ` AND id != $3`;
    }
    const result = await this.pool.query(sql, params);
    return result.rows[0] ?? null;
  }

  async update(id: string, data: CreateFabricInput): Promise<Fabric | null> {
    const { name, fabric_type_id, color, pattern, amount_meters, label, purchase_location, cost, project_ideas } = data;

    const result = await this.pool.query(
      `UPDATE fabrics
       SET name = $1, fabric_type_id = $2, color = $3, pattern = $4, amount_meters = $5,
           label = $6, purchase_location = $7, cost = $8, project_ideas = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [name, fabric_type_id, color, pattern, amount_meters, label, purchase_location, cost, project_ideas, id]
    );

    return result.rows[0] ?? null;
  }

  async findMaterialsByFabricId(fabricId: string): Promise<FabricMaterial[]> {
    const result = await this.pool.query(
      `SELECT fm.id, fm.fabric_id, fm.material_id, m.name AS material_name, m.name_en AS material_name_en, fm.percentage
       FROM fabric_materials fm
       JOIN materials m ON fm.material_id = m.id
       WHERE fm.fabric_id = $1
       ORDER BY fm.percentage DESC`,
      [fabricId]
    );
    return result.rows;
  }

  async insertFabricMaterials(fabricId: string, materials: { material_id: number; percentage: number }[]): Promise<void> {
    if (materials.length === 0) return;

    const values: string[] = [];
    const params: (string | number)[] = [fabricId];

    for (let i = 0; i < materials.length; i++) {
      const mIdx = params.length + 1;
      const pIdx = params.length + 2;
      values.push(`($1, $${mIdx}, $${pIdx})`);
      params.push(materials[i].material_id, materials[i].percentage);
    }

    await this.pool.query(
      `INSERT INTO fabric_materials (fabric_id, material_id, percentage) VALUES ${values.join(', ')}`,
      params
    );
  }

  async deleteFabricMaterials(fabricId: string): Promise<void> {
    await this.pool.query(`DELETE FROM fabric_materials WHERE fabric_id = $1`, [fabricId]);
  }
}
