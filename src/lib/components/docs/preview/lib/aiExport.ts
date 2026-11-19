import { registryUrl as itemRegistryUrl } from '$lib/constants/cli';

export const SITE_ORIGIN = 'https://sveltebits.xyz';

export type PropRow = { name: string; type: string; default?: string; description: string };

export const componentDocsUrl = (category: string, subcategory: string) => `${SITE_ORIGIN}/${category}/${subcategory}`;

export const registryUrl = (slug: string) => itemRegistryUrl(slug);

export function buildPrompt({
	componentName,
	usage,
	source,
	dependencies,
	propData
}: {
	componentName: string;
	usage: string;
	source: string;
	dependencies: string;
	propData: PropRow[];
}) {
	let prompt = `## Integrate the <${componentName} /> component from Svelte Bits

You are helping integrate an open-source Svelte component into an existing application.

### Component: ${componentName}
### Variant: TypeScript + Tailwind
${dependencies ? `### Dependencies: ${dependencies}` : ''}

---

### Usage Example
\`\`\`svelte
${usage}
\`\`\`
`;

	if (propData.length > 0) {
		prompt += `
### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
${propData.map((p) => `| ${p.name} | ${p.type} | ${p.default || '—'} | ${p.description} |`).join('\n')}
`;
	}

	prompt += `
### Full Component Source
\`\`\`svelte
${source}
\`\`\`
`;

	prompt += `
### Integration Instructions
1. Install any listed dependencies.
2. Copy the component source into the appropriate directory in the project.
3. Import and render the component using the usage example above as a starting point.
4. Adjust props as needed for the specific use case — refer to the props table for all available options.
`;

	return prompt;
}

export function buildCompactPrompt({
	componentName,
	category,
	subcategory,
	installCommand,
	usage
}: {
	componentName: string;
	category: string;
	subcategory: string;
	installCommand: string;
	usage: string;
}) {
	const lines = [
		`Help me add the <${componentName} /> component from Svelte Bits to my project.`,
		'',
		'Variant: TypeScript + Tailwind (Svelte 5)',
		`Docs: ${componentDocsUrl(category, subcategory)}`,
		`Component source + dependencies (JSON): ${registryUrl(subcategory)}`
	];

	if (installCommand) lines.push('', 'Install it with:', installCommand);
	if (usage) lines.push('', 'Use this configuration:', usage);

	lines.push(
		'',
		'Please fetch the registry JSON above for the exact source, install any listed dependencies, add the component to my project, and wire it into the right place.'
	);

	return lines.join('\n');
}

const MAX_URL_PROMPT = 6000;

export const AI_PROVIDERS = {
	chatgpt: { kind: 'prompt', build: (p: string) => `https://chatgpt.com/?q=${encodeURIComponent(p)}` },
	claude: { kind: 'prompt', build: (p: string) => `https://claude.ai/new?q=${encodeURIComponent(p)}` },
	v0: { kind: 'registry', build: (url: string) => `https://v0.dev/chat/api/open?url=${encodeURIComponent(url)}` }
} as const;

export function openInAI(providerKey: keyof typeof AI_PROVIDERS, payload: { prompt?: string; registryUrl?: string }) {
	const provider = AI_PROVIDERS[providerKey];
	if (!provider) return false;
	const { prompt = '', registryUrl: itemUrl = '' } = payload;
	let target: string;
	if (provider.kind === 'registry') {
		if (!itemUrl) return false;
		target = provider.build(itemUrl);
	} else {
		if (!prompt) return false;
		const trimmed = prompt.length > MAX_URL_PROMPT ? `${prompt.slice(0, MAX_URL_PROMPT)}\n\n[truncated]` : prompt;
		target = provider.build(trimmed);
	}
	window.open(target, '_blank', 'noopener,noreferrer');
	return true;
}

export async function copyText(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		try {
			const ta = document.createElement('textarea');
			ta.value = text;
			ta.setAttribute('readonly', '');
			ta.style.cssText = 'position:absolute;left:-9999px;top:0;';
			document.body.appendChild(ta);
			ta.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(ta);
			return ok;
		} catch {
			return false;
		}
	}
}
