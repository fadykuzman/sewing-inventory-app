import { Router } from 'express';
import { logger } from '../logger';

const router = Router();

router.post('/', (req, res) => {
  const { level, message, context, timestamp } = req.body;

  const logEntry = {
    source: 'frontend',
    timestamp,
    ...context,
  };

  switch (level) {
    case 'error':
      logger.error(logEntry, message);
      break;
    case 'warn':
      logger.warn(logEntry, message);
      break;
    case 'debug':
      logger.debug(logEntry, message);
      break;
    default:
      logger.info(logEntry, message);
  }

  res.status(204).end();
});

export default router;
