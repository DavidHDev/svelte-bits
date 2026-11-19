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
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme } from '$lib/theme.svelte';
	import PixelTrail from '$lib/components/library/Animations/PixelTrail/PixelTrail.svelte';
	import source from '$lib/components/library/Animations/PixelTrail/PixelTrail.svelte?raw';

	type Shape = 'square' | 'circle' | 'diamond';
	type Decay = 'fade' | 'shrink' | 'dither';

	const WHITE = '#ffffff';
	const INK = '#1c1917';
	const ACCENT = '#ff8a4c';
	const ACCENT_LIGHT = '#ea580c';
	const DAY_SKY = '/assets/demo/day-sky.webp';
	const NIGHT_SKY = '/assets/demo/night-sky.webp';

	const LOOK = {
		gridSize: 50,
		trailSize: 0.1,
		maxAge: 500,
		interpolate: 5,
		color: '#FF8A4C',
		colorShift: true,
		shiftColor: '#FF8A4C',
		gooeyEnabled: true,
		gooStrength: 2,
		shape: 'square' as Shape,
		gap: 0.08,
		decay: 'fade' as Decay,
		flow: 0,
		gravity: 0,
		sparkle: 0,
		shine: 0.6,
		glow: 0.4,
		clickBurst: false,
		reveal: false
	};

	type Look = typeof LOOK;

	const DEFAULT_PROPS = { preset: 'classic', ...LOOK };

	const PRESETS: Record<string, Look> = {
		classic: LOOK,
		comet: {
			...LOOK,
			color: WHITE,
			colorShift: true,
			trailSize: 0.12,
			maxAge: 700,
			flow: 0.4,
			clickBurst: true
		},
		gel: { ...LOOK, gap: 0, maxAge: 600, trailSize: 0.12, gooStrength: 5, shine: 1, glow: 0.5 },
		drip: { ...LOOK, maxAge: 1100, gooStrength: 3, gravity: 0.6, clickBurst: true },
		led: {
			...LOOK,
			color: WHITE,
			colorShift: true,
			gridSize: 60,
			maxAge: 700,
			gooeyEnabled: false,
			shape: 'circle',
			gap: 0.25
		},
		halftone: { ...LOOK, gridSize: 70, maxAge: 800, gooeyEnabled: false, shape: 'circle', decay: 'shrink' },
		dither: { ...LOOK, gridSize: 100, trailSize: 0.14, maxAge: 700, gooeyEnabled: false, decay: 'dither' },
		sparkle: {
			...LOOK,
			color: WHITE,
			colorShift: true,
			maxAge: 900,
			gooeyEnabled: false,
			sparkle: 0.8,
			clickBurst: true
		},
		reveal: { ...LOOK, gridSize: 60, trailSize: 0.15, maxAge: 1600, gooStrength: 3, reveal: true, clickBurst: true }
	};

	const PRESET_OPTIONS = [
		{ value: 'classic', label: 'Classic' },
		{ value: 'comet', label: 'Comet' },
		{ value: 'gel', label: 'Gel' },
		{ value: 'drip', label: 'Drip' },
		{ value: 'led', label: 'LED' },
		{ value: 'halftone', label: 'Halftone' },
		{ value: 'dither', label: 'Dither' },
		{ value: 'sparkle', label: 'Sparkle' },
		{ value: 'reveal', label: 'Reveal' }
	];

	const SHAPE_OPTIONS = [
		{ value: 'square', label: 'Square' },
		{ value: 'circle', label: 'Circle' },
		{ value: 'diamond', label: 'Diamond' }
	];

	const DECAY_OPTIONS = [
		{ value: 'fade', label: 'Fade' },
		{ value: 'shrink', label: 'Shrink' },
		{ value: 'dither', label: 'Dither' }
	];

	const propData: PropRow[] = [
		{ name: 'gridSize', type: 'number', default: '40', description: 'Number of pixels across the longer side.' },
		{
			name: 'trailSize',
			type: 'number',
			default: '0.1',
			description: 'Radius of the trail brush, as a fraction of the longer side.'
		},
		{ name: 'maxAge', type: 'number', default: '250', description: 'How long each part of the trail lasts, in ms.' },
		{
			name: 'interpolate',
			type: 'number',
			default: '5',
			description: 'How many in-between points fill gaps on fast moves. Higher is smoother.'
		},
		{
			name: 'easingFunction',
			type: '(x: number) => number',
			default: 'x => x',
			description: 'Easing curve for how the trail swells in and fades out.'
		},
		{ name: 'color', type: 'string', default: "'#ffffff'", description: 'Pixel color.' },
		{
			name: 'trailColor',
			type: 'string',
			default: 'undefined',
			description: 'A second color the trail shifts to as it ages. Leave it out for a single color.'
		},
		{
			name: 'gooeyFilter',
			type: '{ strength: number } | false',
			default: '{ strength: 2 }',
			description:
				'Melts neighbouring pixels into liquid blobs. Higher strength rounds them more. Pass false for separate pixels.'
		},
		{
			name: 'shape',
			type: "'square' | 'circle' | 'diamond'",
			default: "'square'",
			description: 'Shape of each pixel when goo is off.'
		},
		{
			name: 'gap',
			type: 'number',
			default: '0.08',
			description: 'Space between pixels, as a fraction of a pixel. With goo on it draws fine seams between them.'
		},
		{
			name: 'decay',
			type: "'fade' | 'shrink' | 'dither'",
			default: "'fade'",
			description: 'How pixels disappear: fading out, shrinking away or dropping out in a dither pattern.'
		},
		{
			name: 'flow',
			type: 'number',
			default: '0',
			description: 'How much the trail keeps drifting in the direction the cursor moved, from 0 to 1.'
		},
		{
			name: 'gravity',
			type: 'number',
			default: '0',
			description: 'Makes the trail sag down as it fades. Negative values make it rise, from -1 to 1.'
		},
		{ name: 'sparkle', type: 'number', default: '0', description: 'Makes fading pixels flicker, from 0 to 1.' },
		{
			name: 'shine',
			type: 'number',
			default: '0.6',
			description: 'Glossy light on the pixels: bevels on every step, a brighter core and highlights, from 0 to 1.'
		},
		{ name: 'glow', type: 'number', default: '0.4', description: 'A soft glow around the trail, from 0 to 1.' },
		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'false',
			description: 'Clicking splashes a ring of trail out from the cursor.'
		},
		{
			name: 'imageSrc',
			type: 'string',
			default: 'undefined',
			description: 'An image the trail reveals. Each pixel takes the color of the image beneath it.'
		},
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import PixelTrail from '$lib/components/PixelTrail.svelte';
</${'script'}>

<div style="height: 500px; position: relative; overflow: hidden;">
  <PixelTrail
    gridSize={50}
    trailSize={0.1}
    maxAge={500}
    interpolate={5}
    color="#FF8A4C"
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const {
			preset: _preset,
			colorShift: _colorShift,
			shiftColor: _shiftColor,
			gooeyEnabled: _gooeyEnabled,
			gooStrength: _gooStrength,
			reveal: _reveal,
			...rest
		} = settings;
		return rest;
	});
	let key = $state(0);

	const color = $derived.by(() => {
		if (!theme.isLight) return settings.color;
		const value = settings.color.toLowerCase();
		if (value === WHITE) return INK;
		if (value === ACCENT) return ACCENT_LIGHT;
		return settings.color;
	});
	const gooeyFilter = $derived(settings.gooeyEnabled ? { strength: settings.gooStrength } : (false as const));
	const trailColor = $derived(settings.colorShift ? settings.shiftColor : undefined);
	const imageSrc = $derived(settings.reveal ? (theme.isLight ? NIGHT_SKY : DAY_SKY) : undefined);

	const computedProps = $derived({
		color,
		...(trailColor ? { trailColor } : {}),
		gooeyFilter,
		...(imageSrc ? { imageSrc } : {})
	});

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<Look>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="PixelTrail"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'colorShift', 'shiftColor', 'gooeyEnabled', 'gooStrength', 'reveal']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 400px; padding: 0; overflow: hidden;">
			<RefreshButton onClick={() => key++} />
			{#key key}
				<PixelTrail {...componentProps} {color} {trailColor} {gooeyFilter} {imageSrc} />
			{/key}
			<p
				class="pointer-events-none absolute bottom-5 left-1/2 z-0 m-0 -translate-x-1/2 text-sm select-none"
				style="color: var(--text-dimmed);"
			>
				{settings.clickBurst ? 'Move and click' : 'Move around'}
			</p>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom title="Color" {color} onChange={(v) => demo.updateProp('color', v)} />
			<PreviewColorPickerCustom
				title="Trail Color"
				color={settings.shiftColor}
				onChange={(v) => demo.updateProps({ shiftColor: v, colorShift: true })}
			/>
			<PreviewSwitch
				title="Color Shift"
				isChecked={settings.colorShift}
				onChange={(v) => demo.updateProp('colorShift', v)}
			/>
			<PreviewSlider
				title="Grid Size"
				min={10}
				max={120}
				step={1}
				value={settings.gridSize}
				onChange={(v) => demo.updateProp('gridSize', v)}
			/>
			<PreviewSlider
				title="Trail Size"
				min={0.05}
				max={0.5}
				step={0.01}
				value={settings.trailSize}
				onChange={(v) => demo.updateProp('trailSize', v)}
			/>
			<PreviewSlider
				title="Max Age"
				min={100}
				max={3000}
				step={50}
				value={settings.maxAge}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('maxAge', v)}
			/>
			<PreviewSlider
				title="Interpolate"
				min={0}
				max={10}
				step={0.1}
				value={settings.interpolate}
				onChange={(v) => demo.updateProp('interpolate', v)}
			/>
			<PreviewSwitch
				title="Gooey Filter"
				isChecked={settings.gooeyEnabled}
				onChange={(v) => demo.updateProp('gooeyEnabled', v)}
			/>
			<PreviewSlider
				title="Gooey Strength"
				min={1}
				max={20}
				step={1}
				value={settings.gooStrength}
				isDisabled={!settings.gooeyEnabled}
				onChange={(v) => demo.updateProp('gooStrength', v)}
			/>
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={settings.shape}
				isDisabled={settings.gooeyEnabled}
				onChange={(v) => demo.updateProp('shape', v as Shape)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={0.6}
				step={0.01}
				value={settings.gap}
				onChange={(v) => demo.updateProp('gap', v)}
			/>
			<PreviewSelect
				title="Decay"
				options={DECAY_OPTIONS}
				value={settings.decay}
				onChange={(v) => demo.updateProp('decay', v as Decay)}
			/>
			<PreviewSlider
				title="Flow"
				min={0}
				max={1}
				step={0.05}
				value={settings.flow}
				onChange={(v) => demo.updateProp('flow', v)}
			/>
			<PreviewSlider
				title="Gravity"
				min={-1}
				max={1}
				step={0.05}
				value={settings.gravity}
				onChange={(v) => demo.updateProp('gravity', v)}
			/>
			<PreviewSlider
				title="Sparkle"
				min={0}
				max={1}
				step={0.05}
				value={settings.sparkle}
				onChange={(v) => demo.updateProp('sparkle', v)}
			/>
			<PreviewSlider
				title="Shine"
				min={0}
				max={1}
				step={0.05}
				value={settings.shine}
				onChange={(v) => demo.updateProp('shine', v)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>
			<PreviewSwitch
				title="Click Burst"
				isChecked={settings.clickBurst}
				onChange={(v) => demo.updateProp('clickBurst', v)}
			/>
			<PreviewSwitch title="Reveal Image" isChecked={settings.reveal} onChange={(v) => demo.updateProp('reveal', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
