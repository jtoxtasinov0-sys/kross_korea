// KROSS KOREA backend — asosiy ishga tushirish fayli
import { config, SHOP } from './config/default.js';
import { pool } from './database/connection.js';
import { initSchema } from './database/migrate.js';
import { bot, webAppUrl } from './core/bot.js';
import { createServer, webhookSecret } from './core/server.js';
import { registerBotRoutes, BOT_COMMANDS } from './routes/bot.routes.js';
import { t } from './locales/index.js';
import { logger } from './utils/logger.js';

// Bot tavsiflari: t.me havolasi ulashilganda, profilda va bo'sh chatda ko'rinadi.
// O'zbekcha — standart (til kodisiz), ruscha — "ru". Faqat o'zgargan bo'lsa yuboriladi.
async function syncDescriptions() {
  for (const [lang, language_code] of [['uz', undefined], ['ru', 'ru']]) {
    const other = language_code ? { language_code } : {};
    const short = t(lang, 'botShort');
    const about = t(lang, 'botAbout');
    if ((await bot.api.getMyShortDescription(other)).short_description !== short) {
      await bot.api.setMyShortDescription(short, other);
    }
    if ((await bot.api.getMyDescription(other)).description !== about) {
      await bot.api.setMyDescription(about, other);
    }
  }
}

async function launchBot() {
  if (!bot) return;
  registerBotRoutes(bot);
  await bot.init();

  await bot.api.setMyCommands(BOT_COMMANDS.uz);
  await bot.api.setMyCommands(BOT_COMMANDS.ru, { language_code: 'ru' });
  await syncDescriptions().catch((err) => logger.warn('Bot tavsifi yangilanmadi:', err.description || err.message));
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
