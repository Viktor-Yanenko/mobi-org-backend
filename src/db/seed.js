import mongoose from 'mongoose';
import { initMongoDB } from './initMongoDB.js';
import { BrandsCollection } from './models/brand.js';
import { CategoriesCollection } from './models/category.js';
import {
  ProductsCollection,
  PhonesCollection,
  AccessoriesCollection,
} from './models/product.js';

// мінімальна ціна серед варіантів (поки pre('save') ще не написаний)
const withMinPrice = (product) => ({
  ...product,
  minPrice: Math.min(...product.variants.map((v) => v.price)),
});

const seed = async () => {
  await initMongoDB();

  // 1. Очищаємо каталог (користувачів і замовлення не чіпаємо)
  await Promise.all([
    BrandsCollection.deleteMany({}),
    CategoriesCollection.deleteMany({}),
    ProductsCollection.deleteMany({}),
  ]);

  // 2. Бренди
  const [apple, samsung, xiaomi, anker] = await BrandsCollection.create([
    { name: 'Apple', slug: 'apple' },
    { name: 'Samsung', slug: 'samsung' },
    { name: 'Xiaomi', slug: 'xiaomi' },
    { name: 'Anker', slug: 'anker' },
  ]);

  // 3. Категорії
  const [smartphones, cases, chargers, headphones] =
    await CategoriesCollection.create([
      { name: 'Смартфони', slug: 'smartphones', type: 'phone' },
      { name: 'Чохли', slug: 'cases', type: 'accessory' },
      { name: 'Зарядні пристрої', slug: 'chargers', type: 'accessory' },
      { name: 'Навушники', slug: 'headphones', type: 'accessory' },
    ]);

  // 4. Телефони (через PhonesCollection, тому type: 'phone' підставиться сам)
  const [iphone16, galaxyS25, redmiNote14] = await PhonesCollection.create(
    [
      {
        name: 'iPhone 16',
        slug: 'iphone-16',
        description: 'Смартфон Apple 2024 року з чипом A18.',
        brand: apple._id,
        category: smartphones._id,
        variants: [
          {
            sku: 'IP16-128-BLK',
            color: 'Black',
            storage: 128,
            price: 39999,
            stock: 10,
          },
          {
            sku: 'IP16-256-BLK',
            color: 'Black',
            storage: 256,
            price: 44999,
            stock: 5,
          },
          {
            sku: 'IP16-128-PNK',
            color: 'Pink',
            storage: 128,
            price: 39999,
            stock: 3,
          },
        ],
        specs: { os: 'iOS 18', screenSize: 6.1, ram: 8, battery: 3561 },
      },
      {
        name: 'Samsung Galaxy S25',
        slug: 'samsung-galaxy-s25',
        description: 'Флагман Samsung із Galaxy AI.',
        brand: samsung._id,
        category: smartphones._id,
        variants: [
          {
            sku: 'S25-128-NVY',
            color: 'Navy',
            storage: 128,
            price: 36999,
            oldPrice: 39999,
            stock: 8,
          },
          {
            sku: 'S25-256-NVY',
            color: 'Navy',
            storage: 256,
            price: 40999,
            stock: 4,
          },
        ],
        specs: { os: 'Android 15', screenSize: 6.2, ram: 12, battery: 4000 },
      },
      {
        name: 'Xiaomi Redmi Note 14',
        slug: 'xiaomi-redmi-note-14',
        description: 'Доступний смартфон із великою батареєю.',
        brand: xiaomi._id,
        category: smartphones._id,
        variants: [
          {
            sku: 'RN14-128-BLK',
            color: 'Black',
            storage: 128,
            price: 8999,
            stock: 20,
          },
          {
            sku: 'RN14-256-BLU',
            color: 'Blue',
            storage: 256,
            price: 10499,
            stock: 12,
          },
        ],
        specs: { os: 'Android 14', screenSize: 6.67, ram: 8, battery: 5500 },
      },
    ].map(withMinPrice),
  );

  // 5. Аксесуари (compatibleWith посилається на створені телефони)
  await AccessoriesCollection.create(
    [
      {
        name: 'Чохол MagSafe для iPhone 16',
        slug: 'case-magsafe-iphone-16',
        brand: apple._id,
        category: cases._id,
        accessoryType: 'case',
        compatibleWith: [iphone16._id],
        variants: [
          { sku: 'CASE-IP16-CLR', color: 'Clear', price: 1999, stock: 30 },
          { sku: 'CASE-IP16-BLK', color: 'Black', price: 1999, stock: 25 },
        ],
      },
      {
        name: 'Чохол Silicone для Galaxy S25',
        slug: 'case-silicone-galaxy-s25',
        brand: samsung._id,
        category: cases._id,
        accessoryType: 'case',
        compatibleWith: [galaxyS25._id],
        variants: [
          { sku: 'CASE-S25-BLK', color: 'Black', price: 899, stock: 40 },
        ],
      },
      {
        name: 'Зарядний пристрій Anker 30W USB-C',
        slug: 'anker-charger-30w',
        brand: anker._id,
        category: chargers._id,
        accessoryType: 'charger',
        compatibleWith: [iphone16._id, galaxyS25._id, redmiNote14._id],
        variants: [
          { sku: 'ANK-30W-WHT', color: 'White', price: 1199, stock: 50 },
        ],
      },
      {
        name: 'Навушники Xiaomi Redmi Buds 6',
        slug: 'xiaomi-redmi-buds-6',
        brand: xiaomi._id,
        category: headphones._id,
        accessoryType: 'headphones',
        compatibleWith: [],
        variants: [
          { sku: 'BUDS6-BLK', color: 'Black', price: 1499, stock: 15 },
        ],
      },
    ].map(withMinPrice),
  );

  console.log('Seed completed');
};

seed()
  .catch((error) => {
    console.error('Seed failed', error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
