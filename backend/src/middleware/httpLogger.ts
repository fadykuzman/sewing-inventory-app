import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export function httpLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = {
      requestId: req.id,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    }

    if (res.statusCode >= 500) {
      logger.error(log, 'request failed');
    } else if (res.statusCode >= 400) {
      logger.warn(log, 'request client error');
    } else {
      logger.info(log, 'request completed');
    }
  });

  next();

}
