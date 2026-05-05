<script lang="ts">
	import type { HighlighterCore } from 'shiki/core';
	import { highlighter, resolveDocsCodeLang } from './code-block-shiki';
	import { UseClipboard } from '$lib/hooks/use-clipboard.svelte';

	type Props = {
		code: string;
		language?: string;
	};
	let { code, language = 'svelte' }: Props = $props();

	let hlCore = $state<HighlighterCore | null>(null);
	highlighter.then((h) => {
		hlCore = h;
	});

	const trimmedCode = $derived(code.trimEnd());
	const resolvedLang = $derived(resolveDocsCodeLang(language));

	const html = $derived.by(() => {
		const hl = hlCore;
		const c = trimmedCode;
		const lang = resolvedLang;

		if (!hl) return '';

		return hl.codeToHtml(c, { lang, theme: 'svelte-bits' }) ?? '';
	});

	const clipboard = new UseClipboard();
</script>

<div class="code-highlighter" data-language={language}>
	<button class="code-copy-button" type="button" onclick={() => clipboard.copy(code)} aria-label="Copy code">
		{#if clipboard.copied}
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
				stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="20 6 9 17 4 12" />
			</svg>
		{:else}
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
				stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
				<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
			</svg>
		{/if}
	</button>

	{#if html}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html html}
	{:else}
		<pre class="code-fallback">{code}</pre>
	{/if}
</div>
