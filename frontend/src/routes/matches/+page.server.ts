import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Matches are stored per market, so there is nothing to show before one is chosen. */
export const load: PageServerLoad = async ({ parent }) => {
	const { market } = await parent();
	if (!market) redirect(307, '/');
};
