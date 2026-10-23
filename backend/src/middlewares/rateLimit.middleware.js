// Oddiy xotiradagi so'rov cheklagich (bitta server uchun yetarli)
import { HttpError } from './error.middleware.js';

export function rateLimit({ windowMs, max, key = (req) => req.ip, skip = () => false }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
  }, windowMs).unref();

  return (req, res, next) => {
    if (skip(req)) return next();
    const k = key(req);
    const now = Date.now();
    const entry = hits.get(k);
    if (!entry || entry.reset < now) {
      hits.set(k, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.reset - now) / 1000)));
      throw new HttpError(429, 'too_many');
    }
    return next();
  };
}

// Saytdan buyurtma (Telegram buyurtmalariga ta'sir qilmaydi): bitta mijozdan soatiga 5 ta,
// bitta IP'dan 20 ta — mobil operatorlarda ko'p odam bitta IP bilan chiqadi
const HOUR = 60 * 60 * 1000;
const fromTelegram = (req) => req.via === 'telegram';
export const browserOrderLimit = [
  rateLimit({ windowMs: HOUR, max: 5, key: (req) => `user:${req.user.id}`, skip: fromTelegram }),
  rateLimit({ windowMs: HOUR, max: 20, skip: fromTelegram }),
];
