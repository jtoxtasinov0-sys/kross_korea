// Boshlang'ich ma'lumotlarni bazaga yozish: MAHSULOTLAR/products.json + rasmlar
//   npm run db:seed            — baza bo'sh bo'lsa to'ldiradi
//   npm run db:seed -- --force — mahsulot/storylarni o'chirib qaytadan yozadi (buyurtmalarga tegmaydi)
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/default.js';
import { pool, query, tx } from './connection.js';
import { initSchema } from './migrate.js';
import { logger } from '../utils/logger.js';
import * as Category from '../models/Category.js';
import * as Product from '../models/Product.js';
import * as Upload from '../models/Upload.js';
import * as Story from '../models/Story.js';
import * as Setting from '../models/Setting.js';
import {
  CATEGORIES, PRODUCT_CATEGORY, MODEL_NAMES, GENERIC_NAMES, COLOR_RU, DESCRIPTIONS,
  SIZES_MM, START_STOCK, NEW_IDS, STORIES, ABOUT,
} from './seed-data.js';

const SOURCE_DIR = path.resolve(config.root, '..', 'MAHSULOTLAR');
const force = process.argv.includes('--force');

const categoryOf = (id) =>
  Object.entries(PRODUCT_CATEGORY).find(([, ids]) => ids.includes(id))?.[0] || 'lifestyle';

const translateColor = (uz) =>
  uz
    .split('/')
    .map((part) => COLOR_RU[part.trim()] || part.trim())
    .join('/');

// "-50%" → 0.5
const discountRate = (d) => (d ? Number.parseInt(d, 10) / 100 : 0);

function buildProduct(raw, categoryIds) {
  const slug = categoryOf(raw.id);
  const [modelPart, colorPart] = raw.model.includes(' — ') ? raw.model.split(' — ') : [null, raw.model];
  const [nameUz, nameRu] = modelPart
    ? MODEL_NAMES[modelPart] || [modelPart, modelPart]
    : GENERIC_NAMES[slug];
  const rate = discountRate(raw.discount);

  const oldPriceKrw =
    raw.price_original_krw || (rate ? Math.round(raw.price_korea_krw / (1 - rate) / 1000) * 1000 : null);
  const oldPriceUsd = rate ? Math.round(raw.price_uzbekistan_usd / (1 - rate)) : null;

  return {
    nameUz,
    nameRu,
    brand: raw.brand,
    colorUz: colorPart,
    colorRu: translateColor(colorPart),
    descUz: DESCRIPTIONS[slug].uz.join('\n'),
    descRu: DESCRIPTIONS[slug].ru.join('\n'),
    priceKrw: raw.price_korea_krw,
    oldPriceKrw,
    priceUsd: raw.price_uzbekistan_usd,
    oldPriceUsd,
    categoryId: categoryIds[slug],
    isNew: NEW_IDS.includes(raw.id),
    sortOrder: Number(raw.id),
    images: [`/uploads/p${raw.id}.jpg`],
    variants: SIZES_MM.map((mm) => ({ label: String(mm), stock: START_STOCK })),
  };
}

async function seed() {
  await initSchema();

  const { rows } = await query('SELECT COUNT(*) AS n FROM products');
  if (rows[0].n > 0 && !force) {
    logger.info(`Bazada allaqachon ${rows[0].n} ta mahsulot bor. Qayta yozish: npm run db:seed -- --force`);
    return;
  }

  const source = JSON.parse(await fs.readFile(path.join(SOURCE_DIR, 'products.json'), 'utf8'));

  await tx(async (client) => {
    if (force) {
      await client.query('DELETE FROM stories');
      await client.query('DELETE FROM products');
      await client.query(`DELETE FROM uploaded_files WHERE name ~ '^p[0-9]+\\.jpg$'`);
    }
  });

  const categoryIds = {};
  for (const c of CATEGORIES) categoryIds[c.slug] = (await Category.upsert(c)).id;

  const idMap = {};
  await tx(async (client) => {
    for (const raw of source.products) {
      const data = await fs.readFile(path.join(SOURCE_DIR, raw.image));
      await Upload.insert(`p${raw.id}.jpg`, 'image/jpeg', data, client);
      idMap[raw.id] = await Product.insert(buildProduct(raw, categoryIds), client);
    }
  });
  logger.info(`✅ ${source.products.length} ta mahsulot va rasm yozildi`);

  for (const [i, s] of STORIES.entries()) {
    await Story.insert({
      imageUrl: `/uploads/p${s.productId}.jpg`,
      titleUz: s.titleUz,
      titleRu: s.titleRu,
      link: s.category ? `category:${s.category}` : `product:${idMap[s.productId]}`,
      sortOrder: i,
    });
  }
  logger.info(`✅ ${STORIES.length} ta story yozildi`);

  const settings = await Setting.get();
  if (!settings.about_uz) await Setting.updateAbout(ABOUT.uz, ABOUT.ru);
}

seed()
  .catch((err) => {
    logger.error('Seed xatosi:', err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
