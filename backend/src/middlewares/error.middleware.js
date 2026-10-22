// Xatoliklarni bitta formatda qaytarish: { error: 'kod', ...details }
import multer from 'multer';
import { logger } from '../utils/logger.js';

export class HttpError extends Error {
  constructor(status, code, details = {}) {
    super(code);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: 'not_found' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.code, ...err.details });
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'file_too_large' : 'upload' });
  }
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'bad_json' });
  logger.error(`${req.method} ${req.originalUrl}:`, err);
  res.status(500).json({ error: 'server' });
}
