import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { LocalFileStorageService } from '../../services/fileStorageService';

describe('LocalFileStorageService', () => {
  let service: LocalFileStorageService;
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'storage-test-'));
    service = new LocalFileStorageService(tmpDir);
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  })

  describe('deleteFile', () => {
    it('removes the file from disk', async () => {
      const filePath = '/uploads/fabrics/image.jpg';
      const fullPath = path.join(tmpDir, filePath);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, 'fake image data');

      await service.deleteFile(filePath);

      await expect(fs.access(fullPath)).rejects.toThrow();

    })

    it('throws when the file does not exist', async () => {
      await expect(service.deleteFile('no/such/file.jpg')).rejects.toThrow();
    })
  })

  describe('getUploadPath', () => {
    it('returns the path prefixed with /uploads/fabrics/', () => {
      expect(service.getUploadPath('image.jpg')).toBe('/uploads/fabrics/image.jpg');
    })
  })

})
