import { Router } from 'express';
import {
  getProductsController,
  getProductBySlugController,
} from '../controllers/products.js';

const router = Router();

router.get('/', getProductsController);
router.get('/:slug', getProductBySlugController);

export default router;
