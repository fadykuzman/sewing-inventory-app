import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { validateCreateFabric } from '@sewing/shared';
import { FabricRepository } from '../repositories/fabricRepository';
import { FabricService } from '../services/fabricService';
import { Pool } from 'pg';
import { ApiResponse, FabricWithImages } from '../types/fabric';
import { LocalFileStorageService } from '../services/fileStorageService';
import { parsePagination } from '../validation/paginationValidation'

const storage = multer.diskStorage({
  destination: 'uploads/fabrics/',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname) || `.${file.mimetype.split('/')[1]}`;
    cb(null, `${unique}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_COUNT = 10;

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed. Only JPEG, PNG, WebP, and GIF are accepted.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

export default function fabricsRouter(pool: Pool) {
  const router = Router();
  const fabricRepo = new FabricRepository(pool);
  const fileStorage = new LocalFileStorageService();
  const fabricService = new FabricService(fabricRepo, fileStorage);

  router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit, offset } = parsePagination(_req.query);
      const fabrics = await fabricService.getAllFabrics(limit, offset);
      const response: ApiResponse<FabricWithImages[]> = { success: true, data: fabrics };
      res.json(response);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fabric = await fabricService.getFabricById(req.params['id'] as string);
      if (!fabric) {
        res.status(404).json({ success: false, error: 'Fabric not found' });
        return;
      }
      const response: ApiResponse<FabricWithImages> = { success: true, data: fabric };
      res.json(response);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', upload.array('images', MAX_IMAGE_COUNT), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validateCreateFabric(req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const fabric = await fabricService.createFabric(req.body);

      const files = (req.files as Express.Multer.File[]) ?? [];
      const { images = [], warning } = files.length > 0
        ? await fabricService.saveImages(fabric.id, files)
        : { images: [], warning: undefined };

      const response: ApiResponse<FabricWithImages> = {
        success: true,
        data: { ...fabric, images },
        ...(warning && { warning }),
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validateCreateFabric(req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const fabric = await fabricService.updateFabric(req.params['id'] as string, req.body);
      if (!fabric) {
        res.status(404).json({ success: false, error: 'Fabric not found' });
        return;
      }

      const images = await fabricRepo.findImagesByFabricId(fabric.id);
      const response: ApiResponse<FabricWithImages> = {
        success: true,
        data: { ...fabric, images },
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await fabricService.deleteFabric(req.params['id'] as string);
      if (!deleted) {
        res.status(404).json({ success: false, error: 'Fabric not found' });
        return;
      }
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
