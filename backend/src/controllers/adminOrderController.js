// Admin: buyurtmalar ro'yxati, bitta buyurtma, holat / kuzatuv raqami / izoh o'zgartirish
import { invalidate } from '../core/cache.js';
import * as notify from '../core/notify.js';
import { HttpError } from '../middlewares/error.middleware.js';
import { cleanText, toInt } from '../utils/validate.js';
import * as Order from '../models/Order.js';

export async function list(req, res) {
  const { status, region } = req.query;
  const q = cleanText(req.query.q, 60);
  const offset = Math.max(0, toInt(req.query.offset, 0));
  const [orders, counts] = await Promise.all([
    Order.listAdmin({ status, region, q, offset, limit: 50 }),
    Order.statusCounts(),
  ]);
  res.json({ orders, counts });
}

export async function getOne(req, res) {
  const order = await Order.findAdmin(toInt(req.params.id));
  if (!order) throw new HttpError(404, 'not_found');
  res.json({ order });
}

/** { status?, trackingNumber?, adminNote? } — holat o'zgarsa mijozga bot orqali avtomatik xabar */
export async function update(req, res) {
  const id = toInt(req.params.id);
  const current = await Order.findAdmin(id);
  if (!current) throw new HttpError(404, 'not_found');

  const trackingNumber = req.body.trackingNumber !== undefined ? cleanText(req.body.trackingNumber, 60) : undefined;
  const adminNote = req.body.adminNote !== undefined ? cleanText(req.body.adminNote, 500) : undefined;
  const status = req.body.status;

  let delivered = null;
  if (status && status !== current.status) {
    await Order.changeStatus(id, status, { trackingNumber, adminNote });
    invalidate('catalog'); // zaxira va "eng ko'p sotilgan" o'zgaradi
    const updated = await Order.findAdmin(id);
    ({ delivered } = await notify.statusChanged(updated));
    return res.json({ order: updated, delivered });
  }

  await Order.updateNotes(id, {
    trackingNumber: trackingNumber ?? current.trackingNumber,
    adminNote: adminNote ?? current.adminNote,
  });
  res.json({ order: await Order.findAdmin(id), delivered });
}
