import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../services/reviews.js';

const checkId = (id, message) => {
  if (!isValidObjectId(id)) {
    throw createHttpError(404, message);
  }
};

export const getProductReviewsController = async (req, res) => {
  checkId(req.params.productId, 'Product not found');

  const page = Math.max(1, Number.parseInt(req.query.page) || 1);
  const perPage = Math.min(
    50,
    Math.max(1, Number.parseInt(req.query.perPage) || 10),
  );

  res.json({
    status: 200,
    message: 'Successfully found reviews!',
    data: await getProductReviews(req.params.productId, { page, perPage }),
  });
};

export const createReviewController = async (req, res) => {
  checkId(req.params.productId, 'Product not found');

  res.status(201).json({
    status: 201,
    message: 'Review created!',
    data: await createReview(req.params.productId, req.user._id, req.body),
  });
};

export const updateReviewController = async (req, res) => {
  checkId(req.params.reviewId, 'Review not found');

  res.json({
    status: 200,
    message: 'Review updated!',
    data: await updateReview(req.params.reviewId, req.user, req.body),
  });
};

export const deleteReviewController = async (req, res) => {
  checkId(req.params.reviewId, 'Review not found');
  await deleteReview(req.params.reviewId, req.user);
  res.status(204).send();
};
