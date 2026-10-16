import { Router } from 'express';
import {
  getBrandsController,
  getCategoriesController,
} from '../controllers/admin-products.js';

const router = Router();

router.get('/brands', getBrandsController);
router.get('/categories', getCategoriesController);

export default router;
