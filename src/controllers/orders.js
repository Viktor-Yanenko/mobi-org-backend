import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus,
} from '../services/orders.js';
import { ORDER_STATUSES } from '../constants/index.js';

const checkOrderId = (id) => {
  if (!isValidObjectId(id)) {
    throw createHttpError(404, 'Order not found');
  }
};

export const createOrderController = async (req, res) => {
  const order = await createOrder(req.user._id, req.body);

  res.status(201).json({
    status: 201,
    message: 'Order created!',
    data: order,
  });
};

export const getUserOrdersController = async (req, res) => {
  res.json({
    status: 200,
    message: 'Successfully found orders!',
    data: await getUserOrders(req.user._id),
  });
};

export const getOrderByIdController = async (req, res) => {
  checkOrderId(req.params.orderId);

  res.json({
    status: 200,
    message: 'Successfully found order!',
    data: await getOrderById(req.params.orderId, req.user),
  });
};

export const cancelOrderController = async (req, res) => {
  checkOrderId(req.params.orderId);

  res.json({
    status: 200,
    message: 'Order cancelled!',
    data: await cancelOrder(req.params.orderId, req.user),
  });
};

export const getAllOrdersController = async (req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page) || 1);
  const perPage = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.perPage) || 20),
  );
  const status = ORDER_STATUSES.includes(req.query.status)
    ? req.query.status
    : undefined;

  res.json({
    status: 200,
    message: 'Successfully found orders!',
    data: await getAllOrders({ page, perPage, status }),
  });
};

export const updateOrderStatusController = async (req, res) => {
  checkOrderId(req.params.orderId);

  res.json({
    status: 200,
    message: 'Order status updated!',
    data: await updateOrderStatus(req.params.orderId, req.body.status),
  });
};
