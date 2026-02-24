import { FabricRepository } from '../repositories/fabricRepository';

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
  constructor(private repo: FabricRepository) {}

  async createFabric(data: CreateFabricData) {
    return this.repo.insert(data);
  }

  async saveImages(fabricId: number, files: ImageFile[]): Promise<SaveImagesResult> {
    let images: object[] = [];
    let warning: string | undefined;

    try {
      images = await Promise.all(
        files.map((file, index) =>
          this.repo.insertImage(fabricId, `/uploads/fabrics/${file.filename}`, index)
        )
      );
    } catch (err) {
      console.error(`[FabricService] Image save failed for fabric ${fabricId}:`, err);
      warning = 'Fabric saved, but some images failed to upload. You can retry uploading them.';
    }

    return { images, warning };
  }
}
