import { model, Schema } from 'mongoose';

const categoriesSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // 'smartphones', 'cases'
  type: { type: String, enum: ['phone', 'accessory'], required: true },
  parent: { type: ObjectId, ref: 'Category', default: null },
  image: String,
});

export const CategoriesCollection = model('categories', categoriesSchema);
