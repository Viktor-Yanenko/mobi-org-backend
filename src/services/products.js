import { BrandsCollection } from '../db/models/brand.js';
import { CategoriesCollection } from '../db/models/category.js';
import {
  ProductsCollection,
  AccessoriesCollection,
} from '../db/models/product.js';

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildMongoFilter = async (filter) => {
  const mongoFilter = { isActive: true };

  if (filter.type) mongoFilter.type = filter.type;

  if (filter.brand) {
    const brand = await BrandsCollection.findOne({ slug: filter.brand });
    if (!brand) return null;
    mongoFilter.brand = brand._id;
  }

  if (filter.category) {
    const category = await CategoriesCollection.findOne({
      slug: filter.category,
    });
    if (!category) return null;
    mongoFilter.category = category._id;
  }

  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    mongoFilter.minPrice = {};
    if (filter.minPrice !== undefined)
      mongoFilter.minPrice.$gte = filter.minPrice;
    if (filter.maxPrice !== undefined)
      mongoFilter.minPrice.$lte = filter.maxPrice;
  }

  if (filter.search) {
    mongoFilter.name = { $regex: escapeRegExp(filter.search), $options: 'i' };
  }

  // пам'ять: обидві умови мають виконуватись в одному варіанті
  // (8 ГБ RAM і 256 ГБ — це саме варіант 8/256, а не 8/128 + 6/256)
  if (filter.ram || filter.storage) {
    mongoFilter.variants = {
      $elemMatch: {
        ...(filter.ram && { ram: { $in: filter.ram } }),
        ...(filter.storage && { storage: { $in: filter.storage } }),
      },
    };
  }

  // характеристики аксесуарів: значення однієї характеристики через «або»
  // (1 м або 2 м), різні характеристики через «і» (довжина і роз'єм)
  if (filter.attributes) {
    mongoFilter.$and = Object.entries(filter.attributes).map(
      ([name, values]) => ({
        attributes: { $elemMatch: { name, value: { $in: values } } },
      }),
    );
  }

  return mongoFilter;
};

export const getAllProducts = async ({ page, perPage, filter, sort }) => {
  const mongoFilter = await buildMongoFilter(filter);

  if (!mongoFilter) {
    return {
      data: [],
      page,
      perPage,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: page > 1,
    };
  }

  const [totalItems, data] = await Promise.all([
    ProductsCollection.countDocuments(mongoFilter),
    ProductsCollection.find(mongoFilter)
      .sort(sort)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('brand', 'name slug')
      .populate('category', 'name slug'),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  return {
    data,
    page,
    perPage,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

const byNumber = (a, b) => a - b;
// «2 м» після «1 м», а «10 м» після «2 м»
const byText = (a, b) => a.localeCompare(b, 'uk', { numeric: true });

// варіанти для фільтрів: яка пам'ять і які характеристики взагалі є
// серед товарів з вибраним типом, категорією, брендом, ціною і пошуком
export const getProductFacets = async (filter) => {
  // фільтри за пам'яттю й характеристиками тут не застосовуємо: інакше після
  // вибору «1 м» зник би варіант «2 м» і вибрати обидва стало б неможливо
  const mongoFilter = await buildMongoFilter({
    ...filter,
    ram: undefined,
    storage: undefined,
    attributes: undefined,
  });

  if (!mongoFilter) return { ram: [], storage: [], attributes: [] };

  const [result] = await ProductsCollection.aggregate([
    { $match: mongoFilter },
    {
      $facet: {
        ram: [
          { $unwind: '$variants' },
          { $match: { 'variants.ram': { $ne: null } } },
          { $group: { _id: '$variants.ram' } },
        ],
        storage: [
          { $unwind: '$variants' },
          { $match: { 'variants.storage': { $ne: null } } },
          { $group: { _id: '$variants.storage' } },
        ],
        attributes: [
          { $unwind: '$attributes' },
          {
            $group: {
              _id: '$attributes.name',
              values: { $addToSet: '$attributes.value' },
            },
          },
        ],
      },
    },
  ]);

  return {
    ram: result.ram.map((item) => item._id).sort(byNumber),
    storage: result.storage.map((item) => item._id).sort(byNumber),
    attributes: result.attributes
      .map((item) => ({ name: item._id, values: item.values.sort(byText) }))
      .sort((a, b) => byText(a.name, b.name)),
  };
};

export const getProductBySlug = async (slug) => {
  const product = await ProductsCollection.findOne({ slug, isActive: true })
    .populate('brand', 'name slug logo')
    .populate('category', 'name slug');

  if (!product) return null;

  // для телефону одразу віддаємо сумісні аксесуари
  if (product.type === 'phone') {
    const accessories = await AccessoriesCollection.find({
      compatibleWith: product._id,
      isActive: true,
    }).select('name slug images minPrice accessoryType');

    return { ...product.toObject(), accessories };
  }

  return product;
};
