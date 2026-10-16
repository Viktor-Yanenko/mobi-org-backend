import { model, Schema } from 'mongoose';

const productsSchema = new Schema(
  {
    type: { type: String, enum: ['phone', 'accessory'], required: true }, // discriminatorKey
    name: { type: String, required: true, trim: true }, // 'iPhone 16 Pro'
    slug: { type: String, required: true, unique: true },
    description: String,
    brand: { type: ObjectId, ref: 'Brand', required: true },
    category: { type: ObjectId, ref: 'Category', required: true },
    images: [String], // URL (Cloudinary)
    variants: [
      {
        // колір / пам'ять
        sku: { type: String, required: true },
        color: String,
        storage: Number, // ГБ, для аксесуарів не задається
        price: { type: Number, required: true, min: 0 }, // грн
        oldPrice: { type: Number, min: 0 }, // для знижки
        stock: { type: Number, default: 0, min: 0 },
        images: [String],
      },
    ],
    minPrice: Number, // мінімальна ціна серед варіантів, рахувати в pre('save')
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
  { discriminatorKey: 'type' },
);

export const ProductsCollection = model('products', productsSchema);
