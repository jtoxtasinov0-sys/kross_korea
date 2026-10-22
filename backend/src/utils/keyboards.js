// Bot tugmalari shablonlari. Asosiy menyu — faqat inline tugmalar
// (pastki web_app klaviaturasi iOS'da initData'ni bo'sh yuborishi mumkin).
import { InlineKeyboard, Keyboard } from 'grammy';
import { t } from '../locales/index.js';
import { webAppUrl } from '../core/bot.js';

const tgLink = (username) => `https://t.me/${String(username).replace(/^@/, '')}`;

export function mainMenu(lang, settings) {
  const kb = new InlineKeyboard();
  const app = webAppUrl();
  if (app) kb.webApp(t(lang, 'btnShop'), app).row();
  kb.text(t(lang, 'btnOrders'), 'menu:orders').text(t(lang, 'btnContact'), 'menu:contact').row();
  kb.url(t(lang, 'btnInstagram'), settings.instagram_url).url(t(lang, 'btnChannel'), settings.channel_url).row();
  kb.text(lang === 'uz' ? "🇺🇿 O'zbekcha ✓" : "🇺🇿 O'zbekcha", 'lang:uz').text(
    lang === 'ru' ? '🇷🇺 Русский ✓' : '🇷🇺 Русский',
    'lang:ru',
  );
  return kb;
}

export const phoneKeyboard = (lang) => new Keyboard().requestContact(t(lang, 'btnSendPhone')).resized().oneTime();

export function contactKeyboard(lang, settings) {
  const digits = settings.phone.replace(/\D/g, '');
  return new InlineKeyboard()
    .url(t(lang, 'btnWhatsapp'), `https://wa.me/${digits}`)
    .url(`✈️ @${settings.support_username}`, tgLink(settings.support_username))
    .row()
    .text(t(lang, 'btnBack'), 'menu:home');
}

/** Holat xabarlari ostidagi tugmalar: ilovada ochish + savol berish */
export function orderKeyboard(lang, settings, order) {
  const kb = new InlineKeyboard();
  const app = webAppUrl();
  if (app) kb.webApp(t(lang, 'btnOrders'), `${app}?order=${order.id}`).row();
  kb.url(t(lang, 'btnAsk'), tgLink(settings.support_username));
  return kb;
}

/** Admin uchun chek xabaridagi tasdiqlash tugmasi */
export const confirmKeyboard = (orderId) => new InlineKeyboard().text('✅ Tasdiqlash', `ok:${orderId}`);
