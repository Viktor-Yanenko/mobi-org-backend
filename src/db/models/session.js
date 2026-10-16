import { model, Schema } from 'mongoose';

const sessionsSchema = new Schema(
  {
    userId: { type: ObjectId, ref: 'User', required: true },
    accessToken: { type: String, required: true },
    refreshToken: { type: String, required: true },
    accessTokenValidUntil: { type: Date, required: true },
    refreshTokenValidUntil: { type: Date, required: true },
  },
  { refreshTokenValidUntil: 1 },
  { expireAfterSeconds: 0 },
);

export const SessionsCollection = model('sessions', sessionsSchema);
