import { Pool } from 'pg';
import { FabricType } from '../types/fabric';

interface FindAllOptions {
  hidden?: boolean;
}

export class FabricTypeRepository {
  constructor(private pool: Pool) {}

  async findAll(userId: string, options?: FindAllOptions): Promise<FabricType[]> {
    let query = `
      SELECT ft.id, ft.name, ft.name_en, ft.slug_de, ft.slug_en, ft.category, ft.use_case,
             COALESCE(uftp.hidden, false) AS hidden,
             COUNT(f.id)::int AS fabric_count
        FROM fabric_types ft
        LEFT JOIN user_fabric_type_preferences uftp
          ON uftp.fabric_type_id = ft.id AND uftp.user_id = $1
        LEFT JOIN fabrics f
          ON f.fabric_type_id = ft.id AND f.user_id = $1`;

    const params: unknown[] = [userId];

    if (options?.hidden === false) {
      query += ` WHERE (uftp.hidden IS NULL OR uftp.hidden = false)`;
    } else if (options?.hidden === true) {
      query += ` WHERE uftp.hidden = true`;
    }

    query += ` GROUP BY ft.id, uftp.hidden ORDER BY ft.name_en ASC`;

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

  async toggleHidden(userId: string, fabricTypeId: number, hidden: boolean): Promise<FabricType | null> {
    const typeExists = await this.findById(fabricTypeId);
    if (!typeExists) return null;

    await this.pool.query(
      `INSERT INTO user_fabric_type_preferences (user_id, fabric_type_id, hidden)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, fabric_type_id)
       DO UPDATE SET hidden = $3`,
      [userId, fabricTypeId, hidden]
    );

    const result = await this.pool.query(
      `SELECT ft.id, ft.name, ft.name_en, ft.slug_de, ft.slug_en, ft.category, ft.use_case,
              COALESCE(uftp.hidden, false) AS hidden,
              COUNT(f.id)::int AS fabric_count
         FROM fabric_types ft
         LEFT JOIN user_fabric_type_preferences uftp
           ON uftp.fabric_type_id = ft.id AND uftp.user_id = $1
         LEFT JOIN fabrics f
           ON f.fabric_type_id = ft.id AND f.user_id = $1
        WHERE ft.id = $2
        GROUP BY ft.id, uftp.hidden`,
      [userId, fabricTypeId]
    );
    return result.rows[0] ?? null;
  }
}
