<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import Icon from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages';
	import { formatArticleNumber } from '$lib/product';
	import ProductImage from './ProductImage.svelte';
	import ProductPrice from './ProductPrice.svelte';
	import ProductRating from './ProductRating.svelte';
	import ProductSheet from './ProductSheet.svelte';
	import ProductTitle from './ProductTitle.svelte';

	type Props = {
		product: Product;
		/**
		 * Whether the product is already liked. A match offers "Remove from matches";
		 * anything else offers Like and Dislike. Without handlers no actions show.
		 */
		isMatch?: boolean;
		onlike?: (product: Product) => void;
		ondislike?: (product: Product) => void;
	};

	let { product, isMatch = false, onlike, ondislike }: Props = $props();

	const ACTION = 'flex h-12 flex-1 items-center justify-center gap-2 rounded-full font-bold transition active:scale-[0.98]';
	const SECONDARY = `${ACTION} bg-surface text-accent ring-2 ring-line-strong hover:ring-accent`;

	/** IKEA's "multicolour" has no hex value, so it gets a rainbow swatch. */
	const MULTICOLOR = 'conic-gradient(#e53935, #fdd835, #43a047, #1e88e5, #8e24aa, #e53935)';
</script>

<ProductSheet>
	{#snippet media()}
		{#if product.images.length > 1}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex: scrollable regions must be keyboard reachable (WCAG 2.1.1) -->
			<div
				role="region"
				aria-label={m.product_images_label({ name: product.name })}
				tabindex="0"
				class="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth p-4 outline-offset-[-4px] [scrollbar-width:thin]"
			>
				{#each product.images as image, index (image.url)}
					<ProductImage
						src={image.url}
						alt={image.alt}
						class="aspect-square w-[85%] shrink-0 snap-center rounded-2xl ring-1 ring-line"
						loading={index === 0 ? 'eager' : 'lazy'}
					/>
				{/each}
			</div>
		{:else}
			<ProductImage src={product.imageUrl} alt={product.imageAlt} class="aspect-square w-full p-6" />
		{/if}
	{/snippet}

	<header>
		{#if product.badge}
			<p class="mb-2 inline-block rounded-sm bg-ikea-yellow px-2 py-0.5 text-xs font-bold text-ikea-blue-deep">
				{product.badge}
			</p>
		{/if}
		<ProductTitle {product} size="lg" withMeasurement />
	</header>

	<ProductPrice price={product.price} size="lg" />

	{#if product.rating}
		<ProductRating rating={product.rating} />
	{/if}

	{#if isMatch && ondislike}
		<div class="space-y-2">
			<p class="flex items-center gap-1.5 text-sm font-bold text-accent">
				<Icon name="heart" solid class="size-4" />
				{m.product_in_matches()}
			</p>
			<div class="flex">
				<button type="button" class={SECONDARY} onclick={() => ondislike(product)}>
					<Icon name="close" strokeWidth={2.5} class="size-5" />
					{m.product_action_unmatch()}
				</button>
			</div>
		</div>
	{:else if !isMatch && (onlike || ondislike)}
		<div class="flex gap-3">
			{#if ondislike}
				<button type="button" class={SECONDARY} onclick={() => ondislike(product)}>
					<Icon name="close" strokeWidth={2.5} class="size-5" />
					{m.product_action_dislike()}
				</button>
			{/if}
			{#if onlike}
				<button
					type="button"
					class="{ACTION} bg-ikea-yellow text-ikea-blue-deep hover:bg-ikea-yellow-600"
					onclick={() => onlike(product)}
				>
					<Icon name="heart" solid class="size-5" />
					{m.product_action_like()}
				</button>
			{/if}
		</div>
	{/if}

	<a
		href={product.url}
		target="_blank"
		rel="noopener noreferrer"
		class="flex h-12 items-center justify-center gap-2 rounded-full bg-ikea-blue font-bold text-white transition hover:bg-ikea-blue-deep active:scale-[0.98]"
	>
		{m.product_view_on_ikea()}
		<span class="sr-only">{m.product_opens_new_tab()}</span>
		<Icon name="external" strokeWidth={2.5} class="size-4" />
	</a>

	<section aria-labelledby="details-{product.id}">
		<h3 id="details-{product.id}" class="mb-2 font-bold">{m.product_details_heading()}</h3>
		<dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
			<dt class="text-ink/75">{m.product_article_number()}</dt>
			<dd class="font-mono">{formatArticleNumber(product.id)}</dd>

			{#if product.measurement}
				<dt class="text-ink/75">{m.product_size()}</dt>
				<dd>{product.measurement}</dd>
			{/if}

			{#if product.colors.length > 0}
				<dt class="text-ink/75">{m.product_colors()}</dt>
				<dd>
					<ul class="flex flex-wrap gap-x-3 gap-y-1">
						{#each product.colors as color (color.name)}
							<li class="flex items-center gap-1.5">
								<span
									class="size-3.5 rounded-full ring-1 ring-black/15"
									style:background={color.hex ?? MULTICOLOR}
									aria-hidden="true"
								></span>
								{color.name}
							</li>
						{/each}
					</ul>
				</dd>
			{/if}

			{#if product.categories.length > 0}
				<dt class="text-ink/75">{m.product_category()}</dt>
				<dd>{product.categories.join(' › ')}</dd>
			{/if}

			{#if product.variantCount > 0}
				<dt class="text-ink/75">{m.product_variants()}</dt>
				<dd>{m.product_variant_count({ count: product.variantCount })}</dd>
			{/if}
		</dl>
	</section>
</ProductSheet>
