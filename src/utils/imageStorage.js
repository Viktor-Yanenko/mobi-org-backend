import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { v2 as cloudinary } from 'cloudinary';
import { getEnvVar } from './getEnvVar.js';
import { UPLOAD_DIR } from '../constants/index.js';

const CLOUDINARY_FOLDER = 'mobiorg/products';
const LOCAL_DIR = path.join(UPLOAD_DIR, 'products');

const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

// якщо ключів Cloudinary в .env немає, фото зберігаються локально в uploads/
export const isCloudinaryEnabled = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET,
);

if (isCloudinaryEnabled) {
  cloudinary.config({
    cloud_name: getEnvVar('CLOUDINARY_CLOUD_NAME'),
    api_key: getEnvVar('CLOUDINARY_API_KEY'),
    api_secret: getEnvVar('CLOUDINARY_API_SECRET'),
    secure: true,
  });
}

console.log(
  `Product images storage: ${isCloudinaryEnabled ? 'Cloudinary' : 'local uploads/'}`,
);

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    // файл лежить у пам'яті (file.buffer), тому відправляємо його потоком
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, resource_type: 'image' },
      (error, result) => (error ? reject(error) : resolve(result.secure_url)),
    );
    stream.end(file.buffer);
  });

const saveLocally = async (file, baseUrl) => {
  const fileName = `${randomUUID()}${EXTENSIONS[file.mimetype]}`;
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, fileName), file.buffer);
  return `${baseUrl}/uploads/products/${fileName}`;
};

// повертає URL збереженого фото
export const saveImage = (file, baseUrl) =>
  isCloudinaryEnabled ? uploadToCloudinary(file) : saveLocally(file, baseUrl);

// з https://res.cloudinary.com/<cloud>/image/upload/v123/mobiorg/products/abc.jpg
// дістає public_id "mobiorg/products/abc", потрібний для видалення
const getCloudinaryPublicId = (url) => {
  const afterUpload = new URL(url).pathname.split('/upload/')[1];
  return afterUpload.replace(/^v\d+\//, '').replace(/\.[^/.]+$/, '');
};

// видаляє фото там, де воно лежить: у Cloudinary або в локальній папці
export const deleteImage = async (url) => {
  const { hostname, pathname } = new URL(url);

  if (hostname === 'res.cloudinary.com') {
    await cloudinary.uploader.destroy(getCloudinaryPublicId(url));
    return;
  }

  await fs.unlink(path.join(LOCAL_DIR, path.basename(pathname)));
};
