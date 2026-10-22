// Mini ilova: buyurtma berish, mening buyurtmalarim, chek yuklash
import { invalidate } from '../core/cache.js';
import { saveImage } from '../core/uploads.js';
import * as notify from '../core/notify.js';
import { logger } from '../utils/logger.js';
import { toInt } from '../utils/validate.js';
import { HttpError } from '../middlewares/error.middleware.js';
import * as Order from '../models/Order.js';
import { createOrder } from './cartController.js';

const background = (promise, what) => promise.catch((err) => logger.error(`${what}:`, err));

async function ownOrder(req) {
  const order = await Order.findById(toInt(req.params.id));
  if (!order || order.userId !== req.user.id) throw new HttpError(404, 'not_found');
  return order;
}

export async function create(req, res) {
  const order = await createOrder(req.user, req.body);
  invalidate('catalog'); // zaxira o'zgardi
  background(notify.orderCreated(order, req.user), 'Buyurtma xabari');
  res.status(201).json({ order });
}

export async function mine(req, res) {
  res.json({ orders: await Order.listByUser(req.user.id) });
}

export async function getOne(req, res) {
  res.json({ order: await ownOrder(req) });
}

export async function uploadReceipt(req, res) {
  const order = await ownOrder(req);
  if (!req.file) throw new HttpError(400, 'no_file');
  if (!Order.UNPAID.includes(order.status)) throw new HttpError(409, 'already_paid', { status: order.status });

  const saved = await saveImage(req.file.buffer, req.file.mimetype, 'r');
  const updated = await Order.attachReceipt(order.id, saved.url);
  if (!updated) throw new HttpError(409, 'already_paid');
  background(notify.receiptReceived(updated, req.user, saved.data), 'Chek xabari');
  res.json({ order: updated });
}
