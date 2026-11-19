<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		CheckmarkCircle02Icon,
		CircleIcon,
		DashedLineCircleIcon,
		FilterHorizontalIcon,
		Folder01Icon,
		InboxIcon,
		Layers01Icon,
		Loading03Icon,
		Search01Icon,
		Task01Icon
	} from '@hugeicons/core-free-icons';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import LaserFlow from '$lib/components/library/Animations/LaserFlow/LaserFlow.svelte';
	import source from '$lib/components/library/Animations/LaserFlow/LaserFlow.svelte?raw';
	import { DEFAULT_PROPS, LIGHT_SWAP, PRESET_OPTIONS, presetProps } from './presets/LaserFlow';

	type Surface = { left: string; right: string; top: string } | null;

	const REVEAL_IMAGE = '/assets/demo/laser-ui.svg';

	const SURFACES: Record<string, Surface> = {
		waterfall: { left: '4%', right: '24%', top: '55%' },
		twin: { left: '27%', right: '27%', top: '55%' },
		floor: null,
		ember: { left: '24%', right: '22%', top: '54%' },
		glacier: { left: '20%', right: '42%', top: '52%' },
		quiet: { left: '4%', right: '24%', top: '55%' }
	};

	const NAV = [
		{ icon: InboxIcon, label: 'Inbox', active: false },
		{ icon: Task01Icon, label: 'My issues', active: true },
		{ icon: Folder01Icon, label: 'Projects', active: false },
		{ icon: Layers01Icon, label: 'Views', active: false }
	];

	const ISSUES = [
		{ icon: Loading03Icon, title: 'Polish the onboarding flow', id: 'APP-142', who: 'MK' },
		{ icon: CircleIcon, title: 'Sync drafts across devices', id: 'APP-139', who: 'JL' },
		{ icon: DashedLineCircleIcon, title: 'Audit color tokens', id: 'APP-131', who: 'AR' },
		{ icon: CheckmarkCircle02Icon, title: 'Ship keyboard shortcuts', id: 'APP-127', who: 'DS' },
		{ icon: CircleIcon, title: 'Faster search on large projects', id: 'APP-120', who: 'MK' }
	];

	const propData: PropRow[] = [
		{
			name: 'surfaceRef',
			type: 'HTMLElement | null',
			default: '-',
			description: 'Element the beam lands on. The light spreads along its top edge and spills over its corners.'
		},
		{
			name: 'beamPosition',
			type: 'number',
			default: '0.6',
			description: 'Horizontal position of the beam, from 0 at the left edge to 1 at the right edge.'
		},
		{
			name: 'surfaceLevel',
			type: 'number',
			default: '1',
			description: 'Where the beam lands when no surfaceRef is given, from 0 at the top to 1 at the bottom.'
		},
		{
			name: 'color',
			type: 'string',
			default: "'#FF8A4C'",
			description: 'Color of the light. Every other tone is derived from it.'
		},
		{ name: 'intensity', type: 'number', default: '1.8', description: 'Overall brightness of the light.' },
		{ name: 'beamWidth', type: 'number', default: '1.5', description: 'Thickness of the beam and its glow.' },
		{
			name: 'flare',
			type: 'number',
			default: '1.5',
			description: 'Size of the splash where the beam meets the surface.'
		},
		{ name: 'spread', type: 'number', default: '1.5', description: 'How far the light travels along the surface.' },
		{
			name: 'spill',
			type: 'number',
			default: '1',
			description: 'How much light pours over the corners of the surface.'
		},
		{ name: 'fog', type: 'number', default: '0.2', description: 'Amount of smoke lit up by the beam. 0 turns it off.' },
		{ name: 'dust', type: 'number', default: '1.6', description: 'Amount of glittering dust flowing with the light.' },
		{
			name: 'streaks',
			type: 'number',
			default: '1.5',
			description: 'Brightness of the fine lines flowing along the splash.'
		},
		{ name: 'dots', type: 'number', default: '1', description: 'Strength of the fine dot texture in the glow.' },
		{ name: 'pulse', type: 'number', default: '1.5', description: 'How much the splash breathes over time.' },
		{ name: 'speed', type: 'number', default: '1.5', description: 'Animation speed. 0 holds the light still.' },
		{ name: 'seed', type: 'number', default: '3', description: 'Changes the shape of the smoke.' },
		{
			name: 'mouseInteraction',
			type: 'boolean',
			default: 'true',
			description: 'Brightens the light, smoke and dust softly around the cursor.'
		},
		{
			name: 'revealImage',
			type: 'string',
			default: '-',
			description: 'Image revealed through the light around the cursor, such as a screenshot of your UI.'
		},
		{
			name: 'revealRadius',
			type: 'number',
			default: '220',
			description: 'Radius of the reveal around the cursor, in pixels.'
		},
		{
			name: 'revealOpacity',
			type: 'number',
			default: '0.6',
			description: 'Strength of the revealed image. 0 hides it.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Drops the beam in and lets the light run along the surface on mount.'
		},
		{ name: 'theme', type: "'dark' | 'light'", default: "'dark'", description: 'Use light for light page backgrounds.' },
		{ name: 'paused', type: 'boolean', default: 'false', description: 'Freezes the animation.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' }
	];

	const usage = `<script lang="ts">
  import LaserFlow from '$lib/components/LaserFlow.svelte';

  let card = $state<HTMLElement | null>(null);
</${'script'}>

<div style="position: relative; height: 600px; overflow: hidden;">
  <LaserFlow
    surfaceRef={card}
    beamPosition={0.6}
    color="#FF8A4C"
    intensity={1.8}
    flare={1.5}
    spread={1.5}
    spill={1}
    fog={0.2}
    dust={1.6}
    revealImage="/your-ui.png"
    revealRadius={220}
    revealOpacity={0.6}
  />

  <div
    bind:this={card}
    style="position: absolute; left: 18%; right: 28%; top: 52%; bottom: -24px; border-radius: 14px; background: #0b0b0d;"
  >
    <!-- Your content here -->
  </div>
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	const surface = $derived<Surface>(settings.preset in SURFACES ? SURFACES[settings.preset] : SURFACES.waterfall);
	const laserTheme = $derived<'dark' | 'light'>(theme.isLight ? 'light' : 'dark');
	const laserColor = $derived(
		theme.isLight ? (LIGHT_SWAP[String(settings.color).toLowerCase()] ?? settings.color) : settings.color
	);
	let surfaceEl = $state<HTMLElement | null>(null);
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value, { defaults: demo.defaultProps }), preset: value });
		key++;
	};
</script>

<TabsLayout propsState={demo} componentName="LaserFlow" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<LaserFlow
					{...componentProps}
					color={laserColor}
					revealImage={REVEAL_IMAGE}
					theme={laserTheme}
					surfaceRef={surface ? surfaceEl : null}
				/>
			{/key}

			{#if surface}
				<div
					bind:this={surfaceEl}
					class="laser-window"
					style:left={surface.left}
					style:right={surface.right}
					style:top={surface.top}
				>
					<div class="laser-window-bar">
						{#each [0, 1, 2] as dot (dot)}
							<div class="laser-window-dot"></div>
						{/each}
						<p class="laser-window-title">Tracker</p>
					</div>
					<div class="laser-window-body">
						<div class="laser-window-sidebar">
							{#each NAV as item (item.label)}
								<div class="laser-window-nav" class:active={item.active}>
									<HugeiconsIcon icon={item.icon} size={15} strokeWidth={1.6} />
									<p>{item.label}</p>
								</div>
							{/each}
						</div>
						<div class="laser-window-main">
							<div class="laser-window-head">
								<div class="laser-window-heading">
									<p class="laser-window-name">My issues</p>
									<p class="laser-window-count">{ISSUES.length}</p>
								</div>
								<div class="laser-window-tools">
									<HugeiconsIcon icon={Search01Icon} size={15} strokeWidth={1.6} />
									<HugeiconsIcon icon={FilterHorizontalIcon} size={15} strokeWidth={1.6} />
								</div>
							</div>
							{#each ISSUES as issue (issue.id)}
								<div class="laser-window-row">
									<div class="laser-window-status">
										<HugeiconsIcon icon={issue.icon} size={14} strokeWidth={1.8} />
									</div>
									<p class="laser-window-issue">{issue.title}</p>
									<p class="laser-window-meta laser-window-id">{issue.id}</p>
									<div class="laser-window-meta laser-window-avatar">{issue.who}</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{/if}

			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewSlider
				title="Beam Position"
				min={0.2}
				max={0.8}
				step={0.01}
				value={settings.beamPosition}
				onChange={(value) => demo.updateProp('beamPosition', value)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.3}
				max={2}
				step={0.05}
				value={settings.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
			/>
			<PreviewSlider
				title="Beam Width"
				min={0.4}
				max={3}
				step={0.05}
				value={settings.beamWidth}
				onChange={(value) => demo.updateProp('beamWidth', value)}
			/>
			<PreviewSlider
				title="Flare"
				min={0.5}
				max={2}
				step={0.05}
				value={settings.flare}
				onChange={(value) => demo.updateProp('flare', value)}
			/>
			<PreviewSlider
				title="Spread"
				min={0.4}
				max={2}
				step={0.05}
				value={settings.spread}
				onChange={(value) => demo.updateProp('spread', value)}
			/>
			<PreviewSlider
				title="Spill"
				min={0}
				max={2}
				step={0.05}
				value={settings.spill}
				onChange={(value) => demo.updateProp('spill', value)}
			/>
			<PreviewSlider
				title="Fog"
				min={0}
				max={2}
				step={0.05}
				value={settings.fog}
				onChange={(value) => demo.updateProp('fog', value)}
			/>
			<PreviewSlider
				title="Dust"
				min={0}
				max={2}
				step={0.05}
				value={settings.dust}
				onChange={(value) => demo.updateProp('dust', value)}
			/>
			<PreviewSlider
				title="Streaks"
				min={0}
				max={2}
				step={0.05}
				value={settings.streaks}
				onChange={(value) => demo.updateProp('streaks', value)}
			/>
			<PreviewSlider
				title="Dots"
				min={0}
				max={2}
				step={0.05}
				value={settings.dots}
				onChange={(value) => demo.updateProp('dots', value)}
			/>
			<PreviewSlider
				title="Pulse"
				min={0}
				max={2}
				step={0.05}
				value={settings.pulse}
				onChange={(value) => demo.updateProp('pulse', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={3}
				step={0.05}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSlider
				title="Seed"
				min={0}
				max={20}
				step={1}
				value={settings.seed}
				onChange={(value) => demo.updateProp('seed', value)}
			/>
			<PreviewSlider
				title="Reveal Radius"
				min={80}
				max={400}
				step={10}
				value={settings.revealRadius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('revealRadius', value)}
			/>
			<PreviewSlider
				title="Reveal Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.revealOpacity}
				onChange={(value) => demo.updateProp('revealOpacity', value)}
			/>
			<PreviewSwitch
				title="Mouse Interaction"
				isChecked={settings.mouseInteraction}
				onChange={(value) => demo.updateProp('mouseInteraction', value)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(value) => demo.updateProp('intro', value)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.laser-window {
		container-type: inline-size;
		position: absolute;
		bottom: -24px;
		border-radius: 14px;
		background: var(--bg-card);
		border: 1px solid var(--border-primary);
		overflow: hidden;
		color: var(--text-primary);
		pointer-events: none;
		user-select: none;
	}

	.laser-window p {
		margin: 0;
	}

	.laser-window-bar {
		height: 34px;
		display: flex;
		align-items: center;
		padding: 0 12px;
		gap: 7px;
		border-bottom: 1px solid var(--border-primary);
		position: relative;
	}

	.laser-window-dot {
		width: 11px;
		height: 11px;
		border-radius: 9999px;
		background: var(--surface-ghost-hover);
		border: 1px solid var(--border-primary);
	}

	.laser-window-title {
		position: absolute;
		left: 0;
		right: 0;
		text-align: center;
		font-size: 12px;
		font-weight: 500;
		color: var(--text-dimmed);
	}

	.laser-window-body {
		display: flex;
		height: 100%;
	}

	.laser-window-sidebar {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 150px;
		flex-shrink: 0;
		padding: 10px;
		border-right: 1px solid var(--border-primary);
	}

	.laser-window-nav {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 0 8px;
		height: 28px;
		border-radius: 8px;
		background: transparent;
		color: var(--text-dimmed);
	}

	.laser-window-nav.active {
		background: var(--surface-ghost);
		color: var(--text-primary);
	}

	.laser-window-nav p {
		font-size: 12px;
		font-weight: 500;
		white-space: nowrap;
	}

	.laser-window-main {
		flex: 1;
		min-width: 0;
		padding: 12px 16px 0;
	}

	.laser-window-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8px;
	}

	.laser-window-heading {
		display: flex;
		align-items: baseline;
		gap: 8px;
		min-width: 0;
	}

	.laser-window-name {
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
	}

	.laser-window-count {
		font-size: 12px;
		color: var(--text-dimmed);
	}

	.laser-window-tools {
		display: flex;
		gap: 6px;
		color: var(--text-dimmed);
	}

	.laser-window-row {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 34px;
		border-top: 1px solid var(--border-primary);
		min-width: 0;
	}

	.laser-window-status {
		color: var(--text-dimmed);
		flex-shrink: 0;
		display: flex;
	}

	.laser-window-issue {
		font-size: 12px;
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.laser-window-id {
		font-size: 11px;
		color: var(--text-dimmed);
		white-space: nowrap;
	}

	.laser-window-avatar {
		width: 20px;
		height: 20px;
		flex-shrink: 0;
		border-radius: 9999px;
		background: var(--surface-ghost);
		border: 1px solid var(--border-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 9px;
		font-weight: 600;
		color: var(--text-muted);
	}

	@container (max-width: 440px) {
		.laser-window-sidebar {
			display: none;
		}
	}

	@container (max-width: 300px) {
		.laser-window-meta {
			display: none;
		}
	}

	@container (max-width: 230px) {
		.laser-window-title,
		.laser-window-tools {
			display: none;
		}
	}
</style>
