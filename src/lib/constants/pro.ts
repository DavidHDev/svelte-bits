import { BotIcon, CubeIcon, DashboardSquare01Icon, LayoutTemplateIcon, Layers01Icon } from '@hugeicons/core-free-icons';
import proSummary from './pro-summary.generated.json';

type Counts = typeof proSummary.counts;
type CountKey = Exclude<keyof Counts, 'total' | 'blockCategories' | 'appUiCategories'>;

export type ProShowcaseItem = { name: string; slug: string; href: string; image: string; imageLight?: string };

export type ProMediaItem = {
	name: string;
	slug: string;
	href: string;
	media?: { animated?: string; poster?: string; light?: string; dark?: string };
};

export type ProCategory = { count: number; noun: string; pitch?: string; path: string; items: ProMediaItem[] };

export const PRO_COUNTS: Counts = proSummary.counts;
export const PRO_FREE: Record<string, number> = proSummary.plans.free;
export const PRO_ASSET_BASE: string = proSummary.assets.baseUrl;
export const PRO_SHOWCASE_ITEMS: Record<string, ProShowcaseItem[]> = proSummary.showcase;
export const PRO_CATEGORIES: Record<string, ProCategory> = proSummary.categories;

export type ProSection = {
	slug: string;
	label: string;
	sidebarLabel?: string;
	icon: typeof CubeIcon;
	countKey: CountKey;
	countLabel: string;
	tagline: string;
	proPath: string;
};

export const PRO_SECTIONS: ProSection[] = [
	{
		slug: 'components',
		label: 'Components',
		icon: CubeIcon,
		countKey: 'components',
		countLabel: 'animated components',
		tagline: 'Shaders, 3D, cursor effects and text, in Tailwind or plain CSS.',
		proPath: '/docs/components'
	},
	{
		slug: 'blocks',
		label: 'Blocks',
		icon: Layers01Icon,
		countKey: 'blocks',
		countLabel: 'page sections',
		tagline: 'Heroes, pricing, FAQs and footers that stack into a full landing page.',
		proPath: '/docs/blocks'
	},
	{
		slug: 'app-ui',
		label: 'App UI',
		icon: DashboardSquare01Icon,
		countKey: 'appUi',
		countLabel: 'app UI blocks',
		tagline: 'Dashboards, tables, AI chat and auth, in two styles and one theme panel.',
		proPath: '/docs/app-ui'
	},
	{
		slug: 'templates',
		label: 'Templates',
		icon: LayoutTemplateIcon,
		countKey: 'templates',
		countLabel: 'full templates',
		tagline: 'Multi-page Next.js sites. Swap the copy and deploy.',
		proPath: '/docs/templates'
	},
	{
		slug: 'agent-kit',
		label: 'Agent Kit',
		sidebarLabel: 'Skills',
		icon: BotIcon,
		countKey: 'agentKit',
		countLabel: 'agent skills',
		tagline: 'Give Claude Code, Cursor and Copilot real design taste.',
		proPath: '/docs/agent-kit'
	}
];

export const proFreeCount = (section: ProSection) => PRO_FREE[section.countKey] ?? 0;

export const PRO_PANEL = {
	title: 'Building with React too? Try React Bits Pro.',
	description: 'Components, page blocks, app UI, templates, the Agent Kit and page builders, ready to launch.',
	path: '/'
};
