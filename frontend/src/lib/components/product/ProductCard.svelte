<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import Icon from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages';
	import { describeProduct } from '$lib/product';
	import ProductImageStepper from './ProductImageStepper.svelte';
	import ProductPrice from './ProductPrice.svelte';
	import ProductSheet from './ProductSheet.svelte';
	import ProductTitle from './ProductTitle.svelte';

	type Props = {
		product: Product;
		onlike?: (product: Product) => void;
		ondislike?: (product: Product) => void;
		onmoreinfo?: (product: Product) => void;
		/** Fill the parent's height instead of using a square image (the swipe deck). */
		fill?: boolean;
	};

	let { product, onlike, ondislike, onmoreinfo, fill = false }: Props = $props();

	const ACTION = 'grid place-items-center rounded-full shadow-md transition hover:scale-105 active:scale-95';
</script>

<ProductSheet {fill} label={m.product_card_label({ name: product.name, description: describeProduct(product) })}>
	{#snippet media()}
		<ProductImageStepper {product} {fill} />
	{/snippet}

	<div>
		<ProductTitle {product} size="md" />
		<div class="mt-2"><ProductPrice price={product.price} size="md" /></div>
	</div>

	{#snippet footer()}
		<div class="flex items-center justify-center gap-6 px-5 pb-5">
			<button
				type="button"
				class="{ACTION} size-16 bg-surface text-accent ring-2 ring-line-strong hover:ring-accent"
				aria-label={m.product_dislike({ name: product.name })}
				onclick={() => ondislike?.(product)}
			>
				<Icon name="close" strokeWidth={3} class="size-8" />
			</button>
			<button
				type="button"
				class="{ACTION} size-11 bg-ikea-blue text-white hover:bg-ikea-blue-deep"
				aria-label={m.product_more_info({ name: product.name })}
				onclick={() => onmoreinfo?.(product)}
			>
				<Icon name="info" />
			</button>
			<button
				type="button"
				class="{ACTION} size-16 bg-ikea-yellow text-ikea-blue-deep hover:bg-ikea-yellow-600"
				aria-label={m.product_like({ name: product.name })}
				onclick={() => onlike?.(product)}
			>
				<Icon name="heart" solid class="size-8" />
			</button>
		</div>
	{/snippet}
</ProductSheet>
