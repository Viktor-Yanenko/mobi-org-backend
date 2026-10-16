import Joi from 'joi';

export const registerUserSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(8).max(64).required(),
  phone: Joi.string().pattern(/^\+?\d{10,13}$/),
});

export const loginUserSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
});
