import createHttpError from 'http-errors';
import {
  ProductsCollection,
  PhonesCollection,
  AccessoriesCollection,
} from '../db/models/product.js';
import { BrandsCollection } from '../db/models/brand.js';
import { CategoriesCollection } from '../db/models/category.js';
import { saveImage, deleteImage } from '../utils/imageStorage.js';

const MODELS = { phone: PhonesCollection, accessory: AccessoriesCollection };

// перевіряємо, що бренд, категорія і сумісні телефони справді існують
const checkReferences = async ({ brand, category, compatibleWith }) => {
  if (brand && !(await BrandsCollection.exists({ _id: brand }))) {
    throw createHttpError(400, 'Brand not found');
  }

  if (category && !(await CategoriesCollection.exists({ _id: category }))) {
    throw createHttpError(400, 'Category not found');
  }

  if (compatibleWith?.length) {
    const count = await PhonesCollection.countDocuments({
      _id: { $in: compatibleWith },
    });
    if (count !== new Set(compatibleWith).size) {
      throw createHttpError(400, 'Some compatible phones not found');
    }
  }
};

// sku має бути унікальним серед усіх товарів, а не лише всередині одного
// (окремого унікального індексу на variants.sku у моделі немає)
const checkSkus = async (variants, exceptProductId) => {
  if (!variants?.length) return;

  const filter = { 'variants.sku': { $in: variants.map((v) => v.sku) } };
  if (exceptProductId) filter._id = { $ne: exceptProductId };

  if (await ProductsCollection.exists(filter)) {
    throw createHttpError(409, 'Product with this slug or SKU already exists');
  }
};

// унікальні slug і sku: MongoDB повертає помилку з кодом 11000
const saveProduct = async (product) => {
  try {
    return await product.save();
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError(
        409,
        'Product with this slug or SKU already exists',
      );
    }
    throw error;
  }
};

const findProduct = async (productId) => {
  const product = await ProductsCollection.findById(productId);
  if (!product) {
    throw createHttpError(404, 'Product not found');
  }
  return product;
};

export const createProduct = async (payload) => {
  await checkReferences(payload);
  await checkSkus(payload.variants);

  const Model = MODELS[payload.type];
  return saveProduct(new Model(payload));
};

export const updateProduct = async (productId, payload) => {
  // findById повертає документ потрібної підмоделі (Phone або Accessory),
  // тому set() приймає і specs, і accessoryType
  const product = await findProduct(productId);

  if (
    product.type === 'phone' &&
    (payload.accessoryType || payload.compatibleWith)
  ) {
    throw createHttpError(400, 'Phone cannot have accessory fields');
  }
  if (product.type === 'accessory' && payload.specs) {
    throw createHttpError(400, 'Accessory cannot have phone specs');
  }

  await checkReferences(payload);
  await checkSkus(payload.variants, product._id);

  product.set(payload);
  return saveProduct(product);
};

// «м'яке» видалення: товар зникає з каталогу, але старі замовлення і кошики не ламаються
export const deleteProduct = async (productId) => {
  const product = await findProduct(productId);
  product.isActive = false;
  return saveProduct(product);
};

export const addProductImages = async (productId, files, baseUrl) => {
  const product = await findProduct(productId);

  const urls = await Promise.all(files.map((file) => saveImage(file, baseUrl)));
  product.images.push(...urls);
  return saveProduct(product);
};

export const removeProductImage = async (productId, url) => {
  const product = await findProduct(productId);

  if (!product.images.includes(url)) {
    throw createHttpError(404, 'Image not found');
  }

  product.images = product.images.filter((image) => image !== url);
  await saveProduct(product);

  // якщо файл уже видалений вручну, це не помилка: з товару посилання прибрали
  await deleteImage(url).catch(() => {});

  return product;
};

export const getAllBrands = () => BrandsCollection.find().sort({ name: 1 });

export const getAllCategories = () =>
  CategoriesCollection.find().sort({ type: 1, name: 1 });
