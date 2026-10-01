<script lang="ts">
	import type { SelectableCountry } from '$lib/markets';

	type Props = { country: SelectableCountry; class?: string };

	let { country, class: className = 'h-6 w-8' }: Props = $props();

	// Clip-path IDs must be unique per instance when several UK flags are on one page.
	const id = $props.id();
</script>

<!-- Decorative: the country name always sits next to it. -->
<svg
	viewBox={country === 'gb' ? '0 0 60 30' : country === 'de' ? '0 0 5 3' : country === 'se' ? '0 0 16 10' : '0 0 37 28'}
	preserveAspectRatio="xMidYMid slice"
	class={['shrink-0 rounded-sm ring-1 ring-ink/15', className]}
	aria-hidden="true"
>
	{#if country === 'dk'}
		<rect width="37" height="28" fill="#c8102e" />
		<path d="M12 0h4v28h-4zM0 12h37v4H0z" fill="#fff" />
	{:else if country === 'se'}
		<rect width="16" height="10" fill="#006aa7" />
		<path d="M5 0h2v10H5zM0 4h16v2H0z" fill="#fecc02" />
	{:else if country === 'de'}
		<rect width="5" height="1" fill="#000" />
		<rect y="1" width="5" height="1" fill="#dd0000" />
		<rect y="2" width="5" height="1" fill="#ffce00" />
	{:else if country === 'gb'}
		<clipPath id="{id}-flag">
			<path d="M0 0v30h60V0z" />
		</clipPath>
		<clipPath id="{id}-diagonals">
			<path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
		</clipPath>
		<g clip-path="url(#{id}-flag)">
			<path d="M0 0v30h60V0z" fill="#012169" />
			<path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6" />
			<path d="M0 0l60 30m0-30L0 30" clip-path="url(#{id}-diagonals)" stroke="#c8102e" stroke-width="4" />
			<path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10" />
			<path d="M30 0v30M0 15h60" stroke="#c8102e" stroke-width="6" />
		</g>
	{/if}
</svg>
