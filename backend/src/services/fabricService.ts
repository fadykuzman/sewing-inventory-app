import { FabricRepository } from '../repositories/fabricRepository';
import { CreateFabricInput, Fabric, FabricImage } from '../types/fabric';

interface ImageFile {
  filename: string;
}

interface SaveImagesResult {
  images: FabricImage[];
  warning?: string;
}

export class FabricService {
  constructor(private repo: FabricRepository) {}

  async createFabric(data: CreateFabricInput): Promise<Fabric> {
    return this.repo.insert(data);
  }

  async saveImages(fabricId: string, files: ImageFile[]): Promise<SaveImagesResult> {
    let images: FabricImage[] = [];
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
