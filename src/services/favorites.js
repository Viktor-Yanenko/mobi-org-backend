import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/user.js';
import { ProductsCollection } from '../db/models/product.js';

export const getFavorites = async (userId) => {
  const user = await UsersCollection.findById(userId).populate({
    path: 'favorites',
    match: { isActive: true }, // приховані адміном товари не показуємо
    select: 'type name slug images minPrice rating',
  });

  // match повертає null на місці прихованих товарів, прибираємо їх
  return user.favorites.filter(Boolean);
};

export const addFavorite = async (userId, productId) => {
  const productExists = await ProductsCollection.exists({
    _id: productId,
    isActive: true,
  });
  if (!productExists) {
    throw createHttpError(404, 'Product not found');
  }

  // $addToSet не додасть товар вдруге, якщо він уже в обраному
  await UsersCollection.updateOne(
    { _id: userId },
    { $addToSet: { favorites: productId } },
  );

  return getFavorites(userId);
};

export const removeFavorite = async (userId, productId) => {
  await UsersCollection.updateOne(
    { _id: userId },
    { $pull: { favorites: productId } },
  );

  return getFavorites(userId);
};
