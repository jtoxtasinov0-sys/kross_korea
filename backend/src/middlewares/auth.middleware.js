// Foydalanuvchini aniqlash: Telegram initData (imzo tekshiriladi) yoki brauzer mehmoni
import { config } from '../config/default.js';
import { verifyInitData } from '../utils/telegramAuth.js';
import { passwordStamp, verifyToken } from '../utils/token.js';
import * as User from '../models/User.js';
import * as Setting from '../models/Setting.js';
import { HttpError } from './error.middleware.js';

// Tekshirilgan initData qisqa muddat eslab qolinadi — har so'rovda bazaga yozilmaydi
const sessions = new Map();
const SESSION_MS = 5 * 60 * 1000;
const GUEST_RE = /^[a-z0-9]{12,40}$/i;

const isLocal = (req) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);

async function fromInitData(initData) {
  const key = new URLSearchParams(initData).get('hash');
  const hit = key && sessions.get(key);
  if (hit && hit.expires > Date.now()) return hit;

  const verified = verifyInitData(initData, config.botToken);
  if (!verified) return null;
  const user = await User.upsertTelegramUser(verified.user);
  const session = { user, startParam: verified.startParam, expires: Date.now() + SESSION_MS };
  sessions.set(key, session);
  if (sessions.size > 5000) sessions.delete(sessions.keys().next().value);
  return session;
}

export async function telegramAuth(req, res, next) {
  const initData = req.get('x-telegram-init-data');
  if (initData) {
    const session = await fromInitData(initData);
    if (!session) throw new HttpError(401, 'auth');
    req.user = session.user;
    req.via = 'telegram';
    return next();
  }

  // Faqat localhost'dan test rejimi
  if (config.skipInitDataCheck && isLocal(req)) {
    req.user = await User.upsertTelegramUser({ id: config.devTelegramId, first_name: 'Dev' });
    req.via = 'telegram';
    return next();
  }

  const guestId = req.get('x-guest-id');
  if (guestId && GUEST_RE.test(guestId)) {
    // Saytda ochiq yoki yo'q — admin panel sozlamasi
    if (!(await Setting.get()).browser_access) throw new HttpError(403, 'browser_closed');
    req.user = await User.upsertGuest(guestId);
    req.via = 'browser';
    return next();
  }

  throw new HttpError(401, 'auth');
}

/**
 * Admin API himoyasi: Authorization: Bearer <token>.
 * Parol bilan olingan token parol o'zgarsa bekor bo'ladi; Telegram tokeni — admin huquqi olib tashlansa.
 */
export async function requireAdmin(req, res, next) {
  const token = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const payload = verifyToken(token, config.jwtSecret);
  if (!payload) throw new HttpError(401, 'admin_auth');

  if (payload.via === 'password') {
    const settings = await Setting.get();
    const password = settings.panel_password || config.adminPassword;
    if (!password || payload.pv !== passwordStamp(password)) throw new HttpError(401, 'admin_auth');
  } else {
    const user = await User.findById(payload.uid);
    if (!user?.isAdmin) throw new HttpError(401, 'admin_auth');
    req.adminUser = user;
  }
  req.admin = payload;
  return next();
}

/** Foydalanuvchi ma'lumoti o'zgarganda sessiya keshini yangilash */
export function refreshSessionUser(user) {
  for (const s of sessions.values()) if (s.user.id === user.id) s.user = user;
}
