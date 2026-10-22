// BREND/logo.jpg dan bot banneri va mini ilova ikonkalarini yasash
//   npm run assets
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { config } from '../src/config/default.js';

const BRAND = path.resolve(config.root, '..', 'BREND');
const PUBLIC = path.resolve(config.root, '..', 'frontend', 'public', 'images');
const LOGO = path.join(BRAND, 'logo.jpg');

const ORANGE = '#FF5A1F';
const BLUE = '#0047A0';
const RED = '#CD2E3A';

// /start banneri 1280×720: qora fon, markazda logo belgilari, burchaklarda brend lentalari
async function banner() {
  const W = 1280;
  const H = 720;
  const tape = (color, x, width) =>
    `<polygon points="${x},${H} ${x + width},${H} ${x + width + 300},0 ${x + 300},0" fill="${color}"/>`;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#000"/>
    ${tape(ORANGE, -380, 120)}${tape(BLUE, -250, 90)}
    <g transform="translate(${W} ${H}) rotate(180)">${tape(RED, -380, 120)}${tape(ORANGE, -250, 40)}</g>
    <text x="50%" y="610" text-anchor="middle" fill="#FF5A1F" font-family="Arial, Helvetica, sans-serif"
      font-size="34" font-weight="700" letter-spacing="6">ORIGINAL · KOREA</text>
  </svg>`;
  // Logodagi belgilar va yozuv qismi (chetdagi chiziqlarsiz)
  const mark = await sharp(LOGO)
    .extract({ left: 120, top: 330, width: 760, height: 330 })
    .resize({ width: 860 })
    .toBuffer();
  const { height } = await sharp(mark).metadata();
  await sharp(Buffer.from(svg))
    .composite([{ input: mark, left: Math.round((W - 860) / 2), top: Math.round((H - height) / 2) - 50 }])
    .jpeg({ quality: 88 })
    .toFile(path.join(config.assetsDir, 'banner.jpg'));
}

async function icons() {
  await fs.mkdir(PUBLIC, { recursive: true });
  // Logo chetidagi bo'sh qora joyni qirqib, ikonkada belgi kattaroq ko'rinsin
  const square = await sharp(LOGO).extract({ left: 90, top: 90, width: 820, height: 820 }).toBuffer();
  for (const size of [64, 180, 192, 512]) {
    await sharp(square).resize(size, size).png().toFile(path.join(PUBLIC, `icon-${size}.png`));
  }
  await sharp(LOGO).resize(600, 600).jpeg({ quality: 86 }).toFile(path.join(PUBLIC, 'logo.jpg'));
}

await fs.mkdir(config.assetsDir, { recursive: true });
await banner();
await icons();
console.log('✅ banner.jpg va ikonkalar tayyor');
