import Joi from 'joi';

const phone = Joi.string().pattern(/^\+?\d{10,13}$/);

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  phone: phone.allow(''),
}).min(1);

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .max(64)
    .invalid(Joi.ref('currentPassword'))
    .required()
    .messages({ 'any.invalid': 'New password must differ from current' }),
});

const addressFields = {
  city: Joi.string().trim().max(100),
  novaPoshtaBranch: Joi.string().trim().max(100),
  street: Joi.string().trim().max(200),
  isDefault: Joi.boolean(),
};

// місто обов'язкове, а далі або відділення Нової пошти, або вулиця
export const addAddressSchema = Joi.object(addressFields)
  .fork(['city'], (schema) => schema.required())
  .or('novaPoshtaBranch', 'street');

export const updateAddressSchema = Joi.object(addressFields).min(1);
