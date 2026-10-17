import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';
import { THIRTY_DAYS } from '../constants/index.js';

const isProduction = process.env.NODE_ENV === 'production';

const cookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction,
  maxAge: THIRTY_DAYS,
};

const setupSession = (res, session) => {
  res.cookie('sessionId', session._id.toString(), cookieOptions);
  res.cookie('refreshToken', session.refreshToken, cookieOptions);
};

export const registerUserController = async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: { accessToken: session.accessToken },
  });
};

export const refreshSessionController = async (req, res) => {
  const { sessionId, refreshToken } = req.cookies;
  if (!isValidObjectId(sessionId) || !refreshToken) {
    throw createHttpError(401, 'Session not found');
  }

  const session = await refreshSession({ sessionId, refreshToken });
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: session.accessToken },
  });
};

export const logoutUserController = async (req, res) => {
  if (isValidObjectId(req.cookies.sessionId)) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie('sessionId', cookieOptions);
  res.clearCookie('refreshToken', cookieOptions);
  res.status(204).send();
};

export const getCurrentUserController = (req, res) => {
  res.json({
    status: 200,
    message: 'Successfully found current user!',
    data: req.user,
  });
};
