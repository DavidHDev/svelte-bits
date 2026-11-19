<script lang="ts">
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { ArrowDown01Icon, Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import DocsMenu from './DocsMenu.svelte';
	import AIMenuSections from './AIMenuSections.svelte';
	import type { AIMenuItemData } from './lib/aiItems';

	type Props = { copyItems: AIMenuItemData[]; openItems: AIMenuItemData[]; done: string | null; zIndex?: number };

	let { copyItems, openItems, done, zIndex = 1500 }: Props = $props();
</script>

<DocsMenu placement="bottom-end" gutter={8} minWidth="236px" {zIndex}>
	{#snippet trigger({ props })}
		<button type="button" class="docs-tool" aria-label="Copy for AI" {...props}>
			{#if done}
				<span class="docs-menu-icon docs-tool-done">
					<HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
				</span>
			{:else}
				<HugeiconsIcon icon={Copy01Icon} size={16} strokeWidth={1.6} aria-hidden="true" />
			{/if}
			{done ? 'Copied' : 'Copy for AI'}
			<HugeiconsIcon icon={ArrowDown01Icon} size={14} strokeWidth={1.8} class="docs-tool-chevron" aria-hidden="true" />
		</button>
	{/snippet}
	{#snippet children()}
		<AIMenuSections {copyItems} {openItems} {done} />
	{/snippet}
</DocsMenu>
