import { CHANGELOG_DESCRIPTION, getChangelogEntries, type ChangelogEntry } from '$lib/utils/changelog';
import type { RequestHandler } from './$types';

export const prerender = true;

const SITE = 'https://sveltebits.xyz';
const LIMIT = 100;
const TITLE_PREFIX = { launch: 'New category', added: 'New', updated: 'Updated' };

const escapeXml = (value: string) =>
	String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const toRfc822 = (date: string) => new Date(`${date}T12:00:00Z`).toUTCString();

const describe = (entry: ChangelogEntry) =>
	entry.type === 'launch'
		? `${entry.note} Launched with ${entry.components?.length ?? 0} components: ${(entry.components ?? [])
				.map((component) => component.name)
				.join(', ')}.`
		: entry.note;

export const GET: RequestHandler = () => {
	const entries = getChangelogEntries().slice(0, LIMIT);
	const items = entries
		.map((entry) =>
			[
				'    <item>',
				`      <title>${escapeXml(`${TITLE_PREFIX[entry.type]}: ${entry.name}`)}</title>`,
				`      <link>${SITE}${entry.path}</link>`,
				`      <guid isPermaLink="false">sveltebits:${escapeXml(entry.id)}</guid>`,
				`      <pubDate>${toRfc822(entry.date)}</pubDate>`,
				`      <category>${escapeXml(entry.category)}</category>`,
				`      <description>${escapeXml(describe(entry))}</description>`,
				'    </item>'
			].join('\n')
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Svelte Bits changelog</title>
    <link>${SITE}/get-started/changelog</link>
    <description>${escapeXml(CHANGELOG_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${toRfc822(entries[0]?.date ?? new Date().toISOString().slice(0, 10))}</lastBuildDate>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

	return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
