// Admin panel API: /api/admin/...
import { Router } from 'express';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import * as auth from '../controllers/adminAuthController.js';
import * as stats from '../controllers/adminStatsController.js';
import * as orders from '../controllers/adminOrderController.js';
import * as products from '../controllers/adminProductController.js';
import * as stock from '../controllers/adminStockController.js';
import * as settings from '../controllers/adminSettingController.js';

const router = Router();

// Himoyasiz: serverni uyg'otish va kirish
router.get('/health', (req, res) => res.json({ ok: true }));
router.post('/login', auth.loginWithPassword);
router.post('/telegram', auth.loginWithTelegram);

router.use(requireAdmin);

router.get('/stats', stats.getStats);

router.get('/orders', orders.list);
router.get('/orders/:id', orders.getOne);
router.patch('/orders/:id', orders.update);

router.get('/products', products.list);
router.get('/products/:id', products.getOne);
router.post('/products', products.create);
router.put('/products/:id', products.update);
router.delete('/products/:id', products.remove);
router.get('/categories', products.categories);
router.post('/upload', uploadImage.single('file'), products.upload);

router.get('/stock', stock.list);
router.put('/stock', stock.save);

router.get('/settings', settings.get);
router.put('/settings', settings.update);

export default router;
