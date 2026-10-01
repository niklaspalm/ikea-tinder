<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages';

	type Props = {
		value?: string;
		/** When given, announces how many matches the current query leaves. */
		resultCount?: number;
	};

	let { value = $bindable(''), resultCount }: Props = $props();

	let input: HTMLInputElement;
	const inputId = $props.id();

	const clear = () => {
		value = '';
		input.focus();
	};
</script>

<search class="block">
	<label for={inputId} class="sr-only">{m.match_search_label()}</label>
	<div class="relative">
		<Icon
			name="search"
			strokeWidth={2.2}
			class="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink/60"
		/>

		<input
			bind:this={input}
			bind:value
			id={inputId}
			type="search"
			autocomplete="off"
			spellcheck="false"
			placeholder={m.match_search_placeholder()}
			class="h-12 w-full rounded-full bg-surface pr-12 pl-11 shadow-sm ring-1 ring-line-strong transition
				placeholder:text-ink/50 hover:ring-accent focus:ring-2 focus:ring-accent focus:outline-none
				[&::-webkit-search-cancel-button]:appearance-none"
		/>

		{#if value}
			<button
				type="button"
				class="absolute top-1/2 right-1 grid size-10 -translate-y-1/2 place-items-center rounded-full text-ink/70
					transition hover:bg-tint hover:text-accent active:scale-90"
				aria-label={m.match_search_clear()}
				onclick={clear}
			>
				<Icon name="close" strokeWidth={2.5} class="size-4" />
			</button>
		{/if}
	</div>

	{#if resultCount !== undefined}
		<p class="mt-2 px-4 text-sm text-ink/75" aria-live="polite">
			{m.match_search_results({ count: resultCount })}
		</p>
	{/if}
</search>
