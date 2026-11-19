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
	import AccordionGallery from '$lib/components/library/Components/AccordionGallery/AccordionGallery.svelte';
	import source from '$lib/components/library/Components/AccordionGallery/AccordionGallery.svelte?raw';

	const ITEMS = [
		{ image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
		{ image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
		{ image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
		{ image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
		{ image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' }
	];

	const DEFAULT_PROPS = {
		defaultIndex: 2,
		accentColor: '#ffffff',
		overlayColor: '#0c0906',
		textColor: '#ffffff',
		grayscale: true,
		showLabels: true,
		duration: 0.6,
		ease: 'power3.out',
		parallax: 0.5,
		tilt: 8,
		stagger: 0.06,
		trigger: 'hover' as 'hover' | 'click',
		height: 460,
		gap: 10,
		radius: 16,
		expandRatio: 0.52,
		orientation: 'horizontal' as 'horizontal' | 'vertical'
	};

	const EASE_OPTIONS = [
		{ value: 'power2.inOut', label: 'power2.inOut' },
		{ value: 'power3.out', label: 'power3.out' },
		{ value: 'power4.out', label: 'power4.out' },
		{ value: 'expo.out', label: 'expo.out' },
		{ value: 'back.out', label: 'back.out' },
		{ value: 'sine.inOut', label: 'sine.inOut' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' }
	];

	const ORIENTATION_OPTIONS = [
		{ value: 'horizontal', label: 'Horizontal' },
		{ value: 'vertical', label: 'Vertical' }
	];

	const propData: PropRow[] = [
		{
			name: 'items',
			type: 'Array<{ image: string; label?: string; link?: string; alt?: string }>',
			default: '5 sample panels',
			description: 'The panels to render. Each needs an image, and optionally a label, link and alt text.'
		},
		{
			name: 'defaultIndex',
			type: 'number',
			default: '2',
			description: 'Index of the panel that is expanded on load, so the gallery never looks dead.'
		},
		{
			name: 'accentColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Colour of the caption accent bar and the focus ring.'
		},
		{
			name: 'overlayColor',
			type: 'string',
			default: '"#0c0906"',
			description: 'Colour used for the bottom legibility gradient and the dimming of collapsed panels.'
		},
		{
			name: 'textColor',
			type: 'string',
			default: '"#ffffff"',
			description: 'Colour of the caption text.'
		},
		{
			name: 'grayscale',
			type: 'boolean',
			default: 'true',
			description: 'Desaturate collapsed panels and restore full colour on the expanded one.'
		},
		{
			name: 'showLabels',
			type: 'boolean',
			default: 'true',
			description: 'Whether captions reveal on the expanded panel.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '0.6',
			description: 'Duration of the expand / collapse transition in seconds.'
		},
		{
			name: 'ease',
			type: 'string',
			default: '"power3.out"',
			description: 'GSAP easing used for every transition.'
		},
		{
			name: 'parallax',
			type: 'number',
			default: '0.5',
			description: 'Strength of the internal image drift as panels resize (0 disables it).'
		},
		{
			name: 'tilt',
			type: 'number',
			default: '8',
			description: 'Degrees of 3D rotation applied to collapsed panels, easing to flat on the open one.'
		},
		{
			name: 'stagger',
			type: 'number',
			default: '0.06',
			description: 'Delay between the caption bar and text reveal, in seconds.'
		},
		{
			name: 'trigger',
			type: '"hover" | "click"',
			default: '"hover"',
			description: 'How a panel expands on pointer devices. Focus and tap always expand too.'
		},
		{
			name: 'height',
			type: 'number',
			default: '460',
			description: 'Height of the row in pixels (width of the column when vertical).'
		},
		{
			name: 'gap',
			type: 'number',
			default: '10',
			description: 'Gap between panels in pixels.'
		},
		{
			name: 'radius',
			type: 'number',
			default: '16',
			description: 'Corner radius of each panel in pixels.'
		},
		{
			name: 'expandRatio',
			type: 'number',
			default: '0.52',
			description: 'Fraction of the row the expanded panel occupies (0.2 – 0.9).'
		},
		{
			name: 'orientation',
			type: '"horizontal" | "vertical"',
			default: '"horizontal"',
			description: 'Lay the accordion out as a row or a column.'
		}
	];

	const usage = `<script lang="ts">
  import AccordionGallery from '$lib/components/AccordionGallery.svelte';

  const items = [
    { image: 'https://picsum.photos/id/1015/900/1200', label: 'Canyon', link: '#' },
    { image: 'https://picsum.photos/id/1018/900/1200', label: 'Ridgeline', link: '#' },
    { image: 'https://picsum.photos/id/1039/900/1200', label: 'Falls', link: '#' },
    { image: 'https://picsum.photos/id/1043/900/1200', label: 'Harbour', link: '#' },
    { image: 'https://picsum.photos/id/1044/900/1200', label: 'Skyline', link: '#' }
  ];
</${'script'}>

<AccordionGallery
  {items}
  defaultIndex={2}
  expandRatio={0.52}
  trigger="hover"
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
</script>

<TabsLayout propsState={demo} componentName="AccordionGallery" {usage} {source} {propData}>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 560px; padding: 24px; overflow: hidden;">
			<AccordionGallery
				items={ITEMS}
				defaultIndex={settings.defaultIndex}
				accentColor={settings.accentColor}
				overlayColor={settings.overlayColor}
				textColor={settings.textColor}
				grayscale={settings.grayscale}
				showLabels={settings.showLabels}
				duration={settings.duration}
				ease={settings.ease}
				parallax={settings.parallax}
				tilt={settings.tilt}
				stagger={settings.stagger}
				trigger={settings.trigger}
				height={settings.height}
				gap={settings.gap}
				radius={settings.radius}
				expandRatio={settings.expandRatio}
				orientation={settings.orientation}
			/>
		</div>

		<Customize>
			<PreviewColorPickerCustom
				title="Accent Color"
				color={settings.accentColor}
				onChange={(v) => demo.updateProp('accentColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Overlay Color"
				color={settings.overlayColor}
				onChange={(v) => demo.updateProp('overlayColor', v)}
			/>
			<PreviewColorPickerCustom
				title="Text Color"
				color={settings.textColor}
				onChange={(v) => demo.updateProp('textColor', v)}
			/>

			<PreviewSlider
				title="Default Index"
				min={0}
				max={ITEMS.length - 1}
				step={1}
				value={settings.defaultIndex}
				onChange={(v) => demo.updateProp('defaultIndex', v)}
			/>

			<PreviewSwitch
				title="Grayscale"
				isChecked={settings.grayscale}
				onChange={(v) => demo.updateProp('grayscale', v)}
			/>
			<PreviewSwitch
				title="Show Labels"
				isChecked={settings.showLabels}
				onChange={(v) => demo.updateProp('showLabels', v)}
			/>

			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => demo.updateProp('trigger', v as 'hover' | 'click')}
			/>

			<PreviewSelect
				title="Ease"
				options={EASE_OPTIONS}
				value={settings.ease}
				onChange={(v) => demo.updateProp('ease', String(v))}
			/>

			<PreviewSlider
				title="Duration"
				min={0.2}
				max={1.2}
				step={0.05}
				value={settings.duration}
				valueUnit="s"
				onChange={(v) => demo.updateProp('duration', v)}
			/>

			<PreviewSlider
				title="Parallax"
				min={0}
				max={1.5}
				step={0.05}
				value={settings.parallax}
				onChange={(v) => demo.updateProp('parallax', v)}
			/>

			<PreviewSlider
				title="Tilt"
				min={0}
				max={20}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>

			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.15}
				step={0.01}
				value={settings.stagger}
				valueUnit="s"
				onChange={(v) => demo.updateProp('stagger', v)}
			/>

			<PreviewSelect
				title="Orientation"
				options={ORIENTATION_OPTIONS}
				value={settings.orientation}
				onChange={(v) => demo.updateProp('orientation', v as 'horizontal' | 'vertical')}
			/>

			<PreviewSlider
				title="Height"
				min={320}
				max={560}
				step={10}
				value={settings.height}
				valueUnit="px"
				onChange={(v) => demo.updateProp('height', v)}
			/>

			<PreviewSlider
				title="Expand Ratio"
				min={0.3}
				max={0.8}
				step={0.02}
				value={settings.expandRatio}
				onChange={(v) => demo.updateProp('expandRatio', v)}
			/>

			<PreviewSlider
				title="Gap"
				min={0}
				max={30}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('gap', v)}
			/>

			<PreviewSlider
				title="Radius"
				min={0}
				max={40}
				step={1}
				value={settings.radius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('radius', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
