// Rasm yuklash: faqat rasm, 8 MB gacha, xotirada (keyin bazaga yoziladi)
import multer from 'multer';
import { HttpError } from './error.middleware.js';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    ALLOWED.has(file.mimetype) ? cb(null, true) : cb(new HttpError(400, 'not_image')),
});
