<script lang="ts">
	import { highlightCode, peekHighlight } from './code-block-shiki';

	type Props = {
		code: string;
		language?: string;
		showLineNumbers?: boolean;
	};

	let { code, language = 'svelte', showLineNumbers = true }: Props = $props();

	const source = $derived(String(code ?? ''));
	let html = $state('');

	$effect(() => {
		const current = source;
		const lang = language;
		let active = true;
		html = peekHighlight(current, lang);
		highlightCode(current, lang)
			.then((result) => {
				if (active) html = result;
			})
			.catch((error) => console.error('Failed to highlight code with Shiki:', error));
		return () => {
			active = false;
		};
	});
</script>

<div class="shiki-code" class:has-line-numbers={showLineNumbers} class:is-loading={!html}>
	{#if html}
		{@html html}
	{:else}
		<pre class="shiki-fallback"><code>{source}</code></pre>
	{/if}
</div>
