import { model, Schema } from 'mongoose';

const reviewsSchema = new Schema(
  {
    product: { type: ObjectId, ref: 'Product', required: true },
    user: { type: ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: String,
  },
  { product: 1, user: 1 },
);

export const ReviewsCollection = model('reviews', reviewsSchema);
