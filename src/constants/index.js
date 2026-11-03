export const FIFTEEN_MINUTES = 15 * 60 * 1000;
export const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
import path from 'node:path';

export const ORDER_STATUSES = [
  'new',
  'confirmed',
  'shipped', // відправлено / передано кур'єру
  'ready', // прибуло у відділення / готове до видачі в магазині
  'delivered', // покупець отримав
  'cancelled',
];

export const DELIVERY_COST = { 'nova-poshta': 80, courier: 150, pickup: 0 };
export const FREE_DELIVERY_FROM = 5000;

export const UPLOAD_DIR = path.resolve('uploads');

// статистика для адмінки
export const STATS_TIMEZONE = 'Europe/Kyiv';
export const LOW_STOCK = 3; // «закінчується», якщо на складі стільки або менше

// типи аксесуарів: однаковий список для моделі й валідації
export const ACCESSORY_TYPES = [
  'case',
  'charger',
  'cable',
  'headphones',
  'screen-protector',
  'powerbank',
  'smartwatch',
  'speaker',
  'memory-card',
  'holder',
  'other',
];

export const STATUS_FLOW = {
  'nova-poshta': ['new', 'confirmed', 'shipped', 'ready', 'delivered'],
  courier: ['new', 'confirmed', 'shipped', 'delivered'],
  pickup: ['new', 'confirmed', 'ready', 'delivered'],
};
