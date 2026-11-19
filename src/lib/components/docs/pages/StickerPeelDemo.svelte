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
	import StickerPeel, { type StickerFinish } from '$lib/components/library/Animations/StickerPeel/StickerPeel.svelte';
	import source from '$lib/components/library/Animations/StickerPeel/StickerPeel.svelte?raw';
	import svelteBits from '$lib/assets/logo/svelte-bits-sticker.png';
	import github from '$lib/assets/stickers/github.webp';
	import tailwind from '$lib/assets/stickers/tailwind.webp';
	import openai from '$lib/assets/stickers/openai.webp';
	import apple from '$lib/assets/stickers/apple.webp';
	import vite from '$lib/assets/stickers/vite.webp';

	const STICKERS = { svelteBits, github, tailwind, openai, apple, vite };

	type StickerKey = keyof typeof STICKERS;

	const STICKER_OPTIONS = [
		{ value: 'svelteBits', label: 'Svelte Bits' },
		{ value: 'github', label: 'GitHub' },
		{ value: 'tailwind', label: 'Tailwind' },
		{ value: 'openai', label: 'OpenAI' },
		{ value: 'apple', label: 'Apple' },
		{ value: 'vite', label: 'Vite' }
	];

	const LOOK = {
		finish: 'gloss' as StickerFinish,
		width: 200,
		rotate: 0,
		peelDirection: 0,
		peelBackHoverPct: 25,
		peelBackActivePct: 40,
		curlRadius: 12,
		backColor: '#d4d4d8',
		lightingIntensity: 0.5,
		shadowIntensity: 0.6,
		followPointer: true,
		swing: 1,
		friction: 0.5,
		bounce: 0.35
	};

	const DEFAULT_PROPS = {
		preset: 'signature',
		sticker: 'svelteBits' as StickerKey,
		...LOOK,
		draggable: true,
		intro: true
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<string, Partial<DemoProps>> = {
		signature: { ...LOOK, sticker: 'svelteBits' },
		classic: { ...LOOK, sticker: 'svelteBits', followPointer: false, peelBackHoverPct: 30 },
		holo: { ...LOOK, sticker: 'apple', finish: 'holo', lightingIntensity: 0.8, width: 180 },
		matte: {
			...LOOK,
			sticker: 'github',
			finish: 'matte',
			backColor: '#f4f4f5',
			lightingIntensity: 0.3,
			shadowIntensity: 0.45
		},
		vinyl: {
			...LOOK,
			sticker: 'tailwind',
			width: 240,
			curlRadius: 24,
			peelBackActivePct: 50,
			swing: 0.6,
			friction: 0.75,
			shadowIntensity: 0.75
		},
		paper: {
			...LOOK,
			sticker: 'openai',
			finish: 'matte',
			curlRadius: 6,
			backColor: '#fafafa',
			swing: 1.6,
			friction: 0.35
		},
		bouncy: { ...LOOK, sticker: 'vite', rotate: -8, friction: 0.12, bounce: 0.85, swing: 1.4 }
	};

	const PRESET_OPTIONS = [
		{ value: 'signature', label: 'Signature' },
		{ value: 'classic', label: 'Classic' },
		{ value: 'holo', label: 'Holo' },
		{ value: 'matte', label: 'Matte' },
		{ value: 'vinyl', label: 'Thick Vinyl' },
		{ value: 'paper', label: 'Paper' },
		{ value: 'bouncy', label: 'Bouncy' }
	];

	const FINISH_OPTIONS = [
		{ value: 'gloss', label: 'Gloss' },
		{ value: 'matte', label: 'Matte' },
		{ value: 'holo', label: 'Holo' }
	];

	const propData: PropRow[] = [
		{
			name: 'imageSrc',
			type: 'string',
			default: 'required',
			description: 'Sticker image. Use a PNG with a transparent background so the die-cut outline shows.'
		},
		{ name: 'width', type: 'number', default: '200', description: 'Width of the sticker in pixels.' },
		{ name: 'rotate', type: 'number', default: '0', description: 'Resting rotation of the sticker in degrees.' },
		{
			name: 'finish',
			type: "'gloss' | 'matte' | 'holo'",
			default: "'gloss'",
			description: 'Surface of the sticker. Holo turns light areas into foil with rainbow bands and glitter.'
		},
		{
			name: 'peelBackHoverPct',
			type: 'number',
			default: '25',
			description: 'How far the sticker peels back on hover, as a percentage of its size.'
		},
		{
			name: 'peelBackActivePct',
			type: 'number',
			default: '40',
			description: 'How far the sticker peels back while pressed or dragged.'
		},
		{
			name: 'peelDirection',
			type: 'number',
			default: '0',
			description:
				'Edge that peels, in degrees clockwise from the top. With followPointer it is used when the cursor is near the middle.'
		},
		{
			name: 'followPointer',
			type: 'boolean',
			default: 'true',
			description: 'Peels the edge or corner nearest the cursor, and the edge you grab while dragging.'
		},
		{
			name: 'curlRadius',
			type: 'number',
			default: '12',
			description: 'Radius of the curl where the sticker bends, in pixels. Larger values feel like thicker vinyl.'
		},
		{
			name: 'backColor',
			type: 'string',
			default: "'#d4d4d8'",
			description: 'Color of the back of the sticker, seen on the peeled part.'
		},
		{
			name: 'lightingIntensity',
			type: 'number',
			default: '0.5',
			description: 'Strength of the highlights that follow the cursor, from 0 to 1.'
		},
		{
			name: 'shadowIntensity',
			type: 'number',
			default: '0.6',
			description: 'Strength of the shadows under the sticker and the peeled part, from 0 to 1.'
		},
		{
			name: 'draggable',
			type: 'boolean',
			default: 'true',
			description: 'Lets the sticker be picked up, dragged and thrown around its parent.'
		},
		{
			name: 'swing',
			type: 'number',
			default: '1',
			description: 'How much the sticker swings around the point you hold while dragging, from 0 to 3.'
		},
		{
			name: 'friction',
			type: 'number',
			default: '0.5',
			description: 'How quickly a thrown sticker slides to a stop, from 0 (ice) to 1 (felt).'
		},
		{
			name: 'bounce',
			type: 'number',
			default: '0.35',
			description: 'How much of its speed a thrown sticker keeps when it hits the edge of its parent.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Drops the sticker onto the surface on mount and smooths its corner down.'
		},
		{
			name: 'initialPosition',
			type: "'center' | { x: number; y: number }",
			default: "'center'",
			description: 'Starting position. An object offsets the sticker from the center of its parent, in pixels.'
		},
		{
			name: 'onDragStart',
			type: '() => void',
			default: '-',
			description: 'Called when the sticker starts being dragged.'
		},
		{ name: 'onDragEnd', type: '() => void', default: '-', description: 'Called when the sticker is released.' },
		{ name: 'dpr', type: 'number', default: 'auto', description: 'Maximum device pixel ratio, capped at 2.' },
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the root element.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the root element.' }
	];

	const usage = `<script lang="ts">
  import StickerPeel from '$lib/components/StickerPeel.svelte';
  import logo from './assets/sticker.png';
</${'script'}>

<div style="position: relative; width: 100%; height: 400px;">
  <StickerPeel
    imageSrc={logo}
    width={200}
    finish="gloss"
    peelBackHoverPct={25}
    peelBackActivePct={40}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, sticker: _sticker, ...rest } = settings;
		return rest;
	});
	const imageSrc = $derived(STICKERS[settings.sticker as StickerKey] || svelteBits);
	let key = $state(0);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			Object.keys(DEFAULT_PROPS).map((name) => [name, demo.defaultProps[name as keyof DemoProps]])
		) as Partial<DemoProps>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="StickerPeel"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'sticker']}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 500px; padding: 0; overflow: hidden;">
			{#key key}
				<StickerPeel {imageSrc} {...componentProps} />
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Sticker"
				options={STICKER_OPTIONS}
				value={settings.sticker}
				onChange={(v) => demo.updateProp('sticker', v as StickerKey)}
			/>
			<PreviewSelect
				title="Finish"
				options={FINISH_OPTIONS}
				value={settings.finish}
				onChange={(v) => demo.updateProp('finish', v as StickerFinish)}
			/>
			<PreviewColorPickerCustom
				title="Back Color"
				color={settings.backColor}
				onChange={(v) => demo.updateProp('backColor', v)}
			/>
			<PreviewSlider
				title="Width"
				min={100}
				max={320}
				step={5}
				value={settings.width}
				valueUnit="px"
				onChange={(v) => demo.updateProp('width', v)}
			/>
			<PreviewSlider
				title="Rotate"
				min={-45}
				max={45}
				step={1}
				value={settings.rotate}
				valueUnit="°"
				onChange={(v) => demo.updateProp('rotate', v)}
			/>
			<PreviewSlider
				title="Peel Direction"
				min={0}
				max={360}
				step={1}
				value={settings.peelDirection}
				valueUnit="°"
				onChange={(v) => demo.updateProp('peelDirection', v)}
			/>
			<PreviewSlider
				title="Hover Peel"
				min={0}
				max={60}
				step={1}
				value={settings.peelBackHoverPct}
				valueUnit="%"
				onChange={(v) => demo.updateProp('peelBackHoverPct', v)}
			/>
			<PreviewSlider
				title="Press Peel"
				min={0}
				max={80}
				step={1}
				value={settings.peelBackActivePct}
				valueUnit="%"
				onChange={(v) => demo.updateProp('peelBackActivePct', v)}
			/>
			<PreviewSlider
				title="Curl Radius"
				min={4}
				max={32}
				step={1}
				value={settings.curlRadius}
				valueUnit="px"
				onChange={(v) => demo.updateProp('curlRadius', v)}
			/>
			<PreviewSlider
				title="Lighting"
				min={0}
				max={1}
				step={0.01}
				value={settings.lightingIntensity}
				onChange={(v) => demo.updateProp('lightingIntensity', v)}
			/>
			<PreviewSlider
				title="Shadow"
				min={0}
				max={1}
				step={0.01}
				value={settings.shadowIntensity}
				onChange={(v) => demo.updateProp('shadowIntensity', v)}
			/>
			<PreviewSlider
				title="Swing"
				min={0}
				max={3}
				step={0.05}
				value={settings.swing}
				isDisabled={!settings.draggable}
				onChange={(v) => demo.updateProp('swing', v)}
			/>
			<PreviewSlider
				title="Friction"
				min={0}
				max={1}
				step={0.01}
				value={settings.friction}
				isDisabled={!settings.draggable}
				onChange={(v) => demo.updateProp('friction', v)}
			/>
			<PreviewSlider
				title="Bounce"
				min={0}
				max={1}
				step={0.01}
				value={settings.bounce}
				isDisabled={!settings.draggable}
				onChange={(v) => demo.updateProp('bounce', v)}
			/>
			<PreviewSwitch
				title="Follow Pointer"
				isChecked={settings.followPointer}
				onChange={(v) => demo.updateProp('followPointer', v)}
			/>
			<PreviewSwitch
				title="Draggable"
				isChecked={settings.draggable}
				onChange={(v) => demo.updateProp('draggable', v)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(v) => demo.updateProp('intro', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
