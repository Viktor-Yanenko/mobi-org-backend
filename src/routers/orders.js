import { Router } from 'express';
import {
  createOrderController,
  getUserOrdersController,
  getOrderByIdController,
  cancelOrderController,
  getAllOrdersController,
  updateOrderStatusController,
  getOrderStatsController,
} from '../controllers/orders.js';
import { authenticate, requireAdmin } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from '../validation/orders.js';

const router = Router();

router.use(authenticate);

// адмінські маршрути стоять вище за /:orderId, щоб 'all' не сприймалось як id
router.get('/all', requireAdmin, getAllOrdersController);
// адмінські маршрути стоять вище за /:orderId, щоб 'all' і 'stats' не сприймались як id
router.get('/all', requireAdmin, getAllOrdersController);
router.get('/stats', requireAdmin, getOrderStatsController);
router.patch(
  '/:orderId/status',
  requireAdmin,
  validateBody(updateOrderStatusSchema),
  updateOrderStatusController,
);

router.post('/', validateBody(createOrderSchema), createOrderController);
router.get('/', getUserOrdersController);
router.get('/:orderId', getOrderByIdController);
router.post('/:orderId/cancel', cancelOrderController);

export default router;
