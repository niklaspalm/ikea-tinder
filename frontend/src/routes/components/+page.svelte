<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import ProductCard from '$lib/components/product/ProductCard.svelte';
	import ProductView from '$lib/components/product/ProductView.svelte';
	import ProductPrice from '$lib/components/product/ProductPrice.svelte';
	import ProductRating from '$lib/components/product/ProductRating.svelte';
	import ProductTitle from '$lib/components/product/ProductTitle.svelte';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import SwipeDeck from '$lib/components/swipe/SwipeDeck.svelte';
	import SwipeLoading from '$lib/components/swipe/SwipeLoading.svelte';
	import CountrySelector from '$lib/components/markets/CountrySelector.svelte';
	import { marketKey, type SelectableMarket } from '$lib/markets';
	import BottomNav, { type NavItem } from '$lib/components/nav/BottomNav.svelte';
	import MatchListItem from '$lib/components/matches/MatchListItem.svelte';
	import MatchSearch from '$lib/components/matches/MatchSearch.svelte';
	import { productMatchesQuery } from '$lib/matches';
	import { mainNavItems } from '$lib/navigation';
	import { sampleProduct, sampleProducts } from '$lib/fixtures/product';
	import { m } from '$lib/paraglide/messages';

	const edgeCaseProduct: Product = {
		...sampleProduct,
		id: `${sampleProduct.id}-edge`,
		name: 'SUPERLÅNGTPRODUKTNAMN / MED EXTRA TILLBEHÖR',
		designText: 'antracit/ljusgrå med väldigt lång designbeskrivning',
		price: null
	};

	let lastAction = $state<string>(m.showcase_action_prompt());
	const log = (message: (inputs: { name: string }) => string) => (product: Product) =>
		(lastAction = message({ name: product.name }));

	/** Shows the Matches item in a given state; the path is one no item matches. */
	const navStateRows = (): { label: string; currentPath: string; preview?: NavItem['preview'] }[] => [
		{ label: m.showcase_state_normal(), currentPath: '/components' },
		{ label: m.showcase_state_hover(), currentPath: '/components', preview: 'hover' },
		{ label: m.showcase_state_active(), currentPath: '/matches' },
		{ label: m.showcase_state_pressed(), currentPath: '/components', preview: 'pressed' }
	];
	const withMatchesPreview = (preview: NavItem['preview']) =>
		mainNavItems().map((item) => (item.href === '/matches' && preview ? { ...item, preview } : item));

	let matches = $state<Product[]>([...sampleProducts]);
	let matchQuery = $state('');
	const visibleMatches = $derived(matches.filter((product) => productMatchesQuery(product, matchQuery)));
	const removeMatch = (removed: Product) => (matches = matches.filter((product) => product.id !== removed.id));

	/** The sample with the most to show, so the product view demo exercises every section. */
	const detailScore = (product: Product) =>
		product.images.length +
		[product.rating, product.measurement, product.badge, product.price?.previous, product.variantCount].filter(Boolean).length +
		Math.min(product.colors.length, 2);
	const detailedSample = [...sampleProducts].sort((a, b) => detailScore(b) - detailScore(a))[0] ?? sampleProduct;

	const iconNames: IconName[] = [
		'close', 'heart', 'flame', 'info', 'info-circle', 'search', 'external', 'star', 'sun', 'moon', 'monitor',
		'chevron-left', 'chevron-right', 'undo'
	];
	const solidIcons = new Set<IconName>(['heart', 'flame', 'info-circle']);

	const priceRows = (): { label: string; price: Product['price'] }[] => [
		{ label: m.showcase_price_regular(), price: sampleProduct.price },
		{
			label: m.showcase_price_reduced(),
			price: sampleProduct.price && {
				...sampleProduct.price,
				previous: { label: 'Tidigare lägsta pris', formatted: '9 999:-' }
			}
		},
		{ label: m.showcase_price_unavailable(), price: null }
	];
	const sizes = ['sm', 'md', 'lg'] as const;

	let selectedMarket = $state<SelectableMarket>();

	let deckProducts = $state<Product[]>([...sampleProducts]);

	const swatches = [
		{ name: 'ikea-blue', className: 'bg-ikea-blue' },
		{ name: 'ikea-blue-deep', className: 'bg-ikea-blue-deep' },
		{ name: 'ikea-blue-50', className: 'bg-ikea-blue-50' },
		{ name: 'ikea-blue-100', className: 'bg-ikea-blue-100' },
		{ name: 'ikea-blue-200', className: 'bg-ikea-blue-200' },
		{ name: 'ikea-blue-900', className: 'bg-ikea-blue-900' },
		{ name: 'ikea-yellow', className: 'bg-ikea-yellow' },
		{ name: 'ikea-yellow-50', className: 'bg-ikea-yellow-50' },
		{ name: 'ikea-yellow-100', className: 'bg-ikea-yellow-100' },
		{ name: 'ikea-yellow-600', className: 'bg-ikea-yellow-600' }
	];
	const themeTokens = [
		{ name: 'canvas', className: 'bg-canvas' },
		{ name: 'surface', className: 'bg-surface' },
		{ name: 'ink', className: 'bg-ink' },
		{ name: 'line', className: 'bg-line' },
		{ name: 'line-strong', className: 'bg-line-strong' },
		{ name: 'tint', className: 'bg-tint' },
		{ name: 'tint-strong', className: 'bg-tint-strong' },
		{ name: 'accent', className: 'bg-accent' },
		{ name: 'highlight', className: 'bg-highlight' }
	];
</script>

<svelte:head>
	<title>{m.page_title({ page: m.showcase_page_title() })}</title>
</svelte:head>

<h1 class="text-2xl font-bold text-accent">{m.showcase_heading()}</h1>
<p class="mt-1 text-sm">{m.showcase_intro()}</p>
<div class="mt-4"><ThemeToggle /></div>

<section class="mt-8" aria-labelledby="colors-heading">
	<h2 id="colors-heading" class="text-lg font-bold">{m.showcase_colors_heading()}</h2>
	{#each [{ title: m.showcase_brand_colors(), items: swatches }, { title: m.showcase_theme_tokens(), items: themeTokens }] as group (group.title)}
		<h3 class="mt-4 mb-2 text-sm font-bold">{group.title}</h3>
		<ul class="grid grid-cols-2 gap-3">
			{#each group.items as swatch (swatch.name)}
				<li class="flex items-center gap-3 rounded-xl bg-surface p-2 shadow-sm">
					<span class="size-10 shrink-0 rounded-lg ring-1 ring-ink/15 {swatch.className}"></span>
					<code class="text-xs">{swatch.name}</code>
				</li>
			{/each}
		</ul>
	{/each}
</section>

<section class="mt-10" aria-labelledby="icons-heading">
	<h2 id="icons-heading" class="text-lg font-bold">{m.showcase_icons_heading()}</h2>
	<p class="mt-1 text-sm">{m.showcase_icons_intro()}</p>
	<ul class="mt-3 grid grid-cols-4 gap-3">
		{#each iconNames as name (name)}
			<li class="flex flex-col items-center gap-1 rounded-xl bg-surface p-3 text-accent shadow-sm">
				<span class="flex gap-2">
					<Icon {name} />
					{#if solidIcons.has(name)}<Icon {name} solid />{/if}
				</span>
				<code class="text-[0.65rem] text-ink">{name}</code>
			</li>
		{/each}
	</ul>
</section>

<section class="mt-10" aria-labelledby="country-heading">
	<h2 id="country-heading" class="text-lg font-bold">{m.showcase_country_heading()}</h2>
	<div class="mt-4">
		<CountrySelector bind:value={selectedMarket} />
	</div>
	<p class="mt-3 rounded-lg bg-highlight px-3 py-2 text-sm" aria-live="polite">
		{selectedMarket
			? m.showcase_country_selected({ market: marketKey(selectedMarket) })
			: m.showcase_country_none()}
	</p>
</section>

<section class="mt-10" aria-labelledby="blocks-heading">
	<h2 id="blocks-heading" class="text-lg font-bold">{m.showcase_blocks_heading()}</h2>
	<p class="mt-1 text-sm">{m.showcase_blocks_intro()}</p>

	<h3 class="mt-4 mb-2 text-sm font-bold">{m.showcase_block_title()}</h3>
	<div class="space-y-3">
		{#each sizes as size (size)}
			<div class="rounded-xl bg-surface p-3 shadow-sm">
				<code class="text-xs text-ink/60">size="{size}"</code>
				<ProductTitle product={sampleProduct} {size} level={3} withMeasurement={size === 'lg'} />
			</div>
		{/each}
	</div>

	<h3 class="mt-6 mb-2 text-sm font-bold">{m.showcase_block_price()}</h3>
	<div class="grid grid-cols-3 gap-3">
		{#each priceRows() as row (row.label)}
			<div class="rounded-xl bg-surface p-3 shadow-sm">
				<p class="mb-1 text-xs text-ink/60">{row.label}</p>
				<ProductPrice price={row.price} size="lg" />
			</div>
		{/each}
	</div>

	<h3 class="mt-6 mb-2 text-sm font-bold">{m.showcase_block_rating()}</h3>
	<div class="rounded-xl bg-surface p-3 shadow-sm">
		<ProductRating rating={sampleProduct.rating ?? { value: 4.3, count: 128 }} />
	</div>
</section>

<section class="mt-10" aria-labelledby="product-card-heading">
	<h2 id="product-card-heading" class="text-lg font-bold">{m.showcase_product_card_heading()}</h2>
	<p class="mt-1 text-sm">
		{m.showcase_product_card_intro()}
		{m.showcase_regenerate_label()} <code class="text-xs">npm run fixtures -w frontend</code>
	</p>
	<p class="mt-3 rounded-lg bg-highlight px-3 py-2 text-sm" aria-live="polite">{lastAction}</p>

	<div class="mt-4 space-y-8">
		<div>
			<h3 class="mb-2 text-sm font-bold">{m.showcase_variant_default()}</h3>
			<ProductCard
				product={sampleProduct}
				onlike={log(m.showcase_action_liked)}
				ondislike={log(m.showcase_action_disliked)}
				onmoreinfo={log(m.showcase_action_more_info)}
			/>
		</div>
		<div>
			<h3 class="mb-2 text-sm font-bold">{m.showcase_variant_edge_case()}</h3>
			<ProductCard
				product={edgeCaseProduct}
				onlike={log(m.showcase_action_liked)}
				ondislike={log(m.showcase_action_disliked)}
				onmoreinfo={log(m.showcase_action_more_info)}
			/>
		</div>
	</div>
</section>

<section class="mt-10" aria-labelledby="bottom-nav-heading">
	<h2 id="bottom-nav-heading" class="text-lg font-bold">{m.showcase_nav_heading()}</h2>
	<p class="mt-1 text-sm">{m.showcase_nav_intro()}</p>

	<div class="mt-4 space-y-4">
		{#each navStateRows() as row (row.label)}
			<div>
				<h3 class="mb-2 text-sm font-bold">{row.label}</h3>
				<div class="overflow-hidden rounded-2xl shadow-sm">
					<BottomNav items={withMatchesPreview(row.preview)} currentPath={row.currentPath} />
				</div>
			</div>
		{/each}
	</div>
</section>

<section class="mt-10" aria-labelledby="matches-heading">
	<h2 id="matches-heading" class="text-lg font-bold">{m.showcase_matches_heading()}</h2>
	<p class="mt-1 text-sm">{m.showcase_matches_intro()}</p>

	<div class="mt-4">
		<MatchSearch bind:value={matchQuery} resultCount={visibleMatches.length} />
	</div>

	{#if visibleMatches.length > 0}
		<ul class="mt-3 space-y-3">
			{#each visibleMatches as product (product.id)}
				<li><MatchListItem {product} onremove={removeMatch} /></li>
			{/each}
		</ul>
	{:else if matchQuery}
		<p class="mt-3 rounded-2xl bg-surface p-4 text-center text-sm">
			{m.match_search_no_results({ query: matchQuery })}
		</p>
	{/if}

	<button
		type="button"
		class="mt-4 rounded-full bg-ikea-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-ikea-blue-deep active:scale-95"
		onclick={() => {
			matches = [...sampleProducts];
			matchQuery = '';
		}}
	>
		{m.showcase_matches_reset()}
	</button>
</section>

<section class="mt-10" aria-labelledby="product-view-heading">
	<h2 id="product-view-heading" class="text-lg font-bold">{m.showcase_product_view_heading()}</h2>
	<p class="mt-1 text-sm">{m.showcase_product_view_intro()}</p>
	<div class="mt-4">
		<ProductView product={detailedSample} />
	</div>
</section>

<section class="mt-10" aria-labelledby="deck-heading">
	<h2 id="deck-heading" class="text-lg font-bold">{m.showcase_deck_heading()}</h2>
	<p class="mt-1 text-sm">{m.showcase_deck_intro()}</p>
	<p class="mt-3 rounded-lg bg-highlight px-3 py-2 text-sm" aria-live="polite">{lastAction}</p>
	<div class="relative mt-4 h-[36rem]">
		{#if deckProducts.length > 0}
			<SwipeDeck
				products={deckProducts}
				onswipe={(product, direction) => {
					deckProducts = deckProducts.filter((candidate) => candidate.id !== product.id);
					log(direction === 'right' ? m.showcase_action_liked : m.showcase_action_disliked)(product);
				}}
				onmoreinfo={log(m.showcase_action_more_info)}
			/>
		{:else}
			<div class="grid h-full place-items-center rounded-3xl bg-surface ring-1 ring-line">
				<div class="text-center">
					<p>{m.showcase_deck_empty()}</p>
					<button
						type="button"
						class="mt-3 rounded-full bg-ikea-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-ikea-blue-deep"
						onclick={() => (deckProducts = [...sampleProducts])}
					>
						{m.showcase_matches_reset()}
					</button>
				</div>
			</div>
		{/if}
	</div>
</section>

<section class="mt-10" aria-labelledby="loading-heading">
	<h2 id="loading-heading" class="text-lg font-bold">{m.showcase_loading_heading()}</h2>
	<p class="mt-1 text-sm">{m.showcase_loading_intro()}</p>
	<div class="mt-4 flex h-[30rem] flex-col">
		<SwipeLoading />
	</div>
</section>
