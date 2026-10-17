import createHttpError from 'http-errors';
import { rateLimit } from 'express-rate-limit';
import { FIFTEEN_MINUTES } from '../constants/index.js';

// не більше 5 невдалих входів у той самий акаунт за 15 хвилин.
// Рахуємо за email, а не за IP: на Render усі запити з сайту приходять
// через сервер Vercel з однаковими IP, і ліміт за IP блокував би всіх одразу
export const loginLimiter = rateLimit({
  windowMs: FIFTEEN_MINUTES,
  limit: 5,
  skipSuccessfulRequests: true, // вдалий вхід не рахується
  keyGenerator: (req) => String(req.body?.email ?? '').toLowerCase(),
  handler: (req, res, next) => {
    next(createHttpError(429, 'Too many login attempts, try again later'));
  },
});
