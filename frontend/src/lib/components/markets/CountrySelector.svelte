<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { countryName, marketKey, SELECTABLE_MARKETS, type SelectableMarket } from '$lib/markets';
	import CountryFlag from './CountryFlag.svelte';

	type Props = {
		value?: SelectableMarket;
		onselect?: (market: SelectableMarket) => void;
		/** Form field name; set it to submit the choice (as "se/sv") with a surrounding form. */
		name?: string;
		required?: boolean;
	};

	let { value = $bindable(), onselect, name, required = false }: Props = $props();

	// Radios need a shared name to form one group; standalone use gets a unique one.
	const fallbackName = $props.id();

	const markets = $derived(
		[...SELECTABLE_MARKETS].sort((a, b) => countryName(a.country).localeCompare(countryName(b.country)))
	);

	const select = (market: SelectableMarket) => {
		value = market;
		onselect?.(market);
	};
</script>

<!--
	Native radios: one tab stop, arrow keys to move, announced as a group. The selection is
	uncontrolled (defaultChecked) so a tap made before hydration is not reset by it.
-->
<fieldset>
	<legend class="mb-3 font-bold">{m.country_selector_label()}</legend>
	<div class="space-y-2">
		{#each markets as market (marketKey(market))}
			<label
				class="group flex cursor-pointer items-center gap-3 rounded-2xl bg-surface px-4 py-3 shadow-sm ring-1 ring-line transition select-none
					hover:ring-accent has-checked:bg-tint has-checked:ring-2 has-checked:ring-accent
					has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ikea-yellow"
			>
				<input
					type="radio"
					name={name ?? fallbackName}
					{required}
					value={marketKey(market)}
					defaultChecked={value !== undefined && marketKey(value) === marketKey(market)}
					onchange={() => select(market)}
					class="sr-only"
				/>
				<CountryFlag country={market.country} />
				<span class="flex-1 font-medium">{countryName(market.country)}</span>
				<span
					class="grid size-5 place-items-center rounded-full ring-2 ring-line-strong transition
						group-has-checked:bg-ikea-yellow group-has-checked:ring-ikea-yellow"
					aria-hidden="true"
				>
					<span class="hidden size-2 rounded-full bg-ikea-blue-deep group-has-checked:block"></span>
				</span>
			</label>
		{/each}
	</div>
</fieldset>
