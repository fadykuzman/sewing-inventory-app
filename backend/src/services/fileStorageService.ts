import fs from 'fs/promises';
import path from 'path';

export interface FileStorageService {
  deleteFile(filePath: string): Promise<void>;
  getUploadPath(filename: string): string;
}
export class LocalFileStorageService implements FileStorageService {
  constructor(private basePath: string = process.cwd()) { }

  async deleteFile(filePath: string): Promise<void> {
    await fs.unlink(path.join(this.basePath, filePath));
  }

  getUploadPath(filename: string): string {
    return `/uploads/fabrics/${filename}`;
  }
}
