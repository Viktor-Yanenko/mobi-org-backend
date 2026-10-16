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
