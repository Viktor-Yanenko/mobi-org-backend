import { model, Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

const usersSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true }, // bcrypt-хеш
    phone: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses: [
      {
        city: String,
        novaPoshtaBranch: String,
        street: String,
        isDefault: Boolean,
      },
    ],
    favorites: [{ type: ObjectId, ref: 'products' }],
  },
  { timestamps: true, versionKey: false },
);

usersSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

export const UsersCollection = model('users', usersSchema);
