import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../services/favorites.js';

const checkProductId = (id) => {
  if (!isValidObjectId(id)) {
    throw createHttpError(404, 'Product not found');
  }
};

export const getFavoritesController = async (req, res) => {
  res.json({
    status: 200,
    message: 'Successfully found favorites!',
    data: await getFavorites(req.user._id),
  });
};

export const addFavoriteController = async (req, res) => {
  checkProductId(req.params.productId);

  res.json({
    status: 200,
    message: 'Added to favorites!',
    data: await addFavorite(req.user._id, req.params.productId),
  });
};

export const removeFavoriteController = async (req, res) => {
  checkProductId(req.params.productId);

  res.json({
    status: 200,
    message: 'Removed from favorites!',
    data: await removeFavorite(req.user._id, req.params.productId),
  });
};
