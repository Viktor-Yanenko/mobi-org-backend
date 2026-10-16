import { Router } from 'express';
import {
  getCartController,
  addCartItemController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
  mergeCartController,
} from '../controllers/cart.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  addCartItemSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from '../validation/cart.js';

const router = Router();

// усі маршрути кошика тільки для залогінених
router.use(authenticate);

router.get('/', getCartController);
router.delete('/', clearCartController);
router.post('/items', validateBody(addCartItemSchema), addCartItemController);
router.patch(
  '/items/:sku',
  validateBody(updateCartItemSchema),
  updateCartItemController,
);
router.delete('/items/:sku', removeCartItemController);
router.post('/merge', validateBody(mergeCartSchema), mergeCartController);

export default router;
