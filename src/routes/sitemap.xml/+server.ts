import { CATEGORIES } from '$lib/constants/categories';
import type { ComponentMetadata } from '$lib/constants/information';
import { getComponentCatalog } from '$lib/utils/seo';
import type { RequestHandler } from './$types';

export const prerender = true;

const SITE = 'https://sveltebits.xyz';
const toSlug = (value: string) => value.replace(/\s+/g, '-').toLowerCase();

const escapeXml = (value: string) =>
	String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const lastModified = (meta: ComponentMetadata | undefined, today = new Date().toISOString().slice(0, 10)) =>
	[meta?.added, ...(meta?.updates ?? []).map((update) => update.date)]
		.filter(
			(date): date is string =>
				typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date)) && date <= today
		)
		.sort()
		.at(-1);

export const GET: RequestHandler = () => {
	const categories = CATEGORIES.filter((category) => category.name !== 'Get Started');
	const getStarted = CATEGORIES.find((category) => category.name === 'Get Started')?.subcategories ?? [];
	const pages: { path: string; meta?: ComponentMetadata }[] = [
		{ path: '/' },
		{ path: '/get-started/index' },
		...categories.map((category) => ({ path: `/c/${toSlug(category.name)}` })),
		...getComponentCatalog().map((item) => ({ path: item.path, meta: item.meta })),
		...getStarted.map((name) => ({ path: `/get-started/${toSlug(name)}` }))
	];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map((page) => {
		const lastmod = lastModified(page.meta);
		return `  <url>\n    <loc>${escapeXml(`${SITE}${page.path}`)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
	})
	.join('\n')}
</urlset>
`;

	return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
