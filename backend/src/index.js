// KROSS KOREA backend — asosiy ishga tushirish fayli
import { config, SHOP } from './config/default.js';
import { pool } from './database/connection.js';
import { initSchema } from './database/migrate.js';
import { bot, webAppUrl } from './core/bot.js';
import { createServer, webhookSecret } from './core/server.js';
import { registerBotRoutes, BOT_COMMANDS } from './routes/bot.routes.js';
import { logger } from './utils/logger.js';

async function launchBot() {
  if (!bot) return;
  registerBotRoutes(bot);
  await bot.init();

  await bot.api.setMyCommands(BOT_COMMANDS.uz);
  await bot.api.setMyCommands(BOT_COMMANDS.ru, { language_code: 'ru' });
  if (webAppUrl()) {
    await bot.api.setChatMenuButton({
      menu_button: { type: 'web_app', text: "🛍 Do'kon", web_app: { url: webAppUrl() } },
    });
  }

  if (config.botMode === 'webhook') {
    await bot.api.setWebhook(`${config.publicUrl}/bot/webhook`, { secret_token: webhookSecret });
    logger.info(`🤖 Bot @${bot.botInfo.username} — webhook rejimi`);
    return;
  }
  await bot.api.deleteWebhook();
  // start() bot to'xtaguncha davom etadi — kutmaymiz
  bot
    .start({ onStart: (info) => logger.info(`🤖 Bot @${info.username} ishga tushdi (polling)`) })
    .catch((err) => logger.error('Bot to\'xtadi:', err.description || err.message));
}

// Bepul serverda uxlab qolmaslik uchun har 10 daqiqada o'ziga yengil so'rov
function keepAlive() {
  if (!config.publicUrl) return;
  setInterval(() => fetch(`${config.publicUrl}/api/health`).catch(() => {}), 10 * 60 * 1000).unref();
}

async function main() {
  await initSchema();
  const app = createServer();
  const server = app.listen(config.port, () => logger.info(`🚀 ${SHOP.name} API: http://localhost:${config.port}`));

  await launchBot().catch((err) => logger.error('Botni ishga tushirib bo\'lmadi:', err.description || err.message));
  keepAlive();

  const shutdown = async () => {
    logger.info("To'xtatilmoqda...");
    await bot?.stop().catch(() => {});
    server.close();
    await pool.end().catch(() => {});
    process.exit(0);
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

main().catch((err) => {
  logger.error('Server ishga tushmadi:', err);
  process.exit(1);
});
