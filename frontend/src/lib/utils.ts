// Yordamchi funksiyalar: pul, narx, chegirma, rasm, telefon, rasmni siqish
import type { Product, Region } from '@/types';

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

/** uz → $199   kr → ₩271,500 */
export function formatMoney(amount: number, region: Region) {
  const n = Math.round(amount || 0);
  return region === 'kr' ? `₩${n.toLocaleString('ko-KR')}` : `$${n.toLocaleString('en-US')}`;
}

export const priceOf = (p: Product, region: Region) => (region === 'kr' ? p.priceKrw : p.priceUsd);

export function oldPriceOf(p: Product, region: Region) {
  const old = region === 'kr' ? p.oldPriceKrw : p.oldPriceUsd;
  return old && old > priceOf(p, region) ? old : null;
}

export function discountOf(p: Product, region: Region) {
  const old = oldPriceOf(p, region);
  return old ? Math.round((1 - priceOf(p, region) / old) * 100) : 0;
}

/** Backend rasmlari uchun thumbnail: /uploads/x.jpg?w=480 */
export function thumb(url: string | null | undefined, width?: 240 | 480 | 720 | 1080) {
  if (!url) return '';
  if (!width || !url.startsWith('/uploads/')) return url;
  return `${url}?w=${width}`;
}

/** Telefonni yozish paytida formatlash */
export function formatPhoneInput(raw: string, region: Region) {
  if (region === 'kr') {
    const d = raw.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  }
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('998')) d = d.slice(3);
  d = d.slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return `+998 ${parts.join(' ')}`.trimEnd();
}

export function isValidPhone(value: string, region: Region) {
  const d = value.replace(/\D/g, '');
  if (region === 'kr') return /^01[016789]\d{7,8}$/.test(d.startsWith('82') ? `0${d.slice(2)}` : d);
  return /^\d{9}$/.test(d.startsWith('998') ? d.slice(3) : d);
}

export const isFullAddress = (s: string) => s.trim().length >= 6 && /\d/.test(s);

export function seoulHour() {
  return Number(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Seoul' }).format(new Date())) % 24;
}

/** 23.10.2026 · 07:26 — telefon vaqti bo'yicha, ikkala tilda bir xil ko'rinish */
export function formatDate(iso: string) {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** Chek rasmini yuborishdan oldin kichraytirish (1600px, JPEG) — tezroq yuklanadi */
export async function compressImage(file: File, maxSide = 1600, quality = 0.85): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.size < 400 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

export function randomId(length = 20) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}
