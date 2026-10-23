// Buyurtmalar va ularning holatlari
import { query, tx } from '../database/connection.js';
import { HttpError } from '../middlewares/error.middleware.js';

export const STATUSES = ['PENDING_PAYMENT', 'RECEIPT_SENT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
// Hali to'lanmagan — chek shu holatlardagi buyurtmaga biriktiriladi
export const UNPAID = ['PENDING_PAYMENT', 'RECEIPT_SENT'];

export const schema = `
CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  order_number     TEXT UNIQUE NOT NULL,             -- KK-251023-4821
  user_id          INT REFERENCES users(id) ON DELETE SET NULL,
  region           TEXT NOT NULL,                    -- uz ($) | kr (₩)
  items            JSONB NOT NULL,                   -- [{productId, variantId, name, brand, variant, price, qty, image}]
  subtotal         INT NOT NULL,
  delivery_fee     INT NOT NULL DEFAULT 0,
  total            INT NOT NULL,
  prepay_amount    INT NOT NULL,                     -- hozir to'lanadigan qism
  status           TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
  customer_name    TEXT NOT NULL,
  phone            TEXT NOT NULL,
  city             TEXT,
  street           TEXT NOT NULL,
  detail           TEXT,
  zip_code         TEXT,
  comment          TEXT,
  receipt_url      TEXT,
  tracking_number  TEXT,
  admin_note       TEXT,
  address_fix      BOOLEAN NOT NULL DEFAULT false,   -- admin manzilni qayta so'ragan
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_user_idx ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders(status, created_at DESC);
`;

export const map = (r) =>
  r && {
    id: r.id,
    orderNumber: r.order_number,
    userId: r.user_id,
    region: r.region,
    items: r.items,
    subtotal: r.subtotal,
    deliveryFee: r.delivery_fee,
    total: r.total,
    prepayAmount: r.prepay_amount,
    status: r.status,
    customerName: r.customer_name,
    phone: r.phone,
    city: r.city,
    street: r.street,
    detail: r.detail,
    zipCode: r.zip_code,
    comment: r.comment,
    receiptUrl: r.receipt_url,
    trackingNumber: r.tracking_number,
    addressFix: r.address_fix,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };

export async function findById(id) {
  const { rows } = await query('SELECT * FROM orders WHERE id = $1', [id]);
  return map(rows[0]);
}

// userIds — bitta ID yoki ro'yxat (botda: Telegram mijozi + unga bog'langan sayt mijozlari)
export async function listByUser(userIds, limit = 30) {
  const { rows } = await query('SELECT * FROM orders WHERE user_id = ANY($1) ORDER BY created_at DESC LIMIT $2', [
    [].concat(userIds),
    limit,
  ]);
  return rows.map(map);
}

export async function latestUnpaid(userIds) {
  const { rows } = await query(
    `SELECT * FROM orders WHERE user_id = ANY($1) AND status = ANY($2) ORDER BY created_at DESC LIMIT 1`,
    [[].concat(userIds), UNPAID],
  );
  return map(rows[0]);
}

export async function attachReceipt(id, receiptUrl) {
  const { rows } = await query(
    `UPDATE orders SET receipt_url = $2, status = 'RECEIPT_SENT', updated_at = now()
      WHERE id = $1 AND status = ANY($3) RETURNING *`,
    [id, receiptUrl, UNPAID],
  );
  return map(rows[0]);
}

/** Holatni faqat kutilgan holatlardan o'zgartiradi — ikki admin bir vaqtda bossa ham bir marta ishlaydi */
export async function setStatus(id, status, { from = null, trackingNumber } = {}) {
  const params = [id, status];
  let where = 'id = $1';
  if (from) {
    params.push(from);
    where += ` AND status = ANY($${params.length})`;
  }
  let extra = '';
  if (trackingNumber !== undefined) {
    params.push(trackingNumber);
    extra = `, tracking_number = $${params.length}`;
  }
  const { rows } = await query(
    `UPDATE orders SET status = $2${extra}, updated_at = now() WHERE ${where} RETURNING *`,
    params,
  );
  return map(rows[0]);
}

// ---------- Admin ----------

const mapAdmin = (r) =>
  r && {
    ...map(r),
    adminNote: r.admin_note,
    username: r.username,
    telegramId: r.telegram_id,
    isWeb: String(r.telegram_id || '').startsWith('web_'),
    isBlocked: !!r.is_blocked,
  };

const ADMIN_SELECT = `SELECT o.*, u.username, u.telegram_id, u.is_blocked
  FROM orders o LEFT JOIN users u ON u.id = o.user_id`;

/** Ro'yxat: holat (yoki PENDING — to'lanmaganlar), bo'lim va qidiruv bo'yicha */
export async function listAdmin({ status, region, q, limit = 50, offset = 0 } = {}) {
  const where = [];
  const params = [];
  if (status === 'PENDING') where.push(`o.status = ANY('{PENDING_PAYMENT,RECEIPT_SENT}')`);
  else if (STATUSES.includes(status)) {
    params.push(status);
    where.push(`o.status = $${params.length}`);
  }
  if (region === 'uz' || region === 'kr') {
    params.push(region);
    where.push(`o.region = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    const n = params.length;
    where.push(`(o.order_number ILIKE $${n} OR o.customer_name ILIKE $${n} OR o.phone ILIKE $${n} OR u.username ILIKE $${n})`);
  }
  params.push(limit, offset);
  const { rows } = await query(
    `${ADMIN_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY o.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params,
  );
  return rows.map(mapAdmin);
}

export async function findAdmin(id) {
  const { rows } = await query(`${ADMIN_SELECT} WHERE o.id = $1`, [id]);
  return mapAdmin(rows[0]);
}

export async function statusCounts() {
  const { rows } = await query('SELECT status, COUNT(*) AS n FROM orders GROUP BY status');
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}

/**
 * Holatni o'zgartirish. Bekor qilinsa — zaxira qaytariladi; bekor qilingandan qayta tiklansa —
 * zaxira yana kamaytiriladi (yetmasa 409).
 */
export async function changeStatus(id, status, { trackingNumber, adminNote } = {}) {
  if (!STATUSES.includes(status)) throw new HttpError(400, 'bad_status');
  return tx(async (client) => {
    const { rows } = await client.query('SELECT * FROM orders WHERE id = $1 FOR UPDATE', [id]);
    const order = rows[0];
    if (!order) throw new HttpError(404, 'not_found');

    const wasCancelled = order.status === 'CANCELLED';
    const willCancel = status === 'CANCELLED';
    if (!wasCancelled && willCancel) {
      for (const i of order.items) {
        await client.query('UPDATE product_variants SET stock = stock + $1 WHERE id = $2', [i.qty, i.variantId]);
      }
    } else if (wasCancelled && !willCancel) {
      for (const i of order.items) {
        const res = await client.query(
          'UPDATE product_variants SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
          [i.qty, i.variantId],
        );
        if (!res.rowCount) throw new HttpError(409, 'stock', { name: i.name, variant: i.variant });
      }
    }

    await client.query(
      `UPDATE orders SET status = $2,
          tracking_number = COALESCE($3, tracking_number),
          admin_note = COALESCE($4, admin_note),
          updated_at = now()
        WHERE id = $1`,
      [id, status, trackingNumber ?? null, adminNote ?? null],
    );
    return { previous: order.status };
  });
}

export async function updateNotes(id, { trackingNumber, adminNote }) {
  await query(
    `UPDATE orders SET tracking_number = $2, admin_note = $3, updated_at = now() WHERE id = $1`,
    [id, trackingNumber || null, adminNote || null],
  );
}

// To'langan deb hisoblanadigan holatlar — tushum shulardan
const PAID = `('CONFIRMED','SHIPPED','DELIVERED')`;
const TODAY = `o.created_at >= (date_trunc('day', now() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul')`;

export async function stats() {
  const { rows } = await query(
    `SELECT COUNT(*) AS total,
            COUNT(*) FILTER (WHERE ${TODAY}) AS today,
            COUNT(*) FILTER (WHERE status IN ('PENDING_PAYMENT','RECEIPT_SENT')) AS pending,
            COUNT(*) FILTER (WHERE status = 'RECEIPT_SENT') AS receipts,
            COALESCE(SUM(total) FILTER (WHERE region = 'uz' AND status IN ${PAID}), 0) AS revenue_uz,
            COALESCE(SUM(total) FILTER (WHERE region = 'kr' AND status IN ${PAID}), 0) AS revenue_kr,
            COALESCE(SUM(total) FILTER (WHERE region = 'uz' AND status IN ${PAID} AND ${TODAY}), 0) AS today_uz,
            COALESCE(SUM(total) FILTER (WHERE region = 'kr' AND status IN ${PAID} AND ${TODAY}), 0) AS today_kr
       FROM orders o`,
  );
  const r = rows[0];
  return {
    total: r.total,
    today: r.today,
    pending: r.pending,
    receipts: r.receipts,
    revenue: { uz: r.revenue_uz, kr: r.revenue_kr },
    revenueToday: { uz: r.today_uz, kr: r.today_kr },
  };
}

export async function topProducts(limit = 5) {
  const { rows } = await query(
    `SELECT (item->>'productId')::int AS product_id,
            MAX(item->>'brand') AS brand, MAX(item->>'name') AS name, MAX(item->>'image') AS image,
            SUM((item->>'qty')::int) AS qty
       FROM orders, jsonb_array_elements(items) AS item
      WHERE status <> 'CANCELLED'
      GROUP BY 1 ORDER BY qty DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => ({ productId: r.product_id, brand: r.brand, name: r.name, image: r.image, qty: r.qty }));
}

/** Eng ko'p sotilgan mahsulotlar — buyurtmalar items JSON'idan */
export async function bestsellerIds(limit = 12) {
  const { rows } = await query(
    `SELECT (item->>'productId')::int AS id, SUM((item->>'qty')::int) AS qty
       FROM orders, jsonb_array_elements(items) AS item
      WHERE status <> 'CANCELLED'
      GROUP BY 1 ORDER BY 2 DESC LIMIT $1`,
    [limit],
  );
  return rows.map((r) => r.id);
}
