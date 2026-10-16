import { model, Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

const productsSchema = new Schema(
  {
    type: { type: String, enum: ['phone', 'accessory'], required: true }, // discriminatorKey
    name: { type: String, required: true, trim: true }, // 'iPhone 16 Pro'
    slug: { type: String, required: true, unique: true },
    description: String,
    brand: { type: ObjectId, ref: 'brands', required: true },
    category: { type: ObjectId, ref: 'categories', required: true },
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
  { timestamps: true, discriminatorKey: 'type' },
);

export const ProductsCollection = model('products', productsSchema);

export const PhonesCollection = ProductsCollection.discriminator(
  'phone',
  new Schema({
    specs: {
      os: String,
      screenSize: Number,
      ram: Number,
      battery: Number,
    },
  }),
);

export const AccessoriesCollection = ProductsCollection.discriminator(
  'accessory',
  new Schema({
    accessoryType: {
      type: String,
      enum: [
        'case',
        'charger',
        'cable',
        'headphones',
        'screen-protector',
        'powerbank',
        'other',
      ],
      required: true,
    },
    compatibleWith: [{ type: Schema.Types.ObjectId, ref: 'products' }],
  }),
);
