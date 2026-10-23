// Mini ilova: kirish, til/bo'lim tanlash, saqlangan manzillar
import * as User from '../models/User.js';
import { webLinkUrl } from '../core/bot.js';
import { refreshSessionUser } from '../middlewares/auth.middleware.js';

const publicUser = (u) => ({
  id: u.id,
  firstName: u.firstName,
  lastName: u.lastName,
  username: u.username,
  phone: u.phone,
  language: u.language,
  region: u.region,
  isGuest: User.isWebUser(u),
});

/** Sayt mijozi uchun: bot xabarlarini olish havolasi va ulanganmi. Telegram ichida — null. */
function telegramLink(u) {
  const url = User.isWebUser(u) ? webLinkUrl(u.id) : '';
  return url ? { url, linked: !!u.chatId } : null;
}

export async function auth(req, res) {
  const [stats, uz, kr] = await Promise.all([
    User.countOrders(req.user.id),
    User.getAddress(req.user.id, 'uz'),
    User.getAddress(req.user.id, 'kr'),
  ]);
  res.json({
    user: publicUser(req.user),
    stats,
    addresses: { uz: uz || null, kr: kr || null },
    telegram: telegramLink(req.user),
  });
}

export async function updateMe(req, res) {
  const { language, region } = req.body || {};
  const user = await User.update(req.user.id, {
    language: ['uz', 'ru'].includes(language) ? language : undefined,
    region: ['uz', 'kr'].includes(region) ? region : undefined,
  });
  refreshSessionUser(user);
  res.json({ user: publicUser(user) });
}
