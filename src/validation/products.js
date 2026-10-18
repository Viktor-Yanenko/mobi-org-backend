import Joi from 'joi';
import { ACCESSORY_TYPES } from '../constants/index.js';

const objectId = Joi.string().hex().length(24);

const variantSchema = Joi.object({
  sku: Joi.string().trim().uppercase().required(),
  color: Joi.string().trim(),
  storage: Joi.number().integer().min(1),
  price: Joi.number().integer().min(0).required(),
  oldPrice: Joi.number().integer().min(0),
  stock: Joi.number().integer().min(0).default(0),
  images: Joi.array().items(Joi.string().uri()),
});

const baseFields = {
  name: Joi.string().trim().min(2).max(120),
  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .messages({ 'string.pattern.base': 'slug: only a-z, 0-9 and "-"' }),
  description: Joi.string().trim().max(5000).allow(''),
  brand: objectId,
  category: objectId,
  images: Joi.array().items(Joi.string()),
  variants: Joi.array()
    .items(variantSchema)
    .min(1)
    .unique((a, b) => a.sku === b.sku),
  isActive: Joi.boolean(),
};

const phoneFields = {
  specs: Joi.object({
    os: Joi.string().trim(),
    processor: Joi.string().trim().max(60),
    ram: Joi.number().integer().min(1),
    screenSize: Joi.number().min(1).max(20),
    screenType: Joi.string().trim().max(40),
    refreshRate: Joi.number().integer().min(30).max(240),
    mainCamera: Joi.number().min(1).max(300),
    frontCamera: Joi.number().min(1).max(100),
    battery: Joi.number().integer().min(100),
    has5g: Joi.boolean(),
    hasNfc: Joi.boolean(),
    weight: Joi.number().integer().min(50).max(1000),
    waterResistance: Joi.string()
      .trim()
      .uppercase()
      .pattern(/^IP\d{2}$/)
      .messages({ 'string.pattern.base': 'waterResistance: format like IP68' }),
  }),
};

const accessoryFields = {
  accessoryType: Joi.string().valid(...ACCESSORY_TYPES),
  compatibleWith: Joi.array().items(objectId),
  attributes: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().trim().max(40).required(),
        value: Joi.string().trim().max(100).required(),
      }),
    )
    .max(20),
};

const requireKeys = (fields, keys) =>
  Joi.object(fields)
    .unknown(false)
    .fork(keys, (schema) => schema.required());

// при створенні type обов'язковий і визначає, які поля дозволені
export const createProductSchema = Joi.object({
  type: Joi.string().valid('phone', 'accessory').required(),
})
  // поки type невідомий, решту полів не перевіряємо
  .unknown(true)
  .when(Joi.object({ type: Joi.valid('phone').required() }).unknown(), {
    then: requireKeys({ ...baseFields, ...phoneFields }, [
      'name',
      'slug',
      'brand',
      'category',
      'variants',
    ]),
  })
  .when(Joi.object({ type: Joi.valid('accessory').required() }).unknown(), {
    then: requireKeys({ ...baseFields, ...accessoryFields }, [
      'name',
      'slug',
      'brand',
      'category',
      'variants',
      'accessoryType',
    ]),
  });

// при редагуванні всі поля необов'язкові, а type змінювати не можна
export const updateProductSchema = Joi.object({
  ...baseFields,
  ...phoneFields,
  ...accessoryFields,
}).min(1);

export const removeImageSchema = Joi.object({
  url: Joi.string().uri().required(),
});
