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

	let dialog: HTMLDialogElement;

	// A modal <dialog> gives focus trapping, Escape to close and an inert background for free.
	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	aria-label={label}
	{onclose}
	onclick={(event) => {
		// A click on the dialog element itself (not its content) is a click on the backdrop.
		if (event.target === dialog) dialog.close();
	}}
	class="mx-auto mt-auto mb-0 max-h-[92dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-t-3xl bg-canvas p-4
		pb-[calc(1rem+env(safe-area-inset-bottom))] text-ink backdrop:bg-black/60 open:animate-[sheet-up_200ms_ease-out]
		motion-reduce:open:animate-none"
>
	{#if open}
		<div class="mb-3 flex justify-end">
			<button
				type="button"
				class="grid size-10 place-items-center rounded-full bg-surface text-ink/75 shadow-sm ring-1 ring-line transition hover:text-accent"
				aria-label={m.dialog_close()}
				onclick={() => dialog.close()}
			>
				<Icon name="close" strokeWidth={2.5} class="size-5" />
			</button>
		</div>
		{@render children()}
	{/if}
</dialog>
