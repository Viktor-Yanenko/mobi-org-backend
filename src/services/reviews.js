import { Types } from 'mongoose';
import createHttpError from 'http-errors';
import { ReviewsCollection } from '../db/models/review.js';
import { ProductsCollection } from '../db/models/product.js';
import { OrdersCollection } from '../db/models/order.js';

// перераховує середню оцінку і кількість відгуків у товарі
const updateProductRating = async (productId) => {
  const [stats] = await ReviewsCollection.aggregate([
    // aggregate не перетворює рядок на ObjectId сам, тому робимо це вручну
    { $match: { product: new Types.ObjectId(String(productId)) } },
    {
      $group: {
        _id: null,
        average: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  await ProductsCollection.updateOne(
    { _id: productId },
    {
      rating: {
        average: stats ? Math.round(stats.average * 10) / 10 : 0,
        count: stats?.count ?? 0,
      },
    },
  );
};

export const getProductReviews = async (productId, { page, perPage }) => {
  const filter = { product: productId };

  const [totalItems, data] = await Promise.all([
    ReviewsCollection.countDocuments(filter),
    ReviewsCollection.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('user', 'name'),
  ]);

  return {
    data,
    page,
    perPage,
    totalItems,
    totalPages: Math.ceil(totalItems / perPage),
  };
};

export const createReview = async (productId, userId, payload) => {
  const productExists = await ProductsCollection.exists({
    _id: productId,
    isActive: true,
  });
  if (!productExists) {
    throw createHttpError(404, 'Product not found');
  }

  const isVerifiedPurchase = Boolean(
    await OrdersCollection.exists({
      user: userId,
      status: 'delivered',
      'items.product': productId,
    }),
  );

  let review;
  try {
    review = await ReviewsCollection.create({
      ...payload,
      product: productId,
      user: userId,
      isVerifiedPurchase,
    });
  } catch (error) {
    // унікальний індекс { product, user }: один відгук на товар
    if (error.code === 11000) {
      throw createHttpError(409, 'You have already reviewed this product');
    }
    throw error;
  }

  await updateProductRating(productId);
  return review;
};

// редагувати може тільки автор, видаляти автор або адмін
const findOwnReview = async (reviewId, user, { allowAdmin = false } = {}) => {
  const review = await ReviewsCollection.findById(reviewId);

  const isOwner = review && String(review.user) === String(user._id);
  const isAdmin = allowAdmin && user.role === 'admin';

  if (!review || (!isOwner && !isAdmin)) {
    throw createHttpError(404, 'Review not found');
  }

  return review;
};

export const updateReview = async (reviewId, user, payload) => {
  const review = await findOwnReview(reviewId, user);

  review.set(payload);
  await review.save();
  await updateProductRating(review.product);

  return review;
};

export const deleteReview = async (reviewId, user) => {
  const review = await findOwnReview(reviewId, user, { allowAdmin: true });

  await ReviewsCollection.deleteOne({ _id: review._id });
  await updateProductRating(review.product);
};
