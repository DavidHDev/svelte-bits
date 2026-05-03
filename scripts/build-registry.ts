/**
 * Build script for the svelte-bits shadcn registry.
 *
 * Auto-discovers components under:
 *     src/lib/components/library/<Category>/<Name>/<Name>.svelte
 *
 * Each component may declare metadata via a Svelte HTML comment at the very top
 * of the file:
 *
 *     <!-- @svelte-bits
 *     {
 *       "title": "Shiny Text",
 *       "description": "...",
 *       "dependencies": ["gsap"]
 *     }
 *     -->
 *
 * That header is stripped from the emitted `content` so the user-installed
 * file is clean. If no header is present, sensible defaults are derived from
 * the file name and category.
 *
 * Emits:
 *   - static/r/<slug>.json     — one registry-item per component
 *   - static/r/registry.json   — the index listing them all
 *
 * Items are served from https://sveltebits.xyz/r/<slug>.json. Users install
 * with:  npx shadcn@latest add https://sveltebits.xyz/r/<slug>.json
 *
 * Run:  npm run registry:build
 */

import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { dirname, resolve, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { IMPLEMENTED_DEMOS } from '../src/lib/constants/categories';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LIBRARY_DIR = resolve(ROOT, 'src/lib/components/library');

const HOMEPAGE = 'https://sveltebits.xyz';
const REGISTRY_URL = `${HOMEPAGE}/r`;

// ---------------------------------------------------------------------------
// Types

type Header = {
	title?: string;
	description?: string;
	dependencies?: string[];
	devDependencies?: string[];
	registryDependencies?: string[];
};

type DiscoveredItem = {
	slug: string; // kebab-case, e.g. "shiny-text"
	pascalName: string; // e.g. "ShinyText"
	categorySlug: string; // e.g. "text-animations"
	source: string; // repo-relative path
	header: Header;
};

type RegistryItemJson = {
	$schema: string;
	name: string;
	type: 'registry:component';
	title: string;
	description: string;
	dependencies?: string[];
	devDependencies?: string[];
	registryDependencies?: string[];
	categories?: string[];
	files: Array<{
		path: string;
		content: string;
		type: 'registry:component';
		target: string;
	}>;
};

type RegistryIndexJson = {
	$schema: string;
	name: string;
	homepage: string;
	items: Array<{
		name: string;
		type: 'registry:component';
		title: string;
		description: string;
		categories?: string[];
		files: Array<{ path: string; type: 'registry:component'; target: string }>;
	}>;
};

// ---------------------------------------------------------------------------
// Helpers

function pascalToKebab(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

const HEADER_RE = /^\s*<!--\s*@svelte-bits\s*([\s\S]*?)-->\s*\n?/;

function parseHeader(content: string): { header: Header; stripped: string } {
	const match = content.match(HEADER_RE);
	if (!match) return { header: {}, stripped: content };

	const raw = match[1].trim();
	let header: Header = {};
	try {
		header = JSON.parse(raw) as Header;
	} catch (err) {
		throw new Error(
			`Failed to parse @svelte-bits header JSON. Raw block:\n${raw}\n\n${(err as Error).message}`
		);
	}

	const stripped = content.slice(match[0].length);
	return { header, stripped };
}

async function isDirectory(path: string): Promise<boolean> {
	try {
		const s = await stat(path);
		return s.isDirectory();
	} catch {
		return false;
	}
}

async function* walkComponents(): AsyncGenerator<DiscoveredItem> {
	const categoryDirs = await readdir(LIBRARY_DIR);
	categoryDirs.sort();

	for (const categoryDirName of categoryDirs) {
		const categoryPath = resolve(LIBRARY_DIR, categoryDirName);
		if (!(await isDirectory(categoryPath))) continue;

		const componentDirs = await readdir(categoryPath);
		componentDirs.sort();

		for (const componentDirName of componentDirs) {
			const componentPath = resolve(categoryPath, componentDirName);
			if (!(await isDirectory(componentPath))) continue;

			const expected = resolve(componentPath, `${componentDirName}.svelte`);

			let exists = false;
			try {
				await stat(expected);
				exists = true;
			} catch {
				exists = false;
			}
			if (!exists) {
				console.warn(
					`! skipping ${relative(ROOT, componentPath)} — expected ${componentDirName}.svelte not found`
				);
				continue;
			}

			const content = await readFile(expected, 'utf8');
			const { header } = parseHeader(content);

			yield {
				slug: pascalToKebab(componentDirName),
				pascalName: componentDirName,
				categorySlug: pascalToKebab(categoryDirName),
				source: relative(ROOT, expected).replace(/\\/g, '/'),
				header
			};
		}
	}
}

function pascalToTitle(name: string): string {
	return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

async function buildItem(item: DiscoveredItem): Promise<RegistryItemJson> {
	const absolute = resolve(ROOT, item.source);
	const raw = await readFile(absolute, 'utf8');
	const { stripped } = parseHeader(raw);

	const title = item.header.title ?? pascalToTitle(item.pascalName);
	const description =
		item.header.description ?? `${title} component from svelte-bits.`;
	const fileName = basename(item.source);
	const target = `$lib/components/svelte-bits/${item.pascalName}.svelte`;

	const json: RegistryItemJson = {
		$schema: 'https://ui.shadcn.com/schema/registry-item.json',
		name: item.slug,
		type: 'registry:component',
		title,
		description,
		categories: [item.categorySlug],
		files: [
			{
				path: fileName,
				content: stripped,
				type: 'registry:component',
				target
			}
		]
	};

	if (item.header.dependencies?.length) json.dependencies = item.header.dependencies;
	if (item.header.devDependencies?.length) json.devDependencies = item.header.devDependencies;
	if (item.header.registryDependencies?.length)
		json.registryDependencies = item.header.registryDependencies;

	return json;
}

// ---------------------------------------------------------------------------
// Main

async function main() {
	const outDir = resolve(ROOT, 'static/r');
	await mkdir(outDir, { recursive: true });

	const discovered: DiscoveredItem[] = [];
	for await (const item of walkComponents()) discovered.push(item);
	const discoveredSlugs = new Set(discovered.map((item) => item.slug));
	const registryOnlySlugs = [...discoveredSlugs].filter((slug) => !IMPLEMENTED_DEMOS.has(slug));
	const implementedWithoutRegistry = [...IMPLEMENTED_DEMOS].filter(
		(slug) =>
			!['introduction', 'installation', 'mcp-server', 'index'].includes(slug) &&
			!discoveredSlugs.has(slug)
	);

	if (registryOnlySlugs.length || implementedWithoutRegistry.length) {
		throw new Error(
			[
				'Registry metadata is out of sync.',
				registryOnlySlugs.length
					? `Components found in library but missing from IMPLEMENTED_DEMOS: ${registryOnlySlugs.join(', ')}`
					: '',
				implementedWithoutRegistry.length
					? `IMPLEMENTED_DEMOS entries without registry components: ${implementedWithoutRegistry.join(', ')}`
					: ''
			]
				.filter(Boolean)
				.join('\n')
		);
	}

	if (discovered.length === 0) {
		console.warn(`No components found under ${relative(ROOT, LIBRARY_DIR)}`);
	}

	const indexItems: RegistryIndexJson['items'] = [];

	for (const item of discovered) {
		const json = await buildItem(item);
		const outPath = resolve(outDir, `${item.slug}.json`);
		await writeFile(outPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
		console.log(`✓ wrote ${relative(ROOT, outPath)}`);

		indexItems.push({
			name: json.name,
			type: json.type,
			title: json.title,
			description: json.description,
			categories: json.categories,
			files: json.files.map(({ path, type, target }) => ({ path, type, target }))
		});
	}

	const index: RegistryIndexJson = {
		$schema: 'https://ui.shadcn.com/schema/registry.json',
		name: 'svelte-bits',
		homepage: HOMEPAGE,
		items: indexItems
	};

	const indexPath = resolve(outDir, 'registry.json');
	await writeFile(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
	console.log(`✓ wrote ${relative(ROOT, indexPath)}`);

	console.log(`\n${discovered.length} registry items built.`);
	console.log(`Registry URL: ${REGISTRY_URL}/<name>.json`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
