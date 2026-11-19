import {
	DashboardSquare01Icon,
	Image01Icon,
	Motion01Icon,
	MousePointerClickIcon,
	PuzzleIcon,
	TextFontIcon
} from '@hugeicons/core-free-icons';
import { CATEGORIES } from './categories';
import { componentMetadata } from './information';

export const navSlug = (value: string) => value.replace(/\s+/g, '-').toLowerCase();

export const TOTAL_COMPONENTS = CATEGORIES.filter((category) => category.name !== 'Get Started').reduce(
	(total, category) => total + category.subcategories.length,
	0
);

export const PICKER = [
	{ key: 'all', label: 'All', icon: DashboardSquare01Icon },
	{ key: 'text-animations', label: 'Text Animations', icon: TextFontIcon },
	{ key: 'components', label: 'Components', icon: PuzzleIcon },
	{ key: 'micro', label: 'Micro', icon: MousePointerClickIcon },
	{ key: 'animations', label: 'Animations', icon: Motion01Icon },
	{ key: 'backgrounds', label: 'Backgrounds', icon: Image01Icon }
];

export const CATEGORY_ICONS = {
	'Text Animations': TextFontIcon,
	Animations: Motion01Icon,
	Components: PuzzleIcon,
	Micro: MousePointerClickIcon,
	Backgrounds: Image01Icon
};

export const CATEGORY_KEYS: Record<string, string> = {
	components: 'Components',
	animations: 'Animations',
	backgrounds: 'Backgrounds',
	'text-animations': 'TextAnimations',
	micro: 'Micro'
};

export const DOCS_CATEGORIES = new Set(CATEGORIES.map((category) => navSlug(category.name)));

export const METADATA_BY_PATH = new Map(
	Object.entries(componentMetadata).map(([key, meta]) => [new URL(meta.docsUrl).pathname, { key, meta }])
);

export type PageSEO = {
	title: string;
	description: string;
	heading: string;
	path: string;
	label?: string;
	robots?: string;
};

export const INDEX_SEO: PageSEO = {
	title: 'Browse Free Svelte Components | Svelte Bits',
	description:
		'Browse the Svelte Bits library of free animated Svelte components. Find text effects, backgrounds, cards, galleries and micro interactions with live demos.',
	heading: 'Components',
	path: '/get-started/index'
};

export const CATEGORY_SEO: Record<string, PageSEO> = {
	'text-animations': {
		title: 'Svelte Text Animations — Free Components | Svelte Bits',
		description:
			'Free Svelte text animation components: split text, typewriter effects, rotating text, scroll reveals and more. Try live demos and customize the source.',
		heading: 'Text Animations',
		label: 'Text Animations',
		path: '/c/text-animations'
	},
	animations: {
		title: 'Svelte Animation Effects — Free Components | Svelte Bits',
		description:
			'Explore free Svelte animation effects for cursors, hover interactions, scroll reveals, borders and images. Customize each effect in a live demo.',
		heading: 'Animations',
		label: 'Animations',
		path: '/c/animations'
	},
	components: {
		title: 'Interactive Svelte UI Components — Free Library | Svelte Bits',
		description:
			'Free interactive Svelte UI components for cards, navigation, carousels and galleries. Preview each component and use the TypeScript source.',
		heading: 'Components',
		label: 'Components',
		path: '/c/components'
	},
	backgrounds: {
		title: 'Animated Svelte Backgrounds — Free Components | Svelte Bits',
		description:
			'Free animated Svelte backgrounds, including gradients, particles, grids and shader effects. Explore live previews and customize the look of your page.',
		heading: 'Backgrounds',
		label: 'Backgrounds',
		path: '/c/backgrounds'
	},
	micro: {
		title: 'Svelte Micro Interactions — Free Components | Svelte Bits',
		description:
			'Free Svelte micro interaction components for buttons, toggles, indicators and other interface details. Explore interactive demos and copy the source.',
		heading: 'Micro Interactions',
		label: 'Micro',
		path: '/c/micro'
	}
};

export const PAGE_METADATA: Record<string, PageSEO> = {
	'/get-started/introduction': {
		title: 'Introduction to Svelte Bits | Free Svelte Components',
		heading: 'Introduction',
		description:
			'Free, open source animated Svelte components and backgrounds in TypeScript and Tailwind. See what is inside, how to install it and how it works with AI.',
		path: '/get-started/introduction'
	},
	'/get-started/installation': {
		title: 'Install Svelte Bits Components | Svelte Bits',
		heading: 'Installation',
		description: 'Install Svelte Bits components with the shadcn or jsrepo CLI, or copy the source.',
		path: '/get-started/installation'
	},
	'/get-started/mcp': {
		title: 'Svelte Component Registry MCP Setup | Svelte Bits',
		heading: 'MCP Server',
		description:
			'Connect your coding agent to the Svelte Bits registry through the shadcn MCP server to discover and install components.',
		path: '/get-started/mcp'
	},
	'/get-started/changelog': {
		title: 'Svelte Bits Changelog | New Components and Updates',
		heading: 'Changelog',
		description: 'Keep up with the newest additions to Svelte Bits.',
		path: '/get-started/changelog'
	},
	'/favorites': {
		title: 'Svelte Bits - Favorites',
		heading: 'Favorites',
		description: 'Your saved Svelte Bits components on this browser.',
		path: '/favorites',
		robots: 'noindex, follow'
	}
};
