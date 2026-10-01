<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';

	/**
	 * A product photo: never cropped and never dragged out mid-swipe. IKEA shoots on
	 * white, so the backdrop stays white in dark mode too instead of showing a hard edge.
	 */
	type Props = Omit<HTMLImgAttributes, 'src' | 'alt'> & { src: string; alt: string };

	let { src, alt, class: className, ...rest }: Props = $props();
</script>

<img {src} {alt} class={['bg-white object-contain', className]} draggable="false" {...rest} />
