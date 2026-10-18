import createHttpError from 'http-errors';
import { CartsCollection } from '../db/models/cart.js';
import { ProductsCollection } from '../db/models/product.js';

const MAX_QUANTITY = 10;

const findCart = async (userId) => {
  const cart = await CartsCollection.findOne({ user: userId });
  return cart ?? CartsCollection.create({ user: userId, items: [] });
};

// знаходить товар і потрібний варіант, кидає 404 якщо їх немає
const findVariant = async (productId, sku) => {
  const product = await ProductsCollection.findOne({
    _id: productId,
    isActive: true,
  });
  const variant = product?.variants.find((v) => v.sku === sku);

  if (!variant) {
    throw createHttpError(404, 'Product variant not found');
  }

  return variant;
};

// кошик у зручному для фронтенду вигляді: актуальні ціни й залишки
const formatCart = async (cart) => {
  await cart.populate('items.product', 'name slug images variants isActive');

  const items = cart.items
    .filter((item) => item.product?.isActive)
    .map((item) => {
      const variant = item.product.variants.find((v) => v.sku === item.sku);
      if (!variant) return null;

      return {
        product: {
          _id: item.product._id,
          name: item.product.name,
          slug: item.product.slug,
          image: variant.images[0] ?? item.product.images[0] ?? null,
        },
        sku: item.sku,
        color: variant.color,
        storage: variant.storage,
        ram: variant.ram,
        price: variant.price,
        oldPrice: variant.oldPrice,
        stock: variant.stock,
        quantity: item.quantity,
        subtotal: variant.price * item.quantity,
        isAvailable: variant.stock >= item.quantity,
      };
    })
    .filter(Boolean);

  return {
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.subtotal, 0),
  };
};

export const getCart = async (userId) => formatCart(await findCart(userId));

export const addCartItem = async (userId, { productId, sku, quantity }) => {
  const variant = await findVariant(productId, sku);
  const cart = await findCart(userId);

  const existingItem = cart.items.find((item) => item.sku === sku);
  const newQuantity = (existingItem?.quantity ?? 0) + quantity;

  if (newQuantity > Math.min(variant.stock, MAX_QUANTITY)) {
    throw createHttpError(409, `Only ${variant.stock} items in stock`);
  }

  if (existingItem) {
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({ product: productId, sku, quantity });
  }

  await cart.save();
  return formatCart(cart);
};

export const updateCartItem = async (userId, sku, quantity) => {
  const cart = await findCart(userId);
  const item = cart.items.find((i) => i.sku === sku);

  if (!item) {
    throw createHttpError(404, 'Item not found in cart');
  }

  // item.product може бути ObjectId або вже populated-документом, _id є в обох
  const variant = await findVariant(item.product._id, sku);
  if (quantity > variant.stock) {
    throw createHttpError(409, `Only ${variant.stock} items in stock`);
  }

  item.quantity = quantity;
  await cart.save();
  return formatCart(cart);
};

export const removeCartItem = async (userId, sku) => {
  const cart = await findCart(userId);
  cart.items = cart.items.filter((item) => item.sku !== sku);
  await cart.save();
  return formatCart(cart);
};

export const clearCart = async (userId) => {
  const cart = await findCart(userId);
  cart.items = [];
  await cart.save();
  return formatCart(cart);
};

// після входу переносимо гостьовий кошик з localStorage на сервер
export const mergeCart = async (userId, guestItems) => {
  const cart = await findCart(userId);

  for (const { productId, sku, quantity } of guestItems) {
    const variant = await findVariant(productId, sku).catch(() => null);
    if (!variant || variant.stock === 0) continue;

    const existingItem = cart.items.find((item) => item.sku === sku);
    const limit = Math.min(variant.stock, MAX_QUANTITY);

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + quantity, limit);
    } else {
      cart.items.push({
        product: productId,
        sku,
        quantity: Math.min(quantity, limit),
      });
    }
  }

  await cart.save();
  return formatCart(cart);
};
