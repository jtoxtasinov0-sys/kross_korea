// Admin: mahsulotlar (yaratish, tahrirlash, o'chirish), kategoriyalar ro'yxati, rasm yuklash
import { invalidate } from '../core/cache.js';
import { saveImage } from '../core/uploads.js';
import { HttpError } from '../middlewares/error.middleware.js';
import { cleanLines, cleanText, intInRange, toInt } from '../utils/validate.js';
import * as Product from '../models/Product.js';
import * as Category from '../models/Category.js';

const IMAGE_URL = /^(\/uploads\/[a-z0-9_-]+\.(jpe?g|png|webp)|https:\/\/\S+)$/i;
const MAX_PRICE = 100_000_000;

/** Kelgan ma'lumotni tekshirib, bazaga mos ko'rinishga keltiradi. Xato bo'lsa 400 + maydonlar. */
async function parseProduct(body = {}) {
  const fields = [];
  const nameUz = cleanText(body.nameUz, 120);
  const p = {
    nameUz,
    nameRu: cleanText(body.nameRu, 120) || nameUz,
    brand: cleanText(body.brand, 60),
    colorUz: cleanText(body.colorUz, 80) || null,
    colorRu: cleanText(body.colorRu, 80) || null,
    descUz: cleanLines(body.descUz) || null,
    descRu: cleanLines(body.descRu) || null,
    priceUsd: intInRange(body.priceUsd, 1, MAX_PRICE),
    oldPriceUsd: intInRange(body.oldPriceUsd, 1, MAX_PRICE),
    priceKrw: intInRange(body.priceKrw, 1, MAX_PRICE),
    oldPriceKrw: intInRange(body.oldPriceKrw, 1, MAX_PRICE),
    categoryId: toInt(body.categoryId, 0),
    isActive: body.isActive !== false,
    isNew: !!body.isNew,
    sortOrder: intInRange(body.sortOrder, 0, 100000) ?? 0,
    images: (Array.isArray(body.images) ? body.images : []).map(String).filter((u) => IMAGE_URL.test(u)).slice(0, 12),
    variants: [],
  };

  const labels = new Set();
  for (const v of Array.isArray(body.variants) ? body.variants.slice(0, 40) : []) {
    const label = cleanText(v?.label, 20);
    const stock = intInRange(v?.stock, 0, 99999);
    if (!label || stock === null || labels.has(label)) {
      fields.push('variants');
      break;
    }
    labels.add(label);
    p.variants.push({ id: toInt(v.id, 0) || null, label, stock });
  }

  if (nameUz.length < 2) fields.push('nameUz');
  if (!p.priceUsd) fields.push('priceUsd');
  if (!p.priceKrw) fields.push('priceKrw');
  if (!p.categoryId || !(await Category.exists(p.categoryId))) fields.push('categoryId');
  if (!p.images.length) fields.push('images');
  if (!p.variants.length && !fields.includes('variants')) fields.push('variants');
  if (fields.length) throw new HttpError(400, 'validation', { fields });

  // Eski narx yangisidan katta bo'lmasa — chegirma yo'q
  if (p.oldPriceUsd && p.oldPriceUsd <= p.priceUsd) p.oldPriceUsd = null;
  if (p.oldPriceKrw && p.oldPriceKrw <= p.priceKrw) p.oldPriceKrw = null;
  return p;
}

export async function list(req, res) {
  const [products, categories] = await Promise.all([Product.listAll(), Category.listAll()]);
  res.json({ products, categories });
}

export async function getOne(req, res) {
  const product = await Product.findAdmin(toInt(req.params.id));
  if (!product) throw new HttpError(404, 'not_found');
  res.json({ product });
}

export async function create(req, res) {
  const id = await Product.create(await parseProduct(req.body));
  invalidate('catalog');
  res.status(201).json({ product: await Product.findAdmin(id) });
}

export async function update(req, res) {
  const id = toInt(req.params.id);
  const ok = await Product.update(id, await parseProduct(req.body));
  if (!ok) throw new HttpError(404, 'not_found');
  invalidate('catalog');
  res.json({ product: await Product.findAdmin(id) });
}

export async function remove(req, res) {
  const ok = await Product.remove(toInt(req.params.id));
  if (!ok) throw new HttpError(404, 'not_found');
  invalidate('catalog');
  res.json({ ok: true });
}

export async function categories(req, res) {
  res.json({ categories: await Category.listAll() });
}

export async function upload(req, res) {
  if (!req.file) throw new HttpError(400, 'no_file');
  const saved = await saveImage(req.file.buffer, req.file.mimetype, 'p');
  res.status(201).json({ url: saved.url });
}
