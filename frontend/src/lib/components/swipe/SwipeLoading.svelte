<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages';

	/** After this long, reassure the user that it's IKEA being slow, not the app being stuck. */
	const SLOW_AFTER_MS = 5000;

	let slow = $state(false);

	onMount(() => {
		const timer = setTimeout(() => (slow = true), SLOW_AFTER_MS);
		return () => clearTimeout(timer);
	});
</script>

<!--
	Shaped like the card that will replace it. It fades in after a short delay, so a
	fast response (cached products) never flashes a loading state.
-->
<div
	class="relative min-h-[28rem] flex-1 animate-[fade-in_300ms_ease-out_200ms_both] short:min-h-[19rem] motion-reduce:animate-none"
	role="status"
	aria-live="polite"
>
	<div class="absolute inset-0 flex flex-col overflow-hidden rounded-3xl bg-surface shadow-lg ring-1 ring-line">
		<div class="grid min-h-0 flex-1 place-items-center bg-white">
			<Icon
				name="flame"
				solid
				class="size-16 animate-[flame-pulse_1.2s_ease-in-out_infinite] text-ikea-yellow motion-reduce:animate-none"
			/>
		</div>
		<div class="space-y-3 border-t border-line p-5">
			<div class="h-5 w-2/5 animate-pulse rounded bg-tint motion-reduce:animate-none"></div>
			<div class="h-4 w-3/5 animate-pulse rounded bg-tint motion-reduce:animate-none"></div>
			<div class="h-8 w-1/4 animate-pulse rounded bg-tint motion-reduce:animate-none"></div>
		</div>
		<div class="px-5 pb-5 text-center">
			<p class="font-bold">{m.swipe_loading()}</p>
			{#if slow}
				<p class="mt-1 animate-[fade-in_300ms_ease-out_both] text-sm text-ink/75 motion-reduce:animate-none">
					{m.swipe_loading_slow()}
				</p>
			{/if}
		</div>
	</div>
</div>
