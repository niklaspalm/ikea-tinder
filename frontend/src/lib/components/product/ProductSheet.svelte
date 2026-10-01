<script lang="ts">
	import type { Snippet } from 'svelte';

	/** The shared shell of the swipe card and the product view: media on top, info below. */
	type Props = {
		label?: string;
		/** Fill the parent's height (the swipe deck); the media area then takes the leftover space. */
		fill?: boolean;
		media: Snippet;
		children: Snippet;
		footer?: Snippet;
	};

	let { label, fill = false, media, children, footer }: Props = $props();
</script>

<article
	class={[
		'flex flex-col overflow-hidden rounded-3xl bg-surface shadow-lg ring-1 ring-line',
		fill && 'h-full'
	]}
	aria-label={label}
>
	{@render media()}
	<div class="space-y-4 border-t border-line p-5 short:space-y-3 short:p-4">
		{@render children()}
	</div>
	{@render footer?.()}
</article>
