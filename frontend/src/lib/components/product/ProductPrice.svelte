<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import { m } from '$lib/paraglide/messages';

	type Props = {
		price: Product['price'];
		/** sm: list rows · md: swipe card · lg: product view. The previous price shows from md up. */
		size?: 'sm' | 'md' | 'lg';
	};

	let { price, size = 'md' }: Props = $props();

	const PRICE_SIZE = { sm: 'text-base', md: 'text-3xl', lg: 'text-3xl' } as const;
</script>

<div>
	{#if price}
		<p class={['font-bold', PRICE_SIZE[size]]}>{price.formatted}</p>
		{#if price.previous && size !== 'sm'}
			<p class="text-sm text-ink/75">
				{price.previous.label}
				<s>{price.previous.formatted}</s>
			</p>
		{/if}
	{:else}
		<p class={['text-ink/75', size === 'sm' ? 'text-sm' : 'text-base']}>
			{m.product_price_unavailable()}
		</p>
	{/if}
</div>
