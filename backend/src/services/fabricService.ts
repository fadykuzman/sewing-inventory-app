import { Pool } from 'pg';

interface CreateFabricData {
  type: string;
  color?: string;
  pattern?: string;
  amount_meters: number;
  label?: string;
  purchase_location?: string;
  cost?: number;
  project_ideas?: string;
}

interface ImageFile {
  filename: string;
}

interface SaveImagesResult {
  images: object[];
  warning?: string;
}

export class FabricService {
  constructor(private pool: Pool) {}

  async createFabric(data: CreateFabricData) {
    const { type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas } = data;

    const result = await this.pool.query(
      `INSERT INTO fabrics (type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [type, color, pattern, amount_meters, label, purchase_location, cost, project_ideas]
    );

    return result.rows[0];
  }

  async saveImages(fabricId: number, files: ImageFile[]): Promise<SaveImagesResult> {
    let images: object[] = [];
    let warning: string | undefined;

    try {
      images = await Promise.all(
        files.map((file, index) =>
          this.pool.query(
            `INSERT INTO fabric_images (fabric_id, file_path, "order") VALUES ($1, $2, $3) RETURNING *`,
            [fabricId, `/uploads/fabrics/${file.filename}`, index]
          ).then(r => r.rows[0])
        )
      );
    } catch (err) {
      console.error(`[FabricService] Image save failed for fabric ${fabricId}:`, err);
      warning = 'Fabric saved, but some images failed to upload. You can retry uploading them.';
    }

    return { images, warning };
  }
}
