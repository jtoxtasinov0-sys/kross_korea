// Bot: har bir shaxsiy xabarda foydalanuvchini bazadan olib ctx.user ga qo'yish
import * as User from '../models/User.js';

export async function botUser(ctx, next) {
  if (ctx.from && !ctx.from.is_bot && ctx.chat?.type === 'private') {
    ctx.user = await User.upsertTelegramUser(ctx.from);
  }
  return next();
}
