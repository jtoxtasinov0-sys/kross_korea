// Kategoriyalar: Yugurish, Air Max, Kundalik, Futbol...
import { query } from '../database/connection.js';

export const schema = `
CREATE TABLE IF NOT EXISTS categories (
  id          SERIAL PRIMARY KEY,
  slug        TEXT UNIQUE NOT NULL,
  name_uz     TEXT NOT NULL,
  name_ru     TEXT NOT NULL,
  emoji       TEXT,
  image_url   TEXT,                      -- bo'sh bo'lsa birinchi mahsulot rasmi
  note_uz     TEXT,
  note_ru     TEXT,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);
`;

export const map = (r) => ({
  id: r.id,
  slug: r.slug,
  nameUz: r.name_uz,
  nameRu: r.name_ru,
  emoji: r.emoji,
  imageUrl: r.image_url,
  noteUz: r.note_uz,
  noteRu: r.note_ru,
  sortOrder: r.sort_order,
});

export async function listActive() {
  const { rows } = await query('SELECT * FROM categories WHERE is_active ORDER BY sort_order, id');
  return rows.map(map);
}

export async function listAll() {
  const { rows } = await query(
    `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS count
       FROM categories c ORDER BY c.sort_order, c.id`,
  );
  return rows.map((r) => ({ ...map(r), isActive: r.is_active, count: r.count }));
}

export async function exists(id) {
  const { rows } = await query('SELECT 1 FROM categories WHERE id = $1', [id]);
  return rows.length > 0;
}

export async function upsert(c) {
  const { rows } = await query(
    `INSERT INTO categories (slug, name_uz, name_ru, emoji, note_uz, note_ru, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (slug) DO UPDATE
       SET name_uz = EXCLUDED.name_uz, name_ru = EXCLUDED.name_ru, emoji = EXCLUDED.emoji,
           note_uz = EXCLUDED.note_uz, note_ru = EXCLUDED.note_ru, sort_order = EXCLUDED.sort_order
     RETURNING *`,
    [c.slug, c.nameUz, c.nameRu, c.emoji, c.noteUz || null, c.noteRu || null, c.sortOrder || 0],
  );
  return map(rows[0]);
}
