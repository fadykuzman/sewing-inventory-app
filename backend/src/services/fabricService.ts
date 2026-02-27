import { FabricRepository } from '../repositories/fabricRepository';
import { CreateFabricInput, Fabric, FabricImage, FabricWithImages } from '../types/fabric';
import { FileStorageService } from './fileStorageService';

interface ImageFile {
  filename: string;
}

interface SaveImagesResult {
  images: FabricImage[];
  warning?: string;
}

export class FabricService {
  constructor(
    private repo: FabricRepository,
    private fileStorage: FileStorageService
  ) { }

  async createFabric(data: CreateFabricInput): Promise<Fabric> {
    return this.repo.insert(data);
  }

  async getAllFabrics(): Promise<FabricWithImages[]> {
    const fabrics = await this.repo.findAll();
    const withImages = await Promise.all(
      fabrics.map(async (fabric) => {
        const images = await this.repo.findImagesByFabricId(fabric.id);
        return { ...fabric, images };
      })
    );
    return withImages;
  }

  async getFabricById(id: string): Promise<FabricWithImages | null> {
    const fabric = await this.repo.findById(id);
    if (!fabric) return null;
    const images = await this.repo.findImagesByFabricId(fabric.id);
    return { ...fabric, images };
  }

  async deleteFabric(id: string): Promise<boolean> {
    const images = await this.repo.findImagesByFabricId(id);

    await this.repo.deleteImagesByFabricId(id);
    const deleted = await this.repo.deleteById(id);

    if (deleted) {
      await Promise.allSettled(
        images.map((img) =>
          this.fileStorage.deleteFile(img.file_path)
        )
      );
    }

    return deleted;
  }

  async saveImages(fabricId: string, files: ImageFile[]): Promise<SaveImagesResult> {
    let images: FabricImage[] = [];
    let warning: string | undefined;

    try {
      images = await Promise.all(
        files.map((file, index) =>
          this.repo.insertImage(fabricId, this.fileStorage.getUploadPath(file.filename), index)
        )
      );
    } catch (err) {
      console.error(`[FabricService] Image save failed for fabric ${fabricId}:`, err);
      warning = 'Fabric saved, but some images failed to upload. You can retry uploading them.';
    }

    return { images, warning };
  }
}
