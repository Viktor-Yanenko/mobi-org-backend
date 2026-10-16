import { model, Schema } from 'mongoose';

const brandsSchema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  logo: String,
});

export const BrandsCollection = model('brands', brandsSchema);
