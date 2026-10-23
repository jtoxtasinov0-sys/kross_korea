// Katalog: kategoriyalar, mahsulotlar, storylar, eng ko'p sotilganlar va ochiq sozlamalar — bitta so'rovda
import { SHOP } from '../config/default.js';
import { cached } from '../core/cache.js';
import { botLink } from '../core/bot.js';
import { HttpError } from '../middlewares/error.middleware.js';
import * as Category from '../models/Category.js';
import * as Product from '../models/Product.js';
import * as Story from '../models/Story.js';
import * as Order from '../models/Order.js';
import * as Setting from '../models/Setting.js';
import { toInt } from '../utils/validate.js';

async function loadCatalog() {
  const [settings, categories, rows, stories, bestIds] = await Promise.all([
    Setting.get(),
    Category.listActive(),
    Product.listActive(),
    Story.listActive(),
    Order.bestsellerIds(12),
  ]);
  const opts = { stockVisible: settings.stock_visible, lowStock: SHOP.lowStock };
  // Rasmi yo'q mahsulot mijozga ko'rsatilmaydi
  const products = rows.map((r) => Product.toClient(r, opts)).filter((p) => p.images.length > 0);

  const byCategory = new Map();
  for (const p of products) {
    if (!byCategory.has(p.categoryId)) byCategory.set(p.categoryId, []);
    byCategory.get(p.categoryId).push(p);
  }
  const productIds = new Set(products.map((p) => p.id));

  return {
    settings: Setting.toPublic(settings),
    categories: categories
      .filter((c) => byCategory.has(c.id))
      .map((c) => ({
        ...c,
        count: byCategory.get(c.id).length,
        imageUrl: c.imageUrl || byCategory.get(c.id)[0].images[0],
      })),
    products,
    stories,
    bestsellerIds: bestIds.filter((id) => productIds.has(id)),
  };
}

export async function getCatalog(req, res) {
  res.json(await cached('catalog', 60_000, loadCatalog));
}

export async function getProduct(req, res) {
  const row = await Product.findById(toInt(req.params.id));
  if (!row || !row.is_active) throw new HttpError(404, 'not_found');
  const settings = await Setting.get();
  res.json({ product: Product.toClient(row, { stockVisible: settings.stock_visible, lowStock: SHOP.lowStock }) });
}

/** Himoyasiz: brauzerda ochish mumkinmi va bot havolasi */
export async function getAccess(req, res) {
  const settings = await Setting.get();
  res.json({ browserAccess: settings.browser_access, botUrl: botLink() });
}
