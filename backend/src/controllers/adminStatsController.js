// Admin: boshqaruv sahifasi — buyurtmalar, tushum ($ va ₩ alohida), mijozlar, top mahsulotlar, tugayotgan zaxira
import { SHOP } from '../config/default.js';
import * as Order from '../models/Order.js';
import * as Product from '../models/Product.js';
import * as User from '../models/User.js';
import * as Setting from '../models/Setting.js';

export async function getStats(req, res) {
  const [orders, customers, top, lowStock, settings] = await Promise.all([
    Order.stats(),
    User.countAll(),
    Order.topProducts(5),
    Product.lowStock(SHOP.lowStock, 15),
    Setting.get(),
  ]);
  const admin = Setting.toAdmin(settings);
  res.json({
    orders,
    customers,
    top,
    lowStock,
    lowStockThreshold: SHOP.lowStock,
    testCards: admin.testCards,
    isOpen: settings.is_open,
  });
}
