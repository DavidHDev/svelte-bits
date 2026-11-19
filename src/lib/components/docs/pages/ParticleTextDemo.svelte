<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import ParticleText from '$lib/components/library/TextAnimations/ParticleText/ParticleText.svelte';
	import source from '$lib/components/library/TextAnimations/ParticleText/ParticleText.svelte?raw';

	type Intro = 'gather' | 'rain' | 'spiral' | 'scan';
	type Shape = 'circle' | 'square' | 'line';
	type Trigger = 'mount' | 'hover' | 'click';
	type HighlightMode = 'motion' | 'gradient';

	type Look = {
		highlightColor: string;
		intro: Intro;
		gatherDuration: number;
		stagger: number;
		scatter: number;
		clickBurst: boolean;
		burstStrength: number;
		pointerRepel: number;
		repelRadius: number;
		idleDrift: number;
		shape: Shape;
		highlightMode: HighlightMode;
		particleSize: number;
		density: number;
		glow: boolean;
	};

	const LOOK: Look = {
		highlightColor: '#ff5a36',
		intro: 'gather',
		gatherDuration: 1600,
		stagger: 420,
		scatter: 190,
		clickBurst: true,
		burstStrength: 1,
		pointerRepel: 42,
		repelRadius: 120,
		idleDrift: 0.8,
		shape: 'circle',
		highlightMode: 'motion',
		particleSize: 2.2,
		density: 4,
		glow: true
	};

	const PRESETS: Record<string, Look> = {
		ember: { ...LOOK },
		rain: {
			...LOOK,
			highlightColor: '#4f8dff',
			intro: 'rain',
			gatherDuration: 1900,
			stagger: 760,
			scatter: 120,
			burstStrength: 1.3,
			pointerRepel: 34,
			repelRadius: 110,
			idleDrift: 0,
			shape: 'line',
			particleSize: 1.7,
			density: 4,
			glow: false
		},
		vortex: {
			...LOOK,
			highlightColor: '#988f8a',
			intro: 'spiral',
			gatherDuration: 2600,
			stagger: 650,
			scatter: 240,
			burstStrength: 1.7,
			pointerRepel: 30,
			repelRadius: 150,
			idleDrift: 1.3,
			particleSize: 1.5,
			density: 2,
			glow: false
		},
		scan: {
			...LOOK,
			highlightColor: '#22c55e',
			intro: 'scan',
			gatherDuration: 1800,
			stagger: 240,
			scatter: 120,
			burstStrength: 0.8,
			pointerRepel: 24,
			repelRadius: 90,
			idleDrift: 0,
			shape: 'square',
			particleSize: 3,
			density: 5,
			glow: false
		}
	};

	const PRESET_OPTIONS = [
		{ value: 'ember', label: 'Ember' },
		{ value: 'rain', label: 'Rain' },
		{ value: 'vortex', label: 'Vortex' },
		{ value: 'scan', label: 'Scan' }
	];

	const DEFAULT_PROPS = {
		preset: 'ember',
		text: 'Future Interfaces',
		color: 'currentColor',
		...LOOK,
		trigger: 'mount' as Trigger,
		fontSize: 'clamp(3.5rem, 13vw, 9rem)',
		fontWeight: 800,
		fontFamily: 'inherit'
	};

	const INTRO_OPTIONS = [
		{ value: 'gather', label: 'Gather' },
		{ value: 'rain', label: 'Rain' },
		{ value: 'spiral', label: 'Spiral' },
		{ value: 'scan', label: 'Scan' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'circle', label: 'Circle' },
		{ value: 'square', label: 'Square' },
		{ value: 'line', label: 'Line' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'mount', label: 'Mount' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' }
	];

	const HIGHLIGHT_OPTIONS = [
		{ value: 'motion', label: 'Motion' },
		{ value: 'gradient', label: 'Gradient' }
	];

	const WEIGHT_OPTIONS = [
		{ value: 500, label: '500' },
		{ value: 650, label: '650' },
		{ value: 800, label: '800' },
		{ value: 900, label: '900' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: '"Svelte Bits"',
			description: 'The words sampled into particle targets.'
		},
		{
			name: 'color',
			type: 'string',
			default: '"currentColor"',
			description: 'Particle color at rest. Follows the surrounding text color by default.'
		},
		{
			name: 'highlightColor',
			type: 'string',
			default: '"#ff5a36"',
			description:
				'Color particles take on while they fly in or get pushed around. Also colors the glow and the scan line.'
		},
		{
			name: 'intro',
			type: '"gather" | "rain" | "spiral" | "scan"',
			default: '"gather"',
			description:
				'How the text forms. Gather pulls scattered particles together, rain drops them in from above, spiral swirls them into place, and scan assembles the text behind a sweeping line.'
		},
		{
			name: 'gatherDuration',
			type: 'number',
			default: '1600',
			description: 'Milliseconds for the intro to form the text.'
		},
		{
			name: 'stagger',
			type: 'number',
			default: '420',
			description: 'Maximum per-particle delay in milliseconds before it starts moving.'
		},
		{
			name: 'scatter',
			type: 'number',
			default: '180',
			description: 'How far particles begin from their final spots in the gather and spiral intros.'
		},
		{
			name: 'trigger',
			type: '"mount" | "hover" | "click"',
			default: '"mount"',
			description: 'When the intro plays again after the first formation: never, on hover, or on click.'
		},
		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'true',
			description:
				'Clicking blows the particles away from the click point, then they spring back into the text. Off while trigger is click.'
		},
		{
			name: 'burstStrength',
			type: 'number',
			default: '1',
			description: 'How hard and how wide a click burst pushes.'
		},
		{
			name: 'pointerRepel',
			type: 'number',
			default: '40',
			description: 'Strength of the cursor pushback.'
		},
		{
			name: 'repelRadius',
			type: 'number',
			default: '120',
			description: 'Cursor influence radius in pixels.'
		},
		{
			name: 'idleDrift',
			type: 'number',
			default: '0.7',
			description: 'Subtle resting motion after the text has formed.'
		},
		{
			name: 'shape',
			type: '"circle" | "square" | "line"',
			default: '"circle"',
			description:
				'How each particle is drawn. Line draws short strokes that stretch along their motion and settle into an even hatch.'
		},
		{
			name: 'highlightMode',
			type: '"motion" | "gradient"',
			default: '"motion"',
			description:
				'Motion lights up particles while they are away from their spot and cools them as they land. Gradient blends the highlight across the text from left to right.'
		},
		{
			name: 'particleSize',
			type: 'number',
			default: '2',
			description: 'Rendered size of each particle in CSS pixels.'
		},
		{
			name: 'density',
			type: 'number',
			default: '4',
			description: 'Pixel sampling step for the offscreen glyph canvas. Lower values create more particles.'
		},
		{
			name: 'glow',
			type: 'boolean',
			default: 'true',
			description: 'Adds a soft bloom in the highlight color around highlighted particles.'
		},
		{
			name: 'fontSize',
			type: 'number | string',
			default: '"clamp(3rem, 12vw, 8rem)"',
			description: 'Canvas text size used for glyph sampling.'
		},
		{
			name: 'fontWeight',
			type: 'number | string',
			default: '800',
			description: 'Font weight used for sampling.'
		},
		{
			name: 'fontFamily',
			type: 'string',
			default: '"inherit"',
			description: 'Font family used for sampling. Inherit waits for the surrounding font before sampling.'
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Optional wrapper class name.'
		},
		{
			name: 'style',
			type: 'CSSProperties',
			default: 'undefined',
			description: 'Optional inline styles for the wrapper.'
		}
	];

	const usage = `<script lang="ts">
  import ParticleText from '$lib/components/ParticleText.svelte';
</${'script'}>

<div style="width: 100%; height: 360px;">
  <ParticleText
    text="Launch Faster"
    particleSize={2}
    density={4}
    color="currentColor"
    highlightColor="#ff5a36"
    highlightMode="motion"
    shape="circle"
    intro="gather"
    scatter={180}
    gatherDuration={1600}
    stagger={420}
    clickBurst
    burstStrength={1}
    pointerRepel={40}
    repelRadius={120}
    idleDrift={0.7}
    trigger="hover"
    fontSize="clamp(3rem, 12vw, 8rem)"
    fontWeight={800}
    fontFamily="inherit"
    glow
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	const shown = (value: string) => (value === 'currentColor' ? ink : value);

	const replay = <K extends keyof typeof DEFAULT_PROPS>(name: K, value: (typeof DEFAULT_PROPS)[K]) => {
		demo.updateProp(name, value);
		key++;
	};

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};
</script>

<TabsLayout propsState={demo} componentName="ParticleText" {usage} {source} {propData} dependencies={[]} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 430px; overflow: hidden;">
			<RefreshButton onClick={() => key++} />
			{#key `${settings.preset}-${key}`}
				<ParticleText {...componentProps} />
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={(v) => applyPreset(String(v))} />

			<PreviewColorPickerCustom title="Color" color={shown(settings.color)} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewColorPickerCustom
				title="Highlight Color"
				color={shown(settings.highlightColor)}
				onChange={(v) => demo.updateProp('highlightColor', v)}
			/>

			<PreviewSelect title="Intro" options={INTRO_OPTIONS} value={settings.intro} onChange={(v) => replay('intro', v as Intro)} />

			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => demo.updateProp('trigger', v as Trigger)}
			/>

			<PreviewSlider
				title="Gather"
				min={500}
				max={3000}
				step={100}
				value={settings.gatherDuration}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('gatherDuration', v)}
			/>

			<PreviewSlider
				title="Stagger"
				min={0}
				max={900}
				step={30}
				value={settings.stagger}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('stagger', v)}
			/>

			<PreviewSlider
				title="Scatter"
				min={40}
				max={320}
				step={10}
				value={settings.scatter}
				valueUnit="px"
				onChange={(v) => demo.updateProp('scatter', v)}
			/>

			<PreviewSwitch
				title="Click Burst"
				isChecked={settings.clickBurst}
				isDisabled={settings.trigger === 'click'}
				onChange={(v) => demo.updateProp('clickBurst', v)}
			/>

			<PreviewSlider
				title="Burst Strength"
				min={0.2}
				max={2.5}
				step={0.1}
				value={settings.burstStrength}
				isDisabled={!settings.clickBurst || settings.trigger === 'click'}
				onChange={(v) => demo.updateProp('burstStrength', v)}
			/>

			<PreviewSlider
				title="Repel Strength"
				min={0}
				max={90}
				step={2}
				value={settings.pointerRepel}
				onChange={(v) => demo.updateProp('pointerRepel', v)}
			/>

			<PreviewSlider
				title="Repel Radius"
				min={40}
				max={220}
				step={5}
				value={settings.repelRadius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('repelRadius', v)}
			/>

			<PreviewSlider
				title="Idle Drift"
				min={0}
				max={2}
				step={0.1}
				value={settings.idleDrift}
				valueUnit="px"
				onChange={(v) => demo.updateProp('idleDrift', v)}
			/>

			<PreviewSelect title="Shape" options={SHAPE_OPTIONS} value={settings.shape} onChange={(v) => demo.updateProp('shape', v as Shape)} />

			<PreviewSelect
				title="Highlight"
				options={HIGHLIGHT_OPTIONS}
				value={settings.highlightMode}
				onChange={(v) => demo.updateProp('highlightMode', v as HighlightMode)}
			/>

			<PreviewSelect
				title="Weight"
				options={WEIGHT_OPTIONS}
				value={settings.fontWeight}
				onChange={(v) => demo.updateProp('fontWeight', Number(v))}
			/>

			<PreviewSlider
				title="Particle Size"
				min={1}
				max={4}
				step={0.1}
				value={settings.particleSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('particleSize', v)}
			/>

			<PreviewSlider
				title="Density"
				min={2}
				max={8}
				step={1}
				value={settings.density}
				onChange={(v) => demo.updateProp('density', v)}
			/>

			<PreviewSwitch title="Glow" isChecked={settings.glow} onChange={(v) => demo.updateProp('glow', v)} />

			<PreviewInput
				title="Text"
				value={settings.text}
				placeholder="Your heading"
				maxLength={24}
				onChange={(v) => demo.updateProp('text', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
