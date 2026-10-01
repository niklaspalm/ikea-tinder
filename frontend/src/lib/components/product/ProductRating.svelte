<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import Icon from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages';
	import { formatRating } from '$lib/product';

	type Props = { rating: NonNullable<Product['rating']> };

	let { rating }: Props = $props();

	const formatted = $derived(formatRating(rating.value));
</script>

<p class="flex items-center gap-2 text-sm">
	<!-- Five pale stars with five solid ones on top, clipped to the rating: 4.1 fills 82%. -->
	<span class="relative inline-flex text-line-strong" aria-hidden="true">
		{#each { length: 5 }, star (star)}
			<Icon name="star" class="size-5 shrink-0" />
		{/each}
		<span class="absolute inset-y-0 left-0 flex overflow-hidden text-accent" style:width="{(rating.value / 5) * 100}%">
			{#each { length: 5 }, star (star)}
				<Icon name="star" class="size-5 shrink-0" />
			{/each}
		</span>
	</span>
	<span class="sr-only">{m.product_rating({ rating: formatted })},</span>
	<span class="font-bold" aria-hidden="true">{formatted}</span>
	<span class="text-ink/75">({m.product_review_count({ count: rating.count })})</span>
</p>
