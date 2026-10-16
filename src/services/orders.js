import createHttpError from 'http-errors';
import { OrdersCollection } from '../db/models/order.js';
import { CartsCollection } from '../db/models/cart.js';
import { ProductsCollection } from '../db/models/product.js';
import { getCart } from './cart.js';
import { DELIVERY_COST, FREE_DELIVERY_FROM } from '../constants/index.js';

// списує залишок, тільки якщо на складі вистачає (інакше нічого не змінює)
const decreaseStock = async ({ product, sku, quantity }) => {
  const result = await ProductsCollection.updateOne(
    {
      _id: product,
      variants: { $elemMatch: { sku, stock: { $gte: quantity } } },
    },
    { $inc: { 'variants.$.stock': -quantity } },
  );
  return result.modifiedCount === 1;
};

const increaseStock = ({ product, sku, quantity }) =>
  ProductsCollection.updateOne(
    { _id: product, 'variants.sku': sku },
    { $inc: { 'variants.$.stock': quantity } },
  );

const getNextOrderNumber = async () => {
  const lastOrder = await OrdersCollection.findOne().sort({ orderNumber: -1 });
  return (lastOrder?.orderNumber ?? 1000) + 1;
};

export const createOrder = async (userId, payload) => {
  const cart = await getCart(userId);

  if (cart.items.length === 0) {
    throw createHttpError(400, 'Cart is empty');
  }

  const unavailable = cart.items.filter((item) => !item.isAvailable);
  if (unavailable.length > 0) {
    throw createHttpError(409, 'Some items are out of stock', {
      errors: unavailable.map((item) => `${item.product.name} (${item.sku})`),
    });
  }

  // знімок позицій на момент покупки
  const items = cart.items.map((item) => ({
    product: item.product._id,
    sku: item.sku,
    name: item.product.name,
    image: item.product.image,
    price: item.price,
    quantity: item.quantity,
  }));

  // списуємо залишки; якщо хтось встиг купити раніше, повертаємо вже списане
  const decreased = [];
  for (const item of items) {
    if (!(await decreaseStock(item))) {
      await Promise.all(decreased.map(increaseStock));
      throw createHttpError(409, 'Some items are out of stock', {
        errors: [`${item.name} (${item.sku})`],
      });
    }
    decreased.push(item);
  }

  const deliveryCost =
    cart.totalPrice >= FREE_DELIVERY_FROM
      ? 0
      : DELIVERY_COST[payload.delivery.method];

  let order;
  try {
    order = await OrdersCollection.create({
      ...payload,
      orderNumber: await getNextOrderNumber(),
      user: userId,
      items,
      delivery: { ...payload.delivery, cost: deliveryCost },
      totalPrice: cart.totalPrice + deliveryCost,
    });
  } catch (error) {
    // замовлення не створилось, тому повертаємо списані залишки
    await Promise.all(items.map(increaseStock));
    throw error;
  }

  await CartsCollection.updateOne({ user: userId }, { items: [] });

  return order;
};

export const getUserOrders = (userId) =>
  OrdersCollection.find({ user: userId }).sort({ createdAt: -1 });

export const getOrderById = async (orderId, user) => {
  const order = await OrdersCollection.findById(orderId);

  // чуже замовлення бачить тільки адмін
  if (
    !order ||
    (user.role !== 'admin' && String(order.user) !== String(user._id))
  ) {
    throw createHttpError(404, 'Order not found');
  }

  return order;
};

export const cancelOrder = async (orderId, user) => {
  const order = await getOrderById(orderId, user);

  if (order.status !== 'new') {
    throw createHttpError(409, 'Only new orders can be cancelled');
  }

  order.status = 'cancelled';
  await order.save();
  await Promise.all(order.items.map(increaseStock));

  return order;
};

export const getAllOrders = async ({ page, perPage, status }) => {
  const filter = status ? { status } : {};

  const [totalItems, data] = await Promise.all([
    OrdersCollection.countDocuments(filter),
    OrdersCollection.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('user', 'name email'),
  ]);

  return {
    data,
    page,
    perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
  };
};

export const updateOrderStatus = async (orderId, status) => {
  const order = await OrdersCollection.findById(orderId);

  if (!order) {
    throw createHttpError(404, 'Order not found');
  }

  if (order.status === 'cancelled') {
    throw createHttpError(409, 'Cancelled order cannot be changed');
  }

  order.status = status;
  await order.save();

  if (status === 'cancelled') {
    await Promise.all(order.items.map(increaseStock));
  }

  return order;
};
