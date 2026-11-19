import { guardDocsRoute } from '$lib/utils/docsRoute';
import type { PageLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load: PageLoad = ({ params, url }) => {
	guardDocsRoute(params.category, params.subcategory, url);
};
