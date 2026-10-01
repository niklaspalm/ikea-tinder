<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import { invalidateAll } from '$app/navigation';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import ProductView from '$lib/components/product/ProductView.svelte';
	import { getDecisionStore } from '$lib/decisions.svelte';
	import { m } from '$lib/paraglide/messages';
	import SwipeDeck, { type SwipeDirection } from './SwipeDeck.svelte';
	import SwipeLoading from './SwipeLoading.svelte';

	type Props = { products: Product[] | null; loadFailed: boolean };

	let { products, loadFailed }: Props = $props();

	const decisions = getDecisionStore();

	let deck = $state<ReturnType<typeof SwipeDeck>>();
	let detailsProduct = $state<Product | null>(null);
	let announcement = $state('');
	let retrying = $state(false);

	/** Only products the user hasn't acted on; empty until storage is read so nothing flashes by. */
	const remaining = $derived(
		decisions.loaded && products ? products.filter((product) => !decisions.kindOf(product.id)) : []
	);
	const total = $derived(products?.length ?? 0);

	const onswipe = (product: Product, direction: SwipeDirection) => {
		decisions.decide(product, direction === 'right' ? 'like' : 'dislike');
		announcement =
			direction === 'right'
				? m.swipe_announce_liked({ name: product.name })
				: m.swipe_announce_disliked({ name: product.name });
	};

	/** Deciding from the details sheet closes it and plays the same fly-out as a swipe. */
	const decideFromDetails = (direction: SwipeDirection) => {
		detailsProduct = null;
		deck?.swipe(direction);
	};

	const retry = async () => {
		retrying = true;
		await invalidateAll();
		retrying = false;
	};

	const PRIMARY =
		'inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 font-bold transition active:scale-[0.98]';
</script>

<div class="flex flex-1 flex-col">
	<div class="mb-3 flex items-baseline short:mb-2 justify-between gap-3">
		<h1 class="text-xl font-bold text-accent">{m.swipe_heading()}</h1>
		{#if decisions.loaded && products}
			<p class="text-sm text-ink/75">{m.swipe_progress({ seen: total - remaining.length, total })}</p>
		{/if}
	</div>

	<!-- Screen readers hear each decision, since the card movement itself is visual. -->
	<p class="sr-only" aria-live="polite">{announcement}</p>

	{#if loadFailed}
		<section class="my-auto animate-[pop-in_350ms_ease-out_both] rounded-3xl bg-surface p-6 text-center shadow-sm ring-1 ring-line motion-reduce:animate-none">
			<h2 class="text-lg font-bold">{m.swipe_error_heading()}</h2>
			<p class="mt-1 text-ink/75">{m.swipe_error_body()}</p>
			<button
				type="button"
				class="{PRIMARY} mt-4 bg-ikea-blue text-white hover:bg-ikea-blue-deep disabled:opacity-60"
				disabled={retrying}
				onclick={retry}
			>
				{m.swipe_retry()}
			</button>
		</section>
	{:else if !decisions.loaded || !products}
		<SwipeLoading />
	{:else if remaining.length > 0}
		<div class="relative min-h-[28rem] flex-1 short:min-h-[19rem]">
			<SwipeDeck
				bind:this={deck}
				products={remaining}
				{onswipe}
				onmoreinfo={(product) => (detailsProduct = product)}
			/>
		</div>
	{:else}
		<section class="my-auto animate-[pop-in_350ms_ease-out_both] rounded-3xl bg-surface p-6 text-center shadow-sm ring-1 ring-line motion-reduce:animate-none">
			<Icon name="heart" solid class="mx-auto size-12 text-ikea-yellow" />
			<h2 class="mt-3 text-xl font-bold">{m.swipe_done_heading()}</h2>
			<p class="mt-1 text-ink/75">{m.swipe_done_body({ count: total })}</p>
			<div class="mt-5 flex flex-col gap-3">
				<a href="/matches" class="{PRIMARY} bg-ikea-yellow text-ikea-blue-deep hover:bg-ikea-yellow-600">
					{m.swipe_done_matches()}
				</a>
				<button
					type="button"
					class="{PRIMARY} bg-surface text-accent ring-2 ring-line-strong hover:ring-accent"
					onclick={() => decisions.clearDislikes()}
				>
					{m.swipe_done_restart()}
				</button>
			</div>
		</section>
	{/if}
</div>

<BottomSheet
	open={detailsProduct !== null}
	label={detailsProduct ? m.swipe_details_label({ name: detailsProduct.name }) : ''}
	onclose={() => (detailsProduct = null)}
>
	{#if detailsProduct}
		<ProductView
			product={detailsProduct}
			onlike={() => decideFromDetails('right')}
			ondislike={() => decideFromDetails('left')}
		/>
	{/if}
</BottomSheet>
