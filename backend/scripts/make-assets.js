// BREND/banner.webp (tiniq asl banner) dan bot banneri, mini ilova ikonkalari,
// havola ko'rinishi (og.jpg) va bot avatarini yasash
//   npm run assets
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { config } from '../src/config/default.js';

const BRAND = path.resolve(config.root, '..', 'BREND');
const PUBLIC = path.resolve(config.root, '..', 'frontend', 'public', 'images');
const SOURCE = path.join(BRAND, 'banner.webp');

// Bannerdagi belgilar + KROSS_KOREA + ORIGINAL · KOREA joylashgan qism (burchakdagi lentalarsiz)
const CONTENT = { left: 210, top: 176, width: 1262, height: 596 };

// /start banneri — asl o'lchamda, yuqori sifatda (Telegram o'zi siqadi, shuning uchun manba tiniq bo'lsin)
async function banner() {
  await sharp(SOURCE)
    .jpeg({ quality: 93, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(path.join(config.assetsDir, 'banner.jpg'));
}

// Qora fon, markazda logo. scale — belgi kenglikning qancha qismini egallaydi
async function framed(w, h, scale) {
  const width = Math.round(w * scale);
  const mark = await sharp(SOURCE).extract(CONTENT).resize({ width }).toBuffer();
  const { height } = await sharp(mark).metadata();
  return sharp({ create: { width: w, height: h, channels: 3, background: '#000' } }).composite([
    { input: mark, left: Math.round((w - width) / 2), top: Math.round((h - height) / 2) },
  ]);
}

const square = (size, scale) => framed(size, size, scale);

async function icons() {
  await fs.mkdir(PUBLIC, { recursive: true });
  // Kichik ikonkalarda belgi kattaroq — yozuv o'qilsin
  const base = await (await square(1024, 0.9)).png().toBuffer();
  for (const size of [64, 180, 192]) {
    await sharp(base).resize(size, size).png().toFile(path.join(PUBLIC, `icon-${size}.png`));
  }
  await sharp(base).resize(600, 600).jpeg({ quality: 92 }).toFile(path.join(PUBLIC, 'logo.jpg'));
  // 512 "maskable" ham: doira ichida kesilganda belgi to'liq ko'rinsin (0.74)
  await (await square(512, 0.74)).png().toFile(path.join(PUBLIC, 'icon-512.png'));
  // Bot avatari (BotFather → /setuserpic) — doira ichida ham sig'adi
  await (await square(640, 0.7)).png().toFile(path.join(BRAND, 'bot-avatar.png'));
}

// Havola ulashilganda chiqadigan katta rasm (Telegram, WhatsApp, Instagram) — 1200×630,
// toza qora fon va markazda KROSS logosi (burchak lentalari kesilib qolmasin)
async function ogImage() {
  await (await framed(1200, 630, 0.72))
    .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(path.join(PUBLIC, 'og.jpg'));
  // BotFather → /newapp rasmi (640×360): t.me/kross_korea_bot/<nom> havolasi katta rasm bilan chiqadi
  await (await framed(640, 360, 0.74))
    .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toFile(path.join(BRAND, 'miniapp-640x360.jpg'));
}

await fs.mkdir(config.assetsDir, { recursive: true });
await banner();
await icons();
await ogImage();
console.log('✅ banner.jpg, ikonkalar, og.jpg, miniapp-640x360.jpg va bot-avatar.png tayyor');
