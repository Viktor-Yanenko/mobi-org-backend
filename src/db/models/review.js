import { model, Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

const reviewsSchema = new Schema(
  {
    product: { type: ObjectId, ref: 'products', required: true },
    user: { type: ObjectId, ref: 'users', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: String,
  },
  { timestamps: true },
);

reviewsSchema.index({ product: 1, user: 1 }, { unique: true });

export const ReviewsCollection = model('reviews', reviewsSchema);
