// Admin: sozlamalar — bo'limlar bo'yicha karta rekvizitlari, yetkazish, do'kon ma'lumotlari, panel paroli
import { config } from '../config/default.js';
import { invalidate } from '../core/cache.js';
import { HttpError } from '../middlewares/error.middleware.js';
import { cleanLines, cleanText, intInRange } from '../utils/validate.js';
import * as Setting from '../models/Setting.js';
import { issuePasswordToken } from './adminAuthController.js';

const CARD = /^[0-9 -]{8,40}$/;
const USERNAME = /^[A-Za-z0-9_]{4,32}$/;
const URL = /^https:\/\/\S+$/;

// Har maydon: tozalovchi funksiya → qiymat yoki xato (undefined)
const RULES = {
  shopName: (v) => (cleanText(v, 60).length >= 2 ? cleanText(v, 60) : undefined),
  phone: (v) => (cleanText(v, 30).length >= 7 ? cleanText(v, 30) : undefined),
  supportUsername: (v) => {
    const u = cleanText(v, 40).replace(/^@/, '');
    return USERNAME.test(u) ? u : undefined;
  },
  instagramUrl: (v) => (URL.test(cleanText(v, 200)) ? cleanText(v, 200) : undefined),
  channelUrl: (v) => (URL.test(cleanText(v, 200)) ? cleanText(v, 200) : undefined),
  payUzBank: (v) => cleanText(v, 60) || undefined,
  payUzCard: (v) => (CARD.test(cleanText(v, 40)) ? cleanText(v, 40) : undefined),
  payUzHolder: (v) => cleanText(v, 60) || undefined,
  prepayUz: (v) => intInRange(v, 1, 100) ?? undefined,
  deliveryUzFee: (v) => intInRange(v, 0, 100000) ?? undefined,
  deliveryUzDays: (v) => cleanText(v, 20) || undefined,
  uzsRate: (v) => intInRange(v, 0, 1000000) ?? undefined,
  payKrBank: (v) => cleanText(v, 60) || undefined,
  payKrCard: (v) => (CARD.test(cleanText(v, 40)) ? cleanText(v, 40) : undefined),
  payKrHolder: (v) => cleanText(v, 60) || undefined,
  prepayKr: (v) => intInRange(v, 1, 100) ?? undefined,
  deliveryKrFee: (v) => intInRange(v, 0, 10000000) ?? undefined,
  deliveryKrFreeFrom: (v) => intInRange(v, 0, 100000000) ?? undefined,
  deliveryKrDays: (v) => cleanText(v, 20) || undefined,
  webAppUrl: (v) => (cleanText(v, 200) === '' ? null : URL.test(cleanText(v, 200)) ? cleanText(v, 200) : undefined),
  adminUrl: (v) => (cleanText(v, 200) === '' ? null : URL.test(cleanText(v, 200)) ? cleanText(v, 200) : undefined),
  // Bo'sh — .env dagi ADMIN_PASSWORD ishlatiladi
  panelPassword: (v) => {
    const p = String(v ?? '').trim();
    if (!p) return null;
    return p.length >= 10 && p.length <= 100 ? p : undefined;
  },
  aboutUz: (v) => cleanLines(v, 1000),
  aboutRu: (v) => cleanLines(v, 1000),
  isOpen: (v) => (typeof v === 'boolean' ? v : undefined),
  stockVisible: (v) => (typeof v === 'boolean' ? v : undefined),
  browserAccess: (v) => (typeof v === 'boolean' ? v : undefined),
};

export async function get(req, res) {
  const settings = Setting.toAdmin(await Setting.get());
  res.json({ settings, envPasswordSet: !!config.adminPassword });
}

export async function update(req, res) {
  const body = req.body || {};
  const fields = [];
  const values = {};
  for (const [key, rule] of Object.entries(RULES)) {
    if (body[key] === undefined) continue;
    const value = rule(body[key]);
    if (value === undefined) fields.push(key);
    else values[key] = value;
  }
  if (fields.length) throw new HttpError(400, 'validation', { fields });
  if (values.panelPassword === null && !config.adminPassword) throw new HttpError(400, 'validation', { fields: ['panelPassword'] });

  const saved = await Setting.update(values);
  invalidate('catalog');

  // Parol o'zgardi — parol bilan kirgan adminning eski tokeni bekor, yangisini beramiz
  let token;
  if (values.panelPassword !== undefined && req.admin.via === 'password') {
    token = issuePasswordToken(saved.panel_password || config.adminPassword);
  }
  res.json({ settings: Setting.toAdmin(saved), envPasswordSet: !!config.adminPassword, token });
}
