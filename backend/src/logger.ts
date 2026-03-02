import pino from 'pino';

export const logger = pino({
  name: 'sewing-api',
  level: process.env.LOG_LEVEL || 'info',
});
