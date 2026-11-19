import { error, redirect } from '@sveltejs/kit';
import { CATEGORIES, IMPLEMENTED_DEMOS } from '$lib/constants/categories';
import { componentMetadata } from '$lib/constants/information';
import { DOCS_CATEGORIES, navSlug } from '$lib/constants/docsNav';
import { findComponentBySlug } from './routeMatch';

const GET_STARTED = new Set(
	(CATEGORIES.find((category) => category.name === 'Get Started')?.subcategories ?? []).map(navSlug)
);

const HIDDEN_PATHS = new Set(
	Object.values(componentMetadata)
		.filter((meta) => meta.hidden)
		.map((meta) => new URL(meta.docsUrl).pathname)
		.filter((path) => IMPLEMENTED_DEMOS.has(path.split('/').pop() ?? ''))
);

export function guardDocsRoute(category: string, subcategory: string, url: URL, prefix = '') {
	const tail = url.search;
	if (category === 'get-started' && subcategory === 'mcp-server') redirect(308, `/get-started/mcp${tail}`);
	if (HIDDEN_PATHS.has(`/${category}/${subcategory}`)) return;
	const match = findComponentBySlug(subcategory);
	if (match && match.path !== `/${category}/${subcategory}`) redirect(308, `${prefix}${match.path}${tail}`);
	if (subcategory === 'index' && category !== 'get-started' && DOCS_CATEGORIES.has(category))
		redirect(308, `/c/${category}${tail}`);
	const known = category === 'get-started' ? GET_STARTED.has(subcategory) || subcategory === 'index' : Boolean(match);
	if (!DOCS_CATEGORIES.has(category) || !known) error(404, 'Not found');
}
