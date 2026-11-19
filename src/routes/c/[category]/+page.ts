import { error } from '@sveltejs/kit';
import { DOCS_CATEGORIES } from '$lib/constants/docsNav';
import type { PageLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load: PageLoad = ({ params }) => {
	if (params.category === 'get-started' || !DOCS_CATEGORIES.has(params.category)) error(404, 'Not found');
};
