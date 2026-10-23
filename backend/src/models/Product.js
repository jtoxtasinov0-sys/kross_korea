// Mahsulotlar, ularning rasmlari va o'lcham variantlari
import { query, tx } from '../database/connection.js';

export const schema = `
CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  name_uz        TEXT NOT NULL,
  name_ru        TEXT NOT NULL,
  brand          TEXT NOT NULL DEFAULT '',
  color_uz       TEXT,
  color_ru       TEXT,
  desc_uz        TEXT,                    -- har qator — alohida band
  desc_ru        TEXT,
  price_krw      INT NOT NULL,            -- Koreya bo'limi narxi (₩)
  old_price_krw  INT,
  price_usd      INT NOT NULL,            -- O'zbekiston bo'limi narxi ($)
  old_price_usd  INT,
  category_id    INT REFERENCES categories(id) ON DELETE SET NULL,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  is_new         BOOLEAN NOT NULL DEFAULT false,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_images (
  id          SERIAL PRIMARY KEY,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  sort_order  INT NOT NULL DEFAULT 0      -- birinchisi asosiy rasm
);

CREATE TABLE IF NOT EXISTS product_variants (
  id          SERIAL PRIMARY KEY,
  product_id  INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,              -- o'lcham, mm: 250, 255...
  stock       INT NOT NULL DEFAULT 0,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS product_images_pid  ON product_images(product_id);
CREATE INDEX IF NOT EXISTS product_variants_pid ON product_variants(product_id);
`;

const SELECT = `
  SELECT p.*,
    COALESCE((SELECT json_agg(i.url ORDER BY i.sort_order, i.id)
                FROM product_images i WHERE i.product_id = p.id), '[]') AS images,
    COALESCE((SELECT json_agg(json_build_object('id', v.id, 'label', v.label, 'stock', v.stock)
                ORDER BY v.sort_order, v.id)
                FROM product_variants v WHERE v.product_id = p.id), '[]') AS variants,
    COALESCE((SELECT SUM(v.stock) FROM product_variants v WHERE v.product_id = p.id), 0) AS total_stock
  FROM products p`;

/**
 * Mijozga beriladigan ko'rinish. Zaxira yashirin bo'lsa, aniq son o'rniga
 * "kam qoldi" chegarasigacha qisqartiriladi — mijoz faqat "N ta qoldi"ni ko'radi.
 */
export function toClient(r, { stockVisible = false, lowStock = 3 } = {}) {
  const cap = (n) => (stockVisible ? n : Math.min(n, lowStock));
  return {
    id: r.id,
    nameUz: r.name_uz,
    nameRu: r.name_ru,
    brand: r.brand,
    colorUz: r.color_uz,
    colorRu: r.color_ru,
    descUz: r.desc_uz,
    descRu: r.desc_ru,
    priceKrw: r.price_krw,
    oldPriceKrw: r.old_price_krw,
    priceUsd: r.price_usd,
    oldPriceUsd: r.old_price_usd,
    categoryId: r.category_id,
    isNew: r.is_new,
    sortOrder: r.sort_order,
    createdAt: r.created_at,
    images: r.images,
    variants: r.variants.map((v) => ({ id: v.id, label: v.label, stock: cap(v.stock) })),
    inStock: r.total_stock > 0,
  };
}

/** Katalog: zaxirasi ko'p mahsulotlar tepada, tugaganlar pastda */
export async function listActive() {
  const { rows } = await query(
    `${SELECT}
     JOIN categories c ON c.id = p.category_id AND c.is_active
     WHERE p.is_active
     ORDER BY (COALESCE((SELECT SUM(v.stock) FROM product_variants v WHERE v.product_id = p.id), 0) > 0) DESC,
              COALESCE((SELECT SUM(v.stock) FROM product_variants v WHERE v.product_id = p.id), 0) DESC,
              p.sort_order, p.id`,
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await query(`${SELECT} WHERE p.id = $1`, [id]);
  return rows[0] || null;
}

// ---------- Admin ----------

/** Admin ko'rinishi: aniq zaxira, nofaol mahsulotlar ham */
export const toAdmin = (r) => ({
  ...toClient(r, { stockVisible: true }),
  isActive: r.is_active,
  totalStock: r.total_stock,
  updatedAt: r.updated_at,
});

export async function listAll() {
  const { rows } = await query(
    `${SELECT} LEFT JOIN categories c ON c.id = p.category_id
     ORDER BY c.sort_order NULLS LAST, p.sort_order, p.id`,
  );
  return rows.map(toAdmin);
}

export async function findAdmin(id) {
  const row = await findById(id);
  return row ? toAdmin(row) : null;
}

/** Rasmlar tartib bilan qayta yoziladi; variantlar id bo'yicha yangilanadi, yangilari qo'shiladi, olib tashlanganlari o'chadi */
export async function update(id, p) {
  return tx(async (client) => {
    const { rowCount } = await client.query(
      `UPDATE products SET name_uz=$2, name_ru=$3, brand=$4, color_uz=$5, color_ru=$6, desc_uz=$7, desc_ru=$8,
         price_krw=$9, old_price_krw=$10, price_usd=$11, old_price_usd=$12, category_id=$13,
         is_active=$14, is_new=$15, sort_order=$16, updated_at=now()
       WHERE id=$1`,
      [
        id, p.nameUz, p.nameRu, p.brand, p.colorUz, p.colorRu, p.descUz, p.descRu,
        p.priceKrw, p.oldPriceKrw, p.priceUsd, p.oldPriceUsd, p.categoryId, p.isActive, p.isNew, p.sortOrder,
      ],
    );
    if (!rowCount) return false;

    await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    for (const [i, url] of p.images.entries()) {
      await client.query('INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3)', [id, url, i]);
    }

    const keep = p.variants.filter((v) => v.id).map((v) => v.id);
    await client.query('DELETE FROM product_variants WHERE product_id = $1 AND NOT (id = ANY($2::int[]))', [id, keep]);
    for (const [i, v] of p.variants.entries()) {
      if (v.id) {
        await client.query(
          'UPDATE product_variants SET label=$3, stock=$4, sort_order=$5 WHERE id=$1 AND product_id=$2',
          [v.id, id, v.label, v.stock, i],
        );
      } else {
        await client.query(
          'INSERT INTO product_variants (product_id, label, stock, sort_order) VALUES ($1, $2, $3, $4)',
          [id, v.label, v.stock, i],
        );
      }
    }
    return true;
  });
}

export async function create(p) {
  return tx((client) => insert(p, client));
}

export async function remove(id) {
  const { rowCount } = await query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}

/** Ombor: barcha variantlar bitta ro'yxatda */
export async function listStock() {
  const { rows } = await query(
    `SELECT v.id, v.label, v.stock, v.product_id, p.name_uz, p.brand, p.color_uz, p.category_id, p.is_active,
            (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order, i.id LIMIT 1) AS image
       FROM product_variants v JOIN products p ON p.id = v.product_id
      ORDER BY p.sort_order, p.id, v.sort_order, v.id`,
  );
  return rows.map((r) => ({
    variantId: r.id,
    label: r.label,
    stock: r.stock,
    productId: r.product_id,
    name: r.name_uz,
    brand: r.brand,
    color: r.color_uz,
    categoryId: r.category_id,
    isActive: r.is_active,
    image: r.image,
  }));
}

export async function setStocks(changes) {
  return tx(async (client) => {
    let updated = 0;
    for (const c of changes) {
      const res = await client.query('UPDATE product_variants SET stock = $2 WHERE id = $1', [c.variantId, c.stock]);
      updated += res.rowCount;
    }
    return updated;
  });
}

export async function lowStock(threshold, limit = 20) {
  const { rows } = await query(
    `SELECT v.id, v.label, v.stock, p.id AS product_id, p.name_uz, p.brand,
            (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order, i.id LIMIT 1) AS image
       FROM product_variants v JOIN products p ON p.id = v.product_id
      WHERE p.is_active AND v.stock < $1
      ORDER BY v.stock, p.sort_order LIMIT $2`,
    [threshold, limit],
  );
  return rows.map((r) => ({
    variantId: r.id,
    label: r.label,
    stock: r.stock,
    productId: r.product_id,
    name: r.name_uz,
    brand: r.brand,
    image: r.image,
  }));
}

export async function insert(p, client = { query }) {
  const { rows } = await client.query(
    `INSERT INTO products (name_uz, name_ru, brand, color_uz, color_ru, desc_uz, desc_ru,
       price_krw, old_price_krw, price_usd, old_price_usd, category_id, is_new, sort_order, is_active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING id`,
    [
      p.nameUz, p.nameRu, p.brand, p.colorUz, p.colorRu, p.descUz, p.descRu,
      p.priceKrw, p.oldPriceKrw, p.priceUsd, p.oldPriceUsd, p.categoryId, !!p.isNew, p.sortOrder || 0,
      p.isActive ?? true,
    ],
  );
  const id = rows[0].id;
  for (const [i, url] of (p.images || []).entries()) {
    await client.query('INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3)', [id, url, i]);
  }
  for (const [i, v] of (p.variants || []).entries()) {
    await client.query('INSERT INTO product_variants (product_id, label, stock, sort_order) VALUES ($1, $2, $3, $4)', [
      id, v.label, v.stock, i,
    ]);
  }
  return id;
}
