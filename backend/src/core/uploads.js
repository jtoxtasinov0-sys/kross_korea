// Rasmlar: bazaga saqlash, diskdan berish va WebP thumbnail (?w=240|480|720|1080)
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { config } from '../config/default.js';
import * as Upload from '../models/Upload.js';

const WIDTHS = new Set([240, 480, 720, 1080]);
const NAME_RE = /^[a-z0-9_-]+\.(jpe?g|png|webp)$/i;
const MIME_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const inflight = new Map();

const exists = (p) => fsp.access(p).then(() => true, () => false);

async function writeAtomic(file, data) {
  await fsp.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fsp.writeFile(tmp, data);
  await fsp.rename(tmp, file).catch(async () => fsp.unlink(tmp).catch(() => {}));
}

/** Rasmni bazaga va disk keshiga yozadi, /uploads/<nom> manzilini qaytaradi */
export async function saveImage(buffer, mime, prefix = 'f') {
  // Har qanday rasmni (HEIC emas) JPEG'ga keltiramiz: o'lcham kichrayadi, EXIF burilishi to'g'rilanadi
  const ext = MIME_EXT[mime] || 'jpg';
  let data = buffer;
  let finalMime = mime;
  if (ext !== 'webp') {
    data = await sharp(buffer).rotate().resize({ width: 1800, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
    finalMime = 'image/jpeg';
  }
  const name = `${prefix}${crypto.randomBytes(8).toString('hex')}.${finalMime === 'image/jpeg' ? 'jpg' : ext}`;
  await Upload.insert(name, finalMime, data);
  await writeAtomic(path.join(config.uploadsDir, name), data).catch(() => {});
  return { url: `/uploads/${name}`, data, name };
}

/** Disk keshida bo'lmasa bazadan tiklaydi. Yo'q bo'lsa null. */
async function ensureOriginal(name) {
  const file = path.join(config.uploadsDir, name);
  if (await exists(file)) return file;
  const row = await Upload.findByName(name);
  if (!row) return null;
  await writeAtomic(file, row.data);
  return file;
}

async function ensureThumb(name, width) {
  const file = path.join(config.uploadsDir, 'thumbs', String(width), `${name}.webp`);
  if (await exists(file)) return file;
  const original = await ensureOriginal(name);
  if (!original) return null;
  const data = await sharp(original).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer();
  await writeAtomic(file, data);
  return file;
}

// Bir xil rasm uchun bir vaqtda kelgan so'rovlar bitta ishni kutadi
function once(key, fn) {
  if (!inflight.has(key)) inflight.set(key, fn().finally(() => inflight.delete(key)));
  return inflight.get(key);
}

export async function serveUpload(req, res) {
  const { name } = req.params;
  if (!NAME_RE.test(name)) return res.status(404).end();
  const width = Number(req.query.w);
  const file = WIDTHS.has(width)
    ? await once(`${name}@${width}`, () => ensureThumb(name, width))
    : await once(name, () => ensureOriginal(name));
  if (!file) return res.status(404).end();
  res.set('Cache-Control', 'public, max-age=31536000, immutable');
  return res.sendFile(file);
}
