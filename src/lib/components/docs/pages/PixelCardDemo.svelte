<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import {
		DropletIcon,
		Fire03Icon,
		FlowerIcon,
		Globe02Icon,
		GridIcon,
		Moon02Icon,
		Rocket01Icon,
		SecurityCheckIcon,
		SparklesIcon,
		Sun02Icon,
		Tick02Icon,
		UserGroupIcon,
		WorkflowSquare03Icon
	} from '@hugeicons/core-free-icons';
	import PixelCard from '$lib/components/library/Components/PixelCard/PixelCard.svelte';
	import source from '$lib/components/library/Components/PixelCard/PixelCard.svelte?raw';

	type Tone = 'dark' | 'light';
	type Shape = 'square' | 'circle' | 'diamond';
	type Origin = 'center' | 'pointer';
	type Trigger = 'hover' | 'click' | 'always';
	type IconNode = typeof SparklesIcon;

	const PALETTES: Record<string, { dark: string[]; light: string[]; glow: string[] }> = {
		classic: {
			dark: ['#f8fafc', '#f1f5f9', '#cbd5e1'],
			light: ['#1c1917', '#57534e', '#a8a29e'],
			glow: ['#cbd5e1', '#78716c']
		},
		ocean: {
			dark: ['#e0f2fe', '#7dd3fc', '#0ea5e9'],
			light: ['#0c4a6e', '#0369a1', '#0284c7'],
			glow: ['#0ea5e9', '#0284c7']
		},
		sunbeam: {
			dark: ['#fef08a', '#fde047', '#eab308'],
			light: ['#713f12', '#a16207', '#ca8a04'],
			glow: ['#eab308', '#ca8a04']
		},
		bloom: {
			dark: ['#fecdd3', '#fda4af', '#e11d48'],
			light: ['#831843', '#be123c', '#e11d48'],
			glow: ['#e11d48', '#be123c']
		},
		halo: {
			dark: ['#ccfbf1', '#5eead4', '#14b8a6'],
			light: ['#134e4a', '#0f766e', '#0d9488'],
			glow: ['#14b8a6', '#0d9488']
		},
		ember: {
			dark: ['#ffedd5', '#fdba74', '#f97316'],
			light: ['#7c2d12', '#c2410c', '#ea580c'],
			glow: ['#f97316', '#ea580c']
		}
	};

	const ICONS: Record<string, IconNode> = {
		classic: SparklesIcon,
		ocean: DropletIcon,
		sunbeam: Sun02Icon,
		bloom: FlowerIcon,
		mosaic: GridIcon,
		halo: Moon02Icon,
		ember: Fire03Icon
	};

	const INK: Record<Tone, Record<string, string>> = {
		dark: {
			text: '#f5f5f4',
			muted: 'rgba(245, 245, 244, 0.62)',
			faint: 'rgba(245, 245, 244, 0.36)',
			tile: 'linear-gradient(180deg, #3a332d 0%, #28231f 100%)',
			rim: 'inset 0 0 0 1px rgba(255, 255, 255, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			solid: '#f5f5f4',
			solidText: '#14110e',
			hover: 'brightness(1.12)',
			halo: '0 1px 2px rgba(16, 13, 10, 0.95), 0 0 10px rgba(16, 13, 10, 0.9), 0 0 22px rgba(16, 13, 10, 0.75)'
		},
		light: {
			text: '#1c1917',
			muted: 'rgba(28, 25, 23, 0.62)',
			faint: 'rgba(28, 25, 23, 0.38)',
			tile: 'linear-gradient(180deg, #ffffff 0%, #f8f7f5 100%)',
			rim: 'inset 0 0 0 1px rgba(28, 25, 23, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(28, 25, 23, 0.25)',
			solid: '#1c1917',
			solidText: '#ffffff',
			hover: 'brightness(0.97)',
			halo: '0 0 2px rgba(255, 255, 255, 0.95), 0 0 10px rgba(255, 255, 255, 0.92), 0 0 22px rgba(255, 255, 255, 0.8)'
		}
	};

	const PLANS = [
		{
			name: 'Starter',
			price: '$0',
			note: 'For side projects',
			features: ['3 projects', 'Community support', 'Basic analytics'],
			cta: 'Get started',
			icon: SparklesIcon,
			featured: false
		},
		{
			name: 'Pro',
			price: '$24',
			note: 'For growing teams',
			features: ['Unlimited projects', 'Priority support', 'Advanced analytics'],
			cta: 'Upgrade to Pro',
			icon: Rocket01Icon,
			featured: true
		},
		{
			name: 'Team',
			price: '$59',
			note: 'For organizations',
			features: ['Shared workspaces', 'SSO and audit logs', 'Dedicated manager'],
			cta: 'Contact sales',
			icon: UserGroupIcon,
			featured: false
		}
	];

	const PEOPLE = ['AK', 'JM', 'SR', 'LT'];
	const STEPS = [
		{ label: 'Build', time: '12s' },
		{ label: 'Test', time: '48s' },
		{ label: 'Deploy', time: '9s' }
	];

	const FEATURES = [
		{ icon: SecurityCheckIcon, title: 'SSO and audit logs', text: 'Every sign-in on record.' },
		{ icon: Globe02Icon, title: 'Global edge', text: 'Served close to every visitor.' }
	];

	const LOOK = {
		palette: 'classic',
		colors: PALETTES.classic.dark,
		glowColor: PALETTES.classic.glow[0],
		shape: 'square' as Shape,
		origin: 'center' as Origin,
		gap: 5,
		pixelSize: 2,
		speed: 35,
		revealDuration: 600,
		spotlight: 0.5,
		glow: 0.5,
		opacity: 0.35,
		fade: 0.7,
		trigger: 'hover' as Trigger,
		radius: 24,
		clickPulse: true,
		intro: true
	};

	type Look = typeof LOOK;

	const DEFAULT_PROPS = { preset: 'classic', demo: 'pricing', ...LOOK };

	const withPalette = (name: string, rest: Partial<Look>): Look => ({
		...LOOK,
		palette: name,
		colors: PALETTES[name].dark,
		glowColor: PALETTES[name].glow[0],
		...rest
	});

	const PRESETS: Record<string, Look> = {
		classic: LOOK,
		ocean: withPalette('ocean', { gap: 10, pixelSize: 3, speed: 25, origin: 'pointer', spotlight: 0.7 }),
		sunbeam: withPalette('sunbeam', { gap: 4, pixelSize: 1.8, speed: 20, glow: 0.6 }),
		bloom: withPalette('bloom', { gap: 7, pixelSize: 3, speed: 80, shape: 'circle' }),
		mosaic: { ...LOOK, gap: 12, pixelSize: 7, speed: 14, spotlight: 0.8, radius: 18 },
		halo: withPalette('halo', {
			gap: 9,
			pixelSize: 4,
			shape: 'circle',
			origin: 'pointer',
			spotlight: 1,
			glow: 0.7,
			radius: 32
		}),
		ember: withPalette('ember', { gap: 8, pixelSize: 3.4, speed: 50, shape: 'diamond', revealDuration: 800 })
	};

	const modeOpacity = (demo: string) => (demo === 'basic' ? 0.7 : 0.35);

	const DEMO_OPTIONS = [
		{ value: 'pricing', label: 'Pricing' },
		{ value: 'bento', label: 'Bento' },
		{ value: 'basic', label: 'Basic' }
	];

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'ocean', label: 'Ocean' },
		{ value: 'sunbeam', label: 'Sunbeam' },
		{ value: 'bloom', label: 'Bloom' },
		{ value: 'mosaic', label: 'Mosaic' },
		{ value: 'halo', label: 'Halo' },
		{ value: 'ember', label: 'Ember' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'square', label: 'Square' },
		{ value: 'circle', label: 'Circle' },
		{ value: 'diamond', label: 'Diamond' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' },
		{ value: 'always', label: 'Always' }
	];

	const ORIGIN_OPTIONS = [
		{ value: 'center', label: 'Center' },
		{ value: 'pointer', label: 'Pointer' }
	];

	const same = (a: string[], b: string[]) =>
		a.length === b.length && a.every((value, index) => value.toLowerCase() === b[index].toLowerCase());

	const propData = [
		{
			name: 'variant',
			type: "'default' | 'blue' | 'yellow' | 'pink'",
			default: "'default'",
			description: 'A ready-made palette with its own gap and speed. Any prop you pass overrides it.'
		},
		{
			name: 'colors',
			type: 'string | string[]',
			default: 'From variant',
			description: 'Pixel colors, as an array or a comma-separated string. Each pixel picks one at random.'
		},
		{
			name: 'glowColor',
			type: 'string',
			default: 'From variant',
			description: 'Color of the soft light that follows the cursor across the card.'
		},
		{ name: 'gap', type: 'number', default: 'From variant', description: 'Distance between pixels, in px.' },
		{ name: 'pixelSize', type: 'number', default: '2', description: 'Largest size a pixel grows to, in px.' },
		{
			name: 'speed',
			type: 'number',
			default: 'From variant',
			description: 'How fast the pixels twinkle, from 0 to 100. 0 holds them still.'
		},
		{
			name: 'shape',
			type: "'square' | 'circle' | 'diamond'",
			default: "'square'",
			description: 'Shape of each pixel.'
		},
		{
			name: 'origin',
			type: "'center' | 'pointer'",
			default: "'center'",
			description: 'Where the reveal wave starts: the middle of the card, or wherever the pointer enters.'
		},
		{
			name: 'revealDuration',
			type: 'number',
			default: '600',
			description: 'How long the wave takes to sweep across the card, in ms.'
		},
		{
			name: 'spotlight',
			type: 'number',
			default: '0.5',
			description: 'How much pixels near the cursor swell and brighten, from 0 to 1.'
		},
		{ name: 'glow', type: 'number', default: '0.5', description: 'Strength of the soft light under the pixels.' },
		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Opacity of the pixels and glow. Lower it to keep text on the card easy to read.'
		},
		{
			name: 'fade',
			type: 'number',
			default: '0',
			description: 'Fades the pixels out toward the middle so they frame your content, from 0 to 1.'
		},
		{
			name: 'trigger',
			type: "'hover' | 'click' | 'always'",
			default: "'hover'",
			description: 'What turns the effect on: hovering or focusing the card, clicking it on and off, or always on.'
		},
		{
			name: 'clickPulse',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a ripple of brighter pixels out from the click.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Plays the reveal once when the card first scrolls into view.'
		},
		{
			name: 'introDelay',
			type: 'number',
			default: '0',
			description: 'Wait before the intro, in ms. Stagger it across a row of cards.'
		},
		{
			name: 'noFocus',
			type: 'boolean',
			default: 'From variant',
			description: 'Stops keyboard focus from triggering the effect.'
		},
		{ name: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Color theme of the card.' },
		{ name: 'radius', type: 'number', default: '24', description: 'Corner radius of the card, in px.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the card.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the card.' },
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'Card content. It is centered and sits above the pixels.'
		}
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import PixelCard from '$lib/components/PixelCard.svelte';
${scriptClose}

<PixelCard
  colors={['#f8fafc', '#f1f5f9', '#cbd5e1']}
  glowColor="#cbd5e1"
  shape="square"
  origin="center"
  gap={5}
  pixelSize={2}
  speed={35}
  revealDuration={600}
  spotlight={0.5}
  glow={0.5}
  opacity={0.35}
  fade={0.7}
  trigger="hover"
  radius={24}
  clickPulse
  intro
  theme="dark"
>
  <YourIcon />
</PixelCard>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const props = $derived(demo.props);
	const settings = $derived.by(() => {
		const { preset: _preset, demo: _demo, palette: _palette, ...rest } = props;
		return rest;
	});
	const tone = $derived<Tone>(colorTheme.isLight ? 'light' : 'dark');
	const ink = $derived(INK[tone]);

	const tones = $derived(PALETTES[props.palette] ?? PALETTES.classic);
	const colors = $derived(tone === 'light' && same(settings.colors, tones.dark) ? tones.light : settings.colors);
	const glowColor = $derived(
		tone === 'light' && settings.glowColor.toLowerCase() === tones.glow[0].toLowerCase()
			? tones.glow[1]
			: settings.glowColor
	);
	const accent = $derived(
		props.palette === 'classic' && settings.glowColor === PALETTES.classic.glow[0] ? ink.text : glowColor
	);

	const card = $derived({ ...settings, colors, glowColor, theme: tone });
	const computedProps = $derived({ colors, glowColor, theme: tone });

	let key = $state(0);
	const forceRerender = () => key++;

	const applyPreset = (value: string) => {
		const defaults = demo.defaultProps as Record<string, unknown>;
		const base = Object.fromEntries(Object.keys(LOOK).map((name) => [name, defaults[name]]));
		demo.updateProps({ ...base, ...PRESETS[value], opacity: modeOpacity(props.demo), preset: value });
		forceRerender();
	};

	const tileStyle = (size: number) =>
		`width: ${size}px; height: ${size}px; background: ${ink.tile}; box-shadow: ${ink.rim};`;
</script>

{#snippet tileIcon(icon: IconNode, size: number)}
	<div class="pixel-demo-tile" style={tileStyle(size)}>
		<HugeiconsIcon {icon} size={Math.round(size * 0.5)} color={ink.text} strokeWidth={1.6} />
	</div>
{/snippet}

<TabsLayout
	propsState={demo}
	componentName="PixelCard"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'demo', 'palette']}
	{computedProps}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div class="demo-container pixel-demo-stage">
			<RefreshButton onClick={forceRerender} />
			{#key key}
				<div class="grid w-full grid-cols-[minmax(0,1fr)] justify-items-center">
					{#if props.demo === 'pricing'}
						<div class="grid w-full max-w-[760px] grid-cols-1 gap-[14px] md:grid-cols-3">
							{#each PLANS as plan, index (plan.name)}
								<div class="h-[330px] md:h-[372px]">
									<PixelCard
										{...card}
										trigger={plan.featured ? 'always' : card.trigger}
										introDelay={index * 140}
										style="width: 100%; height: 100%;"
									>
										<div class="flex h-full w-full flex-col p-[22px] text-left" style="text-shadow: {ink.halo};">
											<div class="flex items-center gap-[10px]">
												{@render tileIcon(plan.icon, 32)}
												<p class="text-[15px] font-semibold" style="color: {ink.text};">{plan.name}</p>
												{#if plan.featured}
													<p class="ml-auto text-[12px] font-medium" style="color: {accent};">Popular</p>
												{/if}
											</div>
											<div class="mt-[22px] flex items-baseline gap-[4px]">
												<p
													class="text-[34px] leading-none font-semibold tracking-[-0.03em]"
													style="color: {ink.text};"
												>
													{plan.price}
												</p>
												<p class="text-[13px]" style="color: {ink.muted};">/month</p>
											</div>
											<p class="mt-[8px] text-[13px]" style="color: {ink.muted};">{plan.note}</p>
											<ul class="m-0 mt-[22px] flex list-none flex-col gap-[10px] p-0">
												{#each plan.features as feature (feature)}
													<li class="flex items-center gap-[8px] text-[13px]" style="color: {ink.text};">
														<HugeiconsIcon icon={Tick02Icon} size={15} color={ink.faint} strokeWidth={2} />
														{feature}
													</li>
												{/each}
											</ul>
											<div class="mt-auto pt-[20px]">
												<button
													type="button"
													class="pixel-demo-button"
													style={plan.featured
														? `background: ${ink.solid}; color: ${ink.solidText}; --demo-hover: ${ink.hover};`
														: `background: ${ink.tile}; color: ${ink.text}; box-shadow: ${ink.rim}; --demo-hover: ${ink.hover};`}
												>
													{plan.cta}
												</button>
											</div>
										</div>
									</PixelCard>
								</div>
							{/each}
						</div>
					{:else if props.demo === 'bento'}
						<div
							class="grid w-full max-w-[760px] auto-rows-[180px] grid-cols-1 gap-[14px] md:auto-rows-[178px] md:grid-cols-3"
						>
							<div class="md:col-span-2">
								<PixelCard {...card} introDelay={0} style="width: 100%; height: 100%;">
									<div
										class="flex h-full w-full flex-col justify-between p-[20px] text-left"
										style="text-shadow: {ink.halo};"
									>
										<div class="flex items-center">
											{#each PEOPLE as initials, index (initials)}
												<div
													class="grid h-[32px] w-[32px] place-items-center rounded-full text-[11px] font-semibold"
													style="margin-left: {index
														? '-8px'
														: '0'}; color: {ink.text}; background: {ink.tile}; box-shadow: {ink.rim};"
												>
													{initials}
												</div>
											{/each}
											<p class="ml-[10px] text-[12px]" style="color: {ink.muted};">4 editing now</p>
										</div>
										<div>
											<p class="text-[15px] font-semibold" style="color: {ink.text};">Realtime collaboration</p>
											<p class="mt-[4px] text-[13px] leading-[1.5]" style="color: {ink.muted};">
												Edit together and see every cursor as it moves.
											</p>
										</div>
									</div>
								</PixelCard>
							</div>
							<div class="md:row-span-2">
								<PixelCard {...card} introDelay={160} style="width: 100%; height: 100%;">
									<div
										class="flex h-full w-full flex-col justify-between p-[20px] text-left"
										style="text-shadow: {ink.halo};"
									>
										{@render tileIcon(WorkflowSquare03Icon, 34)}
										<div class="my-[16px] flex flex-col gap-[8px]">
											{#each STEPS as step (step.label)}
												<div
													class="flex h-[34px] items-center gap-[8px] rounded-[10px] px-[10px] text-[13px]"
													style="color: {ink.text}; background: {ink.tile}; box-shadow: {ink.rim}; text-shadow: none;"
												>
													<HugeiconsIcon icon={Tick02Icon} size={15} color={ink.faint} strokeWidth={2} />
													{step.label}
													<span class="ml-auto text-[12px]" style="color: {ink.muted};">{step.time}</span>
												</div>
											{/each}
										</div>
										<div>
											<p class="text-[15px] font-semibold" style="color: {ink.text};">Automated workflows</p>
											<p class="mt-[4px] text-[13px] leading-[1.5]" style="color: {ink.muted};">
												Every push is built, tested and shipped.
											</p>
										</div>
									</div>
								</PixelCard>
							</div>
							{#each FEATURES as feature, index (feature.title)}
								<div>
									<PixelCard {...card} introDelay={320 + index * 160} style="width: 100%; height: 100%;">
										<div
											class="flex h-full w-full flex-col justify-between gap-[16px] p-[20px] text-left"
											style="text-shadow: {ink.halo};"
										>
											{@render tileIcon(feature.icon, 34)}
											<div>
												<p class="text-[15px] font-semibold" style="color: {ink.text};">{feature.title}</p>
												<p class="mt-[4px] text-[13px] leading-[1.5]" style="color: {ink.muted};">
													{feature.text}
												</p>
											</div>
										</div>
									</PixelCard>
								</div>
							{/each}
						</div>
					{:else if props.demo === 'basic'}
						<PixelCard {...card} class="pixel-demo-card">
							<div class="pixel-demo-icon" style="color: {ink.text}; --demo-glow: {glowColor};">
								<HugeiconsIcon icon={ICONS[props.preset] ?? SparklesIcon} size={48} strokeWidth={1.5} />
							</div>
						</PixelCard>
					{/if}
				</div>
			{/key}
		</div>

		<Customize>
			<PreviewColorList
				title="Colors"
				{colors}
				min={1}
				max={6}
				onChange={(value) => demo.updateProps({ colors: value, palette: 'custom' })}
			/>
			<PreviewSelect
				title="Demo"
				options={DEMO_OPTIONS}
				value={props.demo}
				onChange={(value) => {
					demo.updateProps({ demo: value, opacity: modeOpacity(value) });
					forceRerender();
				}}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={props.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Glow Color"
				color={glowColor}
				onChange={(value) => demo.updateProps({ glowColor: value, palette: 'custom' })}
			/>
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(value) => demo.updateProp('trigger', value)}
			/>
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				onChange={(value) => demo.updateProp('shape', value)}
			/>
			<PreviewSelect
				title="Origin"
				options={ORIGIN_OPTIONS}
				value={settings.origin}
				onChange={(value) => demo.updateProp('origin', value)}
			/>
			<PreviewSlider
				title="Gap"
				min={3}
				max={20}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(value) => demo.updateProp('gap', value)}
			/>
			<PreviewSlider
				title="Pixel Size"
				min={1}
				max={10}
				step={0.1}
				value={settings.pixelSize}
				valueUnit="px"
				onChange={(value) => demo.updateProp('pixelSize', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={100}
				step={1}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Reveal Duration"
				min={200}
				max={1600}
				step={50}
				value={settings.revealDuration}
				valueUnit="ms"
				onChange={(value) => demo.updateProp('revealDuration', value)}
			/>
			<PreviewSlider
				title="Spotlight"
				min={0}
				max={1}
				step={0.05}
				value={settings.spotlight}
				onChange={(value) => demo.updateProp('spotlight', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0.1}
				max={1}
				step={0.05}
				value={settings.opacity}
				onChange={(value) => demo.updateProp('opacity', value)}
			/>
			<PreviewSlider
				title="Fade"
				min={0}
				max={1}
				step={0.05}
				value={settings.fade}
				onChange={(value) => demo.updateProp('fade', value)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={48}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewSwitch
				title="Click Pulse"
				isChecked={settings.clickPulse}
				onChange={(value) => demo.updateProp('clickPulse', value)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(value) => {
					demo.updateProp('intro', value);
					forceRerender();
				}}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.pixel-demo-stage {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		place-items: center;
		height: auto;
		min-height: 480px;
		padding: 56px 16px;
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.pixel-demo-stage {
			min-height: 540px;
			padding: 48px 32px;
		}
	}

	.pixel-demo-tile {
		display: grid;
		flex-shrink: 0;
		place-items: center;
		border-radius: 10px;
	}

	.pixel-demo-button {
		width: 100%;
		height: 38px;
		border: 0;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: filter 200ms ease;
	}

	.pixel-demo-button:hover {
		filter: var(--demo-hover);
	}

	.pixel-demo-icon {
		transition:
			color 320ms ease,
			transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	:global(.pixel-demo-card[data-active]) .pixel-demo-icon {
		color: var(--demo-glow) !important;
		transform: scale(1.08);
	}
</style>
