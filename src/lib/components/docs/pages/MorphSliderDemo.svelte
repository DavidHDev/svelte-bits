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
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import MorphSlider, { type MorphTransition } from '$lib/components/library/Components/MorphSlider/MorphSlider.svelte';
	import source from '$lib/components/library/Components/MorphSlider/MorphSlider.svelte?raw';

	const DEMO_ITEMS = [
		{
			image: 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=1600&auto=format&fit=crop',
			caption: 'One'
		},
		{
			image: 'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=1600&auto=format&fit=crop',
			caption: 'Two'
		},
		{
			image: 'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=1600&auto=format&fit=crop',
			caption: 'Three'
		},
		{
			image: 'https://images.unsplash.com/photo-1781242629922-6f39cc3671cd?q=80&w=1600&auto=format&fit=crop',
			caption: 'Four'
		}
	];

	const TRANSITION_OPTIONS = [
		{ value: 'melt', label: 'Melt' },
		{ value: 'ripple', label: 'Ripple' },
		{ value: 'shear', label: 'Shear' },
		{ value: 'swirl', label: 'Swirl' }
	];

	const EASE_OPTIONS = [
		{ value: 'power2.inOut', label: 'Smooth (power2.inOut)' },
		{ value: 'power3.out', label: 'Expo Out (power3.out)' },
		{ value: 'expo.inOut', label: 'Expo InOut' },
		{ value: 'none', label: 'Linear' }
	];

	const DEFAULT_PROPS = {
		transition: 'melt' as MorphTransition,
		overlayColor: '#05060a',
		duration: 1.1,
		ease: 'power2.inOut',
		intensity: 0.55,
		scale: 2.4,
		aberration: 0.35,
		drift: 0.4,
		autoplay: false,
		autoplayDelay: 4,
		loop: true,
		radius: 16,
		showCaptions: true,
		showControls: true,
		showIndicators: true
	};

	const propData: PropRow[] = [
		{
			name: 'items',
			type: 'Array<{ image: string; caption?: string }>',
			default: '[...]',
			description: 'Slides to morph between. Each item is an image URL with an optional caption.'
		},
		{ name: 'startIndex', type: 'number', default: '0', description: 'Index of the slide shown on mount.' },
		{
			name: 'transition',
			type: '"melt" | "ripple" | "shear" | "swirl"',
			default: '"melt"',
			description: 'Character of the GPU displacement morph between slides.'
		},
		{ name: 'duration', type: 'number', default: '1.1', description: 'Length of a full transition in seconds.' },
		{
			name: 'ease',
			type: 'string',
			default: '"power2.inOut"',
			description: 'GSAP easing curve used to drive the transition progress.'
		},
		{
			name: 'intensity',
			type: 'number',
			default: '0.55',
			description: 'Strength of the displacement — how far the images warp during the morph.'
		},
		{
			name: 'scale',
			type: 'number',
			default: '2.4',
			description: 'Frequency of the procedural noise field (affects the Melt transition most).'
		},
		{
			name: 'aberration',
			type: 'number',
			default: '0.35',
			description: 'Amount of RGB split that peaks mid-transition and resolves to zero.'
		},
		{
			name: 'drift',
			type: 'number',
			default: '0.4',
			description: 'Idle drift / breathing applied to the current image so it is never fully static.'
		},
		{
			name: 'autoplay',
			type: 'boolean',
			default: 'false',
			description: 'Advance slides automatically; pauses on hover.'
		},
		{
			name: 'autoplayDelay',
			type: 'number',
			default: '4',
			description: 'Seconds each slide holds before autoplay advances.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'true',
			description: 'Wrap around from the last slide back to the first.'
		},
		{ name: 'radius', type: 'number', default: '16', description: 'Corner radius of the slider in pixels.' },
		{
			name: 'overlayColor',
			type: 'string',
			default: '"#000000"',
			description: 'Tint used for the subtle edge vignette over the images.'
		},
		{
			name: 'showCaptions',
			type: 'boolean',
			default: 'true',
			description: 'Show slide captions that animate in with each transition.'
		},
		{
			name: 'showControls',
			type: 'boolean',
			default: 'true',
			description: 'Show the previous / next arrow buttons.'
		},
		{ name: 'showIndicators', type: 'boolean', default: 'true', description: 'Show the slide indicator dots.' },
		{ name: 'class', type: 'string', default: '""', description: 'Additional CSS classes for the outer wrapper.' }
	];

	const usage = `<script lang="ts">
  import MorphSlider from '$lib/components/MorphSlider.svelte';

  const items = [
    { image: 'https://images.unsplash.com/photo-1782977389500-dd7adad33ebe?q=80&w=1600&auto=format&fit=crop', caption: 'One' },
    { image: 'https://images.unsplash.com/photo-1781499455083-6ccc3beb20cd?q=80&w=1600&auto=format&fit=crop', caption: 'Two' },
    { image: 'https://images.unsplash.com/photo-1776394254711-4a0d7345269a?q=80&w=1600&auto=format&fit=crop', caption: 'Three' }
  ];
</${'script'}>

<div style="height: 500px; position: relative;">
  <MorphSlider
    {items}
    transition="melt"
    intensity={0.55}
    aberration={0.35}
    drift={0.4}
    autoplay
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
</script>

<TabsLayout propsState={demo} componentName="MorphSlider" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			<MorphSlider {...settings} items={DEMO_ITEMS} />
		</div>

		<Customize>
			<PreviewSelect
				title="Transition"
				options={TRANSITION_OPTIONS}
				value={settings.transition}
				onChange={(v) => demo.updateProp('transition', v as MorphTransition)}
			/>
			<PreviewColorPickerCustom
				title="Overlay"
				color={settings.overlayColor}
				onChange={(v) => demo.updateProp('overlayColor', v)}
			/>
			<PreviewSelect
				title="Ease"
				options={EASE_OPTIONS}
				value={settings.ease}
				onChange={(v) => demo.updateProp('ease', v as string)}
			/>
			<PreviewSlider
				title="Duration"
				min={0.4}
				max={2.5}
				step={0.1}
				valueUnit="s"
				value={settings.duration}
				onChange={(v) => demo.updateProp('duration', v)}
			/>
			<PreviewSlider
				title="Intensity"
				min={0}
				max={1.2}
				step={0.05}
				value={settings.intensity}
				onChange={(v) => demo.updateProp('intensity', v)}
			/>
			<PreviewSlider
				title="Noise Scale"
				min={0.5}
				max={6}
				step={0.1}
				value={settings.scale}
				onChange={(v) => demo.updateProp('scale', v)}
			/>
			<PreviewSlider
				title="Aberration"
				min={0}
				max={1}
				step={0.05}
				value={settings.aberration}
				onChange={(v) => demo.updateProp('aberration', v)}
			/>
			<PreviewSlider
				title="Drift"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.drift}
				onChange={(v) => demo.updateProp('drift', v)}
			/>
			<PreviewSlider
				title="Autoplay Delay"
				min={1.5}
				max={8}
				step={0.5}
				valueUnit="s"
				value={settings.autoplayDelay}
				onChange={(v) => demo.updateProp('autoplayDelay', v)}
			/>
			<PreviewSlider
				title="Radius"
				min={0}
				max={40}
				step={1}
				valueUnit="px"
				value={settings.radius}
				onChange={(v) => demo.updateProp('radius', v)}
			/>
			<PreviewSwitch title="Autoplay" isChecked={settings.autoplay} onChange={(v) => demo.updateProp('autoplay', v)} />
			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(v) => demo.updateProp('loop', v)} />
			<PreviewSwitch
				title="Captions"
				isChecked={settings.showCaptions}
				onChange={(v) => demo.updateProp('showCaptions', v)}
			/>
			<PreviewSwitch
				title="Controls"
				isChecked={settings.showControls}
				onChange={(v) => demo.updateProp('showControls', v)}
			/>
			<PreviewSwitch
				title="Indicators"
				isChecked={settings.showIndicators}
				onChange={(v) => demo.updateProp('showIndicators', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['ogl', 'gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
