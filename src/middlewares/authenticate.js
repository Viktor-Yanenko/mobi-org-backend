import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  const [bearer, token] = (req.get('Authorization') ?? '').split(' ');

  if (bearer !== 'Bearer' || !token) {
    throw createHttpError(401, 'Please provide Authorization header');
  }

  const session = await SessionsCollection.findOne({ accessToken: token });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > session.accessTokenValidUntil) {
    throw createHttpError(401, 'Access token expired');
  }

  const user = await UsersCollection.findById(session.userId);
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  req.user = user;
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    throw createHttpError(403, 'Admin access required');
  }
  next();
};
