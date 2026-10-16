import { model, Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

const cartsSchema = new Schema({
  user: { type: ObjectId, ref: 'users', required: true, unique: true },
  items: [
    {
      product: { type: ObjectId, ref: 'products', required: true },
      sku: { type: String, required: true }, // який варіант
      quantity: { type: Number, min: 1, default: 1 },
    },
  ],
});

export const CartsCollection = model('carts', cartsSchema);
