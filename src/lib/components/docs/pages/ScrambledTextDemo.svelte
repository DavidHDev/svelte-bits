<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import ScrambledText from '$lib/components/library/TextAnimations/ScrambledText/ScrambledText.svelte';
	import source from '$lib/components/library/TextAnimations/ScrambledText/ScrambledText.svelte?raw';

	type ScrambleEffect = 'scramble' | 'lift' | 'blur' | 'magnify';

	type Look = {
		color: string;
		scrambleColor: string;
		effect: ScrambleEffect;
		radius: number;
		strength: number;
		trail: number;
		duration: number;
		speed: number;
		clickBurst: boolean;
		fontFamily: string;
		scrambleChars: string;
	};

	const LOOK: Look = {
		color: '',
		scrambleColor: '',
		effect: 'scramble',
		radius: 100,
		strength: 1,
		trail: 0.6,
		duration: 1.2,
		speed: 0.5,
		clickBurst: true,
		fontFamily: '',
		scrambleChars: '.:'
	};

	const PRESETS: Record<string, Look> = {
		decode: { ...LOOK },
		float: {
			...LOOK,
			effect: 'lift',
			radius: 130,
			strength: 1,
			trail: 0.9,
			duration: 0.9,
			speed: 0.8,
			fontFamily: 'Geist, sans-serif',
			scrambleChars: '·•'
		},
		haze: {
			...LOOK,
			effect: 'blur',
			radius: 120,
			strength: 1.1,
			trail: 1.4,
			duration: 1.4,
			speed: 0.4,
			fontFamily: 'Georgia, serif',
			scrambleChars: '░▒'
		},
		lens: {
			...LOOK,
			scrambleColor: '#ff5a1f',
			effect: 'magnify',
			radius: 90,
			strength: 1,
			trail: 0.35,
			duration: 0.8,
			speed: 1,
			fontFamily: '"Geist Mono", monospace',
			scrambleChars: '<>/*'
		}
	};

	const DEFAULT_PROPS = {
		preset: 'decode',
		...LOOK,
		intro: true
	};

	const PRESET_OPTIONS = [
		{ value: 'decode', label: 'Decode' },
		{ value: 'float', label: 'Float' },
		{ value: 'haze', label: 'Haze' },
		{ value: 'lens', label: 'Lens' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'scramble', label: 'Scramble' },
		{ value: 'lift', label: 'Lift' },
		{ value: 'blur', label: 'Blur' },
		{ value: 'magnify', label: 'Magnify' }
	];

	const FONT_OPTIONS = [
		{ value: '', label: 'Mono' },
		{ value: 'Geist, sans-serif', label: 'Sans' },
		{ value: 'Georgia, serif', label: 'Serif' },
		{ value: '"Geist Mono", monospace', label: 'Geist Mono' }
	];

	const propData: PropRow[] = [
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description: 'The text to scramble.'
		},
		{
			name: 'effect',
			type: "'scramble' | 'lift' | 'blur' | 'magnify'",
			default: "'scramble'",
			description:
				'What happens to letters near the pointer: they scramble, rise, blur, or swell like a lens. Each one eases in and out with a soft falloff.'
		},
		{
			name: 'radius',
			type: 'number',
			default: '100',
			description: 'Distance from the pointer, in px, within which letters react.'
		},
		{
			name: 'strength',
			type: 'number',
			default: '1',
			description: 'How far letters lift, how much they blur, or how much they magnify.'
		},
		{
			name: 'trail',
			type: 'number',
			default: '0.6',
			description:
				'How long lifted, blurred or magnified letters take to settle after the pointer moves on, in seconds. Scrambling uses duration instead.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '1.2',
			description:
				'How long a letter right under the pointer keeps scrambling, in seconds. Also sets the pace of the intro and the click burst.'
		},
		{
			name: 'speed',
			type: 'number',
			default: '0.5',
			description: 'How often a scrambling letter swaps to a new character. Higher values flicker faster.'
		},
		{
			name: 'clickBurst',
			type: 'boolean',
			default: 'true',
			description: 'Clicking sends a scramble wave outward from the click point, carrying the current effect with it.'
		},
		{
			name: 'scrambleChars',
			type: 'string',
			default: "'.:'",
			description: 'The characters shown while a letter is scrambled.'
		},
		{
			name: 'scrambleColor',
			type: 'string',
			default: "''",
			description: 'Color of letters while they are scrambled. Leave empty to keep the text color.'
		},
		{
			name: 'color',
			type: 'string',
			default: "''",
			description: 'Color of the text. Leave empty to follow the surrounding text color.'
		},
		{
			name: 'fontFamily',
			type: 'string',
			default: "''",
			description: 'Font of the text. Leave empty to keep the default monospace.'
		},
		{
			name: 'intro',
			type: 'boolean',
			default: 'true',
			description: 'Decodes the whole text from scrambled characters the first time it scrolls into view.'
		},
		{
			name: 'className',
			type: 'string',
			default: "''",
			description: 'Extra class names for the wrapper.'
		},
		{
			name: 'style',
			type: 'CSSProperties',
			default: '{}',
			description: 'Inline styles for the wrapper.'
		}
	];

	const usage = `<script lang="ts">
  import ScrambledText from '$lib/components/ScrambledText.svelte';
</${'script'}>

<ScrambledText
  className="scrambled-text-demo"
  effect="scramble"
  radius={100}
  strength={1}
  trail={0.6}
  duration={1.2}
  speed={0.5}
  scrambleChars=".:"
  clickBurst
  intro
>
  Lorem ipsum dolor sit amet consectetur adipisicing elit.
  Similique pariatur dignissimos porro eius quam doloremque
  et enim velit nobis maxime.
</ScrambledText>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, color: _color, scrambleColor: _scrambleColor, fontFamily: _fontFamily, ...rest } = settings;
		return rest;
	});
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	const physical = $derived(settings.effect !== 'scramble');
	let key = $state(0);

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};

	const computedProps = $derived({
		...(settings.color ? { color: settings.color } : {}),
		...(settings.scrambleColor ? { scrambleColor: settings.scrambleColor } : {}),
		...(settings.fontFamily ? { fontFamily: settings.fontFamily } : {})
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="ScrambledText"
	{usage}
	{source}
	{propData}
	dependencies={['gsap']}
	demoOnlyProps={['preset', 'color', 'scrambleColor', 'fontFamily']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; height: 400px; overflow: hidden;">
			{#key key}
				<ScrambledText
					className="scrambled-text-demo"
					style={{ color: ink }}
					{...componentProps}
					color={settings.color}
					scrambleColor={settings.scrambleColor}
					fontFamily={settings.fontFamily}
				>
					Once you hover over me, you will see the effect in action! You can customize the radius, duration, and speed
					of the scramble effect.
				</ScrambledText>
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Color"
				color={settings.color || ink}
				onChange={(value) => demo.updateProp('color', value)}
			/>
			<PreviewColorPickerCustom
				title="Scramble Color"
				color={settings.scrambleColor || settings.color || ink}
				onChange={(value) => demo.updateProp('scrambleColor', value)}
			/>
			<PreviewSelect
				title="Effect"
				options={EFFECT_OPTIONS}
				value={settings.effect}
				onChange={(value) => demo.updateProp('effect', value as ScrambleEffect)}
			/>
			<PreviewSlider
				title="Radius"
				min={20}
				max={300}
				step={10}
				value={settings.radius}
				valueUnit="px"
				onChange={(value) => demo.updateProp('radius', value)}
			/>
			<PreviewSlider
				title="Strength"
				min={0.2}
				max={2}
				step={0.1}
				value={settings.strength}
				isDisabled={!physical}
				onChange={(value) => demo.updateProp('strength', value)}
			/>
			<PreviewSlider
				title="Trail"
				min={0.1}
				max={3}
				step={0.05}
				value={settings.trail}
				valueUnit="s"
				isDisabled={!physical}
				onChange={(value) => demo.updateProp('trail', value)}
			/>
			<PreviewSlider
				title="Duration"
				min={0.1}
				max={5}
				step={0.1}
				value={settings.duration}
				valueUnit="s"
				onChange={(value) => demo.updateProp('duration', value)}
			/>
			<PreviewSlider
				title="Speed"
				min={0.1}
				max={2}
				step={0.1}
				value={settings.speed}
				onChange={(value) => demo.updateProp('speed', value)}
			/>
			<PreviewSwitch
				title="Click Burst"
				isChecked={settings.clickBurst}
				onChange={(value) => demo.updateProp('clickBurst', value)}
			/>
			<PreviewSwitch title="Intro" isChecked={settings.intro} onChange={(value) => demo.updateProp('intro', value)} />
			<PreviewSelect
				title="Font"
				options={FONT_OPTIONS}
				value={settings.fontFamily}
				onChange={(value) => demo.updateProp('fontFamily', value)}
			/>
			<PreviewInput
				title="Scramble Characters"
				value={settings.scrambleChars}
				placeholder="Enter characters..."
				maxLength={16}
				onChange={(value) => demo.updateProp('scrambleChars', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
