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

// Brauzerdan buyurtma: bitta IP'dan soatiga 5 ta (Telegram buyurtmalariga ta'sir qilmaydi)
export const browserOrderLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  skip: (req) => req.via === 'telegram',
});
