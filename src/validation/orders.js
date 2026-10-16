import Joi from 'joi';
import { ORDER_STATUSES } from '../constants/index.js';

export const createOrderSchema = Joi.object({
  contact: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    phone: Joi.string()
      .pattern(/^\+?\d{10,13}$/)
      .required(),
    email: Joi.string().trim().lowercase().email().required(),
  }).required(),
  delivery: Joi.object({
    method: Joi.string().valid('nova-poshta', 'courier', 'pickup').required(),
    city: Joi.string().trim().when('method', {
      is: 'pickup',
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
    address: Joi.string().trim().when('method', {
      is: 'pickup',
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
  }).required(),
  payment: Joi.object({
    method: Joi.string().valid('card', 'cash-on-delivery').required(),
  }).required(),
  comment: Joi.string().trim().max(500).allow(''),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...ORDER_STATUSES)
    .required(),
});
