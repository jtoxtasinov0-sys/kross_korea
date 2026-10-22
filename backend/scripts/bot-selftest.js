// Bot handlerlarini Telegram'ga ulanmasdan sinash: soxta update'lar yuboriladi,
// Telegram API chaqiruvlari ushlab qolinadi (hech kimga xabar ketmaydi). Oxirida sinov ma'lumotlari o'chiriladi.
//   node scripts/bot-selftest.js
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../src/config/default.js';
import { bot } from '../src/core/bot.js';
import { pool, query } from '../src/database/connection.js';
import { registerBotRoutes } from '../src/routes/bot.routes.js';
import { createOrder } from '../src/controllers/cartController.js';
import * as User from '../src/models/User.js';

const FAKE_ID = 990000111;
const calls = [];
let messageId = 100;

bot.botInfo = { id: 1, is_bot: true, first_name: 'Test', username: 'kross_korea_bot', can_join_groups: false, can_read_all_group_messages: false, supports_inline_queries: false };
bot.api.config.use(async (prev, method, payload) => {
  calls.push({ method, payload });
  const msg = { message_id: (messageId += 1), date: 0, chat: { id: FAKE_ID, type: 'private' } };
  const result = {
    sendPhoto: { ...msg, photo: [{ file_id: 'PHOTO_ID', file_unique_id: 'u', width: 1, height: 1 }] },
    sendMessage: msg,
    editMessageCaption: msg,
    editMessageText: msg,
    getFile: { file_id: 'RECEIPT', file_unique_id: 'r', file_path: 'photos/receipt.jpg' },
  }[method] ?? true;
  return { ok: true, result };
});

// Telegram fayl serveridan chek rasmini "yuklab olish" — mahalliy rasm qaytariladi
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (String(url).includes('/file/bot')) {
    const data = await fs.readFile(path.resolve(config.root, '..', 'MAHSULOTLAR', 'rasmlar', '02_Nike_65usd.jpg'));
    return new Response(data, { status: 200 });
  }
  return realFetch(url, init);
};

registerBotRoutes(bot);

const from = { id: FAKE_ID, is_bot: false, first_name: 'Sinov', language_code: 'ru', username: 'sinov_user' };
const chat = { id: FAKE_ID, type: 'private', first_name: 'Sinov' };
let updateId = 1;
const message = (extra) => ({ update_id: (updateId += 1), message: { message_id: (messageId += 1), date: 0, chat, from, ...extra } });
const callback = (data, extra = {}) => ({
  update_id: (updateId += 1),
  callback_query: { id: String(updateId), from, chat_instance: 'x', data, message: { message_id: 5, date: 0, chat, ...extra } },
});

const lastCalls = () => calls.splice(0).map((c) => `${c.method}: ${String(c.payload.caption ?? c.payload.text ?? '').split('\n')[0].slice(0, 70)}${c.payload.reply_markup ? ' [tugmalar]' : ''}`);
const step = async (title, update) => {
  await bot.handleUpdate(update);
  console.log(`\n▶ ${title}\n  ${lastCalls().join('\n  ') || '(javob yo‘q)'}`);
};

try {
  await step('/start (yangi mijoz, ruscha Telegram)', message({ text: '/start', entities: [{ type: 'bot_command', offset: 0, length: 6 }] }));
  await step("Til tugmasi → O'zbekcha", callback('lang:uz', { photo: [{ file_id: 'x', file_unique_id: 'x', width: 1, height: 1 }], caption: 'old' }));
  await step('Telefon yuborildi', message({ contact: { phone_number: '821012345678', first_name: 'Sinov', user_id: FAKE_ID } }));
  await step('Buyurtmalarim (bo‘sh)', callback('menu:orders'));
  await step('Aloqa', callback('menu:contact'));
  await step('Chek rasm — buyurtma yo‘q', message({ photo: [{ file_id: 'RECEIPT', file_unique_id: 'r', width: 10, height: 10 }] }));

  // Buyurtma yaratib, chekni botga tashlash
  const user = await User.findByTelegramId(FAKE_ID);
  const { rows } = await query('SELECT id, product_id FROM product_variants WHERE product_id = 5 ORDER BY sort_order LIMIT 1');
  const order = await createOrder(user, {
    region: 'kr',
    items: [{ productId: rows[0].product_id, variantId: rows[0].id, qty: 1 }],
    customer: { name: 'Sinov Mijoz', phone: '010-1234-5678', street: 'Seoul Mapo-gu 12', detail: '3층' },
  });
  console.log(`\n▶ Buyurtma yaratildi: ${order.orderNumber}, jami ${order.total}`);

  await User.update(user.id, { isAdmin: true }); // o'zi admin — chek xabari unga ham keladi
  await step('Chek rasm — buyurtmaga biriktiriladi', message({ photo: [{ file_id: 'RECEIPT', file_unique_id: 'r', width: 10, height: 10 }] }));
  await step('Admin "✅ Tasdiqlash"', callback(`ok:${order.id}`, { photo: [{ file_id: 'x', file_unique_id: 'x', width: 1, height: 1 }], caption: 'Chek keldi' }));
  await step('Admin yana bosdi (allaqachon tasdiqlangan)', callback(`ok:${order.id}`, { caption: 'Chek keldi' }));
  await step('Buyurtmalarim (1 ta)', callback('menu:orders'));
  await step('/admin noto‘g‘ri parol', message({ text: '/admin xato', entities: [{ type: 'bot_command', offset: 0, length: 6 }] }));

  const { rows: final } = await query('SELECT status, receipt_url FROM orders WHERE id = $1', [order.id]);
  console.log(`\n✔ Yakuniy holat: ${final[0].status}, chek: ${final[0].receipt_url ? 'bor' : "yo'q"}`);
} finally {
  // Sinov ma'lumotlarini tozalash
  const { rows: orders } = await query(
    `SELECT o.id, o.items, o.receipt_url FROM orders o JOIN users u ON u.id = o.user_id WHERE u.telegram_id = $1`,
    [String(FAKE_ID)],
  );
  for (const o of orders) {
    for (const i of o.items) await query('UPDATE product_variants SET stock = stock + $1 WHERE id = $2', [i.qty, i.variantId]);
    if (o.receipt_url) await query('DELETE FROM uploaded_files WHERE name = $1', [o.receipt_url.replace('/uploads/', '')]);
  }
  await query('DELETE FROM orders WHERE id = ANY($1::int[])', [orders.map((o) => o.id)]);
  await query('DELETE FROM users WHERE telegram_id = $1', [String(FAKE_ID)]);
  console.log('\n🧹 Sinov ma’lumotlari o‘chirildi');
  await pool.end();
}
