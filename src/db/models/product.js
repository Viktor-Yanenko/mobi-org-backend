import { model, Schema } from 'mongoose';
import { ACCESSORY_TYPES } from '../../constants/index.js';

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
        storage: Number,
        ram: Number,
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

productsSchema.pre('save', function () {
  this.minPrice = this.variants.length
    ? Math.min(...this.variants.map((variant) => variant.price))
    : undefined;
});

export const ProductsCollection = model('products', productsSchema);

export const PhonesCollection = ProductsCollection.discriminator(
  'phone',
  new Schema({
    specs: {
      os: String,
      processor: String,
      screenSize: Number, // дюйми
      screenType: String, // OLED, AMOLED, IPS…
      refreshRate: Number, // Гц
      mainCamera: Number, // Мп
      frontCamera: Number, // Мп
      battery: Number, // мА·год
      has5g: Boolean,
      hasNfc: Boolean,
      weight: Number, // г
      waterResistance: String, // IP68
    },
  }),
);

export const AccessoriesCollection = ProductsCollection.discriminator(
  'accessory',
  new Schema({
    accessoryType: { type: String, enum: ACCESSORY_TYPES, required: true },
    // довільні характеристики: у кабелю довжина, у павербанка ємність тощо
    attributes: [
      {
        _id: false,
        name: { type: String, required: true }, // «Довжина»
        value: { type: String, required: true }, // «1 м»
      },
    ],
    compatibleWith: [{ type: Schema.Types.ObjectId, ref: 'products' }],
  }),
);
