import createHttpError from 'http-errors';
import { BrandsCollection } from '../db/models/brand.js';
import { CategoriesCollection } from '../db/models/category.js';
import { ProductsCollection } from '../db/models/product.js';

// бренди й категорії для адмінки: однакова логіка, різні колекції й тексти
const ENTITIES = {
  brand: {
    Collection: BrandsCollection,
    notFound: 'Brand not found',
    duplicate: 'Brand with this name or slug already exists',
    inUse: 'Brand has products',
  },
  category: {
    Collection: CategoriesCollection,
    notFound: 'Category not found',
    duplicate: 'Category with this slug already exists',
    inUse: 'Category has products',
  },
};

// унікальні name і slug: MongoDB повертає помилку з кодом 11000
const withDuplicateCheck = async (entity, action) => {
  try {
    return await action();
  } catch (error) {
    if (error.code === 11000) throw createHttpError(409, entity.duplicate);
    throw error;
  }
};

const create = (kind) => (payload) => {
  const entity = ENTITIES[kind];
  return withDuplicateCheck(entity, () => entity.Collection.create(payload));
};

const update = (kind) => async (id, payload) => {
  const entity = ENTITIES[kind];
  const doc = await withDuplicateCheck(entity, () =>
    entity.Collection.findByIdAndUpdate(id, payload, {
      returnDocument: 'after', // повернути вже оновлений документ
      runValidators: true,
    }),
  );
  if (!doc) throw createHttpError(404, entity.notFound);
  return doc;
};

// видаляти можна лише бренд чи категорію без товарів (навіть прихованих),
// інакше в старих товарах і замовленнях залишились би «биті» посилання
const remove = (kind) => async (id) => {
  const entity = ENTITIES[kind];
  if (await ProductsCollection.exists({ [kind]: id })) {
    throw createHttpError(409, entity.inUse);
  }

  const doc = await entity.Collection.findByIdAndDelete(id);
  if (!doc) throw createHttpError(404, entity.notFound);
};

// скільки товарів у кожного бренду чи категорії: { id: кількість }
const countProducts = async (kind) => {
  const counts = await ProductsCollection.aggregate([
    { $group: { _id: `$${kind}`, count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
};

const listWithCounts = (kind, sort) => async () => {
  const [docs, counts] = await Promise.all([
    ENTITIES[kind].Collection.find().sort(sort).lean(),
    countProducts(kind),
  ]);
  return docs.map((doc) => ({
    ...doc,
    productsCount: counts[String(doc._id)] ?? 0,
  }));
};

export const getBrandsWithCounts = listWithCounts('brand', { name: 1 });
export const createBrand = create('brand');
export const updateBrand = update('brand');
export const deleteBrand = remove('brand');

export const getCategoriesWithCounts = listWithCounts('category', {
  type: 1,
  name: 1,
});
export const createCategory = create('category');
export const updateCategory = update('category');
export const deleteCategory = remove('category');
