import { Router } from 'express';
import {
  getProductReviewsController,
  createReviewController,
  updateReviewController,
  deleteReviewController,
} from '../controllers/reviews.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createReviewSchema,
  updateReviewSchema,
} from '../validation/reviews.js';

const router = Router();

router.get('/products/:productId/reviews', getProductReviewsController);
router.post(
  '/products/:productId/reviews',
  authenticate,
  validateBody(createReviewSchema),
  createReviewController,
);
router.patch(
  '/reviews/:reviewId',
  authenticate,
  validateBody(updateReviewSchema),
  updateReviewController,
);
router.delete('/reviews/:reviewId', authenticate, deleteReviewController);

export default router;
