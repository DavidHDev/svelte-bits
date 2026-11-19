<script lang="ts">
	import MenuGroup from './MenuGroup.svelte';
	import AIMenuItem from './AIMenuItem.svelte';
	import type { AIMenuItemData } from './lib/aiItems';

	type Props = { copyItems: AIMenuItemData[]; openItems: AIMenuItemData[]; done: string | null };

	let { copyItems, openItems, done }: Props = $props();
</script>

<MenuGroup label="Copy">
	{#each copyItems as item (item.key)}
		<AIMenuItem {item} {done} />
	{/each}
</MenuGroup>
<MenuGroup label="Open in">
	{#each openItems as item (item.key)}
		<AIMenuItem {item} {done} external />
	{/each}
</MenuGroup>
