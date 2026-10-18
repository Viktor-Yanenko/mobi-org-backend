import createHttpError from 'http-errors';
import {
  getAllProducts,
  getProductBySlug,
  getProductFacets,
} from '../services/products.js';
import { parseProductsQuery } from '../utils/parseProductsQuery.js';

export const getProductsController = async (req, res) => {
  const result = await getAllProducts(parseProductsQuery(req.query));

  res.json({
    status: 200,
    message: 'Successfully found products!',
    data: result,
  });
};

export const getProductBySlugController = async (req, res) => {
  const product = await getProductBySlug(req.params.slug);

  if (!product) {
    throw createHttpError(404, 'Product not found');
  }

  res.json({
    status: 200,
    message: 'Successfully found product!',
    data: product,
  });
};

export const getProductFacetsController = async (req, res) => {
  const { filter } = parseProductsQuery(req.query);
  const facets = await getProductFacets(filter);

  res.json({
    status: 200,
    message: 'Successfully found filters!',
    data: facets,
  });
};
