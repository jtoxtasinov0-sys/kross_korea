// PostgreSQL (Neon) ulanishi — pool, so'rov va tranzaksiya yordamchilari
import pg from 'pg';
import { config } from '../config/default.js';
import { logger } from '../utils/logger.js';

const { Pool, types } = pg;

// COUNT/SUM (int8) natijalari son bo'lib kelsin, satr emas
types.setTypeParser(20, (v) => Number(v));
types.setTypeParser(1700, (v) => Number(v));

if (!config.databaseUrl) {
  logger.error('DATABASE_URL berilmagan — backend/.env faylini tekshiring');
}

// Neon manzilidagi sslmode=require pg'da baribir verify-full — ogohlantirishsiz aniq yozamiz
const connectionString = config.databaseUrl.replace(/sslmode=(require|prefer|verify-ca)\b/, 'sslmode=verify-full');

export const pool = new Pool({
  connectionString,
  max: 6,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
});

pool.on('error', (err) => logger.error('PostgreSQL pool xatosi:', err.message));

export const query = (text, params) => pool.query(text, params);

/** Bir nechta so'rovni bitta tranzaksiyada bajarish */
export async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
