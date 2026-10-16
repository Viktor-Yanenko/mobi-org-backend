export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
import path from 'node:path';

export const ORDER_STATUSES = [
  'new',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

export const DELIVERY_COST = { 'nova-poshta': 80, courier: 150, pickup: 0 };
export const FREE_DELIVERY_FROM = 5000;

export const UPLOAD_DIR = path.resolve('uploads');
