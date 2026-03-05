import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { validateCreateFabric, validateMaterialComposition } from '@sewing/shared';
import { FabricRepository } from '../repositories/fabricRepository';
import { FabricService } from '../services/fabricService';
import { Pool } from 'pg';
import { ApiResponse, FabricImage, FabricWithImages } from '../types/fabric';
import { LocalFileStorageService } from '../services/fileStorageService';
import { parsePagination } from '../validation/paginationValidation'

function getUserId(req: Request): string {
  return req.user?.uid ?? req.viewer!.ownerId;
}

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

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const { limit, offset } = parsePagination(req.query);
      const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
      const fabricTypeIdRaw = req.query.fabric_type_id;
      const fabricTypeId = typeof fabricTypeIdRaw === 'string' && fabricTypeIdRaw.trim() ? Number(fabricTypeIdRaw) : undefined;
      const fabrics = await fabricService.getAllFabrics(userId, limit, offset, search || undefined, fabricTypeId || undefined);
      const response: ApiResponse<FabricWithImages[]> = { success: true, data: fabrics };
      res.json(response);
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = getUserId(req);
      const fabric = await fabricService.getFabricById(req.params['id'] as string, userId);
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
      const userId = req.user!.uid;
      const errors = validateCreateFabric(req.body);

      const rawMaterials = req.body.materials ? JSON.parse(req.body.materials) : [];
      const materialErrors = validateMaterialComposition(rawMaterials);
      errors.push(...materialErrors);

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

      const existing = await fabricRepo.findByTypeAndName(fabricData.fabric_type_id, fabricData.name, userId);
      if (existing) {
        res.status(400).json({ success: false, errors: ['A fabric with this name already exists for this type.'] });
        return;
      }

      const fabric = await fabricService.createFabric(fabricData, userId);

      const materials = rawMaterials.map((m: { material_id: string | number; percentage: string | number }) => ({
        material_id: Number(m.material_id),
        percentage: Number(m.percentage),
      }));
      await fabricService.saveMaterials(fabric.id, materials);

      const files = (req.files as Express.Multer.File[]) ?? [];
      const { images = [], warning } = files.length > 0
        ? await fabricService.saveImages(fabric.id, files)
        : { images: [], warning: undefined };

      const savedMaterials = await fabricRepo.findMaterialsByFabricId(fabric.id);

      const response: ApiResponse<FabricWithImages> = {
        success: true,
        data: { ...fabric, images, materials: savedMaterials },
        ...(warning && { warning }),
      };

      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  });

  router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.uid;
      const errors = validateCreateFabric(req.body);

      const rawMaterials = req.body.materials ?? [];
      const materialErrors = validateMaterialComposition(rawMaterials);
      errors.push(...materialErrors);

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

      const existing = await fabricRepo.findByTypeAndName(fabricData.fabric_type_id, fabricData.name, userId, fabricId);
      if (existing) {
        res.status(400).json({ success: false, errors: ['A fabric with this name already exists for this type.'] });
        return;
      }

      const fabric = await fabricService.updateFabric(fabricId, fabricData, userId);
      if (!fabric) {
        res.status(404).json({ success: false, error: 'Fabric not found' });
        return;
      }

      const materials = rawMaterials.map((m: { material_id: string | number; percentage: string | number }) => ({
        material_id: Number(m.material_id),
        percentage: Number(m.percentage),
      }));
      await fabricService.updateMaterials(fabricId, materials);

      const [images, savedMaterials] = await Promise.all([
        fabricRepo.findImagesByFabricId(fabric.id),
        fabricRepo.findMaterialsByFabricId(fabric.id),
      ]);

      const response: ApiResponse<FabricWithImages> = {
        success: true,
        data: { ...fabric, images, materials: savedMaterials },
      };

      res.json(response);
    } catch (err) {
      next(err);
    }
  });

  router.post('/:id/images', upload.array('images', MAX_IMAGE_COUNT), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.uid;
      const fabricId = req.params['id'] as string;
      const fabric = await fabricService.getFabricById(fabricId, userId);
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
      const userId = req.user!.uid;
      const fabricId = req.params['id'] as string;
      const fabric = await fabricService.getFabricById(fabricId, userId);
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
      const userId = req.user!.uid;
      const deleted = await fabricService.deleteFabric(req.params['id'] as string, userId);
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
