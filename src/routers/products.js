import { Router } from 'express';
import {
  getProductsController,
  getProductBySlugController,
  getProductFacetsController,
} from '../controllers/products.js';
import {
  createProductController,
  updateProductController,
  deleteProductController,
  addProductImagesController,
  removeProductImageController,
} from '../controllers/admin-products.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { uploadProductImages } from '../middlewares/upload.js';
import {
  createProductSchema,
  updateProductSchema,
  removeImageSchema,
} from '../validation/products.js';

const router = Router();

// публічні маршрути
router.get('/', getProductsController);
router.get('/facets', getProductFacetsController);
router.get('/:slug', getProductBySlugController);

// тільки для адміна
const admin = [authenticate, requireAdmin];

router.post(
  '/',
  admin,
  validateBody(createProductSchema),
  createProductController,
);
router.patch(
  '/:productId',
  admin,
  validateBody(updateProductSchema),
  updateProductController,
);
router.delete('/:productId', admin, deleteProductController);
router.post(
  '/:productId/images',
  admin,
  uploadProductImages,
  addProductImagesController,
);
router.delete(
  '/:productId/images',
  admin,
  validateBody(removeImageSchema),
  removeProductImageController,
);

export default router;
