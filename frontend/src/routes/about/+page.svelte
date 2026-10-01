<script lang="ts">
	import { enhance } from '$app/forms';
	import CountrySelector from '$lib/components/markets/CountrySelector.svelte';
	import LanguageSelector from '$lib/components/LanguageSelector.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import { getDecisionStore } from '$lib/decisions.svelte';
	import { m } from '$lib/paraglide/messages';

	let { data } = $props();

	const decisions = getDecisionStore();
	let resetState = $state<'idle' | 'confirming' | 'done'>('idle');

	const BUTTON = 'flex h-12 items-center justify-center rounded-full px-4 font-bold transition active:scale-[0.98]';
</script>

<svelte:head>
	<title>{m.page_title({ page: m.about_page_title() })}</title>
</svelte:head>

<section class="rounded-3xl bg-surface p-6 shadow-sm ring-1 ring-line">
	<h1 class="text-xl font-bold text-accent">{m.about_heading()}</h1>
	<p class="mt-2">{m.about_body()}</p>
	<p class="mt-3 text-sm text-ink/75">{m.about_disclaimer()}</p>
</section>

<h2 class="mt-8 mb-3 text-lg font-bold">{m.about_settings_heading()}</h2>

<section id="country" class="scroll-mt-[calc(var(--header-height)+1rem)] rounded-3xl bg-surface p-5 shadow-sm ring-1 ring-line">
	<!-- Posts to the front page's action, which sets the cookie and sends the user to swiping. -->
	<form method="POST" action="/?/selectMarket" use:enhance>
		<CountrySelector name="market" value={data.market ?? undefined} required />
		<button
			type="submit"
			class="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-ikea-blue font-bold text-white transition hover:bg-ikea-blue-deep active:scale-[0.98]"
		>
			{m.about_country_save()}
		</button>
	</form>
</section>

<section class="mt-4 rounded-3xl bg-surface p-5 shadow-sm ring-1 ring-line" aria-labelledby="reset-heading">
	<h3 id="reset-heading" class="font-bold">{m.about_reset_heading()}</h3>
	<p class="mt-1 text-sm text-ink/75">{m.about_reset_body()}</p>

	<!-- Destructive and irreversible, so it takes a second, explicit confirmation. -->
	{#if resetState === 'confirming'}
		<div class="mt-4 rounded-2xl bg-highlight p-4" role="alertdialog" aria-labelledby="reset-confirm-text">
			<p id="reset-confirm-text" class="font-bold">{m.about_reset_confirm()}</p>
			<div class="mt-3 flex gap-3">
				<button
					type="button"
					class="{BUTTON} flex-1 bg-surface text-accent ring-2 ring-line-strong hover:ring-accent"
					onclick={() => (resetState = 'idle')}
				>
					{m.about_reset_cancel()}
				</button>
				<!-- svelte-ignore a11y_autofocus: moving focus into the confirmation is the expected flow -->
				<button
					type="button"
					autofocus
					class="{BUTTON} flex-1 bg-ikea-blue text-white hover:bg-ikea-blue-deep"
					onclick={() => {
						decisions.resetAll();
						resetState = 'done';
					}}
				>
					{m.about_reset_confirm_yes()}
				</button>
			</div>
		</div>
	{:else}
		<button
			type="button"
			class="{BUTTON} mt-4 w-full bg-surface text-accent ring-2 ring-line-strong hover:ring-accent"
			onclick={() => (resetState = 'confirming')}
		>
			{m.about_reset_button()}
		</button>
		{#if resetState === 'done'}
			<p class="mt-3 text-sm font-bold" role="status">{m.about_reset_done()}</p>
		{/if}
	{/if}
</section>

<section class="mt-4 rounded-3xl bg-surface p-5 shadow-sm ring-1 ring-line" aria-labelledby="language-heading">
	<h3 id="language-heading" class="mb-3 font-bold">{m.about_language_heading()}</h3>
	<LanguageSelector />
</section>

<section class="mt-4 rounded-3xl bg-surface p-5 shadow-sm ring-1 ring-line" aria-labelledby="theme-heading">
	<h3 id="theme-heading" class="mb-3 font-bold">{m.about_theme_heading()}</h3>
	<ThemeToggle />
</section>
