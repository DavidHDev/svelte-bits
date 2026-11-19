<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import PixelSwap, {
		type PixelSwapPattern,
		type PixelSwapTrigger
	} from '$lib/components/library/Animations/PixelSwap/PixelSwap.svelte';
	import source from '$lib/components/library/Animations/PixelSwap/PixelSwap.svelte?raw';

	const LOOK = {
		pattern: 'pointer' as PixelSwapPattern,
		pixelSize: 48,
		gap: 0,
		pixelRadius: 0,
		pixelScale: 0,
		pixelSpin: 0,
		duration: 400,
		pixelDuration: 350,
		randomness: 0.2,
		bounce: 0.3
	};

	const DEFAULT_PROPS = {
		preset: 'pixels',
		...LOOK,
		trigger: 'hover' as PixelSwapTrigger,
		intro: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		pixels: {},
		dots: { pixelSize: 32, gap: 4, pixelRadius: 50, randomness: 0.3 },
		spin: { pixelSize: 64, pixelSpin: 90 },
		scatter: { pattern: 'random', pixelSize: 40, pixelScale: 0.35, duration: 600, randomness: 0 },
		blocks: { pixelSize: 96, gap: 8, pixelRadius: 20, bounce: 0.5 }
	};

	const PRESET_OPTIONS = [
		{ value: 'pixels', label: 'Pixels' },
		{ value: 'dots', label: 'Dots' },
		{ value: 'spin', label: 'Spin' },
		{ value: 'scatter', label: 'Scatter' },
		{ value: 'blocks', label: 'Blocks' }
	];

	const PATTERN_OPTIONS = [
		{ value: 'pointer', label: 'Pointer' },
		{ value: 'random', label: 'Random' },
		{ value: 'center', label: 'Center' },
		{ value: 'edges', label: 'Edges' },
		{ value: 'left-to-right', label: 'Left to Right' },
		{ value: 'right-to-left', label: 'Right to Left' },
		{ value: 'top-to-bottom', label: 'Top to Bottom' },
		{ value: 'bottom-to-top', label: 'Bottom to Top' },
		{ value: 'diagonal', label: 'Diagonal' },
		{ value: 'spiral', label: 'Spiral' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' }
	];

	const propData: PropRow[] = [
		{ name: 'firstContent', type: 'Snippet', default: '-', description: 'Content shown at rest.' },
		{ name: 'secondContent', type: 'Snippet', default: '-', description: 'Content that builds in pixel by pixel.' },
		{
			name: 'pattern',
			type: "'pointer' | 'random' | 'center' | 'edges' | 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top' | 'diagonal' | 'spiral'",
			default: "'pointer'",
			description: 'Order the pixels arrive in. Pointer starts the wave where the cursor enters, leaves or clicks.'
		},
		{
			name: 'pixelSize',
			type: 'number',
			default: '48',
			description: 'Edge length of each pixel in px. Grows automatically when the grid would pass 600 pixels.'
		},
		{ name: 'gap', type: 'number', default: '0', description: 'Space between pixels in px while they grow.' },
		{
			name: 'pixelRadius',
			type: 'number',
			default: '0',
			description: 'Corner rounding of the pixels while they grow, as a percentage. 50 starts them as dots.'
		},
		{
			name: 'pixelScale',
			type: 'number',
			default: '0',
			description: 'Size each pixel pops in at, from 0 to grow out of nothing to 0.9 for a hard pop.'
		},
		{ name: 'pixelSpin', type: 'number', default: '0', description: 'Degrees each pixel turns as it grows in.' },
		{ name: 'duration', type: 'number', default: '400', description: 'Time in ms the wave takes to cross the content.' },
		{ name: 'pixelDuration', type: 'number', default: '350', description: 'Time in ms a single pixel takes to grow.' },
		{
			name: 'randomness',
			type: 'number',
			default: '0.2',
			description: 'Noise mixed into the pattern, from 0 for a clean wave to 1 for a scatter.'
		},
		{
			name: 'bounce',
			type: 'number',
			default: '0.3',
			description: 'How far each pixel overshoots before it settles, from 0 to 1.'
		},
		{
			name: 'trigger',
			type: "'hover' | 'click' | 'none'",
			default: "'hover'",
			description: 'What starts the swap. With none, drive it with active.'
		},
		{ name: 'intro', type: 'boolean', default: 'true', description: 'Builds the first content in from pixels on mount.' },
		{ name: 'initialActive', type: 'boolean', default: 'false', description: 'Starts on the second content.' },
		{
			name: 'active',
			type: 'boolean',
			default: '-',
			description: 'Controls which content shows. Pair it with onActiveChange.'
		},
		{
			name: 'onActiveChange',
			type: '(active: boolean) => void',
			default: '-',
			description: 'Called when the trigger asks to swap.'
		},
		{ name: 'onComplete', type: '(active: boolean) => void', default: '-', description: 'Called when a swap finishes.' },
		{ name: 'aspectRatio', type: 'string', default: "'16 / 10'", description: 'Aspect ratio of the root.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root.' }
	];

	const usage = `<script lang="ts">
  import PixelSwap from '$lib/components/PixelSwap.svelte';
</${'script'}>

<div style="width: 560px;">
  <PixelSwap
    pattern="pointer"
    pixelSize={48}
    pixelRadius={0}
    duration={400}
    pixelDuration={350}
    randomness={0.2}
    bounce={0.3}
    trigger="hover"
    style="border-radius: 18px;"
  >
    {#snippet firstContent()}
      <img
        src="/assets/demo/day-sky.webp"
        alt=""
        style="width: 100%; height: 100%; object-fit: cover;"
      />
    {/snippet}
    {#snippet secondContent()}
      <img
        src="/assets/demo/night-sky.webp"
        alt=""
        style="width: 100%; height: 100%; object-fit: cover;"
      />
    {/snippet}
  </PixelSwap>
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	let key = $state(0);

	const applyPreset = (value: string) => {
		const defaults = demo.defaultProps;
		const base = Object.fromEntries(
			Object.keys(LOOK).map((name) => [name, defaults[name as keyof DemoProps]])
		) as Partial<DemoProps>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};
</script>

{#snippet dayPhoto()}
	<img
		src="/assets/demo/day-sky.webp"
		alt=""
		draggable="false"
		style="display: block; width: 100%; height: 100%; object-fit: cover;"
	/>
{/snippet}

{#snippet nightPhoto()}
	<img
		src="/assets/demo/night-sky.webp"
		alt=""
		draggable="false"
		style="display: block; width: 100%; height: 100%; object-fit: cover;"
	/>
{/snippet}

<TabsLayout propsState={demo} componentName="PixelSwap" {usage} {source} {propData} demoOnlyProps={['preset']}>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 460px; padding: 24px; display: flex; align-items: center; justify-content: center;"
		>
			<div style="width: 100%; max-width: 560px;">
				{#key key}
					<PixelSwap
						firstContent={dayPhoto}
						secondContent={nightPhoto}
						style="border-radius: 18px; cursor: {settings.trigger === 'click' ? 'pointer' : 'default'};"
						{...componentProps}
					/>
				{/key}
			</div>
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Pattern"
				options={PATTERN_OPTIONS}
				value={settings.pattern}
				onChange={(v) => demo.updateProp('pattern', v as PixelSwapPattern)}
			/>
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => demo.updateProp('trigger', v as PixelSwapTrigger)}
			/>
			<PreviewSlider
				title="Pixel Size"
				min={16}
				max={128}
				step={2}
				value={settings.pixelSize}
				valueUnit="px"
				onChange={(v) => demo.updateProp('pixelSize', v)}
			/>
			<PreviewSlider
				title="Gap"
				min={0}
				max={16}
				step={1}
				value={settings.gap}
				valueUnit="px"
				onChange={(v) => demo.updateProp('gap', v)}
			/>
			<PreviewSlider
				title="Pixel Radius"
				min={0}
				max={50}
				step={1}
				value={settings.pixelRadius}
				valueUnit="%"
				onChange={(v) => demo.updateProp('pixelRadius', v)}
			/>
			<PreviewSlider
				title="Pixel Scale"
				min={0}
				max={0.9}
				step={0.01}
				value={settings.pixelScale}
				onChange={(v) => demo.updateProp('pixelScale', v)}
			/>
			<PreviewSlider
				title="Pixel Spin"
				min={-180}
				max={180}
				step={5}
				value={settings.pixelSpin}
				valueUnit="°"
				onChange={(v) => demo.updateProp('pixelSpin', v)}
			/>
			<PreviewSlider
				title="Duration"
				min={0}
				max={1500}
				step={10}
				value={settings.duration}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('duration', v)}
			/>
			<PreviewSlider
				title="Pixel Duration"
				min={120}
				max={1200}
				step={10}
				value={settings.pixelDuration}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('pixelDuration', v)}
			/>
			<PreviewSlider
				title="Randomness"
				min={0}
				max={1}
				step={0.01}
				value={settings.randomness}
				onChange={(v) => demo.updateProp('randomness', v)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={0.8}
				step={0.01}
				value={settings.bounce}
				onChange={(v) => demo.updateProp('bounce', v)}
			/>
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
