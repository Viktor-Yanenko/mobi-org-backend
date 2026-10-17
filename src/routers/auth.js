import { Router } from 'express';
import {
  registerUserController,
  loginUserController,
  refreshSessionController,
  logoutUserController,
  getCurrentUserController,
} from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { authenticate } from '../middlewares/authenticate.js';
import { registerUserSchema, loginUserSchema } from '../validation/auth.js';
import { loginLimiter } from '../middlewares/rateLimit.js';

const router = Router();

router.post(
  '/register',
  validateBody(registerUserSchema),
  registerUserController,
);
router.post(
  '/login',
  loginLimiter,
  validateBody(loginUserSchema),
  loginUserController,
);
router.post('/refresh', refreshSessionController);
router.post('/logout', logoutUserController);
router.get('/current', authenticate, getCurrentUserController);

export default router;
