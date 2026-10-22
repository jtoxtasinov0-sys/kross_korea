// Pul, sana, buyurtma raqami va HTML formatlash
import { SHOP } from '../config/default.js';

export const normalizeRegion = (r) => (r === 'kr' ? 'kr' : 'uz');

// kr → ₩271,500   uz → $199
export function money(amount, region) {
  const n = Math.round(Number(amount) || 0);
  return region === 'kr' ? `₩${n.toLocaleString('ko-KR')}` : `$${n.toLocaleString('en-US')}`;
}

export function escapeHtml(value = '') {
  return String(value).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
  );
}

// Koreya vaqti bo'yicha YYMMDD
export function seoulDateStamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SHOP.timezone,
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '00';
  return `${get('year')}${get('month')}${get('day')}`;
}

// KK-251023-4821
export function makeOrderNumber() {
  const tail = String(Math.floor(1000 + Math.random() * 9000));
  return `${SHOP.orderPrefix}-${seoulDateStamp()}-${tail}`;
}

export function formatDate(date, lang = 'uz') {
  return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
    timeZone: SHOP.timezone,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

// Ismni qisqa va xavfsiz ko'rinishga keltirish
export function displayName(user) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return name || (user?.username ? `@${user.username}` : 'mijoz');
}
