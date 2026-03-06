import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fabricsRouter from './routers/fabrics';
import fabricTypesRouter from './routers/fabricTypes';
import materialsRouter from './routers/materials';
import { requestId } from './middleware/requestId';
import { logger } from './logger';
import { httpLogger } from './middleware/httpLogger';
import { authMiddleware } from './middleware/auth';
import { viewerMiddleware, requireAuth } from './middleware/viewer';
import inviteRouter from './routers/invite';
import logsRouter from './routers/logs';
import pagesRouter from './routers/pages';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../.env' });
}

const app = express();
const port = process.env.PORT || 3000;


const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
  });

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : '*';
app.use(cors({ origin: corsOrigin }))
app.use(requestId)
app.use(httpLogger)
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
})
app.use(pagesRouter)
app.use('/api/v1', authMiddleware(pool))
app.use('/api/v1', viewerMiddleware(pool))
app.use('/api/v1', requireAuth)
app.use('/api/v1/invite', inviteRouter(pool))
app.use('/api/v1/fabric-types', fabricTypesRouter(pool))
app.use('/api/v1/materials', materialsRouter(pool))
app.use('/api/v1/fabrics', fabricsRouter(pool))
app.use('/api/v1/logs', logsRouter)

app.listen(port, () => {
  logger.info(`server started on port ${port}`)
})

pool.query('SELECT 1')
  .then(() => logger.info(`database connected successfully`))
  .catch(err => logger.fatal({ err }, 'database connection failed'))

// Centralized error handler — must be last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err, requestId: req.id, method: req.method, path: req.path }, 'unhandled error');
  res.status(500).json({ success: false, error: 'An unexpected error occurred. Please try again.' });
});
