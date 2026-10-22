// Yuklangan rasmlarning asl nusxasi bazada saqlanadi
// (bepul serverda disk vaqtinchalik — disk faqat kesh)
import { query } from '../database/connection.js';

export const schema = `
CREATE TABLE IF NOT EXISTS uploaded_files (
  id          SERIAL PRIMARY KEY,
  name        TEXT UNIQUE NOT NULL,
  mime        TEXT NOT NULL,
  data        BYTEA NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export async function insert(name, mime, data, client = { query }) {
  await client.query(
    `INSERT INTO uploaded_files (name, mime, data) VALUES ($1, $2, $3)
     ON CONFLICT (name) DO UPDATE SET mime = EXCLUDED.mime, data = EXCLUDED.data`,
    [name, mime, data],
  );
}

export async function findByName(name) {
  const { rows } = await query('SELECT name, mime, data FROM uploaded_files WHERE name = $1', [name]);
  return rows[0] || null;
}
