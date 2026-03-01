import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { MaterialRepository } from '../repositories/materialRepository';
import { ApiResponse, Material } from '../types/fabric';

export default function materialsRouter(pool: Pool): Router {
  const router = Router();
  const repo = new MaterialRepository(pool);

  router.get('/', async (req: Request, res: Response<ApiResponse<Material[]>>, next: NextFunction) => {
    try {
      const materials = await repo.findAll();
      res.json({ success: true, data: materials });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
