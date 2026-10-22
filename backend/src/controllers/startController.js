// Bot: /start, asosiy menyu, til, aloqa, buyurtmalarim, telefon raqam
import fs from 'node:fs';
import path from 'node:path';
import { InputFile } from 'grammy';
import { config } from '../config/default.js';
import { webAppUrl } from '../core/bot.js';
import { logger } from '../utils/logger.js';
import { escapeHtml, money, formatDate } from '../utils/format.js';
import { mainMenu, phoneKeyboard, contactKeyboard } from '../utils/keyboards.js';
import { t, statusText } from '../locales/index.js';
import * as User from '../models/User.js';
import * as Order from '../models/Order.js';
import * as Setting from '../models/Setting.js';

const BANNER = path.join(config.assetsDir, 'banner.jpg');
let bannerFileId = null; // Telegram'ga bir marta yuklanadi, keyin file_id

const welcomeText = (user) =>
  t(user.language, 'welcome', { name: escapeHtml(user.firstName || 'do\'st'), hasApp: !!webAppUrl() });

async function sendMenu(ctx, user) {
  const settings = await Setting.get();
  const options = { parse_mode: 'HTML', reply_markup: mainMenu(user.language, settings) };

  if (fs.existsSync(BANNER)) {
    try {
      const msg = await ctx.replyWithPhoto(bannerFileId || new InputFile(BANNER), { ...options, caption: welcomeText(user) });
      bannerFileId = msg.photo.at(-1).file_id;
      return;
    } catch (err) {
      // file_id eskirgan bo'lishi mumkin — keyingi safar fayldan yuklanadi
      logger.warn('Banner ketmadi:', err.description || err.message);
      bannerFileId = null;
    }
  }
  await ctx.reply(welcomeText(user), options);
}

export async function onStart(ctx) {
  const user = ctx.user;
  await sendMenu(ctx, user);
  if (!user.phone) {
    await ctx.reply(t(user.language, 'askPhone'), { reply_markup: phoneKeyboard(user.language) });
  }
}

/** Til tugmasi — yangi xabar emas, shu xabarning o'zi o'giriladi */
export async function onLang(ctx) {
  const lang = ctx.match[1];
  const user = await User.update(ctx.user.id, { language: lang });
  const settings = await Setting.get();
  const markup = mainMenu(lang, settings);
  await ctx.answerCallbackQuery(lang === 'ru' ? 'Русский ✓' : "O'zbekcha ✓");
  try {
    if (ctx.callbackQuery.message?.photo) {
      await ctx.editMessageCaption({ caption: welcomeText(user), parse_mode: 'HTML', reply_markup: markup });
    } else {
      await ctx.editMessageText(welcomeText(user), { parse_mode: 'HTML', reply_markup: markup });
    }
  } catch (err) {
    if (!String(err.description).includes('message is not modified')) throw err;
  }
}

export async function onHome(ctx) {
  await ctx.answerCallbackQuery();
  await sendMenu(ctx, ctx.user);
}

export async function onContact(ctx) {
  await ctx.answerCallbackQuery();
  const settings = await Setting.get();
  await ctx.reply(t(ctx.user.language, 'contact', { phone: escapeHtml(settings.phone) }), {
    parse_mode: 'HTML',
    reply_markup: contactKeyboard(ctx.user.language, settings),
  });
}

export async function onOrders(ctx) {
  await ctx.answerCallbackQuery();
  const lang = ctx.user.language;
  const orders = await Order.listByUser(ctx.user.id, 5);
  if (!orders.length) return ctx.reply(t(lang, 'noOrders'));
  const lines = orders.map(
    (o) =>
      `<code>${o.orderNumber}</code> · ${formatDate(o.createdAt, lang)}\n` +
      `${money(o.total, o.region)} — ${statusText(lang, o.status)}` +
      (o.trackingNumber ? `\n📮 <code>${escapeHtml(o.trackingNumber)}</code>` : ''),
  );
  return ctx.reply(`${t(lang, 'ordersTitle')}\n\n${lines.join('\n\n')}`, { parse_mode: 'HTML' });
}

/** request_contact tugmasi orqali kelgan raqam — faqat o'ziniki qabul qilinadi */
export async function onPhone(ctx) {
  const contact = ctx.message.contact;
  const lang = ctx.user.language;
  if (contact.user_id !== ctx.from.id) return ctx.reply(t(lang, 'phoneNotYours'));
  const phone = contact.phone_number.startsWith('+') ? contact.phone_number : `+${contact.phone_number}`;
  await User.update(ctx.user.id, { phone });
  return ctx.reply(t(lang, 'phoneSaved'), { reply_markup: { remove_keyboard: true } });
}
