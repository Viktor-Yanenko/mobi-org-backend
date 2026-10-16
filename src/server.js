import express from 'express';
import pino from 'pino-http';
import cors from 'cors';
import { getEnvVar } from './utils/getEnvVar.js';
import productsRouter from './routers/products.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';
import authRouter from './routers/auth.js';
import cartRouter from './routers/cart.js';
import ordersRouter from './routers/orders.js';
import catalogRouter from './routers/catalog.js';
import { UPLOAD_DIR } from './constants/index.js';
import reviewsRouter from './routers/reviews.js';
import favoritesRouter from './routers/favorites.js';
import usersRouter from './routers/users.js';

const PORT = Number(getEnvVar('PORT', 5000));
const FRONTEND_URL = getEnvVar('FRONTEND_URL', 'http://localhost:3000');

export const startServer = () => {
  const app = express();

  app.use(express.json());
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
  app.use(cookieParser());

  app.use(
    pino({
      transport: {
        target: 'pino-pretty',
      },
    }),
  );

  app.get('/', (req, res) => {
    res.json({
      message: 'Hello world!',
    });
  });

  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/auth', authRouter);
  app.use('/', catalogRouter);
  app.use('/', reviewsRouter);
  app.use('/products', productsRouter);
  app.use('/cart', cartRouter);
  app.use('/orders', ordersRouter);
  app.use('/favorites', favoritesRouter);
  app.use('/users', usersRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};
