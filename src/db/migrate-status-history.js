import mongoose from 'mongoose';
import { initMongoDB } from './initMongoDB.js';
import { OrdersCollection } from './models/order.js';

// одноразові зміни замовлень, створених до кроку 32:
// 1) заповнюємо statusHistory. Точно відомо лише два моменти: створення
//    (createdAt) і остання зміна (updatedAt). Проміжні статуси таймлайн
//    покаже без дати
// 2) у самовивозу статус shipped замінюємо на новий ready
const migrate = async () => {
  await initMongoDB();

  const result = await OrdersCollection.collection.updateMany(
    { 'statusHistory.0': { $exists: false } },
    [
      {
        $set: {
          statusHistory: {
            $concatArrays: [
              [{ status: 'new', date: '$createdAt' }],
              {
                $cond: [
                  { $eq: ['$status', 'new'] },
                  [],
                  [{ status: '$status', date: '$updatedAt' }],
                ],
              },
            ],
          },
        },
      },
    ],
  );

  console.log(`Orders with new history: ${result.modifiedCount}`);

  // самовивіз більше не «відправляють»: shipped → ready (і в історії теж)
  const pickup = await OrdersCollection.collection.updateMany(
    {
      'delivery.method': 'pickup',
      $or: [{ status: 'shipped' }, { 'statusHistory.status': 'shipped' }],
    },
    [
      {
        $set: {
          status: {
            $cond: [{ $eq: ['$status', 'shipped'] }, 'ready', '$status'],
          },
          statusHistory: {
            $map: {
              input: '$statusHistory',
              as: 'entry',
              in: {
                $cond: [
                  { $eq: ['$$entry.status', 'shipped'] },
                  { $mergeObjects: ['$$entry', { status: 'ready' }] },
                  '$$entry',
                ],
              },
            },
          },
        },
      },
    ],
  );

  console.log(`Pickup orders shipped → ready: ${pickup.modifiedCount}`);
};

migrate()
  .catch((error) => {
    console.error('Migration failed', error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
