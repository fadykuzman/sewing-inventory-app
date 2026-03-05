import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { createViewerTokenRepository } from '../repositories/viewerTokenRepository';
import { logger } from '../logger';

export function viewerMiddleware(pool: Pool) {
  const viewerTokenRepo = createViewerTokenRepository(pool);

  return async (req: Request, res: Response, next: NextFunction) => {
    // Already authenticated via Firebase — skip viewer check
    if (req.user) {
      next();
      return;
    }

    const token = typeof req.query.token === 'string' ? req.query.token : undefined;
    if (!token) {
      next();
      return;
    }

    try {
      const viewerToken = await viewerTokenRepo.findByToken(token);
      if (!viewerToken) {
        res.status(401).json({ success: false, error: 'Invalid or revoked viewer token' });
        return;
      }

      req.viewer = { ownerId: viewerToken.owner_id };
      req.readOnly = true;
      next();
    } catch (err) {
      logger.error({ err }, 'Viewer token verification failed');
      res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
    }
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user && !req.viewer) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  if (req.readOnly && req.method !== 'GET') {
    res.status(403).json({ success: false, error: 'Viewer access is read-only' });
    return;
  }

  next();
}
