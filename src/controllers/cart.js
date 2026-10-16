import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeCart,
} from '../services/cart.js';

const sendCart = (res, cart, message) => {
  res.json({ status: 200, message, data: cart });
};

export const getCartController = async (req, res) => {
  sendCart(res, await getCart(req.user._id), 'Successfully found cart!');
};

export const addCartItemController = async (req, res) => {
  const cart = await addCartItem(req.user._id, req.body);
  sendCart(res, cart, 'Item added to cart!');
};

export const updateCartItemController = async (req, res) => {
  const cart = await updateCartItem(
    req.user._id,
    req.params.sku,
    req.body.quantity,
  );
  sendCart(res, cart, 'Cart item updated!');
};

export const removeCartItemController = async (req, res) => {
  const cart = await removeCartItem(req.user._id, req.params.sku);
  sendCart(res, cart, 'Item removed from cart!');
};

export const clearCartController = async (req, res) => {
  sendCart(res, await clearCart(req.user._id), 'Cart cleared!');
};

export const mergeCartController = async (req, res) => {
  const cart = await mergeCart(req.user._id, req.body.items);
  sendCart(res, cart, 'Cart merged!');
};
