// Buyurtmalar va ularning holatlari
import { query } from '../database/connection.js';

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

export async function listByUser(userId, limit = 30) {
  const { rows } = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2', [
    userId,
    limit,
  ]);
  return rows.map(map);
}

export async function latestUnpaid(userId) {
  const { rows } = await query(
    `SELECT * FROM orders WHERE user_id = $1 AND status = ANY($2) ORDER BY created_at DESC LIMIT 1`,
    [userId, UNPAID],
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
