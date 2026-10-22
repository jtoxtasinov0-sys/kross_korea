// Brauzer (web_) orqali berilgan sinov buyurtmalarini o'chirish: zaxira tiklanadi,
// cheklar va mehmon mijozlar o'chiriladi. Telegram mijozlariga tegilmaydi.
//   node scripts/clear-test-orders.js
import { pool, tx } from '../src/database/connection.js';
import { logger } from '../src/utils/logger.js';

const result = await tx(async (client) => {
  const { rows: orders } = await client.query(
    `SELECT o.id, o.items, o.status, o.receipt_url FROM orders o
       JOIN users u ON u.id = o.user_id
      WHERE u.telegram_id LIKE 'web_%'`,
  );
  for (const order of orders) {
    if (order.status !== 'CANCELLED') {
      for (const item of order.items) {
        await client.query('UPDATE product_variants SET stock = stock + $1 WHERE id = $2', [item.qty, item.variantId]);
      }
    }
    if (order.receipt_url) {
      await client.query('DELETE FROM uploaded_files WHERE name = $1', [order.receipt_url.replace('/uploads/', '')]);
    }
  }
  await client.query('DELETE FROM orders WHERE id = ANY($1::int[])', [orders.map((o) => o.id)]);
  const users = await client.query(`DELETE FROM users WHERE telegram_id LIKE 'web_%'`);
  return { orders: orders.length, users: users.rowCount };
});

logger.info(`🧹 ${result.orders} ta sinov buyurtma va ${result.users} ta mehmon o'chirildi, zaxira tiklandi`);
await pool.end();
