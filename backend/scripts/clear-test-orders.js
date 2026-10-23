// Brauzer (web_) orqali berilgan sinov buyurtmalarini o'chirish: zaxira tiklanadi,
// cheklar va mehmon mijozlar o'chiriladi. Telegram mijozlariga tegilmaydi.
// Sayt ochiq — web_ mijozlar orasida haqiqiylari ham bor, shuning uchun faqat ko'rsatilgan mehmonlar:
//   node scripts/clear-test-orders.js <mehmon-id> [<mehmon-id> ...]
// Mehmon ID — brauzerdagi localStorage "kross-guest-id" qiymati (bazada web_<id>).
import { pool, tx } from '../src/database/connection.js';
import { logger } from '../src/utils/logger.js';

const guests = process.argv.slice(2).map((id) => `web_${id.replace(/^web_/, '')}`);
if (!guests.length) {
  logger.error("Mehmon ID berilmadi: node scripts/clear-test-orders.js <mehmon-id> [...]");
  process.exit(1);
}

const result = await tx(async (client) => {
  const { rows: orders } = await client.query(
    `SELECT o.id, o.items, o.status, o.receipt_url FROM orders o
       JOIN users u ON u.id = o.user_id
      WHERE u.telegram_id = ANY($1)`,
    [guests],
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
  const users = await client.query('DELETE FROM users WHERE telegram_id = ANY($1)', [guests]);
  return { orders: orders.length, users: users.rowCount };
});

logger.info(`🧹 ${result.orders} ta sinov buyurtma va ${result.users} ta mehmon o'chirildi, zaxira tiklandi`);
await pool.end();
