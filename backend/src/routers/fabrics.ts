import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { validateCreateFabric } from '../validation/fabricValidation';
import { FabricService } from '../services/fabricService';
import { Pool } from 'pg';

const storage = multer.diskStorage({
  destination: 'uploads/fabrics/',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
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
  const fabricService = new FabricService(pool);

  router.post('/', upload.array('images', MAX_IMAGE_COUNT), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validateCreateFabric(req.body);
      if (errors.length > 0) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const fabric = await fabricService.createFabric(req.body);

      const files = (req.files as Express.Multer.File[]) ?? [];
      let images: object[] = [];
      let warning: string | undefined;

      if (files.length > 0) {
        const result = await fabricService.saveImages(fabric.id, files);
        images = result.images;
        warning = result.warning;
      }

      res.status(201).json({
        success: true,
        data: { ...fabric, images },
        ...(warning && { warning }),
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
