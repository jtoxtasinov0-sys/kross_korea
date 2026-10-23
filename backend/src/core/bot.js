// Bot instansiyasini yaratish. BOT_TOKEN bo'lmasa — bot o'chiq, API ishlayveradi.
import { Bot } from 'grammy';
import { config } from '../config/default.js';
import { logger } from '../utils/logger.js';
import * as Setting from '../models/Setting.js';

export const bot = config.botToken ? new Bot(config.botToken) : null;

if (!bot) logger.warn('BOT_TOKEN berilmagan — bot ishga tushmaydi, faqat API ishlaydi');

/** Mini ilova tugmasi faqat https manzil bilan ishlaydi (Telegram talabi) */
export const webAppUrl = () => (config.webAppUrl.startsWith('https://') ? config.webAppUrl : '');

/** Admin panel manzili: sozlamadagi yoki mini ilova manzili + /admin (faqat https) */
export async function adminPanelUrl() {
  const settings = await Setting.get();
  const url = settings.admin_url || (webAppUrl() ? `${webAppUrl()}/admin` : '');
  return url.startsWith('https://') ? url : '';
}

// botInfo faqat bot.init() dan keyin bor — undan oldin murojaat xato beradi
export const botUsername = () => (bot?.isInited() ? bot.botInfo.username : '');
export const botLink = () => (botUsername() ? `https://t.me/${botUsername()}` : '');
