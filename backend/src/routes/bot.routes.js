// Botning barcha handlerlarini bitta joyga yig'ish
import { logger } from '../utils/logger.js';
import { botUser } from '../middlewares/botUser.middleware.js';
import * as start from '../controllers/startController.js';
import * as receipt from '../controllers/receiptController.js';
import * as adminBot from '../controllers/adminBotController.js';

export function registerBotRoutes(bot) {
  bot.use(botUser);

  bot.command('start', start.onStart);
  bot.command('admin', adminBot.onAdmin);
  bot.command('id', adminBot.onId);

  bot.callbackQuery(/^lang:(uz|ru)$/, start.onLang);
  bot.callbackQuery('menu:home', start.onHome);
  bot.callbackQuery('menu:orders', start.onOrders);
  bot.callbackQuery('menu:contact', start.onContact);
  bot.callbackQuery(/^ok:(\d+)$/, receipt.onConfirm);

  bot.on('message:contact', start.onPhone);
  bot.on(['message:photo', 'message:document'], receipt.onReceipt);

  bot.catch((err) => logger.error(`Bot xatosi (update ${err.ctx?.update?.update_id}):`, err.error));
}

export const BOT_COMMANDS = {
  uz: [
    { command: 'start', description: 'Asosiy menyu' },
    { command: 'id', description: 'Telegram ID' },
  ],
  ru: [
    { command: 'start', description: 'Главное меню' },
    { command: 'id', description: 'Telegram ID' },
  ],
};
