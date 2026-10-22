// Bot: mijoz chekni botga rasm qilib tashlasa — oxirgi to'lanmagan buyurtmaga biriktiriladi.
// Admin "✅ Tasdiqlash" bossa — buyurtma tasdiqlanadi va mijozga xabar ketadi.
import { config } from '../config/default.js';
import { invalidate } from '../core/cache.js';
import { saveImage } from '../core/uploads.js';
import * as notify from '../core/notify.js';
import { escapeHtml } from '../utils/format.js';
import { t, statusText } from '../locales/index.js';
import * as Order from '../models/Order.js';
import * as Setting from '../models/Setting.js';

const IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function downloadTelegramFile(ctx, fileId) {
  const file = await ctx.api.getFile(fileId);
  const res = await fetch(`https://api.telegram.org/file/bot${config.botToken}/${file.file_path}`);
  if (!res.ok) throw new Error(`Telegram fayl yuklanmadi: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

export async function onReceipt(ctx) {
  const msg = ctx.message;
  const doc = msg.document;
  // Rasm emas hujjatlar (pdf va h.k.) — e'tiborsiz
  if (doc && !IMAGE_MIME.has(doc.mime_type)) return;

  const user = ctx.user;
  const order = await Order.latestUnpaid(user.id);
  if (!order) {
    const settings = await Setting.get();
    return ctx.reply(t(user.language, 'receiptNoOrder', { phone: escapeHtml(settings.phone) }), { parse_mode: 'HTML' });
  }

  const fileId = doc ? doc.file_id : msg.photo.at(-1).file_id;
  const buffer = await downloadTelegramFile(ctx, fileId);
  const saved = await saveImage(buffer, doc ? doc.mime_type : 'image/jpeg', 'r');
  const updated = await Order.attachReceipt(order.id, saved.url);
  if (!updated) return ctx.reply(statusText(user.language, order.status));

  // Rasm bo'lsa adminlarga file_id bilan (qayta yuklamasdan), hujjat bo'lsa baytlar bilan
  await notify.receiptReceived(updated, user, doc ? saved.data : fileId);
}

export async function onConfirm(ctx) {
  if (!ctx.user?.isAdmin) return ctx.answerCallbackQuery({ text: 'Faqat adminlar uchun', show_alert: true });

  const orderId = Number(ctx.match[1]);
  const order = await Order.setStatus(orderId, 'CONFIRMED', { from: Order.UNPAID });
  const adminName = escapeHtml(ctx.from.first_name || ctx.from.username || 'admin');
  const caption = ctx.callbackQuery.message?.caption || '';

  if (!order) {
    const current = await Order.findById(orderId);
    await ctx.answerCallbackQuery({ text: `Holati: ${statusText('uz', current?.status)}`, show_alert: true });
    return ctx.editMessageReplyMarkup({ reply_markup: undefined }).catch(() => {});
  }

  invalidate('catalog');
  const { delivered } = await notify.statusChanged(order);
  await ctx.answerCallbackQuery({ text: delivered ? 'Tasdiqlandi, mijozga xabar ketdi' : 'Tasdiqlandi (mijozga bot orqali yetmadi)' });
  await ctx
    .editMessageCaption({ caption: `${escapeHtml(caption)}\n\n✅ Tasdiqlandi — ${adminName}`.slice(0, 1024), parse_mode: 'HTML' })
    .catch(() => ctx.editMessageReplyMarkup({ reply_markup: undefined }).catch(() => {}));
}
