/**
 * Discovers library components and builds jsrepo {@link RegistryItem} entries.
 * Used by jsrepo.config.ts (dynamic registry) — run `pnpm exec jsrepo build`.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import type { RegistryItem } from 'jsrepo/config';

import { parseSvelteBitsHeader, type SvelteBitsSourceHeader } from '../src/lib/utils/svelte-bits-source-header';

import { IMPLEMENTED_DEMOS } from '../src/lib/constants/categories';

export type DiscoveredItem = {
	slug: string;
	pascalName: string;
	categorySlug: string;
	source: string;
	header: SvelteBitsSourceHeader;
};

export function pascalToKebab(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

async function isDirectory(path: string): Promise<boolean> {
	try {
		const s = await stat(path);
		return s.isDirectory();
	} catch {
		return false;
	}
}

export async function* walkComponents(libraryDir: string, rootForRelative: string): AsyncGenerator<DiscoveredItem> {
	const categoryDirs = await readdir(libraryDir);
	categoryDirs.sort();

	for (const categoryDirName of categoryDirs) {
		const categoryPath = resolve(libraryDir, categoryDirName);
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
					`! skipping ${relative(rootForRelative, componentPath)} — expected ${componentDirName}.svelte not found`
				);
				continue;
			}

			const content = await readFile(expected, 'utf8');
			const { header } = parseSvelteBitsHeader(content);

			yield {
				slug: pascalToKebab(componentDirName),
				pascalName: componentDirName,
				categorySlug: pascalToKebab(categoryDirName),
				source: relative(rootForRelative, expected).replace(/\\/g, '/'),
				header
			};
		}
	}
}

function pascalToTitle(name: string): string {
	return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

function assertSyncedWithCategories(discovered: DiscoveredItem[]): void {
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
}

/**
 * Returns jsrepo registry items for all components under `src/lib/components/library`.
 */
export async function getRegistryItems(cwd: string): Promise<RegistryItem[]> {
	const root = cwd;
	const libraryDir = resolve(root, 'src/lib/components/library');
	const discovered: DiscoveredItem[] = [];
	for await (const item of walkComponents(libraryDir, root)) discovered.push(item);

	assertSyncedWithCategories(discovered);

	if (discovered.length === 0) {
		console.warn(`No components found under ${relative(root, libraryDir)}`);
	}

	const items: RegistryItem[] = [];

	for (const item of discovered) {
		const absolute = resolve(root, item.source);
		const raw = await readFile(absolute, 'utf8');
		const { header } = parseSvelteBitsHeader(raw);

		const title = header.title ?? pascalToTitle(item.pascalName);
		const description = header.description ?? `${title} component from svelte-bits.`;
		const target = `$lib/components/svelte-bits/${item.pascalName}.svelte`;

		const registryItem: RegistryItem = {
			name: item.slug,
			type: 'component',
			title,
			description,
			categories: [item.categorySlug],
			files: [
				{
					path: item.source,
					target
				}
			]
		};

		if (header.dependencies?.length) registryItem.dependencies = header.dependencies;
		if (header.devDependencies?.length) registryItem.devDependencies = header.devDependencies;
		if (header.registryDependencies?.length)
			registryItem.registryDependencies = header.registryDependencies;

		items.push(registryItem);
	}

	return items;
}
