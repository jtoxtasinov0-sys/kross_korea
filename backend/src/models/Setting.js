// Do'kon sozlamalari — bazada bitta qator (admin panel orqali o'zgaradi)
import { query } from '../database/connection.js';
import { SHOP } from '../config/default.js';

// Test rekvizitlar — haqiqiy karta kiritilmaguncha admin ogohlantiriladi
export const TEST_CARDS = {
  uz: { bank: 'Uzcard / Humo', card: '8600 1234 5678 9012', holder: 'KROSS KOREA' },
  kr: { bank: 'KB Kookmin Bank', card: '9430 1234 5678 9012', holder: 'KROSS KOREA' },
};

export const schema = `
CREATE TABLE IF NOT EXISTS settings (
  id                     INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  shop_name              TEXT NOT NULL DEFAULT '${SHOP.name}',
  phone                  TEXT NOT NULL DEFAULT '${SHOP.phone}',
  support_username       TEXT NOT NULL DEFAULT '${SHOP.supportUsername}',
  instagram_url          TEXT NOT NULL DEFAULT '${SHOP.instagram}',
  channel_url            TEXT NOT NULL DEFAULT '${SHOP.channel}',

  -- 🇺🇿 O'zbekiston bo'limi ($)
  pay_uz_bank            TEXT NOT NULL DEFAULT '${TEST_CARDS.uz.bank}',
  pay_uz_card            TEXT NOT NULL DEFAULT '${TEST_CARDS.uz.card}',
  pay_uz_holder          TEXT NOT NULL DEFAULT '${TEST_CARDS.uz.holder}',
  prepay_uz              INT  NOT NULL DEFAULT 50,      -- oldindan to'lov, %
  delivery_uz_fee        INT  NOT NULL DEFAULT 0,
  delivery_uz_days       TEXT NOT NULL DEFAULT '10–20',
  uzs_rate               INT  NOT NULL DEFAULT 0,       -- 1$ = N so'm (0 — ko'rsatilmaydi)

  -- 🇰🇷 Koreya bo'limi (₩)
  pay_kr_bank            TEXT NOT NULL DEFAULT '${TEST_CARDS.kr.bank}',
  pay_kr_card            TEXT NOT NULL DEFAULT '${TEST_CARDS.kr.card}',
  pay_kr_holder          TEXT NOT NULL DEFAULT '${TEST_CARDS.kr.holder}',
  prepay_kr              INT  NOT NULL DEFAULT 100,
  delivery_kr_fee        INT  NOT NULL DEFAULT 0,
  delivery_kr_free_from  INT  NOT NULL DEFAULT 0,       -- shu summadan bepul (0 — chegara yo'q)
  delivery_kr_days       TEXT NOT NULL DEFAULT '1–3',

  web_app_url            TEXT,
  admin_url              TEXT,
  panel_password         TEXT,
  about_uz               TEXT,
  about_ru               TEXT,
  is_open                BOOLEAN NOT NULL DEFAULT true,
  stock_visible          BOOLEAN NOT NULL DEFAULT false,
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
`;

let cache = null;
let cachedAt = 0;

export async function get() {
  if (cache && Date.now() - cachedAt < 30_000) return cache;
  const { rows } = await query('SELECT * FROM settings WHERE id = 1');
  cache = rows[0];
  cachedAt = Date.now();
  return cache;
}

export function invalidate() {
  cache = null;
}

/** Mijozga ochiq maydonlar — parol va xizmat manzillarisiz */
export function toPublic(s) {
  return {
    shopName: s.shop_name,
    phone: s.phone,
    supportUsername: s.support_username,
    instagramUrl: s.instagram_url,
    channelUrl: s.channel_url,
    isOpen: s.is_open,
    stockVisible: s.stock_visible,
    lowStock: SHOP.lowStock,
    aboutUz: s.about_uz,
    aboutRu: s.about_ru,
    regions: {
      uz: {
        bank: s.pay_uz_bank,
        card: s.pay_uz_card,
        holder: s.pay_uz_holder,
        prepay: s.prepay_uz,
        deliveryFee: s.delivery_uz_fee,
        freeFrom: 0,
        deliveryDays: s.delivery_uz_days,
        uzsRate: s.uzs_rate,
      },
      kr: {
        bank: s.pay_kr_bank,
        card: s.pay_kr_card,
        holder: s.pay_kr_holder,
        prepay: s.prepay_kr,
        deliveryFee: s.delivery_kr_fee,
        freeFrom: s.delivery_kr_free_from,
        deliveryDays: s.delivery_kr_days,
      },
    },
  };
}

/** Bo'lim bo'yicha to'lov va yetkazish qoidalari */
export function regionRules(s, region) {
  return toPublic(s).regions[region === 'kr' ? 'kr' : 'uz'];
}

export async function updateAbout(aboutUz, aboutRu) {
  await query('UPDATE settings SET about_uz = $1, about_ru = $2, updated_at = now() WHERE id = 1', [aboutUz, aboutRu]);
  invalidate();
}
