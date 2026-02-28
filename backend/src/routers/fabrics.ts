import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { validateCreateFabric } from '@sewing/shared';
import { FabricRepository } from '../repositories/fabricRepository';
import { FabricService } from '../services/fabricService';
import { Pool } from 'pg';
import { ApiResponse, FabricImage, FabricWithImages } from '../types/fabric';
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
      const search = typeof _req.query.search === 'string' ? _req.query.search.trim() : undefined;
      const fabricTypeIdRaw = _req.query.fabric_type_id;
      const fabricTypeId = typeof fabricTypeIdRaw === 'string' && fabricTypeIdRaw.trim() ? Number(fabricTypeIdRaw) : undefined;
      const fabrics = await fabricService.getAllFabrics(limit, offset, search || undefined, fabricTypeId || undefined);
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

      const fabricData = {
        ...req.body,
        name: req.body.name?.trim(),
        fabric_type_id: Number(req.body.fabric_type_id),
        amount_meters: Number(req.body.amount_meters),
        cost: req.body.cost != null && req.body.cost !== '' ? Number(req.body.cost) : undefined,
      };

      const existing = await fabricRepo.findByTypeAndName(fabricData.fabric_type_id, fabricData.name);
      if (existing) {
        res.status(400).json({ success: false, errors: ['A fabric with this name already exists for this type.'] });
        return;
      }

      const fabric = await fabricService.createFabric(fabricData);

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

      const fabricId = req.params['id'] as string;
      const fabricData = {
        ...req.body,
        name: req.body.name?.trim(),
        fabric_type_id: Number(req.body.fabric_type_id),
        amount_meters: Number(req.body.amount_meters),
        cost: req.body.cost != null && req.body.cost !== '' ? Number(req.body.cost) : undefined,
      };

      const existing = await fabricRepo.findByTypeAndName(fabricData.fabric_type_id, fabricData.name, fabricId);
      if (existing) {
        res.status(400).json({ success: false, errors: ['A fabric with this name already exists for this type.'] });
        return;
      }

      const fabric = await fabricService.updateFabric(fabricId, fabricData);
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

  router.post('/:id/images', upload.array('images', MAX_IMAGE_COUNT), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fabricId = req.params['id'] as string;
      const fabric = await fabricService.getFabricById(fabricId);
      if (!fabric) {
        res.status(404).json({ success: false, error: 'Fabric not found' });
        return;
      }

      const files = (req.files as Express.Multer.File[]) ?? [];
      if (files.length === 0) {
        res.status(400).json({ success: false, error: 'No images provided' });
        return;
      }

      const { images, warning } = await fabricService.addImages(fabricId, files);

      const response: ApiResponse<FabricImage[]> = {
        success: true,
        data: images,
        ...(warning && { warning }),
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/:id/images', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fabricId = req.params['id'] as string;
      const fabric = await fabricService.getFabricById(fabricId);
      if (!fabric) {
        res.status(404).json({ success: false, error: 'Fabric not found' });
        return;
      }

      const { imageIds } = req.body;
      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        res.status(400).json({ success: false, error: 'imageIds must be a non-empty array' });
        return;
      }

      await fabricService.removeImages(fabricId, imageIds);

      res.json({ success: true });
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
