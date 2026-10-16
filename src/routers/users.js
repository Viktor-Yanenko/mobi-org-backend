import { Router } from 'express';
import {
  getProfileController,
  updateProfileController,
  changePasswordController,
  addAddressController,
  updateAddressController,
  deleteAddressController,
} from '../controllers/users.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  addAddressSchema,
  updateAddressSchema,
} from '../validation/users.js';

const router = Router();

router.use(authenticate);

router.get('/me', getProfileController);
router.patch('/me', validateBody(updateProfileSchema), updateProfileController);
router.patch(
  '/me/password',
  validateBody(changePasswordSchema),
  changePasswordController,
);

router.post(
  '/me/addresses',
  validateBody(addAddressSchema),
  addAddressController,
);
router.patch(
  '/me/addresses/:addressId',
  validateBody(updateAddressSchema),
  updateAddressController,
);
router.delete('/me/addresses/:addressId', deleteAddressController);

export default router;
