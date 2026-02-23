import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';

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

app.listen(port, () => {
  console.log("Hello from server!")
})

pool.query('SELECT 1')
  .then(() => console.log('DB CONNECTED!'))
  .catch(err => console.error('DB CONNECTION FAILED', err))
