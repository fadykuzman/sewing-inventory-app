import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { FabricTypeRepository } from '../repositories/fabricTypeRepository';
import { ApiResponse, FabricType } from '../types/fabric';

export default function fabricTypesRouter(pool: Pool): Router {
  const router = Router();
  const repo = new FabricTypeRepository(pool);

  router.get('/', async (req: Request, res: Response<ApiResponse<FabricType[]>>, next: NextFunction) => {
    try {
      const userId = req.user!.uid;
      const hiddenParam = req.query.hidden;
      const options: { hidden?: boolean } = {};

      if (hiddenParam === 'true') {
        options.hidden = true;
      } else if (hiddenParam === 'false') {
        options.hidden = false;
      }

      const types = await repo.findAll(userId, options);
      res.json({ success: true, data: types });
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id', async (req: Request, res: Response<ApiResponse<FabricType>>, next: NextFunction) => {
    try {
      const userId = req.user!.uid;
      const id = Number(req.params.id);
      const { hidden } = req.body;

      if (typeof hidden !== 'boolean') {
        res.status(400).json({ success: false, error: 'hidden must be a boolean' });
        return;
      }

      const updated = await repo.toggleHidden(userId, id, hidden);
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
