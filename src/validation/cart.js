import Joi from 'joi';

const objectId = Joi.string().hex().length(24);

export const addCartItemSchema = Joi.object({
  productId: objectId.required(),
  sku: Joi.string().required(),
  quantity: Joi.number().integer().min(1).max(10).default(1),
});

export const updateCartItemSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(10).required(),
});

export const mergeCartSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: objectId.required(),
        sku: Joi.string().required(),
        quantity: Joi.number().integer().min(1).max(10).default(1),
      }),
    )
    .max(50)
    .required(),
});
