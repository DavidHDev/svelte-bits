<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { Icon } from 'svelte-icons-pack';
	import {
		SiBun,
		SiDocker,
		SiGithub,
		SiPrisma,
		SiStripe,
		SiSupabase,
		SiSvelte,
		SiTailwindcss,
		SiTypescript,
		SiVercel
	} from 'svelte-icons-pack/si';
	import LogoLoop, { type LogoItem } from '$lib/components/library/Animations/LogoLoop/LogoLoop.svelte';
	import source from '$lib/components/library/Animations/LogoLoop/LogoLoop.svelte?raw';

	type Layout = 'line' | 'wave' | 'arc' | 'orbit';
	type Direction = 'left' | 'right' | 'up' | 'down';
	type Labels = 'none' | 'inline' | 'below' | 'hover';

	const items: LogoItem[] = [
		{ node: svelteIcon, title: 'Svelte', href: 'https://svelte.dev', hoverColor: '#ff3e00' },
		{ node: bunIcon, title: 'Bun', href: 'https://bun.sh' },
		{ node: typescriptIcon, title: 'TypeScript', href: 'https://www.typescriptlang.org', hoverColor: '#3178c6' },
		{ node: tailwindIcon, title: 'Tailwind CSS', href: 'https://tailwindcss.com', hoverColor: '#38bdf8' },
		{ node: vercelIcon, title: 'Vercel', href: 'https://vercel.com' },
		{ node: githubIcon, title: 'GitHub', href: 'https://github.com' },
		{ node: dockerIcon, title: 'Docker', href: 'https://www.docker.com', hoverColor: '#2496ed' },
		{ node: prismaIcon, title: 'Prisma', href: 'https://www.prisma.io' },
		{ node: supabaseIcon, title: 'Supabase', href: 'https://supabase.com', hoverColor: '#3ecf8e' },
		{ node: stripeIcon, title: 'Stripe', href: 'https://stripe.com' }
	];

	const LOOK = {
		layout: 'line' as Layout,
		direction: 'left' as Direction,
		labels: 'none' as Labels,
		speed: 100,
		hoverSpeed: 0,
		logoHeight: 48,
		gap: 56,
		bend: 0.5,
		focus: 0,
		magnify: 0,
		muted: 0,
		tiltX: 0,
		tiltY: 0,
		fadeOut: true,
		fadeOutWidth: 0.12,
		scrollBoost: 0,
		step: false,
		scaleOnHover: true
	};

	type Look = typeof LOOK;

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK,
		draggable: true,
		intro: true,
		useCustomRender: false
	};

	const PRESETS: Record<string, Partial<Look>> = {
		classic: {},
		minimal: { logoHeight: 36, gap: 72, speed: 60, muted: 0.6, scaleOnHover: false },
		stack: { labels: 'inline', logoHeight: 32, gap: 56, speed: 80, scaleOnHover: false },
		dock: { magnify: 0.8, labels: 'hover', muted: 0.5, logoHeight: 44, gap: 44, scaleOnHover: false },
		spotlight: { focus: 0.7, step: true, labels: 'hover', muted: 0.4, logoHeight: 44, scaleOnHover: false },
		wave: { layout: 'wave', bend: 0.6, scaleOnHover: false },
		arc: { layout: 'arc', bend: 0.6, scaleOnHover: false },
		orbit: { layout: 'orbit', bend: 0.6, scaleOnHover: false },
		perspective: { tiltX: 6, tiltY: -32, speed: 120, scaleOnHover: false },
		vertical: { direction: 'up', focus: 0.5, logoHeight: 40, gap: 40, scaleOnHover: false }
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'minimal', label: 'Minimal' },
		{ value: 'stack', label: 'Stack' },
		{ value: 'dock', label: 'Dock' },
		{ value: 'spotlight', label: 'Spotlight' },
		{ value: 'wave', label: 'Wave' },
		{ value: 'arc', label: 'Arc' },
		{ value: 'orbit', label: 'Orbit' },
		{ value: 'perspective', label: 'Perspective' },
		{ value: 'vertical', label: 'Vertical' }
	];

	const LAYOUT_OPTIONS = [
		{ value: 'line', label: 'Line' },
		{ value: 'wave', label: 'Wave' },
		{ value: 'arc', label: 'Arc' },
		{ value: 'orbit', label: 'Orbit' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'up', label: 'Up' },
		{ value: 'down', label: 'Down' }
	];

	const LABEL_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'inline', label: 'Inline' },
		{ value: 'below', label: 'Below' },
		{ value: 'hover', label: 'On Hover' }
	];

	const propData = [
		{
			name: 'logos',
			type: 'LogoItem[]',
			default: 'required',
			description:
				'Logos to show. Each item is either { node } for any snippet, like an icon, or { src, alt } for an image. Both accept an optional title, href and hoverColor, the brand color a logo takes on when hovered.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '120',
			description: 'Speed in pixels per second. Negative values reverse the direction.'
		},
		{
			name: 'direction',
			type: "'left' | 'right' | 'up' | 'down'",
			default: "'left'",
			description: 'Which way the logos travel.'
		},
		{ name: 'width', type: 'number | string', default: "'100%'", description: 'Width of the loop.' },
		{ name: 'logoHeight', type: 'number', default: '28', description: 'Height of each logo in pixels.' },
		{ name: 'gap', type: 'number', default: '32', description: 'Space between logos in pixels.' },
		{
			name: 'hoverSpeed',
			type: 'number',
			default: 'undefined',
			description:
				'Speed while the loop is hovered or a logo has keyboard focus. 0 pauses it and a small value slows it down. By default it pauses.'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'undefined',
			description: 'Set to false to keep full speed on hover. Ignored when hoverSpeed is set.'
		},
		{
			name: 'fadeOut',
			type: 'boolean',
			default: 'true',
			description:
				'Fades the logos out softly at both ends. It is a transparent mask, so it works on any background.'
		},
		{
			name: 'fadeOutWidth',
			type: 'number',
			default: '0.12',
			description: 'Size of each fade as a fraction of the length, from 0 to 0.5.'
		},
		{ name: 'scaleOnHover', type: 'boolean', default: 'false', description: 'Grows the hovered logo slightly.' },
		{
			name: 'layout',
			type: "'line' | 'wave' | 'arc' | 'orbit'",
			default: "'line'",
			description: 'Path the logos travel along: a straight line, a wave, an arc, or a ring that turns in 3D.'
		},
		{
			name: 'bend',
			type: 'number',
			default: '0.5',
			description:
				'How strongly the path bends, from -1 to 1. It sets the height of the wave, the curve of the arc or the tilt of the orbit. Negative values flip it.'
		},
		{
			name: 'focus',
			type: 'number',
			default: '0',
			description:
				'A lens in the middle, from 0 to 1. Logos grow and make room as they pass the center while the outer ones dim.'
		},
		{
			name: 'magnify',
			type: 'number',
			default: '0',
			description: 'Dock-style magnification under the cursor, from 0 to 1. Nearby logos move aside to make room.'
		},
		{ name: 'tiltX', type: 'number', default: '0', description: 'Tilts the loop back or forward in 3D, in degrees.' },
		{ name: 'tiltY', type: 'number', default: '0', description: 'Turns the loop to the side in 3D, in degrees.' },
		{
			name: 'step',
			type: 'boolean',
			default: 'false',
			description: 'Moves one logo at a time and pauses, centering each logo in turn. Speed sets the pace.'
		},
		{
			name: 'muted',
			type: 'number',
			default: '0',
			description: 'Greys out and dims the logos until one is hovered or centered, from 0 to 1.'
		},
		{
			name: 'labels',
			type: "'none' | 'inline' | 'below' | 'hover'",
			default: "'none'",
			description:
				"Shows each logo's title beside it, below it, or as a small caption when it is hovered or centered."
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'true',
			description: 'Lets people drag or swipe the loop and fling it. Links still open with a normal click.'
		},
		{
			name: 'scrollBoost',
			type: 'number',
			default: '0',
			description: 'Speeds the loop up while the page scrolls and reverses it when scrolling up, from 0 to 1.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Logos fade and rise in from left to right the first time the loop comes into view.'
		},
		{
			name: 'renderItem',
			type: 'Snippet<[LogoItem, string]>',
			default: 'undefined',
			description: 'Custom render snippet for each logo, for full control over how it looks.'
		},
		{ name: 'ariaLabel', type: 'string', default: "'Partner logos'", description: 'Accessible name for the loop.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: "''", description: 'Inline styles for the container.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';
	const usage = `${scriptOpen}
  import LogoLoop from '$lib/components/LogoLoop.svelte';
  import { Icon } from 'svelte-icons-pack';
  import { SiSvelte, SiBun, SiTypescript, SiTailwindcss } from 'svelte-icons-pack/si';

  const techLogos = [
    { node: svelte, title: 'Svelte', href: 'https://svelte.dev', hoverColor: '#ff3e00' },
    { node: bun, title: 'Bun', href: 'https://bun.sh' },
    { node: typescript, title: 'TypeScript', href: 'https://www.typescriptlang.org', hoverColor: '#3178c6' },
    { node: tailwind, title: 'Tailwind CSS', href: 'https://tailwindcss.com', hoverColor: '#38bdf8' }
  ];

  const imageLogos = [
    { src: '/logos/company1.png', alt: 'Company 1', href: 'https://company1.com' },
    { src: '/logos/company2.png', alt: 'Company 2', href: 'https://company2.com' },
    { src: '/logos/company3.png', alt: 'Company 3', href: 'https://company3.com' }
  ];
${scriptClose}

{#snippet svelte()}<Icon src={SiSvelte} />{/snippet}
{#snippet bun()}<Icon src={SiBun} />{/snippet}
{#snippet typescript()}<Icon src={SiTypescript} />{/snippet}
{#snippet tailwind()}<Icon src={SiTailwindcss} />{/snippet}

<div style="height: 200px; position: relative; overflow: hidden;">
  <LogoLoop
    logos={techLogos}
    speed={100}
    direction="left"
    logoHeight={48}
    gap={56}
    hoverSpeed={0}
    scaleOnHover
    ariaLabel="Technology partners"
  />

  <LogoLoop
    logos={techLogos}
    layout="orbit"
    bend={0.6}
    magnify={0.6}
    labels="hover"
    muted={0.5}
  />

  <LogoLoop logos={imageLogos} direction="up" focus={0.5} step />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const loopProps = $derived.by(() => {
		const { preset: _preset, useCustomRender: _useCustomRender, ...rest } = settings;
		return rest;
	});
	const bends = $derived(settings.layout !== 'line');
	let key = $state(0);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(LOOK).map((name) => [name, demo.defaultProps[name as keyof Look]])
		) as Partial<Look>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};
</script>

{#snippet svelteIcon()}<Icon src={SiSvelte} />{/snippet}
{#snippet bunIcon()}<Icon src={SiBun} />{/snippet}
{#snippet typescriptIcon()}<Icon src={SiTypescript} />{/snippet}
{#snippet tailwindIcon()}<Icon src={SiTailwindcss} />{/snippet}
{#snippet vercelIcon()}<Icon src={SiVercel} />{/snippet}
{#snippet githubIcon()}<Icon src={SiGithub} />{/snippet}
{#snippet dockerIcon()}<Icon src={SiDocker} />{/snippet}
{#snippet prismaIcon()}<Icon src={SiPrisma} />{/snippet}
{#snippet supabaseIcon()}<Icon src={SiSupabase} />{/snippet}
{#snippet stripeIcon()}<Icon src={SiStripe} />{/snippet}

{#snippet customTile(item: LogoItem)}
	<div
		style="padding: 0.18em; border-radius: 0.22em; border: 1px solid var(--border-primary); background: var(--surface-ghost); line-height: 0;"
	>
		{#if 'node' in item}
			{@render item.node()}
		{:else}
			<img src={item.src} alt={item.alt} />
		{/if}
	</div>
{/snippet}

<TabsLayout
	propsState={demo}
	componentName="LogoLoop"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'useCustomRender']}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 400px; padding: 0; overflow: hidden;">
			<RefreshButton onClick={() => key++} />
			{#key key}
				<LogoLoop
					logos={items}
					{...loopProps}
					ariaLabel="Our tech stack"
					renderItem={settings.useCustomRender ? customTile : undefined}
				/>
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Layout"
				options={LAYOUT_OPTIONS}
				value={settings.layout}
				onChange={(v) => demo.updateProp('layout', v as Layout)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(v) => demo.updateProp('direction', v as Direction)}
			/>
			<PreviewSelect
				title="Labels"
				options={LABEL_OPTIONS}
				value={settings.labels}
				onChange={(v) => demo.updateProp('labels', v as Labels)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={300}
				step={10}
				value={settings.speed}
				valueUnit="px/s"
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Hover Speed"
				min={0}
				max={200}
				step={10}
				value={settings.hoverSpeed}
				valueUnit="px/s"
				onChange={(v) => demo.updateProp('hoverSpeed', v)}
			/>
			<PreviewSlider
				title="Logo Height"
				min={20}
				max={100}
				step={2}
				value={settings.logoHeight}
				valueUnit="px"
				onChange={(v) => demo.updateProp('logoHeight', v)}
			/>
			<PreviewSlider
				title="Gap"
				min={10}
				max={120}
				step={2}
				value={settings.gap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('gap', v)}
			/>
			<PreviewSlider
				title="Bend"
				min={-1}
				max={1}
				step={0.05}
				value={settings.bend}
				isDisabled={!bends}
				onChange={(v) => demo.updateProp('bend', v)}
			/>
			<PreviewSlider
				title="Focus"
				min={0}
				max={1}
				step={0.05}
				value={settings.focus}
				onChange={(v) => demo.updateProp('focus', v)}
			/>
			<PreviewSlider
				title="Magnify"
				min={0}
				max={1}
				step={0.05}
				value={settings.magnify}
				onChange={(v) => demo.updateProp('magnify', v)}
			/>
			<PreviewSlider
				title="Muted"
				min={0}
				max={1}
				step={0.05}
				value={settings.muted}
				onChange={(v) => demo.updateProp('muted', v)}
			/>
			<PreviewSlider
				title="Tilt X"
				min={-60}
				max={60}
				step={1}
				value={settings.tiltX}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tiltX', v)}
			/>
			<PreviewSlider
				title="Tilt Y"
				min={-60}
				max={60}
				step={1}
				value={settings.tiltY}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tiltY', v)}
			/>
			<PreviewSlider
				title="Fade Width"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.fadeOutWidth}
				isDisabled={!settings.fadeOut}
				onChange={(v) => demo.updateProp('fadeOutWidth', v)}
			/>
			<PreviewSlider
				title="Scroll Boost"
				min={0}
				max={1}
				step={0.05}
				value={settings.scrollBoost}
				onChange={(v) => demo.updateProp('scrollBoost', v)}
			/>
			<PreviewSwitch title="Fade Out" isChecked={settings.fadeOut} onChange={(v) => demo.updateProp('fadeOut', v)} />
			<PreviewSwitch title="Step" isChecked={settings.step} onChange={(v) => demo.updateProp('step', v)} />
			<PreviewSwitch
				title="Draggable"
				isChecked={settings.draggable}
				onChange={(v) => demo.updateProp('draggable', v)}
			/>
			<PreviewSwitch
				title="Scale on Hover"
				isChecked={settings.scaleOnHover}
				onChange={(v) => demo.updateProp('scaleOnHover', v)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v) => {
					demo.updateProp('intro', v);
					key++;
				}}
			/>
			<PreviewSwitch
				title="Custom Render"
				isChecked={settings.useCustomRender}
				onChange={(v) => demo.updateProp('useCustomRender', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
