import express, { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import fabricsRouter from './routers/fabrics';

dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT;

const dbHost = process.env.DB_HOST;
const dbPort = Number(process.env.DB_PORT);
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPassword = String(process.env.DB_PASSWORD);

const pool = new Pool({
  host: dbHost,
  port: dbPort,
  database: dbName,
  user: dbUser,
  password: dbPassword,
})

app.use(express.json())
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
