import type { Product } from 'ikea-tinder-backend/server';

/** Lowercases and strips diacritics, so "fargad" finds "färgad" and "ÄPPLARÖ" finds "applaro". */
const normalize = (text: string) =>
	text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase();

/** True when every word of the query appears in the product's name, type or design. */
export const productMatchesQuery = (product: Product, query: string): boolean => {
	const words = normalize(query).split(/\s+/).filter(Boolean);
	if (words.length === 0) return true;

	const haystack = normalize([product.name, product.typeName, product.designText ?? ''].join(' '));
	return words.every((word) => haystack.includes(word));
};
