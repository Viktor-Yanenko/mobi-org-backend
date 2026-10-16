import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';
import {
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
} from '../services/users.js';

const checkAddressId = (id) => {
  if (!isValidObjectId(id)) {
    throw createHttpError(404, 'Address not found');
  }
};

export const getProfileController = (req, res) => {
  res.json({
    status: 200,
    message: 'Successfully found profile!',
    data: req.user,
  });
};

export const updateProfileController = async (req, res) => {
  res.json({
    status: 200,
    message: 'Profile updated!',
    data: await updateProfile(req.user, req.body),
  });
};

export const changePasswordController = async (req, res) => {
  await changePassword(req.user, req.body);
  res.status(204).send();
};

export const addAddressController = async (req, res) => {
  res.status(201).json({
    status: 201,
    message: 'Address added!',
    data: await addAddress(req.user, req.body),
  });
};

export const updateAddressController = async (req, res) => {
  checkAddressId(req.params.addressId);

  res.json({
    status: 200,
    message: 'Address updated!',
    data: await updateAddress(req.user, req.params.addressId, req.body),
  });
};

export const deleteAddressController = async (req, res) => {
  checkAddressId(req.params.addressId);

  res.json({
    status: 200,
    message: 'Address deleted!',
    data: await deleteAddress(req.user, req.params.addressId),
  });
};
