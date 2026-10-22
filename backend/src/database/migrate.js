// Baza jadvallarini yaratish (bor bo'lsa — tegmaydi). Server ishga tushganda ham chaqiriladi.
// Qo'lda: npm run db:init
import { pathToFileURL } from 'node:url';
import { pool } from './connection.js';
import { logger } from '../utils/logger.js';
import * as User from '../models/User.js';
import * as Category from '../models/Category.js';
import * as Product from '../models/Product.js';
import * as Upload from '../models/Upload.js';
import * as Order from '../models/Order.js';
import * as Story from '../models/Story.js';
import * as Setting from '../models/Setting.js';

// Tartib muhim: bog'liq jadvallar keyin
const MODELS = [User, Category, Product, Upload, Order, Story, Setting];

export async function initSchema() {
  for (const model of MODELS) await pool.query(model.schema);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  initSchema()
    .then(() => logger.info('✅ Jadvallar tayyor'))
    .catch((err) => {
      logger.error('Jadval yaratishda xato:', err.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
