// Sozlamalar va muhit o'zgaruvchilari — butun backend shu fayldan o'qiydi
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// Mini ilova (Vercel) manzili — WEB_APP_URL berilmasa ham botda "Do'kon" tugmasi doim chiqib tursin.
// Telegram faqat https qabul qiladi: bo'sh yoki http (localhost) bo'lsa — shu manzil ishlatiladi
const DEFAULT_WEB_APP_URL = 'https://krosskorea.vercel.app';
const httpsUrl = (v) => (String(v || '').startsWith('https://') ? String(v).replace(/\/$/, '') : '');

try {
  process.loadEnvFile(path.join(ROOT, '.env'));
} catch {
  // .env yo'q — server muhitidagi o'zgaruvchilar ishlatiladi (Render, Vercel)
}

const env = process.env;
const bool = (v, def = false) =>
  v == null || v === '' ? def : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
const list = (v) =>
  String(v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

export const config = {
  root: ROOT,
  port: Number(env.PORT) || 4000,
  databaseUrl: env.DATABASE_URL || '',
  botToken: env.BOT_TOKEN || '',
  botMode: env.BOT_MODE === 'webhook' ? 'webhook' : 'polling',
  adminIds: list(env.ADMIN_IDS),
  adminPassword: env.ADMIN_PASSWORD || '',
  // Kalit berilmasa — har ishga tushganda yangisi (admin qayta kiradi)
  jwtSecret: env.JWT_SECRET || crypto.randomBytes(32).toString('hex'),
  webAppUrl: httpsUrl(env.WEB_APP_URL) || DEFAULT_WEB_APP_URL,
  // Render tashqi manzilni o'zi beradi (RENDER_EXTERNAL_URL) — PUBLIC_URL shart emas
  publicUrl: (env.PUBLIC_URL || env.RENDER_EXTERNAL_URL || '').replace(/\/$/, ''),
  browserAccess: bool(env.BROWSER_ACCESS, true),
  skipInitDataCheck: bool(env.SKIP_INITDATA_CHECK),
  devTelegramId: env.DEV_TELEGRAM_ID || '1000001',
  uploadsDir: env.UPLOADS_DIR || path.join(ROOT, 'uploads'),
  assetsDir: path.join(ROOT, 'assets'),
  isProd: env.NODE_ENV === 'production',
};

// Brend doimiylari — bazadagi sozlamalar bo'sh bo'lsa shular ishlatiladi
export const SHOP = {
  name: 'KROSS KOREA',
  short: 'KROSS',
  orderPrefix: 'KK',
  timezone: 'Asia/Seoul',
  phone: '+82 10 5698 5459',
  whatsapp: 'https://wa.me/821056985459',
  instagram: 'https://instagram.com/kross_korea',
  channel: 'https://t.me/kross_koreaa',
  supportUsername: 'krosss_korea',
  lowStock: 3,
  // Mijoz bir buyurtmada ko'pi bilan nechta juftlik oladi
  maxQtyPerLine: 5,
  maxLines: 20,
};

export const REGIONS = /** @type {const} */ (['uz', 'kr']);
