const parseNumber = (value, defaultValue) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : defaultValue;
};

// ?ram=8&ram=12 приходить масивом, ?ram=8,12 рядком: обидва варіанти дають [8, 12]
const parseNumberList = (value) => {
  const items = [value].flat().join(',').split(',');
  const numbers = items.map(Number).filter((n) => n > 0);
  return numbers.length ? numbers : undefined;
};

// ?attr=Довжина:1 м&attr=Довжина:2 м -> { Довжина: ['1 м', '2 м'] }
const parseAttributes = (value) => {
  const attributes = {};
  for (const item of [value].flat()) {
    if (typeof item !== 'string') continue;
    const index = item.indexOf(':');
    if (index < 1) continue;
    const name = item.slice(0, index);
    (attributes[name] ??= []).push(item.slice(index + 1));
  }
  return Object.keys(attributes).length ? attributes : undefined;
};

// ?compatible=iphone-16&compatible=galaxy-s25 -> ['iphone-16', 'galaxy-s25']
const parseTextList = (value) => {
  const items = [value].flat().filter((item) => typeof item === 'string');
  return items.length ? items : undefined;
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
    ram: query.ram && parseNumberList(query.ram),
    storage: query.storage && parseNumberList(query.storage),
    attributes: query.attr && parseAttributes(query.attr),
    compatible: query.compatible && parseTextList(query.compatible),
  };

  const sortBy = SORT_FIELDS[query.sortBy] ?? 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  return { page, perPage, filter, sort: { [sortBy]: sortOrder } };
};
