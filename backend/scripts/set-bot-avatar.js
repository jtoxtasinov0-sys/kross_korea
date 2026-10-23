// Bot avatarini BREND/bot-avatar.png (tiniq logo) dan o'rnatish — bir martalik
//   npm run bot:avatar
import path from 'node:path';
import sharp from 'sharp';
import { Bot, InputFile } from 'grammy';
import { config } from '../src/config/default.js';

if (!config.botToken) {
  console.error('BOT_TOKEN berilmagan');
  process.exit(1);
}

const file = path.resolve(config.root, '..', 'BREND', 'bot-avatar.png');
// Profil rasmi JPEG ko'rinishida yuboriladi
const jpeg = await sharp(file).jpeg({ quality: 95 }).toBuffer();
await new Bot(config.botToken).api.setMyProfilePhoto({ type: 'static', photo: new InputFile(jpeg, 'avatar.jpg') });
console.log('✅ Bot avatari yangilandi');
