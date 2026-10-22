// Savat → buyurtma: narxlar serverda qayta hisoblanadi (mijoz yuborgan narxga ishonilmaydi),
// zaxira tekshiriladi va kamaytiriladi, yetkazish va oldindan to'lov bo'lim qoidasidan olinadi.
import { SHOP } from '../config/default.js';
import { tx } from '../database/connection.js';
import { HttpError } from '../middlewares/error.middleware.js';
import { makeOrderNumber, normalizeRegion } from '../utils/format.js';
import { cleanText, normalizePhone, isFullAddress, toInt } from '../utils/validate.js';
import * as Order from '../models/Order.js';
import * as User from '../models/User.js';
import * as Setting from '../models/Setting.js';

/** [{productId, variantId, qty}] → tozalangan, bir xil variantlar qo'shilgan */
export function normalizeItems(raw) {
  if (!Array.isArray(raw) || raw.length === 0) throw new HttpError(400, 'empty_cart');
  const merged = new Map();
  for (const item of raw.slice(0, SHOP.maxLines)) {
    const productId = toInt(item?.productId);
    const variantId = toInt(item?.variantId);
    const qty = Math.min(Math.max(toInt(item?.qty, 1), 1), SHOP.maxQtyPerLine);
    if (!productId || !variantId) throw new HttpError(400, 'bad_item');
    const prev = merged.get(variantId);
    merged.set(variantId, {
      productId,
      variantId,
      qty: Math.min((prev?.qty || 0) + qty, SHOP.maxQtyPerLine),
    });
  }
  return [...merged.values()];
}

/** Mijoz ma'lumotlari: xato maydonlar ro'yxati bilan 400 qaytaradi */
export function normalizeCustomer(raw = {}, region) {
  const c = {
    name: cleanText(raw.name, 80),
    phone: normalizePhone(raw.phone, region),
    city: cleanText(raw.city, 80),
    street: cleanText(raw.street, 200),
    detail: cleanText(raw.detail, 200),
    zipCode: cleanText(raw.zipCode, 10),
  };
  const fields = [];
  if (c.name.length < 2) fields.push('name');
  if (!c.phone) fields.push('phone');
  if (region === 'uz' && c.city.length < 2) fields.push('city');
  if (!isFullAddress(c.street)) fields.push('street');
  if (c.zipCode && !/^\d{5,6}$/.test(c.zipCode)) fields.push('zipCode');
  if (fields.length) throw new HttpError(400, 'validation', { fields });
  return c;
}

export async function createOrder(user, body = {}) {
  const region = normalizeRegion(body.region);
  const lines = normalizeItems(body.items);
  const customer = normalizeCustomer(body.customer, region);
  const comment = cleanText(body.comment, 500) || null;

  const settings = await Setting.get();
  if (!settings.is_open) throw new HttpError(409, 'closed');
  const rules = Setting.regionRules(settings, region);

  const order = await tx(async (client) => {
    const { rows } = await client.query(
      `SELECT v.id, v.product_id, v.label, v.stock,
              p.name_uz, p.name_ru, p.brand, p.price_krw, p.price_usd, p.is_active,
              (SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY i.sort_order, i.id LIMIT 1) AS image
         FROM product_variants v JOIN products p ON p.id = v.product_id
        WHERE v.id = ANY($1::int[])
        FOR UPDATE OF v`,
      [lines.map((l) => l.variantId)],
    );
    const byId = new Map(rows.map((r) => [r.id, r]));

    const items = lines.map((line) => {
      const row = byId.get(line.variantId);
      if (!row || row.product_id !== line.productId || !row.is_active) {
        throw new HttpError(409, 'unavailable', { productId: line.productId });
      }
      if (row.stock < line.qty) {
        throw new HttpError(409, 'stock', { productId: line.productId, variantId: line.variantId, left: row.stock });
      }
      return {
        productId: row.product_id,
        variantId: row.id,
        name: row.name_uz,
        nameRu: row.name_ru,
        brand: row.brand,
        variant: row.label,
        price: region === 'kr' ? row.price_krw : row.price_usd,
        qty: line.qty,
        image: row.image,
      };
    });

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const deliveryFee = rules.freeFrom && subtotal >= rules.freeFrom ? 0 : rules.deliveryFee;
    const total = subtotal + deliveryFee;
    const percent = Math.min(Math.max(rules.prepay, 1), 100);
    const prepayAmount = Math.ceil((total * percent) / 100);

    for (const i of items) {
      await client.query('UPDATE product_variants SET stock = stock - $1 WHERE id = $2', [i.qty, i.variantId]);
    }

    // Raqam takrorlansa (juda kam) — qayta urinamiz
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const { rows: inserted } = await client.query(
        `INSERT INTO orders (order_number, user_id, region, items, subtotal, delivery_fee, total, prepay_amount,
            customer_name, phone, city, street, detail, zip_code, comment)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         ON CONFLICT (order_number) DO NOTHING
         RETURNING *`,
        [
          makeOrderNumber(), user.id, region, JSON.stringify(items), subtotal, deliveryFee, total, prepayAmount,
          customer.name, customer.phone, customer.city || null, customer.street, customer.detail || null,
          customer.zipCode || null, comment,
        ],
      );
      if (inserted[0]) return Order.map(inserted[0]);
    }
    throw new Error('Buyurtma raqamini yaratib bo\'lmadi');
  });

  if (body.saveAddress) await User.saveAddress(user.id, region, customer);
  if (!user.phone) await User.update(user.id, { phone: customer.phone });
  return order;
}
