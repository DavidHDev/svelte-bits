<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import ElectricBorder from '$lib/components/library/Animations/ElectricBorder/ElectricBorder.svelte';
	import source from '$lib/components/library/Animations/ElectricBorder/ElectricBorder.svelte?raw';
	import {
		ArrowDown01Icon,
		ArrowUp02Icon,
		Attachment02Icon,
		CloudUploadIcon,
		FlashIcon,
		Image01Icon,
		Mic02Icon,
		Pdf01Icon,
		Rocket01Icon,
		SparklesIcon,
		StopIcon,
		Tick02Icon,
		UserGroupIcon
	} from '@hugeicons/core-free-icons';

	type Icon = typeof SparklesIcon;

	type Ink = {
		text: string;
		muted: string;
		faint: string;
		panel: string;
		panelRim: string;
		tile: string;
		rim: string;
		well: string;
		wellRim: string;
		track: string;
		solid: string;
		solidText: string;
	};

	const INK: Record<'dark' | 'light', Ink> = {
		dark: {
			text: '#f5f5f5',
			muted: 'rgba(245, 245, 245, 0.6)',
			faint: 'rgba(245, 245, 245, 0.34)',
			panel: 'linear-gradient(180deg, #221c17 0%, #1a1612 100%)',
			panelRim: 'inset 0 0 0 1px rgba(255, 255, 255, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
			tile: 'linear-gradient(180deg, #3d342c 0%, #2a241f 100%)',
			rim: 'inset 0 0 0 1px rgba(255, 255, 255, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			well: 'rgba(255, 255, 255, 0.025)',
			wellRim: 'inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
			track: 'rgba(255, 255, 255, 0.08)',
			solid: '#f5f5f5',
			solidText: '#14110E'
		},
		light: {
			text: '#18181b',
			muted: 'rgba(24, 24, 27, 0.6)',
			faint: 'rgba(24, 24, 27, 0.36)',
			panel: 'linear-gradient(180deg, #ffffff 0%, #fbfaf9 100%)',
			panelRim: 'inset 0 0 0 1px rgba(24, 24, 27, 0.08), 0 8px 24px -12px rgba(24, 24, 27, 0.18)',
			tile: 'linear-gradient(180deg, #ffffff 0%, #f5f4f2 100%)',
			rim: 'inset 0 0 0 1px rgba(24, 24, 27, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(24, 24, 27, 0.25)',
			well: 'rgba(24, 24, 27, 0.025)',
			wellRim: 'inset 0 0 0 1px rgba(24, 24, 27, 0.06)',
			track: 'rgba(24, 24, 27, 0.08)',
			solid: '#18181b',
			solidText: '#ffffff'
		}
	};

	const LOOK = {
		color: '#7df9ff',
		speed: 1,
		chaos: 0.5,
		spread: 0.6,
		thickness: 1.5,
		strands: 3,
		glow: 0.6,
		intensity: 0.8,
		arcs: 1,
		flicker: 0.5
	};

	const DEFAULT_PROPS = {
		demo: 'composer',
		preset: 'voltage',
		...LOOK,
		borderRadius: 24,
		offset: 0,
		cursorRadius: 90,
		active: true,
		interactive: true,
		intro: true
	};

	type Look = typeof LOOK;

	const PRESETS: Record<string, Partial<Look>> = {
		voltage: {},
		plasma: { color: '#ff3e00' },
		ember: { color: '#fb923c', chaos: 0.7, flicker: 0.7 },
		emerald: { color: '#34d399', strands: 4, spread: 0.8 },
		storm: { color: '#93c5fd', strands: 5, chaos: 0.9, spread: 1.1, arcs: 2.5, flicker: 0.8, glow: 0.8 },
		silver: { color: '#e4e4e7', strands: 2, chaos: 0.25, spread: 0.3, arcs: 0, flicker: 0.15, glow: 0.4 }
	};

	const LIGHT_SWAP: Record<string, string> = {
		'#7df9ff': '#0891b2',
		'#ff3e00': '#c2410c',
		'#fb923c': '#ea580c',
		'#34d399': '#059669',
		'#93c5fd': '#2563eb',
		'#e4e4e7': '#52525b'
	};

	const DARK_SWAP: Record<string, string> = Object.fromEntries(
		Object.entries(LIGHT_SWAP).map(([dark, light]) => [light, dark])
	);

	const DEMO_OPTIONS = [
		{ value: 'composer', label: 'Composer' },
		{ value: 'pricing', label: 'Pricing' },
		{ value: 'upload', label: 'Upload' },
		{ value: 'basic', label: 'Basic' }
	];

	const PRESET_OPTIONS = [
		{ value: 'voltage', label: 'Voltage' },
		{ value: 'plasma', label: 'Plasma' },
		{ value: 'ember', label: 'Ember' },
		{ value: 'emerald', label: 'Emerald' },
		{ value: 'storm', label: 'Storm' },
		{ value: 'silver', label: 'Silver' }
	];

	type Plan = {
		name: string;
		price: string;
		note: string;
		features: string[];
		cta: string;
		icon: Icon;
		featured?: boolean;
	};

	const PLANS: Plan[] = [
		{
			name: 'Starter',
			price: '$0',
			note: 'For side projects',
			features: ['3 projects', 'Community support', 'Basic analytics'],
			cta: 'Get started',
			icon: SparklesIcon
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
			icon: UserGroupIcon
		}
	];

	const FILES = [
		{ icon: Pdf01Icon, name: 'Brand guidelines.pdf', size: '4.2 MB', progress: 1 },
		{ icon: Image01Icon, name: 'Hero shot.png', size: '2.8 MB', progress: 0.64 }
	];

	const propData: PropRow[] = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content wrapped by the electric border.' },
		{
			name: 'color',
			type: 'string',
			default: "'#7df9ff'",
			description: 'Color of the current. The strands burn whiter at their core.'
		},
		{
			name: 'glowColor',
			type: 'string',
			default: '-',
			description: 'Color of the glow around the strands. Defaults to color.'
		},
		{ name: 'speed', type: 'number', default: '1', description: 'How fast the current crackles and moves.' },
		{ name: 'chaos', type: 'number', default: '0.5', description: 'How jagged the strands are, from 0 to 2.' },
		{
			name: 'spread',
			type: 'number',
			default: '0.6',
			description: 'How far the strands wander from the edge, from 0 to 2.'
		},
		{ name: 'thickness', type: 'number', default: '1.5', description: 'Thickness of the strands, in px.' },
		{
			name: 'strands',
			type: 'number',
			default: '3',
			description: 'Number of strands running along the edge, from 1 to 6.'
		},
		{ name: 'glow', type: 'number', default: '0.6', description: 'Strength of the glow around the border.' },
		{ name: 'intensity', type: 'number', default: '0.8', description: 'Overall brightness of the current.' },
		{
			name: 'arcs',
			type: 'number',
			default: '1',
			description: 'How often sparks leap off the border. 0 turns them off.'
		},
		{ name: 'flicker', type: 'number', default: '0.5', description: 'How much the current flickers, from 0 to 1.' },
		{
			name: 'borderRadius',
			type: 'number',
			default: '24',
			description: 'Corner radius of the border, in px. Match it to your content.'
		},
		{
			name: 'offset',
			type: 'number',
			default: '0',
			description: 'Moves the border outward from the edge of the content, in px. Negative values move it inward.'
		},
		{
			name: 'active',
			type: 'boolean',
			default: 'true',
			description: 'Powers the border on or off. Turning it on sends the current racing around the edge again.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'The current races around the edge from the top when the border mounts.'
		},
		{
			name: 'interactive',
			type: 'boolean',
			default: 'true',
			description: 'The current surges near the cursor and clicks send a jolt around the edge.'
		},
		{
			name: 'cursorRadius',
			type: 'number',
			default: '90',
			description: 'Size of the area around the cursor where the current surges, in px.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Glowing light for dark pages, or crisp ink with a white core for light ones.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the wrapper.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the wrapper.' }
	];

	const usage = `<script lang="ts">
  import ElectricBorder from '$lib/components/ElectricBorder.svelte';
</${'script'}>

<ElectricBorder
  color="#7df9ff"
  speed={1}
  chaos={0.5}
  spread={0.6}
  strands={3}
  thickness={1.5}
  borderRadius={24}
>
  <div style="width: 300px; height: 360px; border-radius: 24px;">
    Your content
  </div>
</ElectricBorder>`;

	const swapColor = (value: string, swap: Record<string, string>) => {
		const key = `#${String(value).replace(/^#/, '').toLowerCase()}`;
		return swap[key] ?? key;
	};

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const ink = $derived(INK[theme]);
	const shown = $derived(swapColor(settings.color, theme === 'light' ? LIGHT_SWAP : DARK_SWAP));
	const scene = $derived(
		['composer', 'pricing', 'upload', 'basic'].includes(settings.demo) ? settings.demo : 'composer'
	);
	const radius = $derived(settings.borderRadius);
	const border = $derived.by(() => {
		const { demo: _demo, preset: _preset, color: _color, borderRadius: _borderRadius, ...rest } = settings;
		return { ...rest, color: shown, theme };
	});
	const computedProps = $derived<Record<string, unknown>>({
		color: shown,
		...(theme === 'light' ? { theme: 'light' } : {})
	});
	const inkVars = $derived(
		[
			`--eb-text: ${ink.text}`,
			`--eb-muted: ${ink.muted}`,
			`--eb-panel: ${ink.panel}`,
			`--eb-panel-rim: ${ink.panelRim}`,
			`--eb-tile: ${ink.tile}`,
			`--eb-rim: ${ink.rim}`,
			`--eb-well: ${ink.well}`,
			`--eb-well-rim: ${ink.wellRim}`,
			`--eb-track: ${ink.track}`,
			`--eb-solid: ${ink.solid}`,
			`--eb-solid-text: ${ink.solidText}`
		].join('; ')
	);

	let key = $state(0);
	let generating = $state(true);
	let hovered = $state(false);
	const sceneKey = $derived(`${scene}-${key}`);

	$effect(() => {
		void sceneKey;
		generating = true;
		hovered = false;
	});

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(LOOK).map((name) => [name, demo.defaultProps[name as keyof Look]])
		) as Partial<Look>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};
</script>

{#snippet tile(icon: Icon, size: number)}
	<div class="eb-tile" style="width: {size}px; height: {size}px;">
		<HugeiconsIcon {icon} size={Math.round(size * 0.5)} color={ink.text} strokeWidth={1.6} />
	</div>
{/snippet}

{#snippet planCard(plan: Plan, accent?: string)}
	<div class="eb-panel eb-plan" style="border-radius: {radius}px;">
		<div class="eb-plan-head">
			{@render tile(plan.icon, 32)}
			<p class="eb-plan-name">{plan.name}</p>
			{#if plan.featured}
				<p class="eb-plan-badge" style="color: {accent};">Popular</p>
			{/if}
		</div>
		<div class="eb-plan-price-row">
			<p class="eb-plan-price">{plan.price}</p>
			<p class="eb-plan-per">/month</p>
		</div>
		<p class="eb-plan-note">{plan.note}</p>
		<ul class="eb-plan-features">
			{#each plan.features as feature (feature)}
				<li>
					<HugeiconsIcon icon={Tick02Icon} size={15} color={ink.faint} strokeWidth={2} />
					{feature}
				</li>
			{/each}
		</ul>
		<button type="button" class={['eb-plan-cta', plan.featured && 'eb-plan-cta--solid']}>{plan.cta}</button>
	</div>
{/snippet}

<TabsLayout
	propsState={demo}
	componentName="ElectricBorder"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['demo', 'preset', 'color']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container eb-demo" style={inkVars}>
			{#key sceneKey}
				{#if scene === 'composer'}
					<ElectricBorder
						{...border}
						active={border.active && generating}
						borderRadius={radius}
						style="width: 100%; max-width: 520px;"
					>
						<div class="eb-panel" style="padding: 14px; border-radius: {radius}px;">
							<p class="eb-composer-text">
								Write a launch post for our new electric borders. Keep it short and upbeat.
							</p>
							<div class="eb-composer-bar">
								<button type="button" class="eb-tool" aria-label="Attach a file">
									<HugeiconsIcon icon={Attachment02Icon} size={16} color={ink.text} strokeWidth={1.8} />
								</button>
								<div class="eb-pill">
									Fast
									<HugeiconsIcon icon={ArrowDown01Icon} size={14} color={ink.muted} strokeWidth={1.8} />
								</div>
								<div class="eb-spacer"></div>
								<button type="button" class="eb-tool" aria-label="Dictate">
									<HugeiconsIcon icon={Mic02Icon} size={16} color={ink.text} strokeWidth={1.8} />
								</button>
								<button
									type="button"
									class="eb-tool eb-tool--solid"
									aria-label={generating ? 'Stop generating' : 'Send'}
									onclick={() => (generating = !generating)}
								>
									<HugeiconsIcon
										icon={generating ? StopIcon : ArrowUp02Icon}
										size={16}
										color={ink.solidText}
										strokeWidth={1.8}
									/>
								</button>
							</div>
						</div>
					</ElectricBorder>
				{:else if scene === 'pricing'}
					<div class="eb-pricing">
						{#each PLANS as plan (plan.name)}
							{#if plan.featured}
								<div class="eb-plan-slot">
									<ElectricBorder {...border} borderRadius={radius} style="height: 100%;">
										{@render planCard(plan, border.color)}
									</ElectricBorder>
								</div>
							{:else}
								<div class="eb-plan-slot eb-plan-slot--side">
									{@render planCard(plan)}
								</div>
							{/if}
						{/each}
					</div>
				{:else if scene === 'upload'}
					<ElectricBorder
						{...border}
						active={border.active && hovered}
						borderRadius={radius}
						style="width: 100%; max-width: 440px;"
					>
						<div
							class="eb-panel"
							style="padding: 14px; border-radius: {radius}px;"
							role="presentation"
							onpointerenter={() => (hovered = true)}
							onpointerleave={() => (hovered = false)}
						>
							<div class="eb-drop" style="border-radius: {Math.max(4, radius - 10)}px;">
								{@render tile(CloudUploadIcon, 40)}
								<p class="eb-drop-title">Drop files to upload</p>
								<p class="eb-drop-note">PNG, JPG or PDF, up to 10 MB</p>
							</div>
							<div class="eb-files">
								{#each FILES as file (file.name)}
									<div class="eb-file">
										{@render tile(file.icon, 32)}
										<div class="eb-file-body">
											<div class="eb-file-head">
												<p class="eb-file-name">{file.name}</p>
												<p class="eb-file-size">
													{file.progress >= 1 ? file.size : `${Math.round(file.progress * 100)}%`}
												</p>
											</div>
											<div class="eb-file-track">
												<div class="eb-file-fill" style="width: {file.progress * 100}%;"></div>
											</div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</ElectricBorder>
				{:else}
					<ElectricBorder {...border} borderRadius={radius} style="width: 100%; max-width: 280px;">
						<div class="eb-panel eb-basic" style="border-radius: {radius}px;">
							{@render tile(FlashIcon, 38)}
							<div>
								<p class="eb-basic-title">Electric Border</p>
								<p class="eb-basic-desc">Wrap anything in a living current.</p>
							</div>
						</div>
					</ElectricBorder>
				{/if}
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect
				title="Demo"
				options={DEMO_OPTIONS}
				value={settings.demo}
				onChange={(v) => demo.updateProp('demo', String(v))}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={(v) => applyPreset(String(v))} />
			<PreviewColorPickerCustom title="Color" color={shown} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(v) => demo.updateProp('speed', v)}
			/>
			<PreviewSlider
				title="Chaos"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.chaos}
				onChange={(v) => demo.updateProp('chaos', v)}
			/>
			<PreviewSlider
				title="Spread"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.spread}
				onChange={(v) => demo.updateProp('spread', v)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.5}
				max={4}
				step={0.1}
				value={settings.thickness}
				valueUnit="px"
				onChange={(v) => demo.updateProp('thickness', v)}
			/>
			<PreviewSlider
				title="Strands"
				min={1}
				max={6}
				step={1}
				value={settings.strands}
				onChange={(v) => demo.updateProp('strands', v)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={2}
				step={0.05}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.intensity}
				onChange={(v) => demo.updateProp('intensity', v)}
			/>
			<PreviewSlider
				title="Arcs"
				min={0}
				max={3}
				step={0.1}
				value={settings.arcs}
				onChange={(v) => demo.updateProp('arcs', v)}
			/>
			<PreviewSlider
				title="Flicker"
				min={0}
				max={1}
				step={0.05}
				value={settings.flicker}
				onChange={(v) => demo.updateProp('flicker', v)}
			/>
			<PreviewSlider
				title="Border Radius"
				min={0}
				max={40}
				step={1}
				value={settings.borderRadius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('borderRadius', v)}
			/>
			<PreviewSlider
				title="Offset"
				min={-6}
				max={12}
				step={1}
				value={settings.offset}
				valueUnit="px"
				onChange={(v) => demo.updateProp('offset', v)}
			/>
			<PreviewSlider
				title="Cursor Radius"
				min={30}
				max={200}
				step={5}
				value={settings.cursorRadius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('cursorRadius', v)}
			/>
			<PreviewSwitch title="Active" isChecked={settings.active} onChange={(v) => demo.updateProp('active', v)} />
			<PreviewSwitch
				title="Interactive"
				isChecked={settings.interactive}
				onChange={(v) => demo.updateProp('interactive', v)}
			/>
			<PreviewSwitch
				title="Intro"
				isChecked={settings.intro}
				onChange={(v) => {
					demo.updateProp('intro', v);
					key++;
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
	.demo-container.eb-demo {
		position: relative;
		height: 520px;
		padding: 0 28px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		container-type: inline-size;
		container-name: electric;
	}

	@media (min-width: 768px) {
		.demo-container.eb-demo {
			height: 560px;
		}
	}

	:where(.eb-demo) p {
		margin: 0;
	}

	.eb-panel {
		width: 100%;
		background: var(--eb-panel);
		box-shadow: var(--eb-panel-rim);
	}

	.eb-tile {
		display: grid;
		place-items: center;
		flex-shrink: 0;
		border-radius: 10px;
		background: var(--eb-tile);
		box-shadow: var(--eb-rim);
	}

	.eb-composer-text {
		padding: 4px 6px 0;
		min-height: 80px;
		font-size: 15px;
		line-height: 1.6;
		color: var(--eb-text);
	}

	.eb-composer-bar {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 10px;
	}

	.eb-spacer {
		flex: 1;
	}

	.eb-tool {
		width: 34px;
		height: 34px;
		padding: 0;
		border: 0;
		border-radius: 999px;
		display: grid;
		place-items: center;
		flex-shrink: 0;
		cursor: pointer;
		background: var(--eb-tile);
		box-shadow: var(--eb-rim);
		transition:
			transform 160ms ease,
			filter 160ms ease;
	}

	.eb-tool:hover {
		filter: brightness(1.08);
	}

	.eb-tool:active {
		transform: scale(0.94);
	}

	.eb-tool--solid {
		background: var(--eb-solid);
		color: var(--eb-solid-text);
		box-shadow: none;
	}

	.eb-pill {
		display: flex;
		align-items: center;
		gap: 4px;
		height: 34px;
		padding: 0 12px;
		border-radius: 999px;
		font-size: 13px;
		font-weight: 500;
		color: var(--eb-text);
		background: var(--eb-tile);
		box-shadow: var(--eb-rim);
	}

	.eb-pricing {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 18px;
		width: 100%;
		max-width: 300px;
	}

	.eb-plan-slot {
		height: 370px;
	}

	.eb-plan-slot--side {
		display: none;
	}

	@container electric (min-width: 660px) {
		.eb-pricing {
			grid-template-columns: repeat(3, minmax(0, 1fr));
			max-width: 740px;
		}

		.eb-plan-slot--side {
			display: block;
		}
	}

	.eb-plan {
		display: flex;
		flex-direction: column;
		height: 100%;
		padding: 22px;
		text-align: left;
	}

	.eb-plan-head {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.eb-plan-name {
		font-size: 15px;
		font-weight: 600;
		color: var(--eb-text);
	}

	.eb-plan-badge {
		margin-left: auto;
		font-size: 12px;
		font-weight: 500;
	}

	.eb-plan-price-row {
		display: flex;
		align-items: baseline;
		gap: 4px;
		margin-top: 22px;
	}

	.eb-plan-price {
		font-size: 34px;
		font-weight: 600;
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--eb-text);
	}

	.eb-plan-per {
		font-size: 13px;
		color: var(--eb-muted);
	}

	.eb-plan-note {
		margin-top: 8px;
		font-size: 13px;
		color: var(--eb-muted);
	}

	.eb-plan-features {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 22px 0 0;
		padding: 0;
		list-style: none;
	}

	.eb-plan-features li {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 13px;
		color: var(--eb-text);
	}

	.eb-plan-cta {
		margin-top: auto;
		width: 100%;
		height: 38px;
		border: 0;
		border-radius: 10px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		background: var(--eb-tile);
		color: var(--eb-text);
		box-shadow: var(--eb-rim);
		transition: filter 200ms ease;
	}

	.eb-plan-cta:hover {
		filter: brightness(1.08);
	}

	.eb-plan-cta--solid {
		background: var(--eb-solid);
		color: var(--eb-solid-text);
		box-shadow: none;
	}

	.eb-drop {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		height: 172px;
		background: var(--eb-well);
		box-shadow: var(--eb-well-rim);
	}

	.eb-drop-title {
		margin-top: 4px;
		font-size: 14px;
		font-weight: 600;
		color: var(--eb-text);
	}

	.eb-drop-note {
		font-size: 12px;
		color: var(--eb-muted);
	}

	.eb-files {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 10px;
	}

	.eb-file {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px;
		border-radius: 12px;
		background: var(--eb-well);
		box-shadow: var(--eb-well-rim);
	}

	.eb-file-body {
		flex: 1;
		min-width: 0;
	}

	.eb-file-head {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}

	.eb-file-name {
		font-size: 13px;
		font-weight: 500;
		color: var(--eb-text);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.eb-file-size {
		margin-left: auto;
		flex-shrink: 0;
		font-size: 12px;
		color: var(--eb-muted);
	}

	.eb-file-track {
		margin-top: 8px;
		height: 4px;
		border-radius: 999px;
		overflow: hidden;
		background: var(--eb-track);
	}

	.eb-file-fill {
		height: 100%;
		border-radius: 999px;
		background: var(--eb-text);
		opacity: 0.8;
	}

	.eb-basic {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 340px;
		padding: 24px;
	}

	.eb-basic-title {
		font-size: 17px;
		font-weight: 600;
		color: var(--eb-text);
	}

	.eb-basic-desc {
		margin-top: 6px;
		font-size: 13px;
		line-height: 1.5;
		color: var(--eb-muted);
	}
</style>
