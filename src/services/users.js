import bcrypt from 'bcryptjs';
import createHttpError from 'http-errors';

const MAX_ADDRESSES = 5;

export const updateProfile = async (user, payload) => {
  user.set(payload);
  return user.save();
};

export const changePassword = async (
  user,
  { currentPassword, newPassword },
) => {
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw createHttpError(400, 'Current password is wrong');
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
};

// лише одна адреса може бути основною
const setDefaultAddress = (user, addressId) => {
  user.addresses.forEach((address) => {
    address.isDefault = address._id.equals(addressId);
  });
};

const findAddress = (user, addressId) => {
  const address = user.addresses.id(addressId);
  if (!address) {
    throw createHttpError(404, 'Address not found');
  }
  return address;
};

export const addAddress = async (user, payload) => {
  if (user.addresses.length >= MAX_ADDRESSES) {
    throw createHttpError(409, `Maximum ${MAX_ADDRESSES} addresses allowed`);
  }

  user.addresses.push({ ...payload, isDefault: false });
  const address = user.addresses.at(-1);

  // перша адреса автоматично стає основною
  if (payload.isDefault || user.addresses.length === 1) {
    setDefaultAddress(user, address._id);
  }

  await user.save();
  return user.addresses;
};

export const updateAddress = async (user, addressId, payload) => {
  const address = findAddress(user, addressId);
  const { isDefault, ...fields } = payload;

  address.set(fields);
  if (isDefault) {
    setDefaultAddress(user, address._id);
  }

  await user.save();
  return user.addresses;
};

export const deleteAddress = async (user, addressId) => {
  const address = findAddress(user, addressId);
  const wasDefault = address.isDefault;

  address.deleteOne();

  // якщо видалили основну, основною стає перша з тих, що лишились
  if (wasDefault && user.addresses.length > 0) {
    setDefaultAddress(user, user.addresses[0]._id);
  }

  await user.save();
  return user.addresses;
};
