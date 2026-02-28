import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fabricsRouter from './routers/fabrics';
import fabricTypesRouter from './routers/fabricTypes';

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
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
})
app.use('/api/v1/fabric-types', fabricTypesRouter(pool))
app.use('/api/v1/fabrics', fabricsRouter(pool))

app.listen(port, () => {
  console.log("Hello from server!")
})

pool.query('SELECT 1')
  .then(() => console.log('DB CONNECTED!'))
  .catch(err => console.error('DB CONNECTION FAILED', err))

// Centralized error handler — must be last
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${req.method} ${req.path}]`, err);
  res.status(500).json({ success: false, error: 'An unexpected error occurred. Please try again.' });
});
