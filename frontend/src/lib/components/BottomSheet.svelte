<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages';

	type Props = {
		open: boolean;
		label: string;
		onclose: () => void;
		children: Snippet;
	};

	let { open, label, onclose, children }: Props = $props();

	/** Keep in sync with the sheet-down/backdrop-out durations below. */
	const CLOSE_MS = 200;

	let dialog: HTMLDialogElement;
	let closing = $state(false);

	/**
	 * A <dialog> closes instantly, so every close path (button, backdrop, Escape, parent)
	 * runs through here: play the slide-down first, then really close.
	 */
	const animateClose = () => {
		if (closing || !dialog.open) return;
		closing = true;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		setTimeout(
			() => {
				dialog.close();
				closing = false;
			},
			reduced ? 0 : CLOSE_MS
		);
	};

	// A modal <dialog> gives focus trapping, Escape to close and an inert background for free.
	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) animateClose();
	});
</script>

<dialog
	bind:this={dialog}
	aria-label={label}
	data-closing={closing || undefined}
	{onclose}
	oncancel={(event) => {
		// Escape: animate out instead of the browser's instant close.
		event.preventDefault();
		animateClose();
	}}
	onclick={(event) => {
		// A click on the dialog element itself (not its content) is a click on the backdrop.
		if (event.target === dialog) animateClose();
	}}
	class="mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl bg-canvas p-4
		pb-[calc(1rem+env(safe-area-inset-bottom))] text-ink backdrop:bg-black/60
		open:not-data-closing:animate-[sheet-up_250ms_cubic-bezier(0.2,0.9,0.3,1)]
		open:not-data-closing:backdrop:animate-[backdrop-in_250ms_ease-out]
		data-closing:animate-[sheet-down_200ms_ease-in_forwards]
		data-closing:backdrop:animate-[backdrop-out_200ms_ease-in_forwards]
		motion-reduce:animate-none motion-reduce:backdrop:animate-none"
>
	{#if open || closing}
		<!--
			Zero-height sticky row: the close button floats over the top-right corner of the
			content (and stays there while scrolling) without pushing anything down.
		-->
		<div class="sticky top-0 z-10 flex h-0 justify-end">
			<button
				type="button"
				class="mt-2 mr-2 grid size-10 place-items-center rounded-full bg-surface/90 text-ink/80 shadow-md ring-1 ring-line backdrop-blur transition hover:text-accent"
				aria-label={m.dialog_close()}
				onclick={animateClose}
			>
				<Icon name="close" strokeWidth={2.5} class="size-5" />
			</button>
		</div>
		{@render children()}
	{/if}
</dialog>
