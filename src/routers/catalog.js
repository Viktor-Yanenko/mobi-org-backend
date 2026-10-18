import { Router } from 'express';
import {
  getBrandsController,
  getCategoriesController,
} from '../controllers/admin-products.js';
import {
  getBrandsWithCountsController,
  createBrandController,
  updateBrandController,
  deleteBrandController,
  getCategoriesWithCountsController,
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
} from '../controllers/catalog.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createBrandSchema,
  updateBrandSchema,
  createCategorySchema,
  updateCategorySchema,
} from '../validation/catalog.js';

const router = Router();
const admin = [authenticate, requireAdmin];

// публічні списки для каталогу і фільтрів
router.get('/brands', getBrandsController);
router.get('/categories', getCategoriesController);

// бренди (адмін): GET /brands/all — список з кількістю товарів
router.get('/brands/all', admin, getBrandsWithCountsController);
router.post(
  '/brands',
  admin,
  validateBody(createBrandSchema),
  createBrandController,
);
router.patch(
  '/brands/:brandId',
  admin,
  validateBody(updateBrandSchema),
  updateBrandController,
);
router.delete('/brands/:brandId', admin, deleteBrandController);

// категорії (адмін)
router.get('/categories/all', admin, getCategoriesWithCountsController);
router.post(
  '/categories',
  admin,
  validateBody(createCategorySchema),
  createCategoryController,
);
router.patch(
  '/categories/:categoryId',
  admin,
  validateBody(updateCategorySchema),
  updateCategoryController,
);
router.delete('/categories/:categoryId', admin, deleteCategoryController);

export default router;
