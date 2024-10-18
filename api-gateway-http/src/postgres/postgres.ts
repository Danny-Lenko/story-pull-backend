import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: +process.env.POSTGRES_PORT!,
});

export const query = (text: string, params: unknown[]) => pool.query(text, params);

export const getClient = () => pool.connect();
export const closePool = () => pool.end();
