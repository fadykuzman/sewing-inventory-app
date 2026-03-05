import { FabricRepository } from '../repositories/fabricRepository';
import { CreateFabricInput, Fabric, FabricImage, FabricWithImages } from '../types/fabric';
import { FileStorageService } from './fileStorageService';
import { logger } from '../logger';

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

  async createFabric(data: CreateFabricInput, userId: string): Promise<Fabric> {
    return this.repo.insert(data, userId);
  }

  async getAllFabrics(userId: string, limit: number, offset: number, search?: string, fabricTypeId?: number): Promise<FabricWithImages[]> {
    return this.repo.findAllWithImages(userId, limit, offset, search, fabricTypeId);
  }

  async getFabricById(id: string, userId: string): Promise<FabricWithImages | null> {
    const fabric = await this.repo.findById(id, userId);
    if (!fabric) return null;
    const [images, materials] = await Promise.all([
      this.repo.findImagesByFabricId(fabric.id),
      this.repo.findMaterialsByFabricId(fabric.id),
    ]);
    return { ...fabric, images, materials };
  }

  async deleteFabric(id: string, userId: string): Promise<boolean> {
    const images = await this.repo.findImagesByFabricId(id);

    await this.repo.deleteImagesByFabricId(id);
    const deleted = await this.repo.deleteById(id, userId);

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
      logger.error({ err, fabricId }, 'image save failed');
      warning = 'Fabric saved, but some images failed to upload. You can retry uploading them.';
    }

    return { images, warning };
  }

  async addImages(fabricId: string, files: ImageFile[]): Promise<SaveImagesResult> {
    const maxOrder = await this.repo.getMaxImageOrder(fabricId);
    let images: FabricImage[] = [];
    let warning: string | undefined;

    try {
      images = await Promise.all(
        files.map((file, index) =>
          this.repo.insertImage(fabricId, this.fileStorage.getUploadPath(file.filename), maxOrder + 1 + index)
        )
      );
    } catch (err) {
      logger.error({ err, fabricId }, 'image add failed');
      warning = 'Some images failed to upload. You can retry uploading them.';
    }

    return { images, warning };
  }

  async removeImages(fabricId: string, imageIds: string[]): Promise<void> {
    const deleted = await this.repo.deleteImagesByIds(fabricId, imageIds);

    await Promise.allSettled(
      deleted.map((img) => this.fileStorage.deleteFile(img.file_path))
    );
  }

  async updateFabric(id: string, data: CreateFabricInput, userId: string): Promise<Fabric | null> {
    return this.repo.update(id, data, userId);
  }

  async saveMaterials(fabricId: string, materials: { material_id: number; percentage: number }[]): Promise<void> {
    if (materials.length > 0) {
      await this.repo.insertFabricMaterials(fabricId, materials);
    }
  }

  async updateMaterials(fabricId: string, materials: { material_id: number; percentage: number }[]): Promise<void> {
    await this.repo.deleteFabricMaterials(fabricId);
    if (materials.length > 0) {
      await this.repo.insertFabricMaterials(fabricId, materials);
    }
  }
}
