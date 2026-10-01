import type { NavItem } from '$lib/components/nav/BottomNav.svelte';
import { m } from '$lib/paraglide/messages';

/** A function, not a constant, so labels are resolved in the current request's locale. */
export const mainNavItems = (): NavItem[] => [
	{ href: '/', label: m.nav_swipe(), icon: 'flame' },
	{ href: '/matches', label: m.nav_matches(), icon: 'heart' },
	{ href: '/about', label: m.nav_about(), icon: 'info-circle' }
];
