<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import RippleDistortion, {
		type RippleQuality,
		type RippleTrigger
	} from '$lib/components/library/Animations/RippleDistortion/RippleDistortion.svelte';
	import source from '$lib/components/library/Animations/RippleDistortion/RippleDistortion.svelte?raw';

	const DEFAULT_PROPS = {
		brushSize: 150,
		strength: 0.2,
		swirl: 1,
		rings: 4,
		spread: 5,
		fade: 3,
		spacing: 15,
		dispersion: 0,
		glint: 0,
		tint: '#FF8A4C',
		tintAmount: 0.1,
		grayscale: true,
		highlightColor: '#ffffff',
		trigger: 'hover' as RippleTrigger,
		clickStrength: 2,
		quality: 'low' as RippleQuality,
		enabled: true
	};

	const triggerOptions = [
		{ label: 'Hover', value: 'hover' },
		{ label: 'Click', value: 'click' },
		{ label: 'Both', value: 'both' }
	];

	const qualityOptions = [
		{ label: 'Low', value: 'low' },
		{ label: 'Medium', value: 'medium' },
		{ label: 'High', value: 'high' }
	];

	const propData: PropRow[] = [
		{
			name: 'src',
			type: 'string',
			default: "'https://images.unsplash.com/...'",
			description: 'Image URL the ripples distort. Cover fitted to the container.'
		},
		{
			name: 'brushSize',
			type: 'number',
			default: '150',
			description: 'Diameter of each ripple the pointer lays down, in px.'
		},
		{
			name: 'strength',
			type: 'number',
			default: '0.2',
			description: 'How far the image is pushed, as a fraction of its size.'
		},
		{
			name: 'swirl',
			type: 'number',
			default: '1',
			description:
				'Full turns the push direction sweeps through as a ripple builds. 0 gives a flat push, higher folds the image into caustics.'
		},
		{
			name: 'rings',
			type: 'number',
			default: '4',
			description: 'Concentric swells inside each ripple. 0 is a single plain blob.'
		},
		{
			name: 'spread',
			type: 'number',
			default: '5',
			description: 'How many times its own size a ripple grows to before it dies.'
		},
		{ name: 'fade', type: 'number', default: '3', description: 'How long a ripple survives, in seconds.' },
		{
			name: 'spacing',
			type: 'number',
			default: '15',
			description: 'Pointer travel between ripples, in px. Higher leaves a sparser trail.'
		},
		{
			name: 'dispersion',
			type: 'number',
			default: '0',
			description: 'Chromatic split between the red and blue channels as they refract.'
		},
		{ name: 'glint', type: 'number', default: '0', description: 'Sheen riding the shoulders of each ripple.' },
		{ name: 'tint', type: 'string', default: '#FF8A4C', description: 'Colour the disturbed water takes on.' },
		{
			name: 'tintAmount',
			type: 'number',
			default: '0.1',
			description: 'How strongly the tint colours the disturbed water.'
		},
		{ name: 'highlightColor', type: 'string', default: '#ffffff', description: 'Colour of the sheen.' },
		{
			name: 'grayscale',
			type: 'boolean',
			default: 'true',
			description: 'Drain the colour out of the image so the folds read on tone alone.'
		},
		{
			name: 'trigger',
			type: "'hover' | 'click' | 'both'",
			default: "'hover'",
			description: 'What disturbs the surface: motion, clicks, or both.'
		},
		{
			name: 'clickStrength',
			type: 'number',
			default: '2',
			description: 'How much larger a click ripple starts than a hover one.'
		},
		{
			name: 'quality',
			type: "'low' | 'medium' | 'high'",
			default: "'low'",
			description: 'Resolution of the displacement buffer. Lower trades crispness for fill rate.'
		},
		{ name: 'enabled', type: 'boolean', default: 'true', description: 'Toggle the effect on or off.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra classes on the container.' }
	];

	const usage = `<script lang="ts">
  import RippleDistortion from '$lib/components/RippleDistortion.svelte';
</${'script'}>

<div style="width: 600px; height: 400px;">
  <RippleDistortion
    src="/hero.jpg"
    brushSize={150}
    strength={0.2}
    swirl={1}
    rings={4}
    grayscale
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	let key = $state(0);
</script>

<TabsLayout propsState={demo} componentName="RippleDistortion" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<div class="relative h-full w-full">
				{#key `${key}-${settings.quality}`}
					<RippleDistortion {...settings} />
				{/key}
			</div>
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSlider
				title="Brush Size"
				min={40}
				max={260}
				step={5}
				value={settings.brushSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('brushSize', v)}
			/>
			<PreviewSlider
				title="Strength"
				min={0.01}
				max={0.3}
				step={0.005}
				value={settings.strength}
				onChange={(v) => demo.updateProp('strength', v)}
			/>
			<PreviewSlider
				title="Swirl"
				min={0}
				max={3}
				step={0.05}
				value={settings.swirl}
				onChange={(v) => demo.updateProp('swirl', v)}
			/>
			<PreviewSlider
				title="Rings"
				min={0}
				max={5}
				step={0.25}
				value={settings.rings}
				onChange={(v) => demo.updateProp('rings', v)}
			/>
			<PreviewSlider
				title="Spread"
				min={1}
				max={10}
				step={0.25}
				value={settings.spread}
				onChange={(v) => demo.updateProp('spread', v)}
			/>
			<PreviewSlider
				title="Fade"
				min={0.5}
				max={5}
				step={0.1}
				value={settings.fade}
				valueUnit="s"
				onChange={(v) => demo.updateProp('fade', v)}
			/>
			<PreviewSlider
				title="Spacing"
				min={1}
				max={40}
				step={1}
				value={settings.spacing}
				valueUnit="px"
				onChange={(v) => demo.updateProp('spacing', v)}
			/>
			<PreviewSlider
				title="Click Strength"
				min={1}
				max={4}
				step={0.1}
				value={settings.clickStrength}
				onChange={(v) => demo.updateProp('clickStrength', v)}
			/>

			<PreviewSlider
				title="Dispersion"
				min={0}
				max={1}
				step={0.05}
				value={settings.dispersion}
				onChange={(v) => demo.updateProp('dispersion', v)}
			/>
			<PreviewSlider
				title="Glint"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.glint}
				onChange={(v) => demo.updateProp('glint', v)}
			/>
			<PreviewSlider
				title="Tint Amount"
				min={0}
				max={0.6}
				step={0.02}
				value={settings.tintAmount}
				onChange={(v) => demo.updateProp('tintAmount', v)}
			/>
			<PreviewColorPickerCustom title="Tint" color={settings.tint} onChange={(v) => demo.updateProp('tint', v)} />
			<PreviewColorPickerCustom
				title="Highlight"
				color={settings.highlightColor}
				onChange={(v) => demo.updateProp('highlightColor', v)}
			/>

			<PreviewSelect
				title="Trigger"
				options={triggerOptions}
				value={settings.trigger}
				onChange={(v) => demo.updateProp('trigger', v as RippleTrigger)}
			/>
			<PreviewSelect
				title="Quality"
				options={qualityOptions}
				value={settings.quality}
				onChange={(v) => demo.updateProp('quality', v as RippleQuality)}
			/>
			<PreviewSwitch
				title="Grayscale"
				isChecked={settings.grayscale}
				onChange={(v) => demo.updateProp('grayscale', v)}
			/>
			<PreviewSwitch title="Enabled" isChecked={settings.enabled} onChange={(v) => demo.updateProp('enabled', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['ogl']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
