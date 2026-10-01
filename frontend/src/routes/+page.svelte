<script lang="ts">
	import { enhance } from '$app/forms';
	import CountrySelector from '$lib/components/markets/CountrySelector.svelte';
	import SwipeScreen from '$lib/components/swipe/SwipeScreen.svelte';
	import { m } from '$lib/paraglide/messages';

	let { data } = $props();
</script>

<svelte:head>
	<title>{m.page_title({ page: data.market ? m.swipe_page_title() : m.home_page_title() })}</title>
</svelte:head>

{#if data.deck}
	<!-- The deck streams in: the page shows a loading screen until IKEA answers. -->
	{#await data.deck}
		<SwipeScreen products={null} loadFailed={false} />
	{:then deck}
		<SwipeScreen products={deck.products} loadFailed={deck.failed} />
	{/await}
{:else}
	<section class="rounded-3xl bg-surface p-6 shadow-sm ring-1 ring-line">
		<h1 class="text-2xl font-bold text-accent">{m.home_heading()}</h1>
		<p class="mt-2">{m.home_intro()}</p>

		<!-- A real form post: picking a country works even before JavaScript has loaded. -->
		<form method="POST" action="?/selectMarket" use:enhance class="mt-6">
			<CountrySelector name="market" required />
			<button
				type="submit"
				class="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-ikea-yellow font-bold text-ikea-blue-deep transition hover:bg-ikea-yellow-600 active:scale-[0.98]"
			>
				{m.home_start()}
			</button>
		</form>
	</section>
{/if}
