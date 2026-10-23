// Mijozlar va ularning saqlangan manzillari
import { query } from '../database/connection.js';
import { config } from '../config/default.js';

export const schema = `
CREATE TABLE IF NOT EXISTS users (
  id           SERIAL PRIMARY KEY,
  telegram_id  TEXT UNIQUE NOT NULL,            -- Telegram ID yoki brauzer mijozi: web_<id>
  first_name   TEXT,
  last_name    TEXT,
  username     TEXT,
  phone        TEXT,
  language     TEXT NOT NULL DEFAULT 'uz',
  region       TEXT,                            -- oxirgi tanlangan bo'lim: uz | kr
  is_blocked   BOOLEAN NOT NULL DEFAULT false,  -- botni bloklagan
  is_admin     BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addresses (
  id          SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  region      TEXT NOT NULL,
  name        TEXT,
  phone       TEXT,
  city        TEXT,
  street      TEXT NOT NULL,
  detail      TEXT,
  zip_code    TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, region)
);

-- Sayt mijozi botdagi havolani bosganda — bot xabarlari shu Telegram chatga boradi
ALTER TABLE users ADD COLUMN IF NOT EXISTS chat_id TEXT;
CREATE INDEX IF NOT EXISTS users_chat_id_idx ON users (chat_id) WHERE chat_id IS NOT NULL;
`;

const map = (r) =>
  r && {
    id: r.id,
    telegramId: r.telegram_id,
    firstName: r.first_name,
    lastName: r.last_name,
    username: r.username,
    phone: r.phone,
    language: r.language,
    region: r.region,
    isBlocked: r.is_blocked,
    isAdmin: r.is_admin || config.adminIds.includes(String(r.telegram_id)),
    chatId: r.chat_id,
    createdAt: r.created_at,
  };

export const isWebUser = (user) => String(user?.telegramId || '').startsWith('web_');

/** Bot xabari qayerga ketadi: Telegram mijozi — o'z chati, sayt mijozi — bog'lagan chati (bo'lmasa null) */
export const chatIdOf = (user) => (isWebUser(user) ? user.chatId || null : user?.telegramId || null);

/** Sayt mijozini Telegram chatiga bog'lash. Faqat web_ mijoz uchun ishlaydi. */
export async function linkChat(id, chatId) {
  const { rows } = await query(
    `UPDATE users SET chat_id = $2 WHERE id = $1 AND telegram_id LIKE 'web_%' RETURNING *`,
    [id, String(chatId)],
  );
  return map(rows[0]);
}

/** Shu Telegram chatga bog'langan sayt mijozlari ID'lari */
export async function webIdsByChat(chatId) {
  const { rows } = await query('SELECT id FROM users WHERE chat_id = $1', [String(chatId)]);
  return rows.map((r) => r.id);
}

export async function findByTelegramId(telegramId) {
  const { rows } = await query('SELECT * FROM users WHERE telegram_id = $1', [String(telegramId)]);
  return map(rows[0]);
}

export async function findById(id) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return map(rows[0]);
}

/** Telegram ma'lumotidan mijozni yaratish/yangilash. Yangi mijoz tili Telegram tilidan olinadi. */
export async function upsertTelegramUser(tg) {
  const lang = String(tg.language_code || '').startsWith('ru') ? 'ru' : 'uz';
  const { rows } = await query(
    `INSERT INTO users (telegram_id, first_name, last_name, username, language)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (telegram_id) DO UPDATE
       SET first_name = EXCLUDED.first_name,
           last_name  = EXCLUDED.last_name,
           username   = EXCLUDED.username,
           is_blocked = false
     RETURNING *`,
    [String(tg.id), tg.first_name || null, tg.last_name || null, tg.username || null, lang],
  );
  return map(rows[0]);
}

export async function upsertGuest(guestId) {
  const { rows } = await query(
    `INSERT INTO users (telegram_id) VALUES ($1)
     ON CONFLICT (telegram_id) DO UPDATE SET telegram_id = EXCLUDED.telegram_id
     RETURNING *`,
    [`web_${guestId}`],
  );
  return map(rows[0]);
}

export async function update(id, fields) {
  const cols = { language: 'language', region: 'region', phone: 'phone', isBlocked: 'is_blocked', isAdmin: 'is_admin', firstName: 'first_name' };
  const sets = [];
  const values = [];
  for (const [key, col] of Object.entries(cols)) {
    if (fields[key] !== undefined) {
      values.push(fields[key]);
      sets.push(`${col} = $${values.length}`);
    }
  }
  if (!sets.length) return findById(id);
  values.push(id);
  const { rows } = await query(`UPDATE users SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`, values);
  return map(rows[0]);
}

/** Bot xabarlari yuboriladigan adminlar: is_admin + .env ADMIN_IDS */
export async function adminChatIds() {
  const { rows } = await query(`SELECT telegram_id FROM users WHERE is_admin AND telegram_id NOT LIKE 'web_%'`);
  return [...new Set([...rows.map((r) => r.telegram_id), ...config.adminIds])];
}

export async function getAddress(userId, region) {
  const { rows } = await query('SELECT * FROM addresses WHERE user_id = $1 AND region = $2', [userId, region]);
  const r = rows[0];
  return (
    r && { name: r.name, phone: r.phone, city: r.city, street: r.street, detail: r.detail, zipCode: r.zip_code }
  );
}

export async function saveAddress(userId, region, a) {
  await query(
    `INSERT INTO addresses (user_id, region, name, phone, city, street, detail, zip_code, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, now())
     ON CONFLICT (user_id, region) DO UPDATE
       SET name = EXCLUDED.name, phone = EXCLUDED.phone, city = EXCLUDED.city, street = EXCLUDED.street,
           detail = EXCLUDED.detail, zip_code = EXCLUDED.zip_code, updated_at = now()`,
    [userId, region, a.name, a.phone, a.city, a.street, a.detail, a.zipCode],
  );
}

export async function countAll() {
  const { rows } = await query(
    `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE telegram_id NOT LIKE 'web_%') AS telegram FROM users`,
  );
  return rows[0];
}

export async function countOrders(userId) {
  const { rows } = await query(
    `SELECT COUNT(*) FILTER (WHERE status <> 'CANCELLED') AS total,
            COUNT(*) FILTER (WHERE status = 'DELIVERED')   AS delivered
       FROM orders WHERE user_id = $1`,
    [userId],
  );
  return rows[0];
}
