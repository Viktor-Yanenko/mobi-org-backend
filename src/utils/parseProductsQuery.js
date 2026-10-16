const parseNumber = (value, defaultValue) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : defaultValue;
};

const SORT_FIELDS = {
  price: 'minPrice',
  createdAt: 'createdAt',
  rating: 'rating.average',
  name: 'name',
};

export const parseProductsQuery = (query) => {
  const page = Math.max(1, Math.floor(parseNumber(query.page, 1)));
  const perPage = Math.min(
    50,
    Math.max(1, Math.floor(parseNumber(query.perPage, 12))),
  );

  const filter = {
    type: ['phone', 'accessory'].includes(query.type) ? query.type : undefined,
    brand: typeof query.brand === 'string' ? query.brand : undefined,
    category: typeof query.category === 'string' ? query.category : undefined,
    minPrice: parseNumber(query.minPrice, undefined),
    maxPrice: parseNumber(query.maxPrice, undefined),
    search: typeof query.search === 'string' ? query.search.trim() : undefined,
  };

  const sortBy = SORT_FIELDS[query.sortBy] ?? 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  return { page, perPage, filter, sort: { [sortBy]: sortOrder } };
};
