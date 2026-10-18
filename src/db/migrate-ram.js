import mongoose from 'mongoose';
import { initMongoDB } from './initMongoDB.js';
import { ProductsCollection } from './models/product.js';

// одноразовий перенос: specs.ram телефону копіюється в кожен його варіант
// (якщо у варіанті ram ще немає), а потім specs.ram видаляється.
// Через .collection, бо mongoose прибрав би specs.ram із запиту:
// цього поля вже немає в схемі
const migrate = async () => {
  await initMongoDB();

  const result = await ProductsCollection.collection.updateMany(
    { type: 'phone', 'specs.ram': { $exists: true } },
    [
      {
        $set: {
          variants: {
            $map: {
              input: '$variants',
              as: 'variant',
              in: {
                $mergeObjects: [
                  '$$variant',
                  { ram: { $ifNull: ['$$variant.ram', '$specs.ram'] } },
                ],
              },
            },
          },
        },
      },
      { $unset: 'specs.ram' },
    ],
  );

  console.log(`Phones updated: ${result.modifiedCount}`);
};

migrate()
  .catch((error) => {
    console.error('Migration failed', error);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
