import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { FabricTypeRepository } from '../repositories/fabricTypeRepository';
import { ApiResponse, FabricType } from '../types/fabric';

export default function fabricTypesRouter(pool: Pool): Router {
  const router = Router();
  const repo = new FabricTypeRepository(pool);

  router.get('/', async (req: Request, res: Response<ApiResponse<FabricType[]>>, next: NextFunction) => {
    try {
      const availableParam = req.query.available;
      const options: { available?: boolean } = {};

      if (availableParam === 'true') {
        options.available = true;
      } else if (availableParam === 'false') {
        options.available = false;
      }

      const types = await repo.findAll(options);
      res.json({ success: true, data: types });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id', async (req: Request, res: Response<ApiResponse<FabricType>>, next: NextFunction) => {
    try {
      const id = Number(req.params.id);
      const { available } = req.body;

      if (typeof available !== 'boolean') {
        res.status(400).json({ success: false, error: 'available must be a boolean' });
        return;
      }

      const updated = await repo.updateAvailable(id, available);
      if (!updated) {
        res.status(404).json({ success: false, error: 'Fabric type not found' });
        return;
      }

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
