import Joi from 'joi';

const name = Joi.string().trim().min(2).max(60);
const slug = Joi.string()
  .trim()
  .lowercase()
  .pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .messages({ 'string.pattern.base': 'slug: only a-z, 0-9 and "-"' });

export const createBrandSchema = Joi.object({
  name: name.required(),
  slug: slug.required(),
});

export const updateBrandSchema = Joi.object({ name, slug }).min(1);

export const createCategorySchema = Joi.object({
  name: name.required(),
  slug: slug.required(),
  type: Joi.string().valid('phone', 'accessory').required(),
});

// тип не змінюємо: телефони в категорії аксесуарів зламали б каталог
export const updateCategorySchema = Joi.object({ name, slug }).min(1);
