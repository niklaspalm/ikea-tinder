<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import MatchListItem from '$lib/components/matches/MatchListItem.svelte';
	import MatchSearch from '$lib/components/matches/MatchSearch.svelte';
	import ProductView from '$lib/components/product/ProductView.svelte';
	import { getDecisionStore } from '$lib/decisions.svelte';
	import { productMatchesQuery } from '$lib/matches';
	import { m } from '$lib/paraglide/messages';

	const decisions = getDecisionStore();

	let query = $state('');
	let detailsProduct = $state<Product | null>(null);

	const visibleMatches = $derived(decisions.matches.filter((product) => productMatchesQuery(product, query)));

	/** Unmatching counts as a dislike, so the product doesn't come back in the swipe deck. */
	const unmatch = (product: Product) => {
		decisions.decide(product, 'dislike');
		detailsProduct = null;
	};
</script>

<svelte:head>
	<title>{m.page_title({ page: m.matches_page_title() })}</title>
</svelte:head>

<h1 class="mb-4 text-xl font-bold text-accent">{m.matches_heading()}</h1>

{#if !decisions.loaded}
	<div class="space-y-3" aria-busy="true">
		{#each { length: 3 }, index (index)}
			<div class="h-22 animate-pulse rounded-2xl bg-surface ring-1 ring-line motion-reduce:animate-none"></div>
		{/each}
	</div>
{:else if decisions.matches.length === 0}
	<section class="my-auto rounded-3xl bg-surface p-6 text-center shadow-sm ring-1 ring-line">
		<p>{m.matches_empty()}</p>
		<a
			href="/"
			class="mt-4 inline-flex h-12 items-center justify-center rounded-full bg-ikea-yellow px-6 font-bold text-ikea-blue-deep transition hover:bg-ikea-yellow-600"
		>
			{m.matches_empty_cta()}
		</a>
	</section>
{:else}
	<!--
		Sticks below the sticky header; the canvas background hides list rows scrolling underneath.
		z-15 sits above the rows' remove buttons (z-10) and below the header (z-20).
	-->
	<div class="sticky top-(--header-height) z-15 -mx-4 bg-canvas px-4 pt-1 pb-2">
		<MatchSearch bind:value={query} resultCount={visibleMatches.length} />
	</div>

	{#if visibleMatches.length > 0}
		<ul class="mt-3 space-y-3">
			{#each visibleMatches as product (product.id)}
				<li>
					<MatchListItem {product} onremove={unmatch} onopen={(selected) => (detailsProduct = selected)} />
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-3 rounded-2xl bg-surface p-4 text-center text-sm">
			{m.match_search_no_results({ query })}
		</p>
	{/if}
{/if}

<BottomSheet
	open={detailsProduct !== null}
	label={detailsProduct ? m.swipe_details_label({ name: detailsProduct.name }) : ''}
	onclose={() => (detailsProduct = null)}
>
	{#if detailsProduct}
		<ProductView product={detailsProduct} isMatch ondislike={unmatch} />
	{/if}
</BottomSheet>
