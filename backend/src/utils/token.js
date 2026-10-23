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

/** Parol o'zgarsa eski tokenlar bekor bo'lishi uchun — parolning qisqa izi */
export const passwordStamp = (password) =>
  crypto.createHash('sha256').update(String(password)).digest('hex').slice(0, 12);
