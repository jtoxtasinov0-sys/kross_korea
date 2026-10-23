// Admin: ombor — barcha o'lchamlar qoldig'i bitta jadvalda, birdan saqlash
import { SHOP } from '../config/default.js';
import { invalidate } from '../core/cache.js';
import { HttpError } from '../middlewares/error.middleware.js';
import { intInRange, toInt } from '../utils/validate.js';
import * as Product from '../models/Product.js';
import * as Category from '../models/Category.js';
import * as Setting from '../models/Setting.js';

export async function list(req, res) {
  const [items, categories, settings] = await Promise.all([Product.listStock(), Category.listAll(), Setting.get()]);
  res.json({ items, categories, stockVisible: settings.stock_visible, lowStock: SHOP.lowStock });
}

/** { changes: [{ variantId, stock }], stockVisible? } */
export async function save(req, res) {
  const raw = Array.isArray(req.body?.changes) ? req.body.changes.slice(0, 2000) : [];
  const changes = raw.map((c) => ({ variantId: toInt(c?.variantId), stock: intInRange(c?.stock, 0, 99999) }));
  if (changes.some((c) => !c.variantId || c.stock === null)) throw new HttpError(400, 'validation');

  const updated = changes.length ? await Product.setStocks(changes) : 0;
  if (typeof req.body?.stockVisible === 'boolean') await Setting.update({ stockVisible: req.body.stockVisible });
  invalidate('catalog');
  res.json({ updated });
}
