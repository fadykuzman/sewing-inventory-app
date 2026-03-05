import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { createViewerTokenRepository } from '../repositories/viewerTokenRepository';
import { ApiResponse } from '../types/fabric';

export default function inviteRouter(pool: Pool): Router {
  const router = Router();
  const viewerTokenRepo = createViewerTokenRepository(pool);

  // Invite routes require a fully authenticated user (not a viewer)
  router.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }
    next();
  });

  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = await viewerTokenRepo.findActiveByOwner(req.user!.uid);
      const response: ApiResponse<{ token: string | null }> = {
        success: true,
        data: { token: token?.token ?? null },
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  });

  router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Revoke existing tokens before creating a new one
      await viewerTokenRepo.revokeAllByOwner(req.user!.uid);
      const token = await viewerTokenRepo.create(req.user!.uid);
      const response: ApiResponse<{ token: string }> = {
        success: true,
        data: { token: token.token },
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  });

  router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      await viewerTokenRepo.revokeAllByOwner(req.user!.uid);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
