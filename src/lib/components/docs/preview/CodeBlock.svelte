<script module lang="ts">
	import {
		createHighlighterCore,
		type HighlighterCore,
		type ThemeRegistration
	} from 'shiki/core';
	import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

	// Custom dark theme keyed to the svelte-bits orange palette.
	// Background matches our card surfaces; accents use orange (#FF8A4C / #FF3E00).
	const svelteBitsTheme: ThemeRegistration = {
		name: 'svelte-bits',
		type: 'dark',
		colors: {
			'editor.background': '#0a0a0a',
			'editor.foreground': '#e6e6e6'
		},
		tokenColors: [
			{ scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#5c5c5c', fontStyle: 'italic' } },
			{ scope: ['string', 'string.quoted', 'string.template'], settings: { foreground: '#FFB089' } },
			{ scope: ['constant.numeric', 'constant.language'], settings: { foreground: '#FF8A4C' } },
			{ scope: ['constant.character', 'constant.other'], settings: { foreground: '#FF8A4C' } },
			{ scope: ['variable', 'variable.other.readwrite', 'variable.parameter'], settings: { foreground: '#e6e6e6' } },
			{ scope: ['variable.other.constant', 'variable.other.enummember'], settings: { foreground: '#FFB089' } },
			{ scope: ['keyword', 'storage.type', 'storage.modifier'], settings: { foreground: '#FF3E00' } },
			{ scope: ['keyword.control', 'keyword.operator.new'], settings: { foreground: '#FF3E00' } },
			{ scope: ['keyword.operator'], settings: { foreground: '#a8a8a8' } },
			{ scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#FFC9A8' } },
			{ scope: ['entity.name.type', 'entity.name.class', 'support.class', 'support.type'], settings: { foreground: '#FFD8BD' } },
			{ scope: ['entity.name.tag', 'meta.tag'], settings: { foreground: '#FF3E00' } },
			{ scope: ['entity.other.attribute-name'], settings: { foreground: '#FF8A4C' } },
			{ scope: ['punctuation', 'meta.brace', 'meta.delimiter'], settings: { foreground: '#888' } },
			{ scope: ['punctuation.definition.tag', 'punctuation.section.embedded'], settings: { foreground: '#666' } },
			{ scope: ['meta.embedded', 'source.svelte'], settings: { foreground: '#e6e6e6' } },
			{ scope: ['markup.bold'], settings: { fontStyle: 'bold' } },
			{ scope: ['markup.italic'], settings: { fontStyle: 'italic' } },
			{ scope: ['markup.heading'], settings: { foreground: '#FF8A4C', fontStyle: 'bold' } },
			{ scope: ['invalid'], settings: { foreground: '#ff6b6b' } }
		]
	};

	let highlighterPromise: Promise<HighlighterCore> | null = null;

	async function getHighlighter(): Promise<HighlighterCore> {
		if (!highlighterPromise) {
			highlighterPromise = createHighlighterCore({
				themes: [svelteBitsTheme],
				langs: [
					import('@shikijs/langs/svelte'),
					import('@shikijs/langs/typescript'),
					import('@shikijs/langs/javascript'),
					import('@shikijs/langs/tsx'),
					import('@shikijs/langs/jsx'),
					import('@shikijs/langs/css'),
					import('@shikijs/langs/html'),
					import('@shikijs/langs/json'),
					import('@shikijs/langs/bash'),
					import('@shikijs/langs/shell')
				],
				engine: createOnigurumaEngine(import('shiki/wasm'))
			});
		}
		return highlighterPromise;
	}
</script>

<script lang="ts">
	type Props = {
		code: string;
		language?: string;
	};
	let { code, language = 'svelte' }: Props = $props();

	let copied = $state(false);
	let html = $state<string>('');

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			/* ignore */
		}
	}

	$effect(() => {
		const c = code;
		const lang = language;
		let cancelled = false;
		(async () => {
			try {
				const hl = await getHighlighter();
				const out = hl.codeToHtml(c, { lang, theme: 'svelte-bits' });
				if (!cancelled) html = out;
			} catch (err) {
				console.error('shiki highlight failed', err);
				if (!cancelled) {
					// Fallback: escape and wrap in <pre>
					const escaped = c
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;');
					html = `<pre class="shiki" style="background:#0a0a0a;color:#e6e6e6;"><code>${escaped}</code></pre>`;
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	});
</script>

<div class="code-highlighter" data-language={language}>
	<button class="code-copy-button" type="button" onclick={copy} aria-label="Copy code">
		{#if copied}
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
