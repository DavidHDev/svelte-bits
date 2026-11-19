<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import SplashCursor, {
		type SplashCursorQuality
	} from '$lib/components/library/Animations/SplashCursor/SplashCursor.svelte';
	import source from '$lib/components/library/Animations/SplashCursor/SplashCursor.svelte?raw';
	import { CLASSIC, LOOK, PRESET_OPTIONS, presetProps } from './presets/SplashCursor';

	const DEFAULT_PROPS = {
		preset: 'classic',
		...LOOK,
		...CLASSIC,
		quality: 'high' as SplashCursorQuality,
		clickSplash: true,
		intro: true,
		contained: false
	};

	const LIGHT_SWAP: Record<string, string> = {
		'#ff8a4c': '#ea580c',
		'#e7e5e4': '#44403c',
		'#3b82f6': '#1d4ed8'
	};

	const DARK_SWAP: Record<string, string> = Object.fromEntries(
		Object.entries(LIGHT_SWAP).map(([dark, light]) => [light, dark])
	);

	const QUALITY_OPTIONS = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' }
	];

	const propData: PropRow[] = [
		{
			name: 'colors',
			type: 'string[]',
			default: "['#4f8cff', '#2dd4bf', '#ffd166']",
			description: 'Palette the ink cycles through when rainbow is off.'
		},
		{
			name: 'rainbow',
			type: 'boolean',
			default: 'true',
			description: 'Cycles through the full spectrum instead of the palette.'
		},
		{
			name: 'colorSpeed',
			type: 'number',
			default: '1',
			description: 'How fast the colors shift while you move. 0 keeps one color per stroke.'
		},
		{ name: 'intensity', type: 'number', default: '1', description: 'How much ink each movement leaves behind.' },
		{ name: 'size', type: 'number', default: '1', description: 'Width of the stroke and the splash.' },
		{ name: 'force', type: 'number', default: '1', description: 'How hard the cursor pushes the fluid.' },
		{ name: 'swirl', type: 'number', default: '3', description: 'Amount of curling eddies in the flow.' },
		{
			name: 'trail',
			type: 'number',
			default: '1',
			description: 'How long the ink lingers before it fades. 2 lasts twice as long.'
		},
		{
			name: 'momentum',
			type: 'number',
			default: '1',
			description: 'How long the fluid keeps moving after the cursor stops.'
		},
		{ name: 'shading', type: 'number', default: '1', description: 'Depth shading on the ripples, from 0 to 1.' },
		{ name: 'glow', type: 'number', default: '0', description: 'Soft bloom around the brightest ink, from 0 to 1.' },
		{
			name: 'quality',
			type: "'low' | 'medium' | 'high'",
			default: "'high'",
			description: 'Simulation detail. Lower settings are lighter on older devices.'
		},
		{ name: 'clickSplash', type: 'boolean', default: 'true', description: 'Bursts a splash where you click or tap.' },
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Plays a short stroke across the screen on mount.' },
		{
			name: 'contained',
			type: 'boolean',
			default: 'false',
			description: 'Fills the parent element instead of the whole viewport and only reacts inside it.'
		},
		{
			name: 'theme',
			type: "'dark' | 'light'",
			default: "'dark'",
			description: 'Glowing ink for dark backgrounds or absorbing ink for light ones.'
		},
		{ name: 'zIndex', type: 'number', default: '50', description: 'Stacking order of the effect over your content.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import SplashCursor from '$lib/components/SplashCursor.svelte';
</${'script'}>

<SplashCursor
  rainbow
  size={1}
  force={1}
  swirl={3}
  trail={1}
  clickSplash
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, colors: _colors, ...rest } = settings;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const shown = $derived.by(() => {
		const swap = theme === 'light' ? LIGHT_SWAP : DARK_SWAP;
		const colors = settings.colors?.length ? settings.colors : LOOK.colors;
		return colors.map((color) => swap[color.toLowerCase()] ?? color);
	});
	const computedProps = $derived({ colors: shown, ...(theme === 'light' ? { theme: 'light' } : {}) });
	let key = $state(0);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value), preset: value });
		key++;
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="SplashCursor"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'colors']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden; cursor: crosshair;">
			<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
				<span class="select-none" style="font-size: 14px; color: var(--text-muted);">Move your cursor</span>
			</div>
			{#if settings.contained}
				{#key key}
					<SplashCursor {theme} {...componentProps} colors={shown} />
				{/key}
			{/if}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			{#if !settings.rainbow}
				<PreviewColorList
					title="Colors"
					colors={shown}
					min={1}
					max={6}
					onChange={(v) => demo.updateProp('colors', v)}
				/>
			{/if}
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Quality"
				options={QUALITY_OPTIONS}
				value={settings.quality}
				onChange={(v) => demo.updateProp('quality', v)}
			/>
			<PreviewSlider
				title="Color Speed"
				min={0}
				max={4}
				step={0.05}
				value={settings.colorSpeed}
				onChange={(v) => demo.updateProp('colorSpeed', v)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0.2}
				max={3}
				step={0.05}
				value={settings.intensity}
				onChange={(v) => demo.updateProp('intensity', v)}
			/>
			<PreviewSlider
				title="Size"
				min={0.2}
				max={4}
				step={0.05}
				value={settings.size}
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="Force"
				min={0}
				max={3}
				step={0.05}
				value={settings.force}
				onChange={(v) => demo.updateProp('force', v)}
			/>
			<PreviewSlider
				title="Swirl"
				min={0}
				max={40}
				step={0.5}
				value={settings.swirl}
				onChange={(v) => demo.updateProp('swirl', v)}
			/>
			<PreviewSlider
				title="Trail"
				min={0.2}
				max={5}
				step={0.05}
				value={settings.trail}
				onChange={(v) => demo.updateProp('trail', v)}
			/>
			<PreviewSlider
				title="Momentum"
				min={0.2}
				max={5}
				step={0.05}
				value={settings.momentum}
				onChange={(v) => demo.updateProp('momentum', v)}
			/>
			<PreviewSlider
				title="Shading"
				min={0}
				max={1}
				step={0.01}
				value={settings.shading}
				onChange={(v) => demo.updateProp('shading', v)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.01}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>
			<PreviewSwitch title="Rainbow" isChecked={settings.rainbow} onChange={(v) => demo.updateProp('rainbow', v)} />
			<PreviewSwitch
				title="Click Splash"
				isChecked={settings.clickSplash}
				onChange={(v) => demo.updateProp('clickSplash', v)}
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
				title="Contained"
				isChecked={settings.contained}
				onChange={(v) => demo.updateProp('contained', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

{#if !settings.contained}
	{#key key}
		<SplashCursor {theme} {...componentProps} colors={shown} />
	{/key}
{/if}
