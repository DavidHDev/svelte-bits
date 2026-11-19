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
	import { colorModeValue } from '$lib/theme.svelte';
	import GlareHover, {
		type GlareHoverMode,
		type GlareHoverVariant
	} from '$lib/components/library/Animations/GlareHover/GlareHover.svelte';
	import source from '$lib/components/library/Animations/GlareHover/GlareHover.svelte?raw';

	const LOOK = {
		mode: 'hover' as GlareHoverMode,
		variant: 'streak' as GlareHoverVariant,
		glareOpacity: 0.5,
		glareSize: 30,
		softness: 0.6,
		glareAngle: -45,
		transitionDuration: 650,
		interval: 3
	};

	type Look = typeof LOOK;

	const PRESETS: Record<string, Look> = {
		sweep: { ...LOOK },
		twin: {
			...LOOK,
			variant: 'twin',
			glareOpacity: 0.6,
			glareSize: 40,
			softness: 0.4,
			glareAngle: -60,
			transitionDuration: 800
		},
		follow: {
			...LOOK,
			mode: 'follow',
			variant: 'sheen',
			glareOpacity: 0.45,
			glareSize: 55,
			softness: 0.8,
			glareAngle: -30
		},
		shine: {
			...LOOK,
			mode: 'loop',
			glareOpacity: 0.7,
			glareSize: 16,
			softness: 0.3,
			glareAngle: -60,
			transitionDuration: 900,
			interval: 2.5
		}
	};

	const DEFAULT_PROPS = {
		preset: 'sweep',
		...LOOK,
		glareColor: '#ffffff',
		blendMode: 'screen',
		rimGlint: true,
		playOnce: false,
		intro: false
	};

	const PRESET_OPTIONS = [
		{ value: 'sweep', label: 'Sweep' },
		{ value: 'twin', label: 'Twin' },
		{ value: 'follow', label: 'Follow' },
		{ value: 'shine', label: 'Shine' }
	];

	const MODE_OPTIONS = [
		{ value: 'hover', label: 'Hover' },
		{ value: 'follow', label: 'Follow' },
		{ value: 'loop', label: 'Loop' },
		{ value: 'click', label: 'Click' }
	];

	const VARIANT_OPTIONS = [
		{ value: 'streak', label: 'Streak' },
		{ value: 'twin', label: 'Twin' },
		{ value: 'sheen', label: 'Sheen' }
	];

	const BLEND_OPTIONS = [
		{ value: 'screen', label: 'Screen' },
		{ value: 'normal', label: 'Normal' },
		{ value: 'overlay', label: 'Overlay' },
		{ value: 'soft-light', label: 'Soft Light' }
	];

	const propData: PropRow[] = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'The content the glare passes over.' },
		{
			name: 'mode',
			type: "'hover' | 'follow' | 'loop' | 'click'",
			default: "'hover'",
			description: 'Sweep on hover, follow the cursor, shine on a timer, or sweep on click.'
		},
		{
			name: 'variant',
			type: "'streak' | 'twin' | 'sheen'",
			default: "'streak'",
			description: 'Shape of the glare: one bright streak, a double streak like glass, or a soft wide sheen.'
		},
		{ name: 'glareColor', type: 'string', default: "'#ffffff'", description: 'Color of the glare. Any CSS color.' },
		{ name: 'glareOpacity', type: 'number', default: '0.5', description: 'Brightness of the glare, from 0 to 1.' },
		{
			name: 'glareSize',
			type: 'number',
			default: '30',
			description: "Width of the glare as a percentage of the element's diagonal."
		},
		{ name: 'softness', type: 'number', default: '0.6', description: 'How soft the core of the glare is, from 0 to 1.' },
		{ name: 'glareAngle', type: 'number', default: '-45', description: 'Direction the glare travels, in degrees.' },
		{
			name: 'blendMode',
			type: 'string',
			default: "'screen'",
			description: 'How the glare mixes with the content: screen, normal, overlay or soft-light.'
		},
		{
			name: 'rimGlint',
			type: 'boolean',
			default: 'true',
			description: 'Lets the edge catch the light where the glare crosses it.'
		},
		{
			name: 'transitionDuration',
			type: 'number',
			default: '650',
			description: 'How long one sweep takes, in milliseconds.'
		},
		{ name: 'interval', type: 'number', default: '3', description: 'Seconds between shines in loop mode.' },
		{
			name: 'playOnce',
			type: 'boolean',
			default: 'false',
			description: 'In hover mode, sweeps only on the way in instead of again on the way out.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'false',
			description: 'Sweeps once when the element first scrolls into view.'
		},
		{ name: 'width', type: 'string', default: "'auto'", description: 'Width of the element.' },
		{ name: 'height', type: 'string', default: "'auto'", description: 'Height of the element.' },
		{ name: 'background', type: 'string', default: "'transparent'", description: 'Background of the element.' },
		{ name: 'borderRadius', type: 'string', default: "'10px'", description: 'Corner radius of the element.' },
		{ name: 'borderColor', type: 'string', default: "'transparent'", description: 'Border color of the element.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the element.' },
		{ name: 'style', type: 'string', default: "''", description: 'Inline styles for the element.' }
	];

	const usage = `<script lang="ts">
  import GlareHover from '$lib/components/GlareHover.svelte';
</${'script'}>

<GlareHover
  width="360px"
  height="240px"
  borderRadius="20px"
  mode="hover"
  variant="streak"
  glareColor="#ffffff"
  glareOpacity={0.5}
  glareSize={30}
  softness={0.6}
  glareAngle={-45}
  blendMode="screen"
  rimGlint={true}
  transitionDuration={650}
>
  <img src="/photo.jpg" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
</GlareHover>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	const photo = $derived(`/assets/demo/${colorModeValue('light', 'dark') === 'light' ? 'day' : 'night'}-sky.webp`);
	const computedProps = { width: '360px', height: '240px', borderRadius: '20px' };
	let key = $state(0);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(LOOK).map((name) => [name, demo.defaultProps[name as keyof Look]])
		) as Partial<Look>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="GlareHover"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 460px; overflow: hidden;">
			{#key key}
				<GlareHover width="min(360px, 82vw)" borderRadius="20px" {...componentProps}>
					<img
						src={photo}
						alt=""
						draggable="false"
						style="width: 100%; aspect-ratio: 3 / 2; object-fit: cover; display: block;"
					/>
				</GlareHover>
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Glare Color"
				color={settings.glareColor}
				onChange={(v) => demo.updateProp('glareColor', v)}
			/>
			<PreviewSelect
				title="Mode"
				options={MODE_OPTIONS}
				value={settings.mode}
				onChange={(v) => demo.updateProp('mode', v as GlareHoverMode)}
			/>
			<PreviewSelect
				title="Variant"
				options={VARIANT_OPTIONS}
				value={settings.variant}
				onChange={(v) => demo.updateProp('variant', v as GlareHoverVariant)}
			/>
			<PreviewSelect
				title="Blend"
				options={BLEND_OPTIONS}
				value={settings.blendMode}
				onChange={(v) => demo.updateProp('blendMode', v)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.glareOpacity}
				onChange={(v) => demo.updateProp('glareOpacity', v)}
			/>
			<PreviewSlider
				title="Size"
				min={5}
				max={80}
				step={1}
				value={settings.glareSize}
				valueUnit="%"
				onChange={(v) => demo.updateProp('glareSize', v)}
			/>
			<PreviewSlider
				title="Softness"
				min={0}
				max={1}
				step={0.05}
				value={settings.softness}
				onChange={(v) => demo.updateProp('softness', v)}
			/>
			<PreviewSlider
				title="Angle"
				min={-90}
				max={90}
				step={1}
				value={settings.glareAngle}
				valueUnit="°"
				onChange={(v) => demo.updateProp('glareAngle', v)}
			/>
			<PreviewSlider
				title="Duration"
				min={200}
				max={2000}
				step={50}
				value={settings.transitionDuration}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('transitionDuration', v)}
			/>
			{#if settings.mode === 'loop'}
				<PreviewSlider
					title="Interval"
					min={1}
					max={8}
					step={0.5}
					value={settings.interval}
					valueUnit="s"
					onChange={(v) => demo.updateProp('interval', v)}
				/>
			{/if}
			<PreviewSwitch
				title="Rim Glint"
				isChecked={settings.rimGlint}
				onChange={(v) => demo.updateProp('rimGlint', v)}
			/>
			{#if settings.mode === 'hover'}
				<PreviewSwitch
					title="Play Once"
					isChecked={settings.playOnce}
					onChange={(v) => demo.updateProp('playOnce', v)}
				/>
			{/if}
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
