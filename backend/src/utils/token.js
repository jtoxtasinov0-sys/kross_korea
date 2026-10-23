// Admin tokeni: base64url(payload).HMAC-SHA256 imzo — qo'shimcha kutubxonasiz
import crypto from 'node:crypto';

const sign = (body, secret) => crypto.createHmac('sha256', secret).update(body).digest('base64url');

export function signToken(payload, secret, ttlSec) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSec })).toString(
    'base64url',
  );
  return `${body}.${sign(body, secret)}`;
}

/** To'g'ri va muddati o'tmagan bo'lsa payload, aks holda null */
export function verifyToken(token, secret) {
  const [body, sig] = String(token || '').split('.');
  if (!body || !sig) return null;
  const expected = sign(body, secret);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.exp > Date.now() / 1000 ? payload : null;
  } catch {
    return null;
  }
}

/**
 * Sayt mijozini botga bog'lash kodi: w<id>_<imzo>. t.me/<bot>?start=<kod> havolasida ketadi
 * (Telegram: ≤64 belgi, faqat A-Z a-z 0-9 _ -). Imzosiz ID'ni birov o'zgartirib bo'lmaydi.
 */
export const linkCode = (userId, secret) => `w${userId}_${sign(`link:${userId}`, secret).slice(0, 16)}`;

/** To'g'ri kod bo'lsa mijoz ID'si, aks holda null */
export function parseLinkCode(code, secret) {
  const m = /^w(\d{1,12})_[\w-]{16}$/.exec(String(code || ''));
  if (!m || !secret) return null;
  const a = Buffer.from(code);
  const b = Buffer.from(linkCode(Number(m[1]), secret));
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? Number(m[1]) : null;
}

/** Parol o'zgarsa eski tokenlar bekor bo'lishi uchun — parolning qisqa izi */
export const passwordStamp = (password) =>
  crypto.createHash('sha256').update(String(password)).digest('hex').slice(0, 12);
