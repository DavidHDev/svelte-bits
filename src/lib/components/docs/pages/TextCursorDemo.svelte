<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import TextCursor from '$lib/components/library/TextAnimations/TextCursor/TextCursor.svelte';
	import source from '$lib/components/library/TextAnimations/TextCursor/TextCursor.svelte?raw';

	type Mode = 'stamp' | 'chain' | 'ribbon';

	type Look = {
		text: string;
		mode: Mode;
		fontSize: number;
		spacing: number;
		maxPoints: number;
		shrink: number;
		fade: number;
		smoothing: number;
		exitDuration: number;
		removalInterval: number;
		followMouseDirection: boolean;
		keepUpright: boolean;
		randomFloat: boolean;
		popIn: boolean;
	};

	const LOOK: Look = {
		text: 'Hello',
		mode: 'stamp',
		fontSize: 28,
		spacing: 88,
		maxPoints: 7,
		shrink: 0.5,
		fade: 0.6,
		smoothing: 0.3,
		exitDuration: 0.5,
		removalInterval: 30,
		followMouseDirection: true,
		keepUpright: true,
		randomFloat: true,
		popIn: true
	};

	const PRESETS: Record<string, Look> = {
		words: { ...LOOK },
		emoji: { ...LOOK, text: '✨', fontSize: 30, spacing: 46, maxPoints: 10, shrink: 0.6, fade: 0.5 },
		chain: {
			...LOOK,
			text: '→',
			mode: 'chain',
			fontSize: 24,
			spacing: 22,
			maxPoints: 18,
			shrink: 0.55,
			fade: 0.75,
			randomFloat: false
		},
		ribbon: {
			...LOOK,
			text: 'Svelte Bits follows your cursor ✦ ',
			mode: 'ribbon',
			fontSize: 26,
			spacing: 1,
			shrink: 0.35,
			fade: 0.7,
			smoothing: 0.4
		}
	};

	const DEFAULT_PROPS = {
		preset: 'words',
		...LOOK,
		textColor: '',
		hideCursor: false
	};

	const PRESET_OPTIONS = [
		{ value: 'words', label: 'Words' },
		{ value: 'emoji', label: 'Emoji' },
		{ value: 'chain', label: 'Chain' },
		{ value: 'ribbon', label: 'Ribbon' }
	];

	const MODE_OPTIONS = [
		{ value: 'stamp', label: 'Stamp' },
		{ value: 'chain', label: 'Chain' },
		{ value: 'ribbon', label: 'Ribbon' }
	];

	const propData: PropRow[] = [
		{ name: 'text', type: 'string', default: "'Hello'", description: 'The text or emoji the trail is made of.' },
		{
			name: 'mode',
			type: "'stamp' | 'chain' | 'ribbon'",
			default: "'stamp'",
			description:
				'Stamp leaves copies along the path, chain makes copies follow each other like a snake, and ribbon lays the letters along the path.'
		},
		{
			name: 'spacing',
			type: 'number',
			default: '88',
			description: 'Distance between copies, in px. In ribbon mode, extra space between letters.'
		},
		{
			name: 'maxPoints',
			type: 'number',
			default: '7',
			description: 'Most copies shown at once in stamp and chain modes.'
		},
		{ name: 'color', type: 'string', default: "'currentColor'", description: 'Color of the text.' },
		{ name: 'fontSize', type: 'number', default: '28', description: 'Font size of the text, in px.' },
		{ name: 'fontWeight', type: 'number | string', default: '600', description: 'Font weight of the text.' },
		{ name: 'fontFamily', type: 'string', default: "'inherit'", description: 'Font family of the text.' },
		{
			name: 'shrink',
			type: 'number',
			default: '0.5',
			description: 'How much smaller the trail gets toward its end, from 0 to 1.'
		},
		{
			name: 'fade',
			type: 'number',
			default: '0.6',
			description: 'How much the trail fades toward its end, from 0 to 1.'
		},
		{
			name: 'smoothing',
			type: 'number',
			default: '0.3',
			description: 'Softens the path the trail follows, from 0 to 1. Higher values lag a little behind the cursor.'
		},
		{
			name: 'followMouseDirection',
			type: 'boolean',
			default: 'true',
			description: 'Turns the text to face the direction the cursor moves.'
		},
		{
			name: 'randomFloat',
			type: 'boolean',
			default: 'true',
			description: 'Lets stamped copies sway gently, and makes chains and ribbons ripple.'
		},
		{ name: 'popIn', type: 'boolean', default: 'true', description: 'Makes new copies pop in with a little overshoot.' },
		{
			name: 'keepUpright',
			type: 'boolean',
			default: 'true',
			description: 'In stamp mode, keeps copies from turning upside down when the cursor moves left.'
		},
		{
			name: 'exitDuration',
			type: 'number',
			default: '0.5',
			description: 'How long a stamped copy takes to shrink away, in seconds.'
		},
		{
			name: 'removalInterval',
			type: 'number',
			default: '30',
			description: 'How quickly the trail pulls back into the cursor once it stops, in ms per copy.'
		},
		{ name: 'hideCursor', type: 'boolean', default: 'false', description: 'Hides the system cursor over the element.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the container.' },
		{ name: 'style', type: 'CSSProperties', default: '-', description: 'Inline styles for the container.' }
	];

	const usage = `<script lang="ts">
  import TextCursor from '$lib/components/TextCursor.svelte';
</${'script'}>

<div style="height: 400px; position: relative;">
  <TextCursor
    text="Hello"
    mode="stamp"
    fontSize={28}
    spacing={88}
    maxPoints={7}
    shrink={0.5}
    fade={0.6}
    smoothing={0.3}
    exitDuration={0.5}
    removalInterval={30}
    followMouseDirection={true}
    keepUpright={true}
    randomFloat={true}
    popIn={true}
  />
</div>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, textColor: _textColor, ...rest } = settings;
		return rest;
	});
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
	};

	const computedProps = $derived(settings.textColor ? { color: settings.textColor } : {});
</script>

<TabsLayout
	propsState={demo}
	componentName="TextCursor"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['preset', 'textColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 460px; padding: 0; overflow: hidden;">
			<p
				class="pointer-events-none absolute bottom-5 left-1/2 m-0 -translate-x-1/2 select-none text-sm"
				style="color: var(--text-dimmed);"
			>
				Move around
			</p>
			<TextCursor {...componentProps} color={settings.textColor || 'currentColor'} />
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={(v) => applyPreset(String(v))} />
			<PreviewInput
				title="Text"
				value={settings.text}
				placeholder="Enter text..."
				maxLength={40}
				onChange={(v) => demo.updateProp('text', v)}
			/>
			<PreviewColorPickerCustom title="Color" color={settings.textColor || ink} onChange={(v) => demo.updateProp('textColor', v)} />
			<PreviewSelect title="Mode" options={MODE_OPTIONS} value={settings.mode} onChange={(v) => demo.updateProp('mode', v as Mode)} />
			<PreviewSlider title="Font Size" min={12} max={72} step={1} value={settings.fontSize} valueUnit="px" onChange={(v) => demo.updateProp('fontSize', v)} />
			<PreviewSlider title="Spacing" min={0} max={200} step={1} value={settings.spacing} valueUnit="px" onChange={(v) => demo.updateProp('spacing', v)} />
			<PreviewSlider title="Max Points" min={1} max={30} step={1} value={settings.maxPoints} onChange={(v) => demo.updateProp('maxPoints', v)} />
			<PreviewSlider title="Shrink" min={0} max={1} step={0.05} value={settings.shrink} onChange={(v) => demo.updateProp('shrink', v)} />
			<PreviewSlider title="Fade" min={0} max={1} step={0.05} value={settings.fade} onChange={(v) => demo.updateProp('fade', v)} />
			<PreviewSlider title="Smoothing" min={0} max={1} step={0.05} value={settings.smoothing} onChange={(v) => demo.updateProp('smoothing', v)} />
			<PreviewSlider
				title="Exit Duration"
				min={0.1}
				max={2}
				step={0.05}
				value={settings.exitDuration}
				valueUnit="s"
				onChange={(v) => demo.updateProp('exitDuration', v)}
			/>
			<PreviewSlider
				title="Removal Interval"
				min={5}
				max={200}
				step={5}
				value={settings.removalInterval}
				valueUnit="ms"
				onChange={(v) => demo.updateProp('removalInterval', v)}
			/>
			<PreviewSwitch
				title="Follow Mouse Direction"
				isChecked={settings.followMouseDirection}
				onChange={(v) => demo.updateProp('followMouseDirection', v)}
			/>
			<PreviewSwitch title="Keep Upright" isChecked={settings.keepUpright} onChange={(v) => demo.updateProp('keepUpright', v)} />
			<PreviewSwitch title="Random Float" isChecked={settings.randomFloat} onChange={(v) => demo.updateProp('randomFloat', v)} />
			<PreviewSwitch title="Pop In" isChecked={settings.popIn} onChange={(v) => demo.updateProp('popIn', v)} />
			<PreviewSwitch title="Hide Cursor" isChecked={settings.hideCursor} onChange={(v) => demo.updateProp('hideCursor', v)} />
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
