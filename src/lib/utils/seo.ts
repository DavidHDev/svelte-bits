import { CATEGORIES } from '$lib/constants/categories';
import { componentMetadata, type ComponentMetadata } from '$lib/constants/information';

export const toSlug = (value: string) => value.replace(/\s+/g, '-').toLowerCase();

export const CATEGORY_LABELS: Record<string, { label: string; path: string }> = {
	'text-animations': { label: 'Text Animations', path: '/c/text-animations' },
	animations: { label: 'Animations', path: '/c/animations' },
	components: { label: 'Components', path: '/c/components' },
	backgrounds: { label: 'Backgrounds', path: '/c/backgrounds' },
	micro: { label: 'Micro', path: '/c/micro' }
};

export type CatalogItem = {
	key: string;
	meta: ComponentMetadata;
	name: string;
	category: string;
	categorySlug: string;
	slug: string;
	path: string;
};

export const getComponentCatalog = (): CatalogItem[] => {
	const metadataByPath = new Map(
		Object.entries(componentMetadata).map(([key, meta]) => [new URL(meta.docsUrl).pathname, { key, meta }])
	);
	return CATEGORIES.filter((category) => category.name !== 'Get Started').flatMap((category) =>
		category.subcategories.flatMap((name) => {
			const categorySlug = toSlug(category.name);
			const slug = toSlug(name);
			const path = `/${categorySlug}/${slug}`;
			const found = metadataByPath.get(path);
			return found ? [{ ...found, name, category: category.name, categorySlug, slug, path }] : [];
		})
	);
};

const catalog = getComponentCatalog();
const componentsByPath = new Map(catalog.map((item) => [item.path, item]));

const stopWords = new Set(
	'a an and as at by for from in into is it of on or that the to with your svelte react component components animated animation effect effects customizable'.split(
		' '
	)
);

const tokens = (value: string) =>
	new Set(
		String(value)
			.toLowerCase()
			.match(/[a-z0-9]+/g)
			?.filter((word) => word.length > 2 && !stopWords.has(word)) ?? []
	);

const relatedComponents = (item: CatalogItem) => {
	const keywords = tokens(`${item.name} ${item.meta.description} ${(item.meta.tags ?? []).join(' ')}`);
	return catalog
		.filter((candidate) => candidate.path !== item.path && candidate.categorySlug === item.categorySlug)
		.map((candidate) => {
			const candidateKeywords = tokens(
				`${candidate.name} ${candidate.meta.description} ${(candidate.meta.tags ?? []).join(' ')}`
			);
			const score = [...keywords].filter((word) => candidateKeywords.has(word)).length;
			return { candidate, score };
		})
		.sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
		.slice(0, 3)
		.map(({ candidate }) => ({ name: candidate.name, path: candidate.path, description: candidate.meta.description }));
};

export type ComponentSEO = {
	heading: string;
	path: string;
	intro: string;
	category: { name: string; path: string };
	related: { name: string; path: string; description: string }[];
};

export const getComponentSEOByPath = (path: string): ComponentSEO | null => {
	const item = componentsByPath.get(path);
	if (!item) return null;
	const category = CATEGORY_LABELS[item.categorySlug];
	return {
		heading: item.name,
		path: item.path,
		intro: item.meta.description,
		category: { name: category?.label ?? item.category, path: category?.path ?? '/get-started/index' },
		related: relatedComponents(item)
	};
};

export const COMPONENT_ROUTES = CATEGORIES.filter((category) => category.name !== 'Get Started').flatMap((category) =>
	category.subcategories.map((component) => ({
		category: category.name,
		component,
		path: `/${toSlug(category.name)}/${toSlug(component)}`
	}))
);
