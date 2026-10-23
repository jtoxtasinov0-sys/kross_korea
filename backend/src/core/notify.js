// Mijoz va adminlarga bot orqali xabarlar: yangi buyurtma, chek, holat o'zgarishi
import { InlineKeyboard, InputFile } from 'grammy';
import { adminPanelUrl, bot } from './bot.js';
import { logger } from '../utils/logger.js';
import { money, escapeHtml } from '../utils/format.js';
import { t, statusText } from '../locales/index.js';
import { orderKeyboard, confirmKeyboard } from '../utils/keyboards.js';
import * as User from '../models/User.js';
import * as Setting from '../models/Setting.js';

const REGION_LABEL = { uz: "🇺🇿 O'zbekiston", kr: '🇰🇷 Koreya' };

/**
 * Xabar yuborishda xato bo'lsa server yiqilmaydi; mijoz botni bloklagan bo'lsa belgilanadi.
 * Sayt mijoziga — faqat u botdagi havolani bosib, Telegram chatini bog'lagan bo'lsa.
 */
async function safeSend(user, fn) {
  const chatId = User.chatIdOf(user);
  if (!bot || !chatId) return { delivered: false };
  try {
    const message = await fn(chatId);
    return { delivered: true, message };
  } catch (err) {
    if (err?.error_code === 403 && !User.isWebUser(user)) await User.update(user.id, { isBlocked: true }).catch(() => {});
    logger.warn(`Xabar yetmadi (${chatId}):`, err?.description || err.message);
    return { delivered: false };
  }
}

const keyboardFor = (user, lang, settings, order) =>
  orderKeyboard(lang, settings, order, { inApp: !User.isWebUser(user) });

const itemLines = (order, lang) =>
  order.items
    .map((i) => `• ${escapeHtml(`${i.brand} ${lang === 'ru' ? i.nameRu || i.name : i.name}`)} — ${escapeHtml(i.variant)} mm × ${i.qty} — ${money(i.price * i.qty, order.region)}`)
    .join('\n');

const prepayLine = (order, lang) =>
  order.prepayAmount >= order.total
    ? t(lang, 'prepayFull')
    : t(lang, 'prepayPart', {
        amount: money(order.prepayAmount, order.region),
        percent: Math.floor((order.prepayAmount / order.total) * 100),
      });

function adminSummary(order, user) {
  const address = [order.city, order.street, order.detail, order.zipCode].filter(Boolean).map(escapeHtml).join(', ');
  return (
    `${REGION_LABEL[order.region]} · № <code>${order.orderNumber}</code>\n` +
    (User.isWebUser(user) ? '🌐 Saytdan berilgan\n' : '') +
    '\n' +
    `👤 ${escapeHtml(order.customerName)}${user?.username ? ` (@${escapeHtml(user.username)})` : ''}\n` +
    `📞 <code>${escapeHtml(order.phone)}</code>\n` +
    `📍 ${address}\n` +
    (order.comment ? `💬 ${escapeHtml(order.comment)}\n` : '') +
    `\n${itemLines(order, 'uz')}\n\n` +
    `💰 Jami: <b>${money(order.total, order.region)}</b>` +
    (order.prepayAmount < order.total ? ` · hozir: <b>${money(order.prepayAmount, order.region)}</b>` : '')
  );
}

async function eachAdmin(fn) {
  for (const chatId of await User.adminChatIds()) {
    try {
      await fn(chatId);
    } catch (err) {
      logger.warn(`Adminga xabar yetmadi (${chatId}):`, err?.description || err.message);
    }
  }
}

/** Mijozga buyurtma tarkibi va to'lov rekvizitlari (sayt mijozi botga ulanganda ham shu yuboriladi) */
export async function orderDetails(order, user) {
  if (!bot) return { delivered: false };
  const settings = await Setting.get();
  const rules = Setting.regionRules(settings, order.region);
  const lang = user?.language;

  return safeSend(user, (chatId) =>
    bot.api.sendMessage(
      chatId,
      t(lang, 'orderCreated', {
        number: order.orderNumber,
        items: itemLines(order, lang),
        total: money(order.total, order.region),
        prepayLine: prepayLine(order, lang),
        bank: escapeHtml(rules.bank),
        card: escapeHtml(rules.card),
        holder: escapeHtml(rules.holder),
      }),
      { parse_mode: 'HTML', reply_markup: keyboardFor(user, lang, settings, order) },
    ),
  );
}

export async function orderCreated(order, user) {
  if (!bot) return;
  await orderDetails(order, user);

  const panel = await adminPanelUrl();
  await eachAdmin((chatId) =>
    bot.api.sendMessage(chatId, `🆕 <b>Yangi buyurtma</b>\n${adminSummary(order, user)}\n\n${statusText('uz', order.status)}`, {
      parse_mode: 'HTML',
      reply_markup: panel ? new InlineKeyboard().webApp('🗂 Admin panelni ochish', panel) : undefined,
    }),
  );
}

/**
 * Chek kelganda: mijozga tasdiq, adminlarga chek rasmi + "✅ Tasdiqlash".
 * photo — Telegram file_id yoki rasm baytlari (Buffer).
 */
export async function receiptReceived(order, user, photo) {
  if (!bot) return;
  const lang = user?.language;
  await safeSend(user, (chatId) =>
    bot.api.sendMessage(chatId, t(lang, 'receiptOk', { number: order.orderNumber }), { parse_mode: 'HTML' }),
  );

  // Baytlar bitta adminga yuklanadi, qolganlariga Telegram file_id bilan ketadi
  let media = Buffer.isBuffer(photo) ? new InputFile(photo, `${order.orderNumber}.jpg`) : photo;
  await eachAdmin(async (chatId) => {
    const sent = await bot.api.sendPhoto(chatId, media, {
      caption: `🧾 <b>Chek keldi</b>\n${adminSummary(order, user)}`.slice(0, 1024),
      parse_mode: 'HTML',
      reply_markup: confirmKeyboard(order.id),
    });
    if (sent.photo?.length) media = sent.photo[sent.photo.length - 1].file_id;
  });
}

const STATUS_MESSAGE = {
  CONFIRMED: 'statusConfirmed',
  SHIPPED: 'statusShipped',
  DELIVERED: 'statusDelivered',
  CANCELLED: 'statusCancelled',
};

/** Holat o'zgarganda mijozga avtomatik xabar. Yetib bordimi — qaytaradi. */
export async function statusChanged(order) {
  const key = STATUS_MESSAGE[order.status];
  if (!bot || !key || !order.userId) return { delivered: false };
  const user = await User.findById(order.userId);
  const settings = await Setting.get();
  const lang = user?.language;
  return safeSend(user, (chatId) =>
    bot.api.sendMessage(
      chatId,
      t(lang, key, { number: order.orderNumber, tracking: order.trackingNumber && escapeHtml(order.trackingNumber) }),
      { parse_mode: 'HTML', reply_markup: keyboardFor(user, lang, settings, order) },
    ),
  );
}
