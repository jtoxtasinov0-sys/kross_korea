// Express ilovasini yig'ish: siqish, JSON, marshrutlar, xatoliklar
import express from 'express';
import compression from 'compression';
import { webhookCallback } from 'grammy';
import { config, SHOP } from '../config/default.js';
import { bot } from './bot.js';
import apiRoutes from '../routes/api.routes.js';
import filesRoutes from '../routes/files.routes.js';
import { notFound, errorHandler } from '../middlewares/error.middleware.js';

// Webhook so'rovlari faqat Telegram'dan kelishini tekshirish uchun
export const webhookSecret = config.jwtSecret.slice(0, 32);

export function createServer() {
  const app = express();
  app.set('trust proxy', true);
  app.disable('x-powered-by');

  app.use(compression());
  app.use(express.json({ limit: '200kb' }));

  app.get('/', (req, res) => res.json({ ok: true, name: SHOP.name }));
  app.use('/uploads', filesRoutes);
  app.use('/api', apiRoutes);

  if (bot && config.botMode === 'webhook') {
    app.post('/bot/webhook', webhookCallback(bot, 'express', { secretToken: webhookSecret }));
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
