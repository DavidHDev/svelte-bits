<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		ArrowRight01Icon,
		GithubIcon,
		Home01Icon,
		Message01Icon,
		Notification03Icon,
		PlayIcon,
		Search01Icon,
		Settings02Icon
	} from '@hugeicons/core-free-icons';
	import Magnet, { type MagnetAxis } from '$lib/components/library/Animations/Magnet/Magnet.svelte';
	import source from '$lib/components/library/Animations/Magnet/Magnet.svelte?raw';

	const INK = {
		dark: {
			text: '#f4f4f5',
			muted: 'rgba(244, 244, 245, 0.56)',
			hover: 'brightness(1.12)',
			primary: 'linear-gradient(to bottom, #ffffff, #efece9)',
			primaryInk: '#14110E',
			primaryShadow:
				'inset 0 1px 0 #ffffff, inset 0 -1px 0 rgba(20, 17, 14, 0.1), 0 1px 2px rgba(0, 0, 0, 0.3), 0 10px 24px -10px rgba(0, 0, 0, 0.6)',
			ghost: 'rgba(255, 255, 255, 0.08)',
			ghostShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
			panel: 'rgba(42, 36, 31, 0.66)',
			panelShadow: '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
			panelRim: 'inset 0 1px 0 rgba(255, 255, 255, 0.07), inset 0 0 0 1px rgba(255, 255, 255, 0.08)',
			tile: 'linear-gradient(180deg, #3d3630 0%, #2a2420 100%)',
			tileShadow:
				'inset 0 1px 0 rgba(255, 255, 255, 0.12), inset 0 0 0 1px rgba(255, 255, 255, 0.07), 0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			cardShadow:
				'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.06), 0 30px 60px -30px rgba(0, 0, 0, 0.85), 0 10px 24px -14px rgba(0, 0, 0, 0.55)',
			track: 'rgba(255, 255, 255, 0.12)',
			cover: '/assets/demo/night-sky.webp'
		},
		light: {
			text: '#18181b',
			muted: 'rgba(24, 24, 27, 0.56)',
			hover: 'brightness(0.97)',
			primary: 'linear-gradient(to bottom, #2d2722, #17130F)',
			primaryInk: '#ffffff',
			primaryShadow:
				'inset 0 1px 0 rgba(255, 255, 255, 0.14), 0 1px 2px rgba(24, 24, 27, 0.25), 0 10px 24px -12px rgba(24, 24, 27, 0.5)',
			ghost: 'rgba(255, 255, 255, 0.72)',
			ghostShadow: 'inset 0 0 0 1px rgba(24, 24, 27, 0.08), 0 1px 2px rgba(24, 24, 27, 0.05)',
			panel: 'rgba(243, 242, 240, 0.8)',
			panelShadow: '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
			panelRim: 'inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 0 0 1px rgba(24, 24, 27, 0.07)',
			tile: 'linear-gradient(180deg, #ffffff 0%, #f7f6f4 100%)',
			tileShadow: 'inset 0 1px 0 #ffffff, inset 0 0 0 1px rgba(24, 24, 27, 0.08), 0 4px 10px -5px rgba(24, 24, 27, 0.25)',
			cardShadow:
				'inset 0 1px 0 #ffffff, inset 0 0 0 1px rgba(24, 24, 27, 0.07), 0 30px 60px -32px rgba(24, 24, 27, 0.35), 0 10px 24px -16px rgba(24, 24, 27, 0.2)',
			track: 'rgba(24, 24, 27, 0.1)',
			cover: '/assets/demo/day-sky.webp'
		}
	};

	const DOCK_ICONS = [Home01Icon, Search01Icon, Notification03Icon, Message01Icon, Settings02Icon];

	const FEEL = {
		padding: 100,
		magnetStrength: 2,
		stiffness: 170,
		damping: 16,
		tilt: 6,
		scale: 1,
		axis: 'both' as MagnetAxis
	};

	const DEFAULT_PROPS = {
		demo: 'buttons',
		preset: 'default',
		...FEEL,
		disabled: false
	};

	type Feel = typeof FEEL;

	const PRESETS: Record<string, Feel> = {
		default: { ...FEEL },
		subtle: { ...FEEL, padding: 60, magnetStrength: 5, stiffness: 150, damping: 20, tilt: 3 },
		snappy: { ...FEEL, padding: 90, stiffness: 420, damping: 28 },
		elastic: { ...FEEL, padding: 110, magnetStrength: 1.6, stiffness: 240, damping: 8 },
		floaty: { ...FEEL, padding: 140, magnetStrength: 2.4, stiffness: 50, damping: 9 },
		sticky: { ...FEEL, padding: 180, magnetStrength: 1.2, stiffness: 200, damping: 18 },
		lift: { ...FEEL, magnetStrength: 3, tilt: 14, scale: 1.06 }
	};

	const PRESET_OPTIONS = [
		{ value: 'default', label: 'Default' },
		{ value: 'subtle', label: 'Subtle' },
		{ value: 'snappy', label: 'Snappy' },
		{ value: 'elastic', label: 'Elastic' },
		{ value: 'floaty', label: 'Floaty' },
		{ value: 'sticky', label: 'Sticky' },
		{ value: 'lift', label: 'Lift' }
	];

	const DEMO_OPTIONS = [
		{ value: 'buttons', label: 'Buttons' },
		{ value: 'dock', label: 'Dock' },
		{ value: 'card', label: 'Card' },
		{ value: 'basic', label: 'Basic' }
	];

	const AXIS_OPTIONS = [
		{ value: 'both', label: 'Both' },
		{ value: 'x', label: 'Horizontal' },
		{ value: 'y', label: 'Vertical' }
	];

	const propData: PropRow[] = [
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'The content that moves toward the cursor.'
		},
		{
			name: 'padding',
			type: 'number',
			default: '100',
			description: 'Distance in pixels around the element where the cursor starts to pull it.'
		},
		{
			name: 'magnetStrength',
			type: 'number',
			default: '2',
			description:
				'How far the element follows the cursor. The offset is divided by this value, so 1 follows the cursor and higher values move less.'
		},
		{
			name: 'exclusive',
			type: 'boolean',
			default: 'true',
			description:
				'When several magnets are in range, only the nearest exclusive one is pulled. Turn it off to let a group, like dock icons, lean toward the cursor together.'
		},
		{
			name: 'axis',
			type: "'both' | 'x' | 'y'",
			default: "'both'",
			description: 'Limits the movement to one axis.'
		},
		{
			name: 'maxOffset',
			type: 'number',
			default: '-',
			description: 'Caps how far the element can move from its resting place, in pixels.'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '0',
			description: 'Maximum 3D tilt toward the cursor, in degrees.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '1',
			description: 'Scale of the element while the cursor pulls it.'
		},
		{
			name: 'spring',
			type: '{ stiffness?: number; damping?: number; mass?: number }',
			default: '{ stiffness: 170, damping: 16, mass: 1 }',
			description:
				'Spring that drives the movement. Higher stiffness reacts faster, lower damping lets it overshoot and wobble back.'
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Turns the effect off and lets the element spring back to rest.'
		},
		{
			name: 'onActiveChange',
			type: '(active: boolean) => void',
			default: '-',
			description:
				'Called when the cursor enters or leaves the magnetic area. The wrapper also gets a data-magnet-active attribute.'
		},
		{
			name: 'wrapperClassName',
			type: 'string',
			default: "''",
			description: 'Class name for the outer wrapper, which stays in place.'
		},
		{
			name: 'innerClassName',
			type: 'string',
			default: "''",
			description: 'Class name for the inner element that moves.'
		},
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the outer wrapper.' }
	];

	const usage = `<script lang="ts">
  import Magnet from '$lib/components/Magnet.svelte';
</${'script'}>

<Magnet
  padding={100}
  magnetStrength={2}
>
  <button>Star Svelte Bits on GitHub</button>
</Magnet>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const props = $derived(demo.props);
	const ink = $derived(colorModeValue(INK.light, INK.dark));
	const spring = $derived({ stiffness: props.stiffness, damping: props.damping });
	const computedProps = $derived({ spring });
	const magnet = $derived.by(() => {
		const { demo: _demo, preset: _preset, stiffness: _stiffness, damping: _damping, ...rest } = props;
		return { ...rest, spring };
	});

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(FEEL).map((name) => [name, demo.defaultProps[name as keyof Feel]])
		) as Partial<Feel>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="Magnet"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['demo', 'preset', 'stiffness', 'damping']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 460px; padding: 0; overflow: hidden; display: flex; align-items: center; justify-content: center; --mg-hover: {ink.hover};"
		>
			{#if props.demo === 'dock'}
				<div
					style="position: relative; display: flex; gap: 10px; padding: 10px; border-radius: 22px; background: {ink.panel}; box-shadow: {ink.panelShadow}; backdrop-filter: blur(20px) saturate(1.6); -webkit-backdrop-filter: blur(20px) saturate(1.6);"
				>
					{#each DOCK_ICONS as icon, index (index)}
						<Magnet {...magnet} exclusive={false} maxOffset={14}>
							<button
								type="button"
								aria-label="Dock item"
								class="mg-demo-hoverable"
								style="width: 48px; height: 48px; border: 0; border-radius: 14px; display: grid; place-items: center; cursor: pointer; background: {ink.tile}; box-shadow: {ink.tileShadow}; color: {ink.text};"
							>
								<HugeiconsIcon {icon} size={21} strokeWidth={1.6} />
							</button>
						</Magnet>
					{/each}
					<div
						style="position: absolute; inset: 0; border-radius: inherit; pointer-events: none; box-shadow: {ink.panelRim};"
					></div>
				</div>
			{:else if props.demo === 'card'}
				<Magnet {...magnet} maxOffset={36}>
					<div style="width: 288px; padding: 14px; border-radius: 22px; background: {ink.tile}; box-shadow: {ink.cardShadow};">
						<div
							style="height: 168px; border-radius: 12px; background-size: cover; background-position: center; background-image: url({ink.cover});"
						></div>
						<div style="display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding: 0 4px;">
							<div>
								<p style="margin: 0; font-size: 15px; font-weight: 600; letter-spacing: -0.01em; color: {ink.text};">
									Afterglow
								</p>
								<p style="margin: 0; font-size: 13px; color: {ink.muted};">Golden hour sessions</p>
							</div>
							<button
								type="button"
								aria-label="Play"
								style="width: 40px; height: 40px; border: 0; border-radius: 12px; display: grid; place-items: center; cursor: pointer; background: {ink.primary}; color: {ink.primaryInk}; box-shadow: {ink.primaryShadow};"
							>
								<HugeiconsIcon icon={PlayIcon} size={17} strokeWidth={2} />
							</button>
						</div>
						<div style="margin: 14px 4px 4px; height: 4px; border-radius: 2px; overflow: hidden; background: {ink.track};">
							<div style="height: 100%; width: 38%; border-radius: 2px; background: {ink.text};"></div>
						</div>
					</div>
				</Magnet>
			{:else if props.demo === 'basic'}
				<Magnet {...magnet}>
					<button
						type="button"
						class="mg-demo-button mg-demo-hoverable"
						style="background: {ink.ghost}; color: {ink.text}; box-shadow: {ink.ghostShadow};"
					>
						Hover me
					</button>
				</Magnet>
			{:else}
				<div style="display: flex; gap: 14px; flex-wrap: wrap; justify-content: center;">
					<Magnet {...magnet} maxOffset={10}>
						<button
							type="button"
							class="mg-demo-button mg-demo-hoverable"
							style="background: {ink.primary}; color: {ink.primaryInk}; box-shadow: {ink.primaryShadow};"
						>
							Get started
							<span style="display: inline-flex; margin-right: -4px;">
								<HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
							</span>
						</button>
					</Magnet>
					<Magnet {...magnet} maxOffset={10}>
						<button
							type="button"
							class="mg-demo-button mg-demo-hoverable"
							style="background: {ink.ghost}; color: {ink.text}; box-shadow: {ink.ghostShadow};"
						>
							<HugeiconsIcon icon={GithubIcon} size={16} strokeWidth={1.8} />
							Star on GitHub
						</button>
					</Magnet>
				</div>
			{/if}
		</div>

		<Customize>
			<PreviewSelect title="Demo" options={DEMO_OPTIONS} value={props.demo} onChange={(v) => demo.updateProp('demo', v)} />
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={props.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Axis"
				options={AXIS_OPTIONS}
				value={props.axis}
				onChange={(v) => demo.updateProp('axis', v as MagnetAxis)}
			/>
			<PreviewSlider
				title="Padding"
				min={0}
				max={300}
				step={10}
				value={props.padding}
				valueUnit="px"
				onChange={(v) => demo.updateProp('padding', v)}
			/>
			<PreviewSlider
				title="Strength"
				min={1}
				max={10}
				step={0.1}
				value={props.magnetStrength}
				onChange={(v) => demo.updateProp('magnetStrength', v)}
			/>
			<PreviewSlider
				title="Stiffness"
				min={20}
				max={600}
				step={10}
				value={props.stiffness}
				onChange={(v) => demo.updateProp('stiffness', v)}
			/>
			<PreviewSlider
				title="Damping"
				min={2}
				max={40}
				step={1}
				value={props.damping}
				onChange={(v) => demo.updateProp('damping', v)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={30}
				step={1}
				value={props.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>
			<PreviewSlider
				title="Scale"
				min={1}
				max={1.2}
				step={0.01}
				value={props.scale}
				onChange={(v) => demo.updateProp('scale', v)}
			/>
			<PreviewSwitch title="Disabled" isChecked={props.disabled} onChange={(v) => demo.updateProp('disabled', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.mg-demo-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		height: 44px;
		padding: 0 20px;
		border: 0;
		border-radius: 12px;
		font-family: inherit;
		font-size: 14px;
		font-weight: 500;
		letter-spacing: -0.01em;
		white-space: nowrap;
		cursor: pointer;
	}

	.mg-demo-hoverable {
		transition: filter 200ms ease;
	}

	.mg-demo-hoverable:hover {
		filter: var(--mg-hover);
	}
</style>
