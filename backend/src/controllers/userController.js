// Mini ilova: kirish, til/bo'lim tanlash, saqlangan manzillar
import * as User from '../models/User.js';
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

export async function auth(req, res) {
  const [stats, uz, kr] = await Promise.all([
    User.countOrders(req.user.id),
    User.getAddress(req.user.id, 'uz'),
    User.getAddress(req.user.id, 'kr'),
  ]);
  res.json({ user: publicUser(req.user), stats, addresses: { uz: uz || null, kr: kr || null } });
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
