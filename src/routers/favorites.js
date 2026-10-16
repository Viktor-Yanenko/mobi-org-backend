import { Router } from 'express';
import {
  getFavoritesController,
  addFavoriteController,
  removeFavoriteController,
} from '../controllers/favorites.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

router.use(authenticate);

router.get('/', getFavoritesController);
router.post('/:productId', addFavoriteController);
router.delete('/:productId', removeFavoriteController);

export default router;
