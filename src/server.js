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
import { swaggerDocs } from './middlewares/swaggerDocs.js';

const PORT = Number(getEnvVar('PORT', 5000));
const isProduction = process.env.NODE_ENV === 'production';
const FRONTEND_URLS = getEnvVar('FRONTEND_URL', 'http://localhost:3000')
  .split(',')
  .map((url) => url.trim());

export const startServer = () => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(express.json());
  app.use(cors({ origin: FRONTEND_URLS, credentials: true }));
  app.use(cookieParser());

  // pino-pretty стоїть у devDependencies, на сервері пишемо звичайний JSON
  app.use(pino(isProduction ? {} : { transport: { target: 'pino-pretty' } }));

  app.get('/', (req, res) => {
    res.json({
      message: 'Hello world!',
    });
  });

  app.use('/uploads', express.static(UPLOAD_DIR));
  app.use('/api-docs', swaggerDocs());
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
