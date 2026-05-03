<script lang="ts">
	import type { Component } from 'svelte';
	import CliInstall from './CliInstall.svelte';

	type Props = {
		slug: string;
		usage: string;
		source: string;
	};

	let { slug, usage, source }: Props = $props();
	let CodeBlock = $state<Component<{ code: string; language?: string }> | null>(null);

	$effect(() => {
		let cancelled = false;
		import('./CodeBlock.svelte').then((module) => {
			if (!cancelled) CodeBlock = module.default;
		});
		return () => {
			cancelled = true;
		};
	});
</script>

<CliInstall {slug} />
<h3 class="demo-title-extra">Usage</h3>
{#if CodeBlock}
	<CodeBlock code={usage} language="svelte" />
{:else}
	<pre class="code-highlighter code-fallback">{usage}</pre>
{/if}
<h3 class="demo-title-extra">Component source</h3>
{#if CodeBlock}
	<CodeBlock code={source} language="svelte" />
{:else}
	<pre class="code-highlighter code-fallback">{source}</pre>
{/if}
