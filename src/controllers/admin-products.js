import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  removeProductImage,
  getAllBrands,
  getAllCategories,
} from '../services/admin-products.js';

const checkProductId = (id) => {
  if (!isValidObjectId(id)) {
    throw createHttpError(404, 'Product not found');
  }
};

export const createProductController = async (req, res) => {
  res.status(201).json({
    status: 201,
    message: 'Product created!',
    data: await createProduct(req.body),
  });
};

export const updateProductController = async (req, res) => {
  checkProductId(req.params.productId);

  res.json({
    status: 200,
    message: 'Product updated!',
    data: await updateProduct(req.params.productId, req.body),
  });
};

export const deleteProductController = async (req, res) => {
  checkProductId(req.params.productId);
  await deleteProduct(req.params.productId);
  res.status(204).send();
};

export const addProductImagesController = async (req, res) => {
  checkProductId(req.params.productId);

  if (!req.files?.length) {
    throw createHttpError(400, 'No images uploaded (field name: images)');
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;

  res.json({
    status: 200,
    message: 'Images uploaded!',
    data: await addProductImages(req.params.productId, req.files, baseUrl),
  });
};

export const removeProductImageController = async (req, res) => {
  checkProductId(req.params.productId);

  res.json({
    status: 200,
    message: 'Image removed!',
    data: await removeProductImage(req.params.productId, req.body.url),
  });
};

export const getBrandsController = async (req, res) => {
  res.json({
    status: 200,
    message: 'Successfully found brands!',
    data: await getAllBrands(),
  });
};

export const getCategoriesController = async (req, res) => {
  res.json({
    status: 200,
    message: 'Successfully found categories!',
    data: await getAllCategories(),
  });
};
