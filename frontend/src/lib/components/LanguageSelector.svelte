<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { getLocale, locales, setLocale, type Locale } from '$lib/paraglide/runtime';

	/** Each language in itself ("Dansk", "Deutsch"): people scan for their own language's name. */
	const endonym = (locale: Locale) => {
		const name = new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale;
		return name.charAt(0).toLocaleUpperCase(locale) + name.slice(1);
	};

	const current = getLocale();
</script>

<!-- setLocale stores the choice in a cookie and reloads, so the server renders the new language too. -->
<fieldset class="flex flex-wrap gap-2">
	<legend class="sr-only">{m.language_label()}</legend>
	{#each locales as locale (locale)}
		<label
			lang={locale}
			class="flex cursor-pointer items-center rounded-full bg-surface px-4 py-2 text-sm font-medium text-ink/75 ring-1 ring-line transition
				select-none hover:text-accent hover:ring-accent has-checked:bg-ikea-yellow has-checked:font-bold
				has-checked:text-ikea-blue-deep has-checked:ring-ikea-yellow
				has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ikea-yellow"
		>
			<input
				type="radio"
				name="language"
				value={locale}
				class="sr-only"
				checked={locale === current}
				onchange={() => setLocale(locale)}
			/>
			{endonym(locale)}
		</label>
	{/each}
</fieldset>
