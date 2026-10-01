<script lang="ts" module>
	import type { IconName } from '$lib/components/Icon.svelte';

	export type NavItem = {
		href: string;
		label: string;
		icon: IconName;
		/** Showcase only: renders the item as if hovered or pressed. */
		preview?: 'hover' | 'pressed';
	};

	export const isActiveHref = (href: string, currentPath: string) =>
		href === '/' ? currentPath === '/' : currentPath === href || currentPath.startsWith(`${href}/`);
</script>

<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import Icon from '$lib/components/Icon.svelte';

	type Props = { items: NavItem[]; currentPath: string };

	let { items, currentPath }: Props = $props();
</script>

<nav
	aria-label={m.nav_label()}
	class="border-t border-line bg-surface pb-[env(safe-area-inset-bottom)]"
>
	<ul class="mx-auto grid max-w-md" style:grid-template-columns="repeat({items.length}, 1fr)">
		{#each items as item (item.href)}
			{@const active = isActiveHref(item.href, currentPath)}
			<li>
				<a
					href={item.href}
					class="nav-item flex flex-col items-center gap-1 py-2 outline-offset-[-4px] select-none"
					aria-current={active ? 'page' : undefined}
					data-preview={item.preview}
				>
					<span
						class="grid h-8 w-16 place-items-center rounded-full text-ink/70 transition
							nav-hover:bg-tint nav-hover:text-accent
							nav-active:bg-ikea-yellow nav-active:text-ikea-blue-deep
							nav-pressed:scale-90 nav-pressed:bg-tint-strong nav-pressed:text-accent
							nav-active:nav-pressed:bg-ikea-yellow-600"
					>
						<Icon name={item.icon} solid={active} strokeWidth={1.8} />
					</span>
					<span
						class="text-xs font-medium text-ink/70
							nav-hover:text-accent nav-active:font-bold nav-active:text-accent"
					>
						{item.label}
					</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
