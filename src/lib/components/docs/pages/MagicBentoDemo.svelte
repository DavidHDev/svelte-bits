<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		AnalyticsUpIcon,
		DashboardSquare01Icon,
		PlugSocketIcon,
		SecurityCheckIcon,
		UserGroupIcon,
		WorkflowSquare03Icon
	} from '@hugeicons/core-free-icons';
	import MagicBento, { type MagicBentoItem } from '$lib/components/library/Components/MagicBento/MagicBento.svelte';
	import source from '$lib/components/library/Components/MagicBento/MagicBento.svelte?raw';

	type DemoMode = 'features' | 'gallery' | 'basic';
	type PresetName = 'classic' | 'ember' | 'ocean' | 'mint' | 'tilt' | 'quiet';

	const BASIC: MagicBentoItem[] = [
		{ label: 'Insights', title: 'Analytics', description: 'Track user behavior', icon: analyticsGlyph },
		{ label: 'Overview', title: 'Dashboard', description: 'Centralized data view', icon: dashboardGlyph },
		{
			label: 'Teamwork',
			title: 'Collaboration',
			description: 'Work together seamlessly',
			icon: teamGlyph,
			colSpan: 2,
			rowSpan: 2
		},
		{
			label: 'Efficiency',
			title: 'Automation',
			description: 'Streamline workflows',
			icon: workflowGlyph,
			colSpan: 2,
			rowSpan: 2
		},
		{ label: 'Connectivity', title: 'Integration', description: 'Connect favorite tools', icon: plugGlyph },
		{ label: 'Protection', title: 'Security', description: 'Enterprise-grade protection', icon: securityGlyph }
	];

	const GALLERY: Record<'light' | 'dark', MagicBentoItem[]> = {
		light: [
			{
				image: '/assets/demo/day-portrait.webp',
				title: 'The Pier',
				description: 'Clear sky',
				colSpan: 2,
				rowSpan: 2
			},
			{ image: '/assets/demo/day-sky.webp', title: 'Open Sky', description: 'Golden hour', colSpan: 2 },
			{ image: '/assets/demo/day-landscape.webp', title: 'Canola Field', description: 'Midday' },
			{ image: '/assets/demo/night-sky.webp', title: 'Open Sky', description: 'Blue hour' },
			{ image: '/assets/demo/night-landscape.webp', title: 'Canola Field', description: 'Moonrise', colSpan: 2 },
			{ image: '/assets/demo/night-portrait.webp', title: 'The Pier', description: 'Dusk', colSpan: 2 }
		],
		dark: [
			{
				image: '/assets/demo/night-portrait.webp',
				title: 'The Pier',
				description: 'Dusk',
				colSpan: 2,
				rowSpan: 2
			},
			{ image: '/assets/demo/night-sky.webp', title: 'Open Sky', description: 'Blue hour', colSpan: 2 },
			{ image: '/assets/demo/night-landscape.webp', title: 'Canola Field', description: 'Moonrise' },
			{ image: '/assets/demo/day-sky.webp', title: 'Open Sky', description: 'Golden hour' },
			{ image: '/assets/demo/day-landscape.webp', title: 'Canola Field', description: 'Midday', colSpan: 2 },
			{ image: '/assets/demo/day-portrait.webp', title: 'The Pier', description: 'Clear sky', colSpan: 2 }
		]
	};

	const LOOK = {
		glowColor: '',
		spotlightRadius: 300,
		enableBorderGlow: true,
		enableSpotlight: true,
		enableStars: false,
		particleCount: 24,
		enableTilt: false,
		enableMagnetism: false
	};

	const DEFAULT_PROPS = {
		demo: 'features' as DemoMode,
		preset: 'classic' as PresetName,
		...LOOK,
		rowHeight: 200,
		gap: 12,
		radius: 20,
		clickEffect: true,
		textAutoHide: true,
		intro: true
	};

	const PRESETS: Record<PresetName, Partial<typeof LOOK>> = {
		classic: {},
		ember: { glowColor: '#f97316', enableStars: true, particleCount: 28 },
		ocean: { glowColor: '#38bdf8', spotlightRadius: 420 },
		mint: { glowColor: '#34d399', enableStars: true, particleCount: 18, spotlightRadius: 260 },
		tilt: { enableTilt: true, enableMagnetism: true },
		quiet: { enableSpotlight: false, spotlightRadius: 220 }
	};

	const LIGHT_SWAP: Record<string, string> = {
		'#f97316': '#ea580c',
		'#38bdf8': '#0284c7',
		'#34d399': '#059669'
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'ember', label: 'Ember' },
		{ value: 'ocean', label: 'Ocean' },
		{ value: 'mint', label: 'Mint' },
		{ value: 'tilt', label: 'Tilt' },
		{ value: 'quiet', label: 'Quiet' }
	];

	const DEMO_OPTIONS = [
		{ value: 'features', label: 'Features' },
		{ value: 'gallery', label: 'Gallery' },
		{ value: 'basic', label: 'Basic' }
	];

	const propData = [
		{
			name: 'items',
			type: 'MagicBentoItem[]',
			default: 'Six feature cards',
			description:
				'Cards to show. Each takes label, title, description, icon, image, visual, content, href, onClick, colSpan and rowSpan.'
		},
		{
			name: 'items[].visual',
			type: 'Snippet | string',
			default: '-',
			description:
				'Artwork between the header and the text. Use your own snippet, or a built-in one: analytics, dashboard, collaboration, automation, integration or security.'
		},
		{
			name: 'items[].content',
			type: 'Snippet',
			default: '-',
			description: 'Replaces the whole inside of the card. The lights, border and click wave still apply.'
		},
		{
			name: 'items[].image',
			type: 'string',
			default: '-',
			description: 'Photo that fills the card, with a soft shade under the text.'
		},
		{
			name: 'columns',
			type: 'number',
			default: '4',
			description: 'Columns on wide screens. Drops to 2, then 1, as the grid gets narrower.'
		},
		{ name: 'rowHeight', type: 'number', default: '200', description: 'Height of one row, in px.' },
		{ name: 'gap', type: 'number', default: '12', description: 'Space between cards, in px.' },
		{ name: 'radius', type: 'number', default: '20', description: 'Corner radius of the cards, in px.' },
		{ name: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Color theme of the cards.' },
		{
			name: 'glowColor',
			type: 'string',
			default: 'Text color',
			description: 'Color of the lights and the accents in the artwork. Takes hex or "r, g, b".'
		},
		{
			name: 'enableBorderGlow',
			type: 'boolean',
			default: 'true',
			description: 'Lights up the card edges near the cursor, across neighboring cards too.'
		},
		{
			name: 'enableSpotlight',
			type: 'boolean',
			default: 'true',
			description: 'A soft light follows the cursor inside the hovered card.'
		},
		{ name: 'spotlightRadius', type: 'number', default: '300', description: 'Size of the cursor light, in px.' },
		{
			name: 'enableStars',
			type: 'boolean',
			default: 'false',
			description: 'Fine specks of light drift up around the cursor in the hovered card.'
		},
		{ name: 'particleCount', type: 'number', default: '24', description: 'Number of specks in each card.' },
		{ name: 'enableTilt', type: 'boolean', default: 'false', description: 'Tilts the hovered card toward the cursor.' },
		{
			name: 'enableMagnetism',
			type: 'boolean',
			default: 'false',
			description: 'The hovered card leans a few pixels toward the cursor.'
		},
		{
			name: 'clickEffect',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a ring of light across the grid and replays the card artwork.'
		},
		{
			name: 'textAutoHide',
			type: 'boolean',
			default: 'true',
			description: 'Keeps titles to one line and descriptions to two.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Cards rise in one by one and their artwork plays when the grid scrolls into view.'
		},
		{
			name: 'disableAnimations',
			type: 'boolean',
			default: 'false',
			description: 'Turns off all motion. Reduced motion settings do the same.'
		},
		{
			name: 'onItemClick',
			type: '(item, index) => void',
			default: '-',
			description: 'Called when a card is clicked. Cards become focusable buttons.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the grid.' },
		{ name: 'style', type: 'string', default: "''", description: 'Inline styles for the grid.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import MagicBento from '$lib/components/MagicBento.svelte';
${scriptClose}

<MagicBento
  columns={4}
  rowHeight={200}
  gap={12}
  radius={20}
  enableBorderGlow={true}
  enableSpotlight={true}
  spotlightRadius={300}
  clickEffect={true}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { demo: _demo, preset: _preset, glowColor: _glowColor, ...rest } = settings;
		return rest;
	});
	const bentoTheme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');
	const picked = $derived(
		settings.glowColor ? `#${String(settings.glowColor).replace(/^#/, '').toLowerCase()}` : ''
	);
	const color = $derived(picked && bentoTheme === 'light' ? (LIGHT_SWAP[picked] ?? picked) : picked);
	const items = $derived(
		settings.demo === 'gallery' ? GALLERY[bentoTheme] : settings.demo === 'basic' ? BASIC : undefined
	);
	let key = $state(0);

	const applyPreset = (value: string) => {
		const name = (value in PRESETS ? value : 'classic') as PresetName;
		const base = Object.fromEntries(
			Object.keys(LOOK).map((prop) => [prop, demo.defaultProps[prop as keyof typeof LOOK]])
		) as typeof LOOK;
		demo.updateProps({ ...base, ...PRESETS[name], preset: name });
	};

	const computedProps = $derived({
		...(color ? { glowColor: color } : {}),
		...(bentoTheme === 'light' ? { theme: 'light' } : {})
	});
</script>

{#snippet analyticsGlyph()}<HugeiconsIcon icon={AnalyticsUpIcon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet dashboardGlyph()}<HugeiconsIcon icon={DashboardSquare01Icon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet teamGlyph()}<HugeiconsIcon icon={UserGroupIcon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet workflowGlyph()}<HugeiconsIcon icon={WorkflowSquare03Icon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet plugGlyph()}<HugeiconsIcon icon={PlugSocketIcon} size={16} strokeWidth={1.8} />{/snippet}
{#snippet securityGlyph()}<HugeiconsIcon icon={SecurityCheckIcon} size={16} strokeWidth={1.8} />{/snippet}

<TabsLayout
	propsState={demo}
	componentName="MagicBento"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['demo', 'preset', 'glowColor']}
	{computedProps}
	dependencies={['@hugeicons/svelte', '@hugeicons/core-free-icons']}
>
	{#snippet previewTab()}
		<div class="demo-container magic-bento-demo">
			<RefreshButton onClick={() => key++} />
			<div class="magic-bento-demo__frame">
				{#key `${key}-${settings.demo}`}
					<MagicBento {...componentProps} theme={bentoTheme} {items} glowColor={color || undefined} />
				{/key}
			</div>
		</div>

		<Customize>
			<PreviewSelect
				title="Demo"
				options={DEMO_OPTIONS}
				value={settings.demo}
				onChange={(value) => demo.updateProp('demo', value as DemoMode)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Glow Color"
				color={color || (bentoTheme === 'light' ? '#18181b' : '#f4f4f5')}
				onChange={(value) => demo.updateProp('glowColor', value)}
			/>
			<PreviewSlider
				title="Spotlight Radius"
				min={120}
				max={600}
				step={10}
				value={settings.spotlightRadius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('spotlightRadius', value)}
			/>
			<PreviewSlider
				title="Star Count"
				min={6}
				max={60}
				step={1}
				value={settings.particleCount}
				isDisabled={!settings.enableStars}
				onChange={(value) => demo.updateProp('particleCount', value)}
			/>
			<PreviewSlider
				title="Row Height"
				min={170}
				max={280}
				step={5}
				value={settings.rowHeight}
				valueUnit="px"
				onChange={(value) => demo.updateProp('rowHeight', value)}
			/>
			<PreviewSlider
				title="Gap"
				min={4}
				max={24}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(value) => demo.updateProp('gap', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={32}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewSwitch
				title="Border Glow"
				isChecked={settings.enableBorderGlow}
				onChange={(value) => demo.updateProp('enableBorderGlow', value)}
			/>
			<PreviewSwitch
				title="Spotlight"
				isChecked={settings.enableSpotlight}
				onChange={(value) => demo.updateProp('enableSpotlight', value)}
			/>
			<PreviewSwitch
				title="Stars"
				isChecked={settings.enableStars}
				onChange={(value) => demo.updateProp('enableStars', value)}
			/>
			<PreviewSwitch
				title="Tilt"
				isChecked={settings.enableTilt}
				onChange={(value) => demo.updateProp('enableTilt', value)}
			/>
			<PreviewSwitch
				title="Magnetism"
				isChecked={settings.enableMagnetism}
				onChange={(value) => demo.updateProp('enableMagnetism', value)}
			/>
			<PreviewSwitch
				title="Click Effect"
				isChecked={settings.clickEffect}
				onChange={(value) => demo.updateProp('clickEffect', value)}
			/>
			<PreviewSwitch
				title="Text Auto Hide"
				isChecked={settings.textAutoHide}
				onChange={(value) => demo.updateProp('textAutoHide', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => {
					demo.updateProp('intro', value);
					key++;
				}}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['@hugeicons/svelte', '@hugeicons/core-free-icons']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.magic-bento-demo {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		place-items: center;
		height: auto;
		min-height: 480px;
		padding: 56px 16px;
		overflow: hidden;
	}

	.magic-bento-demo__frame {
		width: 100%;
		max-width: 760px;
	}

	@media (min-width: 768px) {
		.magic-bento-demo {
			min-height: 600px;
			padding: 48px 32px;
		}
	}
</style>
