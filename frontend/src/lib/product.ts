import type { Product } from 'ikea-tinder-backend/server';
import { getLocale } from '$lib/paraglide/runtime';
import { m } from '$lib/paraglide/messages';

/** "Sängstomme, vit" — the type plus design, or just the type when there is no design text. */
export const describeProduct = (product: Product): string =>
	product.designText
		? m.product_description({ typeName: product.typeName, designText: product.designText })
		: product.typeName;

/** IKEA prints article numbers as 806.237.16; combination IDs ("s29626148") get the same grouping. */
export const formatArticleNumber = (id: string): string => {
	const digits = id.replace(/\D/g, '');
	return digits.length === 8 ? `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}` : id;
};

export const formatRating = (value: number): string =>
	new Intl.NumberFormat(getLocale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
