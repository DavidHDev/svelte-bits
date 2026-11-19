<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorList from '$lib/components/docs/preview/PreviewColorList.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import GradientText from '$lib/components/library/TextAnimations/GradientText/GradientText.svelte';
	import source from '$lib/components/library/TextAnimations/GradientText/GradientText.svelte?raw';

	type Variant = 'linear' | 'flow' | 'conic';

	const DEFAULT_PROPS = {
		colors: ['#FF3E00', '#FFB089', '#FF8A4C'],
		animationSpeed: 8,
		variant: 'linear' as Variant,
		angle: 90,
		scale: 3,
		yoyo: true,
		glow: 0,
		showBorder: false,
		borderWidth: 1.5,
		pauseOnHover: false,
		followPointer: false
	};

	const VARIANT_OPTIONS = [
		{ value: 'linear', label: 'Linear' },
		{ value: 'flow', label: 'Flow' },
		{ value: 'conic', label: 'Conic' }
	];

	const propData: PropRow[] = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'The text to fill with the gradient.' },
		{
			name: 'colors',
			type: 'string[]',
			default: `["#FF3E00", "#FFB089", "#FF8A4C"]`,
			description: 'Colors of the gradient, in order. The first color is repeated at the end so loops stay seamless.'
		},
		{
			name: 'animationSpeed',
			type: 'number',
			default: '8',
			description: 'Seconds for one full cycle of the animation.'
		},
		{
			name: 'variant',
			type: "'linear' | 'flow' | 'conic'",
			default: "'linear'",
			description:
				'How the colors move. Linear slides a gradient through the text, flow drifts soft blobs of color around like a living mesh gradient and conic swings colors around the center.'
		},
		{
			name: 'angle',
			type: 'number',
			default: '90',
			description: 'Direction of the gradient in degrees. 90 runs left to right, 180 top to bottom.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '3',
			description: 'How broad the colors are. Higher values show fewer colors at once in longer, calmer bands.'
		},
		{
			name: 'yoyo',
			type: 'boolean',
			default: 'true',
			description: 'Eases back and forth instead of scrolling the gradient in one direction forever.'
		},
		{
			name: 'glow',
			type: 'number',
			default: '0',
			description: 'A soft bloom of the gradient colors around the letters, from 0 to 1.'
		},
		{
			name: 'showBorder',
			type: 'boolean',
			default: 'false',
			description: 'Wraps the text in a pill with an animated gradient outline that works on any background.'
		},
		{ name: 'borderWidth', type: 'number', default: '1.5', description: 'Thickness of the outline in px.' },
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Holds the colors still while the pointer is over the text.'
		},
		{
			name: 'followPointer',
			type: 'boolean',
			default: 'false',
			description: 'While hovered, the colors are drawn toward the pointer.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root element.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root element.' }
	];

	const usage = `<script lang="ts">
  import GradientText from '$lib/components/GradientText.svelte';
</${'script'}>

<GradientText
  colors={['#FF3E00', '#FFB089', '#FF8A4C']}
  animationSpeed={8}
  variant="flow"
  glow={0.4}
>
  Add a splash of color!
</GradientText>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
</script>

<TabsLayout propsState={demo} componentName="GradientText" {usage} {source} {propData} dependencies={[]}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; min-height: 400px;">
			<div style="font-size: 3rem; font-weight: 600; text-align: center; padding: 0 1rem;">
				<GradientText {...settings}>Gradient Magic</GradientText>
			</div>
		</div>

		<Customize>
			<PreviewColorList title="Colors" colors={settings.colors} onChange={(v) => demo.updateProp('colors', v)} />

			<PreviewSelect
				title="Variant"
				options={VARIANT_OPTIONS}
				value={settings.variant}
				onChange={(v) => demo.updateProp('variant', v as Variant)}
			/>

			<PreviewSlider
				title="Animation Speed"
				min={1}
				max={20}
				step={0.5}
				value={settings.animationSpeed}
				valueUnit="s"
				onChange={(v) => demo.updateProp('animationSpeed', v)}
			/>

			<PreviewSlider
				title="Angle"
				min={0}
				max={360}
				step={5}
				value={settings.angle}
				valueUnit="°"
				onChange={(v) => demo.updateProp('angle', v)}
			/>

			<PreviewSlider
				title="Scale"
				min={1}
				max={6}
				step={0.25}
				value={settings.scale}
				onChange={(v) => demo.updateProp('scale', v)}
			/>

			<PreviewSlider
				title="Glow"
				min={0}
				max={1}
				step={0.05}
				value={settings.glow}
				onChange={(v) => demo.updateProp('glow', v)}
			/>

			<PreviewSlider
				title="Border Width"
				min={0.5}
				max={4}
				step={0.5}
				value={settings.borderWidth}
				valueUnit="px"
				onChange={(v) => demo.updateProp('borderWidth', v)}
			/>

			<PreviewSwitch title="Yoyo" isChecked={settings.yoyo} onChange={(v) => demo.updateProp('yoyo', v)} />

			<PreviewSwitch
				title="Show Border"
				isChecked={settings.showBorder}
				onChange={(v) => demo.updateProp('showBorder', v)}
			/>

			<PreviewSwitch
				title="Pause on Hover"
				isChecked={settings.pauseOnHover}
				onChange={(v) => demo.updateProp('pauseOnHover', v)}
			/>

			<PreviewSwitch
				title="Follow Pointer"
				isChecked={settings.followPointer}
				onChange={(v) => demo.updateProp('followPointer', v)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
