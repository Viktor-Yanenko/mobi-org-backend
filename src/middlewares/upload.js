import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import createHttpError from 'http-errors';
import { UPLOAD_DIR } from '../constants/index.js';

const PRODUCTS_DIR = path.join(UPLOAD_DIR, 'products');
fs.mkdirSync(PRODUCTS_DIR, { recursive: true });

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination: PRODUCTS_DIR,
  // випадкова назва, щоб файли з однаковими іменами не перезаписували один одного
  filename: (req, file, cb) => {
    cb(null, `${randomUUID()}${ALLOWED_TYPES[file.mimetype]}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(createHttpError(400, 'Only JPG, PNG and WEBP images are allowed'));
    }
  },
}).array('images', 5);

// помилки multer (завеликий файл, забагато файлів) перетворюємо на 400
export const uploadProductImages = (req, res, next) => {
  upload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      next(createHttpError(400, error.message));
      return;
    }
    next(error);
  });
};
