<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import Icon from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages';
	import ProductImage from './ProductImage.svelte';

	type Props = {
		product: Product;
		/** Take the leftover height of a flex column (the swipe deck) instead of being square. */
		fill?: boolean;
	};

	let { product, fill = false }: Props = $props();

	const images = $derived(
		product.images.length > 0 ? product.images : [{ url: product.imageUrl, alt: product.imageAlt }]
	);

	// A writable derived: starts at the first image and resets whenever the product changes.
	let index = $derived.by(() => {
		void product.id;
		return 0;
	});

	const current = $derived(images[Math.min(index, images.length - 1)]!);
	const next = $derived(images[index + 1]);
	const hasMany = $derived(images.length > 1);

	/**
	 * Tap zones are real buttons (keyboard, screen readers, disabled at the ends). They are
	 * marked swipe-through so the deck still starts a drag here; a tap without movement
	 * stays a click and steps the image.
	 */
	const ZONE =
		'group absolute inset-y-0 flex w-1/2 cursor-pointer items-center outline-offset-[-4px] disabled:cursor-default';
	const CHEVRON =
		'grid size-9 place-items-center rounded-full bg-white/90 text-ikea-blue shadow-md opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 group-disabled:hidden';
</script>

<!-- The stage stays white in both themes, like the photos themselves. -->
<div class={['flex flex-col bg-white', fill ? 'min-h-0 flex-1' : 'aspect-square']}>
	<div class="relative min-h-0 flex-1">
		<ProductImage src={current.url} alt={current.alt} class="absolute inset-0 size-full p-6" />

		{#if hasMany}
			<button
				type="button"
				data-swipe-through
				class="{ZONE} left-0 justify-start pl-3"
				aria-label={m.product_image_previous()}
				disabled={index === 0}
				onclick={() => (index = Math.max(0, index - 1))}
			>
				<span class={CHEVRON}><Icon name="chevron-left" strokeWidth={2.5} class="size-5" /></span>
			</button>
			<button
				type="button"
				data-swipe-through
				class="{ZONE} right-0 justify-end pr-3"
				aria-label={m.product_image_next()}
				disabled={index === images.length - 1}
				onclick={() => (index = Math.min(images.length - 1, index + 1))}
			>
				<span class={CHEVRON}><Icon name="chevron-right" strokeWidth={2.5} class="size-5" /></span>
			</button>
		{/if}
	</div>

	{#if hasMany}
		<div class="flex justify-center gap-1.5 pb-3" aria-hidden="true">
			{#each images as image, position (image.url)}
				<span
					class={[
						'h-1.5 rounded-full transition-all motion-reduce:transition-none',
						position === index ? 'w-5 bg-ikea-blue' : 'w-1.5 bg-ikea-blue-200'
					]}
				></span>
			{/each}
		</div>
		<p class="sr-only" aria-live="polite">
			{m.product_image_position({ index: index + 1, count: images.length })}
		</p>
		{#if next}
			<!-- Warm the cache so stepping forward doesn't flash. -->
			<link rel="prefetch" href={next.url} as="image" />
		{/if}
	{/if}
</div>
