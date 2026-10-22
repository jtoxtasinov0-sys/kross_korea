// Bosh sahifadagi storylar
import { query } from '../database/connection.js';

export const schema = `
CREATE TABLE IF NOT EXISTS stories (
  id          SERIAL PRIMARY KEY,
  image_url   TEXT NOT NULL,
  title_uz    TEXT,
  title_ru    TEXT,
  link        TEXT,                  -- product:<id> | category:<slug> | https://...
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

export async function listActive() {
  const { rows } = await query('SELECT * FROM stories WHERE is_active ORDER BY sort_order, id');
  return rows.map((r) => ({
    id: r.id,
    imageUrl: r.image_url,
    titleUz: r.title_uz,
    titleRu: r.title_ru,
    link: r.link,
  }));
}

export async function insert(s) {
  await query('INSERT INTO stories (image_url, title_uz, title_ru, link, sort_order) VALUES ($1, $2, $3, $4, $5)', [
    s.imageUrl,
    s.titleUz,
    s.titleRu,
    s.link,
    s.sortOrder || 0,
  ]);
}
