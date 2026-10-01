<script lang="ts">
	import type { Product } from 'ikea-tinder-backend/server';
	import Icon from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages';

	type Image = Product['images'][number];

	type Props = {
		images: Image[];
		/** Image to show first; null keeps the lightbox closed. */
		openAt: number | null;
		label: string;
		onclose: () => void;
	};

	let { images, openAt, label, onclose }: Props = $props();

	const ZOOM = 2.5;

	let dialog: HTMLDialogElement;
	let track = $state<HTMLDivElement>();
	let index = $state(0);
	let zoomed = $state(false);
	/** Zoom focus point in percent of the image; following the pointer pans the zoomed image. */
	let focus = $state({ x: 50, y: 50 });

	const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const goTo = (target: number, behavior: ScrollBehavior = prefersReducedMotion() ? 'instant' : 'smooth') => {
		const next = Math.max(0, Math.min(images.length - 1, target));
		zoomed = false;
		track?.scrollTo({ left: next * track.clientWidth, behavior });
		index = next;
	};

	$effect(() => {
		if (openAt === null) {
			if (dialog.open) dialog.close();
			return;
		}
		if (!dialog.open) {
			dialog.showModal();
			zoomed = false;
			// Jump straight to the tapped image once the dialog has its size.
			requestAnimationFrame(() => goTo(openAt, 'instant'));
		}
	});

	/** Native snap-scrolling (swipe on touch) decides the image; keep the counter in sync. */
	const onscroll = () => {
		if (zoomed || !track || track.clientWidth === 0) return;
		index = Math.round(track.scrollLeft / track.clientWidth);
	};

	const pointToFocus = (event: PointerEvent | MouseEvent, element: Element) => {
		const box = element.getBoundingClientRect();
		focus = {
			x: Math.max(0, Math.min(100, ((event.clientX - box.left) / box.width) * 100)),
			y: Math.max(0, Math.min(100, ((event.clientY - box.top) / box.height) * 100))
		};
	};

	const toggleZoom = (event: MouseEvent) => {
		if (zoomed) {
			zoomed = false;
			return;
		}
		// Keyboard activation has no pointer position (detail 0): zoom into the centre.
		if (event.detail === 0) focus = { x: 50, y: 50 };
		else pointToFocus(event, event.currentTarget as Element);
		zoomed = true;
	};

	const onkeydown = (event: KeyboardEvent) => {
		if (zoomed) return;
		if (event.key === 'ArrowRight') goTo(index + 1);
		if (event.key === 'ArrowLeft') goTo(index - 1);
	};

	const NAV =
		'absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white text-ikea-blue shadow-md ring-1 ring-ikea-blue-100 transition hover:bg-ikea-blue-50 disabled:invisible';
</script>

<!-- Photos sit on white in both themes, so the viewer is white too. -->
<dialog
	bind:this={dialog}
	aria-label={label}
	{onclose}
	oncancel={(event) => {
		// Escape zooms out first, and only closes from the normal view.
		if (zoomed) {
			event.preventDefault();
			zoomed = false;
		}
	}}
	{onkeydown}
	class="m-0 h-dvh max-h-none w-dvw max-w-none bg-white p-0 text-ikea-blue-900 backdrop:bg-black/70"
>
	{#if openAt !== null}
		<div
			bind:this={track}
			{onscroll}
			class={[
				'flex h-full snap-x snap-mandatory [scrollbar-width:none]',
				zoomed ? 'overflow-hidden' : 'overflow-x-auto'
			]}
		>
			{#each images as image, position (image.url)}
				<div class="relative h-full w-full shrink-0 snap-center overflow-hidden">
					<button
						type="button"
						class={[
							'size-full outline-offset-[-4px]',
							position === index && zoomed ? 'cursor-zoom-out touch-none' : 'cursor-zoom-in'
						]}
						aria-label={position === index && zoomed ? m.lightbox_zoom_out() : m.lightbox_zoom_in()}
						onclick={toggleZoom}
						onpointermove={(event) => {
							// Pan by following the pointer (mouse hover or a dragging finger).
							if (position === index && zoomed) pointToFocus(event, event.currentTarget);
						}}
					>
						<img
							src={image.url}
							alt={image.alt}
							draggable="false"
							class="size-full object-contain p-4 transition-transform duration-200 select-none motion-reduce:transition-none"
							style:transform={position === index && zoomed ? `scale(${ZOOM})` : 'none'}
							style:transform-origin="{focus.x}% {focus.y}%"
							loading={Math.abs(position - (openAt ?? 0)) <= 1 ? 'eager' : 'lazy'}
						/>
					</button>
				</div>
			{/each}
		</div>

		{#if !zoomed && images.length > 1}
			<button
				type="button"
				class="{NAV} left-3"
				aria-label={m.product_image_previous()}
				disabled={index === 0}
				onclick={() => goTo(index - 1)}
			>
				<Icon name="chevron-left" strokeWidth={2.5} class="size-6" />
			</button>
			<button
				type="button"
				class="{NAV} right-3"
				aria-label={m.product_image_next()}
				disabled={index === images.length - 1}
				onclick={() => goTo(index + 1)}
			>
				<Icon name="chevron-right" strokeWidth={2.5} class="size-6" />
			</button>
		{/if}

		<div class="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
			<p
				class="rounded-full bg-ikea-blue-900/80 px-3 py-1 text-sm font-bold text-white"
				aria-live="polite"
			>
				{m.product_image_position({ index: index + 1, count: images.length })}
			</p>
			<button
				type="button"
				class="pointer-events-auto grid size-11 place-items-center rounded-full bg-white text-ikea-blue-900 shadow-md ring-1 ring-ikea-blue-100 transition hover:text-ikea-blue"
				aria-label={m.dialog_close()}
				onclick={() => dialog.close()}
			>
				<Icon name="close" strokeWidth={2.5} class="size-5" />
			</button>
		</div>
	{/if}
</dialog>
