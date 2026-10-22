// Mini ilova API: /api/...
import { Router } from 'express';
import { telegramAuth } from '../middlewares/auth.middleware.js';
import { uploadImage } from '../middlewares/upload.middleware.js';
import { browserOrderLimit } from '../middlewares/rateLimit.middleware.js';
import * as catalog from '../controllers/catalogController.js';
import * as user from '../controllers/userController.js';
import * as order from '../controllers/orderController.js';

const router = Router();

// Himoyasiz
router.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
router.get('/access', catalog.getAccess);

// Quyidagilar — Telegram initData yoki brauzer mehmoni bilan
router.use(telegramAuth);

router.post('/auth', user.auth);
router.patch('/me', user.updateMe);

router.get('/catalog', catalog.getCatalog);
router.get('/products/:id', catalog.getProduct);

router.get('/orders/mine', order.mine);
router.get('/orders/:id', order.getOne);
router.post('/orders', browserOrderLimit, order.create);
router.post('/orders/:id/receipt', uploadImage.single('file'), order.uploadReceipt);

export default router;
