// Bot: admin buyruqlari — /admin PAROL (o'zini admin qilish), /id
import { config } from '../config/default.js';
import * as User from '../models/User.js';
import * as Setting from '../models/Setting.js';

// Parolni taxmin qilishdan himoya: 5 xato → 15 daqiqa
const attempts = new Map();
const LOCK_MS = 15 * 60 * 1000;

export async function onAdmin(ctx) {
  const key = String(ctx.from.id);
  const entry = attempts.get(key);
  if (entry?.lockedUntil > Date.now()) return ctx.reply('⏳ Juda ko\'p urinish. 15 daqiqadan keyin qayta urinib ko\'ring.');

  const password = String(ctx.match || '').trim();
  const settings = await Setting.get();
  const expected = settings.panel_password || config.adminPassword;
  // Xabarda parol qolmasin
  await ctx.deleteMessage().catch(() => {});

  if (!expected || password !== expected) {
    const count = (entry?.count || 0) + 1;
    attempts.set(key, { count, lockedUntil: count >= 5 ? Date.now() + LOCK_MS : 0 });
    return ctx.reply('❌ Parol noto\'g\'ri.');
  }
  attempts.delete(key);
  await User.update(ctx.user.id, { isAdmin: true });
  return ctx.reply('✅ Siz endi adminsiz. Yangi buyurtmalar va cheklar shu chatga keladi.');
}

export function onId(ctx) {
  return ctx.reply(`🆔 Sizning Telegram ID: <code>${ctx.from.id}</code>`, { parse_mode: 'HTML' });
}
