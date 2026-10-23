// Mijoz kiritgan ma'lumotlarni tozalash va tekshirish

export function cleanText(value, max = 200) {
  return String(value ?? '')
    .replace(/[\u0000-\u001f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

/** Ko'p qatorli matn: har qator tozalanadi, bo'sh qatorlar tashlanadi */
export function cleanLines(value, max = 2000) {
  return String(value ?? '')
    .split(/\r?\n/)
    .map((line) => cleanText(line, 300))
    .filter(Boolean)
    .join('\n')
    .slice(0, max);
}

/** Butun son chegarada, aks holda null */
export function intInRange(value, min, max) {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

/**
 * Telefonni region formatiga keltiradi, noto'g'ri bo'lsa null.
 * kr → 010-1234-5678     uz → +998 90 123 45 67
 */
export function normalizePhone(raw, region) {
  const digits = String(raw ?? '').replace(/\D/g, '');
  if (region === 'kr') {
    const d = digits.startsWith('82') ? `0${digits.slice(2)}` : digits;
    if (/^01[016789]\d{8}$/.test(d)) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
    if (/^01[016789]\d{7}$/.test(d)) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    return null;
  }
  const d = digits.startsWith('998') ? digits.slice(3) : digits;
  if (/^\d{9}$/.test(d)) return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
  return null;
}

// To'liq manzil: kamida 6 belgi va uy raqami (raqam) bo'lishi kerak
export const isFullAddress = (s) => typeof s === 'string' && s.length >= 6 && /\d/.test(s);

export const toInt = (v, def = 0) => {
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? n : def;
};
