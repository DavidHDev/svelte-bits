import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import { createHighlighterCore } from 'shiki/core';
import type { ThemeRegistration } from 'shiki/core';

const sharedScopes = {
	comments: ['comment', 'punctuation.definition.comment'],
	accent: [
		'keyword',
		'storage',
		'entity.name.tag',
		'entity.name.function',
		'support.function',
		'support.type',
		'constant.language'
	],
	soft: [
		'entity.other.attribute-name',
		'variable.other.property',
		'meta.object-literal.key',
		'support.variable.property'
	],
	strings: ['string', 'string.quoted', 'string.template', 'constant.character.escape'],
	numbers: ['constant.numeric', 'constant.character', 'constant.other'],
	punctuation: ['punctuation', 'meta.brace', 'meta.delimiter']
};

type ThemeInput = {
	name: string;
	type: 'dark' | 'light';
	background: string;
	foreground: string;
	muted: string;
	accent: string;
	soft: string;
	string: string;
	number: string;
};

const createTheme = ({
	name,
	type,
	background,
	foreground,
	muted,
	accent,
	soft,
	string,
	number
}: ThemeInput): ThemeRegistration => ({
	name,
	type,
	colors: {
		'editor.background': background,
		'editor.foreground': foreground
	},
	settings: [
		{ settings: { background, foreground } },
		{ scope: sharedScopes.comments, settings: { foreground: muted, fontStyle: 'italic' } },
		{ scope: sharedScopes.accent, settings: { foreground: accent } },
		{ scope: sharedScopes.soft, settings: { foreground: soft, fontStyle: 'italic' } },
		{ scope: sharedScopes.strings, settings: { foreground: string } },
		{ scope: sharedScopes.numbers, settings: { foreground: number } },
		{ scope: sharedScopes.punctuation, settings: { foreground: muted } }
	]
});

export const svelteBitsDarkTheme = createTheme({
	name: 'svelte-bits-dark',
	type: 'dark',
	background: '#14110e',
	foreground: '#e2d8d0',
	muted: '#887a6d',
	accent: '#fb923c',
	soft: '#fdba74',
	string: '#d9b8a3',
	number: '#fcc8a5'
});

export const svelteBitsLightTheme = createTheme({
	name: 'svelte-bits-light',
	type: 'light',
	background: '#ffffff',
	foreground: '#47403a',
	muted: '#8d8279',
	accent: '#c2410c',
	soft: '#b45a2a',
	string: '#74584a',
	number: '#b4532a'
});

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

export type BundledDocsCodeLang = keyof typeof bundledLanguages | 'text';

const ALIASES: Record<string, BundledDocsCodeLang> = {
	js: 'javascript',
	ts: 'typescript',
	sh: 'bash',
	zsh: 'bash',
	shellscript: 'bash'
};

export function resolveDocsCodeLang(lang: string): BundledDocsCodeLang {
	if (lang === 'text') return 'text';
	if (ALIASES[lang]) return ALIASES[lang];
	if (Object.hasOwn(bundledLanguages, lang)) return lang as keyof typeof bundledLanguages;
	return 'svelte';
}

export const highlighter = createHighlighterCore({
	themes: [svelteBitsLightTheme, svelteBitsDarkTheme],
	langs: Object.values(bundledLanguages),
	engine: createJavaScriptRegexEngine()
});

const cache = new Map<string, string>();
const LIMIT = 40;

export const peekHighlight = (code: string, language: string) => cache.get(`${language}\u0000${code}`) ?? '';

export async function highlightCode(code: string, language = 'svelte'): Promise<string> {
	const key = `${language}\u0000${code}`;
	const known = cache.get(key);
	if (known) return known;
	const hl = await highlighter;
	const html = hl.codeToHtml(code, {
		lang: resolveDocsCodeLang(language),
		themes: { light: 'svelte-bits-light', dark: 'svelte-bits-dark' },
		defaultColor: false
	});
	cache.set(key, html);
	if (cache.size > LIMIT) cache.delete(cache.keys().next().value as string);
	return html;
}
