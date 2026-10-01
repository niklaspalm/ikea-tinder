<script lang="ts" module>
	export type SwipeDirection = 'left' | 'right';
</script>

<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import ProductCard from '$lib/components/product/ProductCard.svelte';
	import { m } from '$lib/paraglide/messages';

	type Props = {
		/** Products still to decide on, next one first. */
		products: Product[];
		/** Called once the card has left the screen: right = like, left = dislike. */
		onswipe: (product: Product, direction: SwipeDirection) => void;
		onmoreinfo?: (product: Product) => void;
	};

	let { products, onswipe, onmoreinfo }: Props = $props();

	/** Drag distance that commits a swipe; a quick flick commits earlier (see FLICK_VELOCITY). */
	const SWIPE_DISTANCE = 110;
	/** px per ms; lets a short, fast flick count as a swipe, like on Tinder. */
	const FLICK_VELOCITY = 0.6;
	const FLY_OUT_MS = 280;

	let offsetX = $state(0);
	let offsetY = $state(0);
	let dragging = $state(false);
	let leaving = $state(false);
	let dragStart = { x: 0, y: 0, time: 0 };

	// The top card plus two behind it: one visible, one preloading its image.
	const stack = $derived(products.slice(0, 3));
	const dragProgress = $derived(Math.min(Math.abs(offsetX) / SWIPE_DISTANCE, 1));

	const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/** Flies the top card off screen, then reports the decision. Also used by the buttons. */
	export function swipe(direction: SwipeDirection) {
		const product = products[0];
		if (!product || leaving) return;

		leaving = true;
		dragging = false;
		offsetX = (direction === 'right' ? 1 : -1) * (window.innerWidth + 200);

		setTimeout(
			() => {
				onswipe(product, direction);
				// Same tick as the parent removing the card, so the next card simply moves up.
				offsetX = 0;
				offsetY = 0;
				leaving = false;
			},
			prefersReducedMotion() ? 0 : FLY_OUT_MS
		);
	}

	const reset = () => {
		dragging = false;
		offsetX = 0;
		offsetY = 0;
	};

	const onpointerdown = (event: PointerEvent) => {
		// Buttons on the card keep working; only the card surface drags.
		if (leaving || (event.target as Element).closest('button, a')) return;
		dragging = true;
		dragStart = { x: event.clientX, y: event.clientY, time: performance.now() };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	};

	const onpointermove = (event: PointerEvent) => {
		if (!dragging) return;
		offsetX = event.clientX - dragStart.x;
		offsetY = (event.clientY - dragStart.y) * 0.3;
	};

	const onpointerup = () => {
		if (!dragging) return;
		const velocity = offsetX / Math.max(performance.now() - dragStart.time, 1);
		const isFlick = Math.abs(velocity) > FLICK_VELOCITY && Math.abs(offsetX) > 30;
		if (Math.abs(offsetX) > SWIPE_DISTANCE || isFlick) swipe(offsetX > 0 ? 'right' : 'left');
		else reset();
	};

	const cardStyle = (depth: number) => {
		if (depth === 0) {
			return [
				`transform: translate(${offsetX}px, ${offsetY}px) rotate(${offsetX / 18}deg)`,
				`transition: ${dragging ? 'none' : `transform ${FLY_OUT_MS}ms ease-out`}`,
				'z-index: 3'
			].join(';');
		}
		// Cards behind grow into place as the top card is dragged away.
		const scale = depth === 1 ? 0.94 + 0.06 * dragProgress : 0.9;
		const lift = depth === 1 ? 14 * (1 - dragProgress) : 28;
		return [
			`transform: translateY(${lift}px) scale(${scale})`,
			`transition: ${dragging ? 'none' : `transform ${FLY_OUT_MS}ms ease-out`}`,
			`z-index: ${3 - depth}`,
			depth === 2 ? 'opacity: 0' : ''
		].join(';');
	};
</script>

<!-- Fills the positioned parent; cards stack absolutely inside it. -->
<div class="absolute inset-0">
	{#each stack as product, depth (product.id)}
		<div
			class={[
				'absolute inset-0 touch-pan-y select-none motion-reduce:transition-none',
				depth === 0 && (dragging ? 'cursor-grabbing' : 'cursor-grab')
			]}
			style={cardStyle(depth)}
			role="group"
			aria-label={product.name}
			inert={depth > 0}
			onpointerdown={depth === 0 ? onpointerdown : undefined}
			onpointermove={depth === 0 ? onpointermove : undefined}
			onpointerup={depth === 0 ? onpointerup : undefined}
			onpointercancel={depth === 0 ? reset : undefined}
		>
			<ProductCard
				{product}
				fill
				onlike={() => swipe('right')}
				ondislike={() => swipe('left')}
				onmoreinfo={onmoreinfo}
			/>

			{#if depth === 0}
				<!-- Tinder-style stamps that fade in with the drag direction. -->
				<span
					class="pointer-events-none absolute top-8 left-6 -rotate-12 rounded-lg border-4 border-ikea-yellow bg-ikea-blue-deep/80 px-3 py-1 text-3xl font-black tracking-widest text-ikea-yellow"
					style:opacity={Math.max(0, Math.min(offsetX / SWIPE_DISTANCE, 1))}
					aria-hidden="true"
				>
					{m.swipe_stamp_like()}
				</span>
				<span
					class="pointer-events-none absolute top-8 right-6 rotate-12 rounded-lg border-4 border-white bg-ikea-blue-900/80 px-3 py-1 text-3xl font-black tracking-widest text-white"
					style:opacity={Math.max(0, Math.min(-offsetX / SWIPE_DISTANCE, 1))}
					aria-hidden="true"
				>
					{m.swipe_stamp_nope()}
				</span>
			{/if}
		</div>
	{/each}
</div>
