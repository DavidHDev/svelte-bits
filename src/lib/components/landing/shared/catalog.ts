import { CATEGORIES, isImplemented, slug } from '$lib/constants/categories';
import { componentMetadata } from '$lib/constants/information';

const addedByPath = new Map(
	Object.values(componentMetadata).map((meta) => [new URL(meta.docsUrl).pathname, meta.added])
);

export const CATALOG = CATEGORIES.filter((category) => category.name !== 'Get Started').flatMap((category) =>
	category.subcategories.filter(isImplemented).map((name) => {
		const path = `/${slug(category.name)}/${slug(name)}`;
		return { name, category: category.name, path, added: addedByPath.get(path) ?? '' };
	})
);

export const TOTAL_COMPONENTS = CATALOG.length;

export const COMPONENT_COUNT = Math.floor(TOTAL_COMPONENTS / 5) * 5;

export const MICRO_COUNT = CATALOG.filter((item) => item.category === 'Micro').length;

export const CATEGORY_COUNT = new Set(CATALOG.map((item) => item.category)).size;

export const isAvailable = (path: string) => CATALOG.some((item) => item.path === path);

export const latestComponents = (count: number) =>
	[...CATALOG].sort((a, b) => (a.added < b.added ? 1 : a.added > b.added ? -1 : 0)).slice(0, count);
