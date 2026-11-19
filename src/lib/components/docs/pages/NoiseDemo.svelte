<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import Noise, { type NoiseBlendMode } from '$lib/components/library/Animations/Noise/Noise.svelte';
	import source from '$lib/components/library/Animations/Noise/Noise.svelte?raw';
	import { DEFAULT_PROPS, PRESET_OPTIONS, presetProps, type NoiseScene } from './presets/Noise';

	const PHOTO = 'https://images.unsplash.com/photo-1762846818262-33c197852fa8?w=1600&q=80&auto=format&fit=crop';

	const SCENES: Record<NoiseScene, { background: string }> = {
		photo: { background: `center / cover no-repeat url("${PHOTO}")` },
		studio: {
			background:
				'radial-gradient(70% 90% at 50% 34%, #a29b92 0%, #7a746d 30%, #4b4743 62%, #262422 88%, #1c1b1a 100%)'
		},
		dark: { background: '#0b0b0d' },
		paper: { background: '#f3efe6' }
	};

	const BLEND_OPTIONS = [
		{ value: 'normal', label: 'Normal' },
		{ value: 'overlay', label: 'Overlay' },
		{ value: 'soft-light', label: 'Soft Light' },
		{ value: 'multiply', label: 'Multiply' },
		{ value: 'screen', label: 'Screen' },
		{ value: 'difference', label: 'Difference' }
	];

	const propData: PropRow[] = [
		{ name: 'opacity', type: 'number', default: '0.2', description: 'Strength of the grain, from 0 to 1.' },
		{
			name: 'size',
			type: 'number',
			default: '1',
			description: 'Size of each grain in CSS pixels. 0.5 is one device pixel on retina screens.'
		},
		{
			name: 'fps',
			type: 'number',
			default: '24',
			description: 'How many times per second the grain changes. 0 keeps it still, like a paper texture.'
		},
		{
			name: 'blendMode',
			type: "'normal' | 'overlay' | 'soft-light' | 'multiply' | 'screen' | 'difference'",
			default: "'overlay'",
			description:
				'How the grain mixes with what is underneath. Overlay and soft light add texture without graying the image.'
		},
		{
			name: 'contrast',
			type: 'number',
			default: '0.6',
			description: 'From soft, fine grain at 0 to harsh, punchy grain at 1.'
		},
		{
			name: 'dust',
			type: 'number',
			default: '0',
			description: 'Specks, hairs and fibers that flicker over the frame like dust on a film print, from 0 to 1.'
		},
		{
			name: 'scratches',
			type: 'number',
			default: '0',
			description: 'How often thin vertical scratches run down the frame for a few seconds, from 0 to 1.'
		},
		{ name: 'colored', type: 'boolean', default: 'false', description: 'Uses colored grain instead of gray.' },
		{
			name: 'scanlines',
			type: 'number',
			default: '0',
			description: 'Adds rolling horizontal lines, like an old screen, from 0 to 1.'
		},
		{
			name: 'flicker',
			type: 'number',
			default: '0',
			description: 'Makes the grain strength jump a little every frame, like a film projector.'
		},
		{
			name: 'fixed',
			type: 'boolean',
			default: 'false',
			description: 'Covers the whole viewport instead of the nearest positioned parent.'
		},
		{ name: 'zIndex', type: 'number', default: '-', description: 'Stacking order of the overlay.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the overlay.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the overlay.' }
	];

	const usage = `<script lang="ts">
  import Noise from '$lib/components/Noise.svelte';
</${'script'}>

<div style="position: relative; width: 100%; height: 500px;">
  <img src="/photo.jpg" alt="" style="width: 100%; height: 100%; object-fit: cover;" />
  <Noise
    opacity={0.2}
    size={1}
    fps={24}
    blendMode="overlay"
    contrast={0.6}
    colored={false}
    dust={0}
    scratches={0}
    scanlines={0}
    flicker={0}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, scene: _scene, ...rest } = settings;
		return rest;
	});
	const look = $derived(SCENES[settings.scene as NoiseScene] ?? SCENES.photo);

	const applyPreset = (value: string) => {
		demo.updateProps({ ...presetProps(value), preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="Noise"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'scene']}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 500px; padding: 0; overflow: hidden; background: {look.background};"
		>
			<Noise {...componentProps} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSlider
				title="Opacity"
				min={0}
				max={1}
				step={0.01}
				value={settings.opacity}
				onChange={(v) => demo.updateProp('opacity', v)}
			/>
			<PreviewSlider
				title="Size"
				min={0.5}
				max={4}
				step={0.5}
				value={settings.size}
				valueUnit="px"
				onChange={(v) => demo.updateProp('size', v)}
			/>
			<PreviewSlider
				title="FPS"
				min={0}
				max={60}
				step={1}
				value={settings.fps}
				onChange={(v) => demo.updateProp('fps', v)}
			/>
			<PreviewSelect
				title="Blend"
				options={BLEND_OPTIONS}
				value={settings.blendMode}
				onChange={(v) => demo.updateProp('blendMode', v as NoiseBlendMode)}
			/>
			<PreviewSlider
				title="Contrast"
				min={0}
				max={1}
				step={0.05}
				value={settings.contrast}
				onChange={(v) => demo.updateProp('contrast', v)}
			/>
			<PreviewSlider
				title="Dust"
				min={0}
				max={1}
				step={0.05}
				value={settings.dust}
				onChange={(v) => demo.updateProp('dust', v)}
			/>
			<PreviewSlider
				title="Scratches"
				min={0}
				max={1}
				step={0.05}
				value={settings.scratches}
				onChange={(v) => demo.updateProp('scratches', v)}
			/>
			<PreviewSlider
				title="Scanlines"
				min={0}
				max={1}
				step={0.05}
				value={settings.scanlines}
				onChange={(v) => demo.updateProp('scanlines', v)}
			/>
			<PreviewSlider
				title="Flicker"
				min={0}
				max={1}
				step={0.05}
				value={settings.flicker}
				onChange={(v) => demo.updateProp('flicker', v)}
			/>
			<PreviewSwitch title="Colored" isChecked={settings.colored} onChange={(v) => demo.updateProp('colored', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
