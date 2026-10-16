import { model, Schema } from 'mongoose';

const cartsSchema = new Schema({
  user: { type: ObjectId, ref: 'User', required: true, unique: true },
  items: [
    {
      product: { type: ObjectId, ref: 'Product', required: true },
      sku: { type: String, required: true }, // який варіант
      quantity: { type: Number, min: 1, default: 1 },
    },
  ],
});

export const CartsCollection = model('carts', cartsSchema);
