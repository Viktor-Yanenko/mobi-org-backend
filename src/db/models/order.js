import { model, Schema } from 'mongoose';

const ordersSchema = new Schema({
  orderNumber: { type: Number, required: true, unique: true },
  user: { type: ObjectId, ref: 'User' }, // null для гостьового замовлення
  items: [
    {
      // знімок на момент покупки
      product: { type: ObjectId, ref: 'Product' },
      sku: String,
      name: String,
      image: String,
      price: Number,
      quantity: Number,
    },
  ],
  contact: { name: String, phone: String, email: String },
  delivery: {
    method: { type: String, enum: ['nova-poshta', 'courier', 'pickup'] },
    city: String,
    address: String, // відділення або адреса
    cost: { type: Number, default: 0 },
  },
  payment: {
    method: { type: String, enum: ['card', 'cash-on-delivery'] },
    status: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'new',
  },
  comment: String,
});

export const OrdersCollection = model('orders', ordersSchema);
