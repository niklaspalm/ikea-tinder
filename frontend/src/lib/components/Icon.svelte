<script lang="ts" module>
	export type IconName =
		| 'close'
		| 'heart'
		| 'flame'
		| 'info'
		| 'info-circle'
		| 'search'
		| 'external'
		| 'star'
		| 'sun'
		| 'moon'
		| 'monitor';
</script>

<script lang="ts">
	type Props = {
		name: IconName;
		/** Filled instead of outlined, for icons that have both (heart, flame, info-circle). */
		solid?: boolean;
		strokeWidth?: number;
		class?: string;
	};

	let { name, solid = false, strokeWidth = 2, class: className = 'size-6' }: Props = $props();

	const HEART =
		'M12 20.3l-1.3-1.2C6 14.9 3 12.2 3 8.9 3 6.2 5.1 4 7.8 4c1.6 0 3.1.7 4.2 1.9C13.1 4.7 14.6 4 16.2 4 18.9 4 21 6.2 21 8.9c0 3.3-3 6-7.7 10.2L12 20.3z';
	const FLAME =
		'M12.5 2C14 5.5 18.5 8 18.5 14A6.5 6.5 0 0 1 5.5 14C5.5 11.5 6.2 9.3 7.5 7.5 8 9.2 8.8 10.4 10 11 10 7.5 11 4.5 12.5 2z';
	const CIRCLE = 'M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18z';
	const INFO_GLYPH = 'M12 6.9a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 1 0 0-2.4zM11 10.8h2v6.4h-2z';
	const STAR = 'M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.2 6.6L12 17.4l-5.8 3.2 1.2-6.6-4.9-4.6 6.6-.8z';
</script>

<svg
	viewBox="0 0 24 24"
	class={className}
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	{#if name === 'close'}
		<path d="M6 6l12 12M18 6L6 18" />
	{:else if name === 'heart' || name === 'flame'}
		<path d={name === 'heart' ? HEART : FLAME} fill={solid ? 'currentColor' : 'none'} />
	{:else if name === 'info'}
		<path d={INFO_GLYPH} fill="currentColor" stroke="none" />
	{:else if name === 'info-circle'}
		{#if solid}
			<!-- even-odd turns the "i" into a cut-out of the filled circle -->
			<path d="{CIRCLE}{INFO_GLYPH}" fill="currentColor" fill-rule="evenodd" stroke="none" />
		{:else}
			<path d={CIRCLE} />
			<path d={INFO_GLYPH} fill="currentColor" stroke="none" />
		{/if}
	{:else if name === 'search'}
		<circle cx="10.5" cy="10.5" r="6.5" />
		<path d="M15.5 15.5L20 20" />
	{:else if name === 'external'}
		<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
	{:else if name === 'star'}
		<path d={STAR} fill="currentColor" stroke="none" />
	{:else if name === 'sun'}
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
	{:else if name === 'moon'}
		<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
	{:else if name === 'monitor'}
		<rect x="3" y="4" width="18" height="12" rx="2" />
		<path d="M8 20h8M12 16v4" />
	{/if}
</svg>
