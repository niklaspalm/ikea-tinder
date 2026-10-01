<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import Icon from '$lib/components/Icon.svelte';
	import ProductImage from '$lib/components/product/ProductImage.svelte';
	import ProductPrice from '$lib/components/product/ProductPrice.svelte';
	import ProductTitle from '$lib/components/product/ProductTitle.svelte';
	import { m } from '$lib/paraglide/messages';

	type Props = {
		product: Product;
		onremove?: (product: Product) => void;
		/** Opens the product in-app; without it the row links to the product on IKEA.com. */
		onopen?: (product: Product) => void;
	};

	let { product, onremove, onopen }: Props = $props();
</script>

<!-- The title link stretches over the whole row; the remove button sits above it. -->
<article
	class="relative flex items-center gap-4 rounded-2xl bg-surface p-3 shadow-sm ring-1 ring-line transition
		focus-within:ring-2 focus-within:ring-accent hover:shadow-md"
>
	<ProductImage src={product.imageUrl} alt="" class="size-16 shrink-0 rounded-xl" loading="lazy" />

	<div class="min-w-0 flex-1">
		<ProductTitle
			{product}
			size="sm"
			level={3}
			action={onopen
				? { label: m.match_view_details({ name: product.name }), onclick: () => onopen(product) }
				: { href: product.url, label: m.match_view_on_ikea({ name: product.name }), external: true }}
		/>
		<div class="mt-0.5"><ProductPrice price={product.price} size="sm" /></div>
	</div>

	{#if onremove}
		<button
			type="button"
			class="relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-ink/70 transition
				hover:bg-tint hover:text-accent active:scale-90 active:bg-tint-strong"
			aria-label={m.match_remove({ name: product.name })}
			onclick={() => onremove(product)}
		>
			<Icon name="close" strokeWidth={2.5} class="size-5" />
		</button>
	{/if}
</article>
