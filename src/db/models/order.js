import { model, Schema } from 'mongoose';
import { ORDER_STATUSES } from '../../constants/index.js';

const { ObjectId } = Schema.Types;

const ordersSchema = new Schema(
  {
    orderNumber: { type: Number, required: true, unique: true },
    user: { type: ObjectId, ref: 'users' }, // null для гостьового замовлення
    items: [
      {
        // знімок на момент покупки
        product: { type: ObjectId, ref: 'products' },
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
      enum: ORDER_STATUSES,
      default: 'new',
    },
    comment: String,
    statusHistory: [
      {
        _id: false,
        status: String,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

ordersSchema.pre('save', function () {
  if (this.isNew || this.isModified('status')) {
    this.statusHistory.push({ status: this.status, date: new Date() });
  }
});

export const OrdersCollection = model('orders', ordersSchema);
