<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import SpecularButton, {
		type SpecularButtonSize
	} from '$lib/components/library/Components/SpecularButton/SpecularButton.svelte';
	import source from '$lib/components/library/Components/SpecularButton/SpecularButton.svelte?raw';

	type Preset = 'glass' | 'pill' | 'crisp' | 'orbit';

	const GLASS = {
		radius: 18,
		thickness: 1.2,
		glow: 1,
		shineSize: 10,
		shineFade: 34,
		idleIntensity: 0.35,
		autoAnimate: false,
		speed: 0.35
	};

	const DEFAULT_PROPS = {
		preset: 'glass' as Preset,
		size: 'lg' as SpecularButtonSize,
		...GLASS,
		tint: '#ffffff',
		tintOpacity: 0.04,
		blur: 0,
		textColor: '#f5f5f5',
		lineColor: '#ffffff',
		baseColor: '#525252',
		intensity: 1,
		followMouse: true,
		proximity: 250,
		disabled: false
	};

	const PRESETS: Record<Preset, typeof GLASS> = {
		glass: GLASS,
		pill: { ...GLASS, radius: 40, thickness: 1.5, glow: 1.4, shineSize: 14, shineFade: 40 },
		crisp: { ...GLASS, radius: 12, thickness: 1, glow: 0, shineSize: 6, shineFade: 22, idleIntensity: 0.5 },
		orbit: { ...GLASS, autoAnimate: true, speed: 0.8 }
	};

	const PRESET_OPTIONS = [
		{ value: 'glass', label: 'Glass' },
		{ value: 'pill', label: 'Pill' },
		{ value: 'crisp', label: 'Crisp' },
		{ value: 'orbit', label: 'Orbit' }
	];

	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' }
	];

	const PAGE = { dark: '#14110E', light: '#ffffff' };

	const clampOpacity = (value: unknown) => Math.min(1, Math.max(0, Number(value) || 0));

	const luminance = (hex: string) => {
		const value = parseInt(hex.replace('#', '').padEnd(6, '0').slice(0, 6), 16);
		return (0.2126 * ((value >> 16) & 255) + 0.7152 * ((value >> 8) & 255) + 0.0722 * (value & 255)) / 255;
	};

	const propData = [
		{ name: 'children', type: 'Snippet', default: "'Get Started'", description: 'Button label or any content.' },
		{ name: 'size', type: "'sm' | 'md' | 'lg'", default: "'lg'", description: 'Padding and font size of the button.' },
		{
			name: 'radius',
			type: 'number',
			default: '18',
			description: 'Corner radius in px. Values past half the height make a pill.'
		},
		{ name: 'tint', type: 'string', default: "'#ffffff'", description: 'Color of the glass body.' },
		{
			name: 'tintOpacity',
			type: 'number',
			default: '0.04',
			description: 'How strongly the tint fills the body, from 0 for clear glass to 1 for a solid button.'
		},
		{ name: 'blur', type: 'number', default: '0', description: 'Blur of whatever sits behind the button, in px.' },
		{ name: 'textColor', type: 'string', default: "'#f5f5f5'", description: 'Color of the label.' },
		{ name: 'lineColor', type: 'string', default: "'#ffffff'", description: 'Color of the light on the edge.' },
		{
			name: 'baseColor',
			type: 'string',
			default: "'#525252'",
			description: 'Color of the thin edge line that stays visible under the light.'
		},
		{ name: 'intensity', type: 'number', default: '1', description: 'Brightness of the light on the edge.' },
		{
			name: 'idleIntensity',
			type: 'number',
			default: '0.35',
			description: 'How much of the light stays on when the cursor is away, from 0 to 1.'
		},
		{
			name: 'shineSize',
			type: 'number',
			default: '10',
			description: 'How much of the edge the light covers at full strength, in degrees around the button.'
		},
		{
			name: 'shineFade',
			type: 'number',
			default: '34',
			description: 'How far the light fades out past that, in degrees around the button.'
		},
		{ name: 'thickness', type: 'number', default: '1.2', description: 'Width of the lit edge in px.' },
		{
			name: 'glow',
			type: 'number',
			default: '1',
			description: 'Soft light around the lit edge and inside the glass. 0 keeps only the crisp line.'
		},
		{
			name: 'followMouse',
			type: 'boolean',
			default: 'true',
			description: 'Moves the light to the part of the edge nearest the cursor.'
		},
		{
			name: 'proximity',
			type: 'number',
			default: '250',
			description: 'Distance in px at which the light starts to follow the cursor and brighten.'
		},
		{
			name: 'autoAnimate',
			type: 'boolean',
			default: 'false',
			description: 'Keeps the light on and circling the edge whenever the cursor is away.'
		},
		{ name: 'speed', type: 'number', default: '0.35', description: 'How fast the light circles when autoAnimate is on.' },
		{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the button.' },
		{ name: 'onClick', type: '(event: MouseEvent) => void', default: '-', description: 'Click handler.' },
		{ name: 'type', type: "'button' | 'submit' | 'reset'", default: "'button'", description: 'Native button type.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the button.' },
		{ name: 'style', type: 'string | CSSProperties', default: '-', description: 'Inline styles for the button.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import SpecularButton from '$lib/components/SpecularButton.svelte';
${scriptClose}

<SpecularButton
  size="lg"
  radius={18}
  tint="#ffffff"
  tintOpacity={0.04}
  textColor="#f5f5f5"
  lineColor="#ffffff"
  baseColor="#525252"
  intensity={1}
  idleIntensity={0.35}
  shineSize={10}
  shineFade={34}
  thickness={1.2}
  glow={1}
  followMouse
  proximity={250}
  onClick={() => console.log('clicked')}
>
  Get Started
</SpecularButton>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived.by(() => {
		const { preset: _preset, ...rest } = demo.props;
		return rest;
	});
	const mode = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');

	const themed = $derived.by(() => {
		const { tint, tintOpacity, textColor, baseColor } = settings;
		const result: Partial<Pick<typeof DEFAULT_PROPS, 'tint' | 'tintOpacity' | 'textColor' | 'baseColor'>> = {};
		if (mode === 'light' && tint === DEFAULT_PROPS.tint) result.tint = '#18181b';
		if (mode === 'light' && tintOpacity === DEFAULT_PROPS.tintOpacity) result.tintOpacity = 1;
		const body = luminance(result.tint ?? tint);
		const opacity = clampOpacity(result.tintOpacity ?? tintOpacity);
		const bright = luminance(PAGE[mode]) * (1 - opacity) + body * opacity > 0.5;
		if (textColor === DEFAULT_PROPS.textColor && (bright || mode === 'light')) {
			result.textColor = bright ? '#18181b' : '#fafafa';
		}
		if (baseColor === DEFAULT_PROPS.baseColor && (bright || mode === 'light')) {
			result.baseColor = bright ? '#a8a29e' : '#44403c';
		}
		return result;
	});

	const shown = $derived({ ...settings, ...themed });

	const applyPreset = (value: string) => {
		demo.updateProps({ ...PRESETS[value as Preset], preset: value as Preset });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="SpecularButton"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	computedProps={themed}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 400px; overflow: hidden; display: flex; align-items: center; justify-content: center;"
		>
			<SpecularButton {...shown}>Get Started</SpecularButton>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={demo.props.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Light"
				color={shown.lineColor}
				onChange={(value) => demo.updateProp('lineColor', value)}
			/>
			<PreviewColorPickerCustom
				title="Edge"
				color={shown.baseColor}
				onChange={(value) => demo.updateProp('baseColor', value)}
			/>
			<PreviewColorPickerCustom title="Tint" color={shown.tint} onChange={(value) => demo.updateProp('tint', value)} />
			<PreviewColorPickerCustom
				title="Text"
				color={shown.textColor}
				onChange={(value) => demo.updateProp('textColor', value)}
			/>
			<PreviewSelect
				title="Size"
				options={SIZE_OPTIONS}
				value={shown.size}
				onChange={(value) => demo.updateProp('size', value as SpecularButtonSize)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={40}
				step={1}
				value={shown.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewSlider
				title="Tint Opacity"
				min={0}
				max={1}
				step={0.01}
				value={shown.tintOpacity}
				onChange={(value) => demo.updateProp('tintOpacity', value)}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={30}
				step={1}
				value={shown.blur}
				valueUnit="px"
				onChange={(value) => demo.updateProp('blur', value)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0}
				max={2}
				step={0.05}
				value={shown.intensity}
				onChange={(value) => demo.updateProp('intensity', value)}
			/>
			<PreviewSlider
				title="Idle Intensity"
				min={0}
				max={1}
				step={0.05}
				value={shown.idleIntensity}
				onChange={(value) => demo.updateProp('idleIntensity', value)}
			/>
			<PreviewSlider
				title="Shine Size"
				min={0}
				max={45}
				step={1}
				value={shown.shineSize}
				valueUnit="°"
				onChange={(value) => demo.updateProp('shineSize', value)}
			/>
			<PreviewSlider
				title="Shine Fade"
				min={0}
				max={90}
				step={1}
				value={shown.shineFade}
				valueUnit="°"
				onChange={(value) => demo.updateProp('shineFade', value)}
			/>
			<PreviewSlider
				title="Thickness"
				min={0.5}
				max={4}
				step={0.1}
				value={shown.thickness}
				valueUnit="px"
				onChange={(value) => demo.updateProp('thickness', value)}
			/>
			<PreviewSlider
				title="Glow"
				min={0}
				max={2}
				step={0.05}
				value={shown.glow}
				onChange={(value) => demo.updateProp('glow', value)}
			/>
			<PreviewSlider
				title="Proximity"
				min={50}
				max={500}
				step={10}
				value={shown.proximity}
				valueUnit="px"
				onChange={(value) => demo.updateProp('proximity', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0}
				max={2}
				step={0.05}
				value={shown.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSwitch
				title="Follow Mouse"
				isChecked={shown.followMouse}
				onChange={(value) => demo.updateProp('followMouse', value)}
			/>
			<PreviewSwitch
				title="Auto Animate"
				isChecked={shown.autoAnimate}
				onChange={(value) => demo.updateProp('autoAnimate', value)}
			/>
			<PreviewSwitch
				title="Disabled"
				isChecked={shown.disabled}
				onChange={(value) => demo.updateProp('disabled', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
