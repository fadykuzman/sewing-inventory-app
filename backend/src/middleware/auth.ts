import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { Pool } from 'pg';
import { createUserRepository } from '../repositories/userRepository';
import { logger } from '../logger';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

export function authMiddleware(pool: Pool) {
  const userRepository = createUserRepository(pool);

  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      // No Bearer token — pass through to let viewerMiddleware try
      next();
      return;
    }

    const token = header.split('Bearer ')[1];
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      req.user = { uid: decoded.uid, email: decoded.email || '' };
      await userRepository.upsert(decoded.uid, decoded.email || '');
      next();
    } catch (err) {
      logger.warn({ err }, 'Firebase token verification failed');
      res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
  };
}
