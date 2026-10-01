<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import '@fontsource-variable/noto-sans';
	import './layout.css';
	import logo from '$lib/assets/logo.svg';
	import CountryFlag from '$lib/components/markets/CountryFlag.svelte';
	import BottomNav from '$lib/components/nav/BottomNav.svelte';
	import { createDecisionStore, setDecisionStore } from '$lib/decisions.svelte';
	import { countryName, marketKey } from '$lib/markets';
	import { mainNavItems } from '$lib/navigation';
	import { m } from '$lib/paraglide/messages';

	let { data, children } = $props();

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
	<header class="sticky top-0 z-20 bg-ikea-blue text-white">
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

	<main class="mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-4">
		{@render children()}
	</main>

	<div class="sticky bottom-0 z-10">
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
