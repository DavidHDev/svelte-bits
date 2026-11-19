<script lang="ts">
	import type { Snippet } from 'svelte';
	import CopyButton from './CopyButton.svelte';

	export type CommandItem = {
		key: string;
		label: string;
		command: string;
		icon?: Snippet;
		note?: Snippet;
	};

	type Props = { items: CommandItem[] };
	let { items }: Props = $props();
</script>

<ul class="docs-cmds">
	{#each items as item (item.key)}
		<li class="docs-cmd">
			<span class="docs-cmd-head">
				{#if item.icon}{@render item.icon()}{/if}
				{item.label}
			</span>
			<span class="docs-cmd-line" class:is-block={item.command.includes('\n')}>
				<code class="docs-cmd-code">{item.command}</code>
				<CopyButton text={item.command} />
			</span>
			{#if item.note}
				<span class="docs-cmd-note">{@render item.note()}</span>
			{/if}
		</li>
	{/each}
</ul>
