import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import {
  getBrandsWithCounts,
  createBrand,
  updateBrand,
  deleteBrand,
  getCategoriesWithCounts,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/catalog.js';

const checkId = (id, message) => {
  if (!isValidObjectId(id)) throw createHttpError(404, message);
};

// ---------- бренди ----------

export const getBrandsWithCountsController = async (req, res) => {
  res.json({
    status: 200,
    message: 'Successfully found brands!',
    data: await getBrandsWithCounts(),
  });
};

export const createBrandController = async (req, res) => {
  res.status(201).json({
    status: 201,
    message: 'Brand created!',
    data: await createBrand(req.body),
  });
};

export const updateBrandController = async (req, res) => {
  checkId(req.params.brandId, 'Brand not found');

  res.json({
    status: 200,
    message: 'Brand updated!',
    data: await updateBrand(req.params.brandId, req.body),
  });
};

export const deleteBrandController = async (req, res) => {
  checkId(req.params.brandId, 'Brand not found');
  await deleteBrand(req.params.brandId);
  res.status(204).send();
};

// ---------- категорії ----------

export const getCategoriesWithCountsController = async (req, res) => {
  res.json({
    status: 200,
    message: 'Successfully found categories!',
    data: await getCategoriesWithCounts(),
  });
};

export const createCategoryController = async (req, res) => {
  res.status(201).json({
    status: 201,
    message: 'Category created!',
    data: await createCategory(req.body),
  });
};

export const updateCategoryController = async (req, res) => {
  checkId(req.params.categoryId, 'Category not found');

  res.json({
    status: 200,
    message: 'Category updated!',
    data: await updateCategory(req.params.categoryId, req.body),
  });
};

export const deleteCategoryController = async (req, res) => {
  checkId(req.params.categoryId, 'Category not found');
  await deleteCategory(req.params.categoryId);
  res.status(204).send();
};
