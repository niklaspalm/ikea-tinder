<script lang="ts">
	import { onMount } from 'svelte';
	import Icon, { type IconName } from '$lib/components/Icon.svelte';
	import { m } from '$lib/paraglide/messages';
	import {
		applyThemePreference,
		readThemePreference,
		THEME_PREFERENCES,
		type ThemePreference
	} from '$lib/theme';

	let preference = $state<ThemePreference>('system');

	// The server can't know the stored choice, so the selection syncs after hydration.
	onMount(() => {
		preference = readThemePreference();
	});

	const OPTIONS: Record<ThemePreference, { icon: IconName; label: () => string }> = {
		system: { icon: 'monitor', label: m.theme_system },
		light: { icon: 'sun', label: m.theme_light },
		dark: { icon: 'moon', label: m.theme_dark }
	};
</script>

<!-- Native radios: arrow keys, focus and screen-reader semantics come for free. -->
<fieldset class="inline-flex rounded-full bg-surface p-1 shadow-sm ring-1 ring-line">
	<legend class="sr-only">{m.theme_label()}</legend>
	{#each THEME_PREFERENCES as option (option)}
		<label
			class="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink/75 transition
				select-none hover:text-accent has-checked:bg-ikea-yellow has-checked:font-bold has-checked:text-ikea-blue-deep
				has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ikea-yellow"
		>
			<input
				type="radio"
				name="theme"
				value={option}
				class="sr-only"
				bind:group={preference}
				onchange={() => applyThemePreference(option)}
			/>
			<Icon name={OPTIONS[option].icon} class="size-4" />
			{OPTIONS[option].label()}
		</label>
	{/each}
</fieldset>
