import multer from 'multer';
import createHttpError from 'http-errors';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  // файли тримаємо в пам'яті, а куди їх зберегти, вирішує utils/imageStorage.js
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
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
