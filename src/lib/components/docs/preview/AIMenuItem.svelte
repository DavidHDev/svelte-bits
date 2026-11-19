<script lang="ts">
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { ArrowUpRight01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import Icon from './Icon.svelte';
	import type { AIMenuItemData } from './lib/aiItems';

	type Props = { item: AIMenuItemData; done: string | null; external?: boolean };

	let { item, done, external = false }: Props = $props();

	const isDone = $derived(done === item.key);
</script>

<button type="button" role="menuitem" data-part="item" class="docs-menu-item" onclick={item.run}>
	{#if isDone}
		<span class="docs-menu-icon docs-tool-done">
			<HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
		</span>
	{:else}
		<span class="docs-menu-icon">
			{#if typeof item.icon === 'string'}
				<Icon name={item.icon} size={15} />
			{:else}
				<HugeiconsIcon icon={item.icon} size={16} strokeWidth={1.6} aria-hidden="true" />
			{/if}
		</span>
	{/if}
	{isDone ? 'Copied' : item.label}
	{#if external}
		<span class="docs-menu-trail">
			<HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={1.8} aria-hidden="true" />
		</span>
	{/if}
</button>
