import { query } from './postgres';
import { Logger } from '../config';

export const checkPostgresConnection = async () => {
  try {
    const res = await query('SELECT NOW()', []);
    Logger.info('PostgreSQL connected:', res.rows[0].now);
  } catch (err) {
    Logger.error('Error connecting to PostgreSQL:', err);
  }
};
