import { model, Schema } from 'mongoose';

const { ObjectId } = Schema.Types;

const sessionsSchema = new Schema(
  {
    userId: { type: ObjectId, ref: 'users', required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true },
  },
  { timestamps: true },
);

sessionsSchema.index({ refreshTokenValidUntil: 1 }, { expireAfterSeconds: 0 });

export const SessionsCollection = model('sessions', sessionsSchema);
