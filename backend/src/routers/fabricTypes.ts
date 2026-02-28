import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { FabricTypeRepository } from '../repositories/fabricTypeRepository';
import { ApiResponse, FabricType } from '../types/fabric';

export default function fabricTypesRouter(pool: Pool): Router {
  const router = Router();
  const repo = new FabricTypeRepository(pool);

  router.get('/', async (req: Request, res: Response<ApiResponse<FabricType[]>>, next: NextFunction) => {
    try {
      const types = await repo.findAll();
      res.json({ success: true, data: types });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
