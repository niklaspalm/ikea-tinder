<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import '@fontsource-variable/noto-sans';
	import './layout.css';
	import logo from '$lib/assets/logo.svg';
	import CountryFlag from '$lib/components/markets/CountryFlag.svelte';
	import BottomNav, { isActiveHref } from '$lib/components/nav/BottomNav.svelte';
	import { createDecisionStore, setDecisionStore } from '$lib/decisions.svelte';
	import { countryName, marketKey } from '$lib/markets';
	import { mainNavItems } from '$lib/navigation';
	import { m } from '$lib/paraglide/messages';

	let { data, children } = $props();

	/** Position in the bottom nav, so page transitions slide the way the user moves. */
	const navIndex = (path: string) => mainNavItems().findIndex((item) => isActiveHref(item.href, path));

	// Page transitions via the View Transitions API; browsers without it switch instantly.
	onNavigate((navigation) => {
		const from = navigation.from?.url.pathname;
		const to = navigation.to?.url.pathname;
		if (!document.startViewTransition || !from || !to || from === to) return;

		const root = document.documentElement;
		root.dataset.navDirection = navIndex(to) < navIndex(from) ? 'back' : 'forward';
		const pageTop = () => document.querySelector('main')?.getBoundingClientRect().top ?? 0;
		const oldTop = pageTop();

		return new Promise((resolve) => {
			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
				// The new page starts scrolled to the top. Keep the outgoing page where the user
				// was looking (see --page-old-y in layout.css) so the slide stays horizontal.
				root.style.setProperty('--page-old-y', `${oldTop - pageTop()}px`);
			});
			transition.finished.finally(() => {
				delete root.dataset.navDirection;
				root.style.removeProperty('--page-old-y');
			});
		});
	});

	const decisions = createDecisionStore();
	setDecisionStore(decisions);

	// Decisions live in localStorage, so they load in the browser only, per market.
	$effect(() => {
		if (data.market) decisions.load(marketKey(data.market));
	});
</script>

<svelte:head>
	<link rel="icon" href={logo} />
	<meta name="theme-color" content="#0c60a9" />
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<header class="sticky top-0 z-20 bg-ikea-blue text-white [view-transition-name:site-header]">
		<div class="mx-auto flex h-(--header-height) max-w-md items-center gap-3 px-4">
			<a href="/" class="flex items-center gap-3 rounded-lg">
				<img src={logo} alt="" class="size-9" />
				<!-- Brand wordmark: a proper name, intentionally not translated. -->
				<span class="text-xl font-bold tracking-tight">IKEA <span class="text-ikea-yellow">Tinder</span></span>
			</a>
			{#if data.market}
				<a
					href="/about#country"
					class="ml-auto rounded-md p-1 transition hover:bg-white/10"
					aria-label={m.header_change_country({ country: countryName(data.market.country) })}
				>
					<!-- White frame so flags with blue in them stay distinct on the blue header. -->
					<span class="block rounded-[3px] bg-white p-px">
						<CountryFlag country={data.market.country} class="block h-5 w-7" />
					</span>
				</a>
			{/if}
		</div>
	</header>

	<main class="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-4 short:py-2 [view-transition-name:page]">
		{@render children()}
	</main>

	<div class="sticky bottom-0 z-10 [view-transition-name:bottom-nav]">
		<BottomNav items={mainNavItems()} currentPath={page.url.pathname} />
	</div>
</div>

<div style="display:none">
	{#each locales as locale (locale)}
		<a
			href={resolve(localizeHref(page.url.pathname, { locale }) as Pathname)}
		>{locale}</a>
	{/each}
</div>
