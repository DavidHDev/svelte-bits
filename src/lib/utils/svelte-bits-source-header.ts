/**
 * Parses and strips the `<!-- @svelte-bits {...} -->` metadata block used at the top of
 * library `.svelte` sources. Shared by the docs site (preview) and registry tooling (`scripts/registry-items.ts`).
 */
export type SvelteBitsSourceHeader = {
	title?: string;
	description?: string;
	dependencies?: string[];
	devDependencies?: string[];
	registryDependencies?: string[];
};

export const HEADER_RE = /^\s*<!--\s*@svelte-bits\s*([\s\S]*?)-->\s*\n?/;

/** Remove registry metadata HTML comment so displayed / published source matches installed output. */
export function stripSvelteBitsHeader(content: string): string {
	const match = content.match(HEADER_RE);
	if (!match) return content;
	return content.slice(match[0].length);
}

/** Parse metadata (for registry/build) plus body with the header removed. */
export function parseSvelteBitsHeader(content: string): {
	header: SvelteBitsSourceHeader;
	stripped: string;
} {
	const match = content.match(HEADER_RE);
	if (!match) return { header: {}, stripped: content };

	const raw = match[1].trim();
	let header: SvelteBitsSourceHeader = {};
	try {
		header = JSON.parse(raw) as SvelteBitsSourceHeader;
	} catch (err) {
		throw new Error(
			`Failed to parse @svelte-bits header JSON. Raw block:\n${raw}\n\n${(err as Error).message}`
		);
	}

	const stripped = content.slice(match[0].length);
	return { header, stripped };
}
