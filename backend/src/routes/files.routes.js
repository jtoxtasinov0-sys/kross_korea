// Rasmlar: /uploads/<nom>  va  /uploads/<nom>?w=480 (WebP thumbnail)
import { Router } from 'express';
import { serveUpload } from '../core/uploads.js';

const router = Router();
router.get('/:name', serveUpload);

export default router;
