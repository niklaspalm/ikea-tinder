<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import { describeProduct } from '$lib/product';

	type Props = {
		product: Product;
		/** sm: list rows · md: swipe card · lg: product view */
		size?: 'sm' | 'md' | 'lg';
		level?: 2 | 3;
		/** Single line with ellipsis; defaults to on everywhere except the roomy lg size. */
		truncate?: boolean;
		withMeasurement?: boolean;
		/**
		 * Makes the name a link or button whose hit area stretches over the nearest
		 * `relative` ancestor, so a whole row is clickable without nesting interactive elements.
		 */
		action?: { label: string } & ({ href: string; external?: boolean } | { onclick: () => void });
	};

	let { product, size = 'md', level = 2, truncate = size !== 'lg', withMeasurement = false, action }: Props =
		$props();

	const description = $derived(
		withMeasurement && product.measurement
			? `${describeProduct(product)}, ${product.measurement}`
			: describeProduct(product)
	);

	const NAME_SIZE = { sm: 'text-base', md: 'text-xl', lg: 'text-2xl' } as const;
	const DESCRIPTION_SIZE = { sm: 'text-sm', md: 'text-sm', lg: 'text-base' } as const;
	/** The parent row shows focus (focus-within), so the element itself stays outline-free. */
	const STRETCHED = 'outline-none after:absolute after:inset-0';
</script>

<svelte:element
	this={`h${level}`}
	class={['font-bold tracking-wide uppercase', NAME_SIZE[size], truncate && 'truncate']}
>
	{#if action && 'href' in action}
		<a
			href={action.href}
			aria-label={action.label}
			class={STRETCHED}
			{...action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {}}
		>
			{product.name}
		</a>
	{:else if action}
		<button type="button" aria-label={action.label} class={['cursor-pointer text-left uppercase', STRETCHED]} onclick={action.onclick}>
			{product.name}
		</button>
	{:else}
		{product.name}
	{/if}
</svelte:element>
<p class={['text-ink/75', DESCRIPTION_SIZE[size], truncate && 'truncate']}>{description}</p>
