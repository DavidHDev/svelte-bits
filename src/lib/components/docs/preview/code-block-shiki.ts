// Mirrors shadcn-svelte-extras `ui/code/shiki.ts` + Shiki best-performance guidance:
// https://shiki.style/guide/best-performance
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { createHighlighterCore } from 'shiki/core';
import type { ThemeRegistration } from 'shiki/core';

/** Custom dark theme for docs code blocks */
export const svelteBitsTheme: ThemeRegistration = {
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

const bundledLanguages = {
	bash: () => import('@shikijs/langs/bash'),
	css: () => import('@shikijs/langs/css'),
	html: () => import('@shikijs/langs/html'),
	javascript: () => import('@shikijs/langs/javascript'),
	json: () => import('@shikijs/langs/json'),
	jsx: () => import('@shikijs/langs/jsx'),
	shell: () => import('@shikijs/langs/shell'),
	svelte: () => import('@shikijs/langs/svelte'),
	typescript: () => import('@shikijs/langs/typescript'),
	tsx: () => import('@shikijs/langs/tsx')
} as const;

/** Languages bundled into the docs highlighter (`text` is built into Shiki). */
export type BundledDocsCodeLang = keyof typeof bundledLanguages | 'text';

/** Map `language` prop to a bundled grammar (extras only loads a fixed set; unknown → svelte). */
export function resolveDocsCodeLang(lang: string): BundledDocsCodeLang {
	if (lang === 'text') return 'text';
	if (Object.hasOwn(bundledLanguages, lang)) return lang as keyof typeof bundledLanguages;
	return 'svelte';
}

/** Preloaded highlighter (same initialization pattern as shadcn-svelte-extras Code). */
export const highlighter = createHighlighterCore({
	themes: [svelteBitsTheme],
	langs: Object.values(bundledLanguages),
	engine: createJavaScriptRegexEngine()
});
