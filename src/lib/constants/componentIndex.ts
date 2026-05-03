import { CATEGORIES, IMPLEMENTED_DEMOS, slug } from './categories';

export type ComponentIndexItem = {
	key: string;
	categoryLabel: string;
	title: string;
	to: string;
	videoBase: string;
};

function videoName(label: string) {
	return label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

export const COMPONENT_INDEX_ITEMS: ComponentIndexItem[] = CATEGORIES
	.filter((category) => category.name !== 'Get Started')
	.flatMap((category) =>
		category.subcategories
			.filter((title) => IMPLEMENTED_DEMOS.has(slug(title)))
			.map((title) => ({
				key: `${category.name}/${title}`,
				categoryLabel: category.name,
				title,
				to: `/${slug(category.name)}/${slug(title)}`,
				videoBase: `/video/${videoName(title)}`
			}))
	)
	.sort((a, b) => a.title.localeCompare(b.title));
