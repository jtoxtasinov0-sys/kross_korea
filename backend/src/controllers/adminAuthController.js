// Admin panelga kirish: (1) Telegram ichida — initData orqali parolsiz, faqat adminlar;
// (2) brauzerdan — parol. Parol bilan 5 marta xato → IP 15 daqiqaga bloklanadi.
import { config } from '../config/default.js';
import { HttpError } from '../middlewares/error.middleware.js';
import { verifyInitData } from '../utils/telegramAuth.js';
import { passwordStamp, signToken } from '../utils/token.js';
import * as User from '../models/User.js';
import * as Setting from '../models/Setting.js';

const TOKEN_TTL = 7 * 24 * 3600;
const MAX_FAILS = 5;
const BLOCK_MS = 15 * 60 * 1000;
const fails = new Map(); // ip → { count, until }

export async function currentPassword() {
  const settings = await Setting.get();
  return settings.panel_password || config.adminPassword;
}

export async function loginWithPassword(req, res) {
  const ip = req.ip;
  const entry = fails.get(ip);
  if (entry?.until > Date.now()) {
    throw new HttpError(429, 'blocked', { minutes: Math.ceil((entry.until - Date.now()) / 60000) });
  }

  const expected = await currentPassword();
  const password = String(req.body?.password ?? '');
  if (!expected || password !== expected) {
    const count = (entry?.until && entry.until < Date.now() ? 0 : entry?.count || 0) + 1;
    fails.set(ip, { count, until: count >= MAX_FAILS ? Date.now() + BLOCK_MS : 0 });
    throw new HttpError(401, 'wrong_password', { left: Math.max(0, MAX_FAILS - count) });
  }

  fails.delete(ip);
  res.json({ token: issuePasswordToken(expected), name: 'Admin' });
}

/** Parol bilan kirgan admin uchun token (parol o'zgarganda yangisi beriladi) */
export const issuePasswordToken = (password) =>
  signToken({ via: 'password', pv: passwordStamp(password) }, config.jwtSecret, TOKEN_TTL);

export async function loginWithTelegram(req, res) {
  const verified = verifyInitData(req.get('x-telegram-init-data'), config.botToken);
  if (!verified) throw new HttpError(401, 'auth');
  const user = await User.upsertTelegramUser(verified.user);
  if (!user.isAdmin) throw new HttpError(403, 'not_admin');
  const token = signToken({ via: 'telegram', uid: user.id }, config.jwtSecret, TOKEN_TTL);
  res.json({ token, name: user.firstName || 'Admin' });
}
