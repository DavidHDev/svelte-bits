<script lang="ts">
	import { toast } from 'svelte-sonner';
	import Icon from '$lib/components/docs/preview/Icon.svelte';
	import DocsMenu from '$lib/components/docs/preview/DocsMenu.svelte';
	import { copyText, openInAI } from '$lib/components/docs/preview/lib/aiExport';
	import { sectionToMarkdown } from '$lib/utils/docsMarkdown';

	const AI_ITEMS = [
		{ key: 'chatgpt', label: 'Open in ChatGPT', icon: 'SiOpenai' },
		{ key: 'claude', label: 'Open in Claude', icon: 'SiClaude' }
	] as const;

	let rootEl = $state<HTMLElement | null>(null);
	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const getMarkdown = () => sectionToMarkdown(rootEl?.closest('.docs-section'));

	async function handleCopy() {
		const md = getMarkdown();
		if (!md) return;
		if (await copyText(md)) {
			copied = true;
			toast.success('Page copied as Markdown');
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 2000);
		} else {
			toast.error('Could not copy to clipboard');
		}
	}

	function handleOpen(providerKey: 'chatgpt' | 'claude') {
		const md = getMarkdown();
		if (!md) return;
		openInAI(providerKey, { prompt: `Read the Svelte Bits documentation below, then help me apply it.\n\n${md}` });
	}

	$effect(() => () => clearTimeout(timer));
</script>

<div class="docs-page-actions" bind:this={rootEl}>
	<button
		type="button"
		class="docs-page-action docs-page-action-primary"
		onclick={handleCopy}
		aria-label="Copy this page as Markdown"
	>
		<Icon name={copied ? 'TbCheck' : 'TbCopy'} size={16} />
		<span>{copied ? 'Copied' : 'Copy as Markdown'}</span>
	</button>

	<DocsMenu placement="bottom-end" gutter={6} minWidth="" contentClass="docs-ai-menu" fluid={false}>
		{#snippet trigger({ props })}
			<button type="button" class="docs-page-action docs-page-action-more" aria-label="More AI actions" {...props}>
				<Icon name="TbChevronDown" size={16} />
			</button>
		{/snippet}
		{#snippet children()}
			{#each AI_ITEMS as item (item.key)}
				<button
					type="button"
					role="menuitem"
					data-part="item"
					class="docs-ai-menu-item"
					onclick={() => handleOpen(item.key)}
				>
					<Icon name={item.icon} size={16} />
					{item.label}
				</button>
			{/each}
		{/snippet}
	</DocsMenu>
</div>
