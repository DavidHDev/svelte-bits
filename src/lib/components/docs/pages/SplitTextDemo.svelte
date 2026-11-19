<script lang="ts">
	import { toast } from 'svelte-sonner';
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
	import { colorModeValue } from '$lib/theme.svelte';
	import SplitText from '$lib/components/library/TextAnimations/SplitText/SplitText.svelte';
	import source from '$lib/components/library/TextAnimations/SplitText/SplitText.svelte?raw';

	type Effect = 'rise' | 'fade' | 'blur' | 'flip' | 'pop' | 'skew' | 'wave';
	type SplitType = 'chars' | 'words' | 'lines' | 'words, chars';
	type Trigger = 'view' | 'load' | 'hover' | 'click';
	type HoverEffect = 'none' | 'lift' | 'wave';
	type StaggerFrom = 'start' | 'center' | 'end' | 'edges' | 'random';

	type Look = {
		effect: Effect;
		splitType: SplitType;
		ease: string;
		delay: number;
		duration: number;
		staggerFrom: StaggerFrom;
		trigger: Trigger;
		hoverEffect: HoverEffect;
		loop: boolean;
		loopDelay: number;
		mask: boolean;
		color: string;
		accentColor: string;
	};

	const LOOK: Look = {
		effect: 'rise',
		splitType: 'chars',
		ease: '',
		delay: 50,
		duration: 1.25,
		staggerFrom: 'start',
		trigger: 'view',
		hoverEffect: 'lift',
		loop: false,
		loopDelay: 1.5,
		mask: false,
		color: '',
		accentColor: ''
	};

	const PRESETS: Record<string, Look> = {
		rise: { ...LOOK },
		flip: {
			...LOOK,
			effect: 'flip',
			delay: 45,
			duration: 1.1,
			trigger: 'hover',
			hoverEffect: 'none',
			accentColor: '#ff5a36'
		},
		blur: {
			...LOOK,
			effect: 'blur',
			splitType: 'words',
			delay: 160,
			duration: 1.6,
			staggerFrom: 'center',
			hoverEffect: 'none',
			loop: true,
			loopDelay: 1.4
		},
		wave: { ...LOOK, effect: 'wave', delay: 45, duration: 1.4, trigger: 'click', hoverEffect: 'wave' }
	};

	const DEFAULT_PROPS = {
		preset: 'rise',
		text: 'Hello, you!',
		...LOOK,
		showCallback: true
	};

	const PRESET_OPTIONS = [
		{ value: 'rise', label: 'Rise' },
		{ value: 'flip', label: 'Flip' },
		{ value: 'blur', label: 'Blur' },
		{ value: 'wave', label: 'Wave' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'rise', label: 'Rise' },
		{ value: 'fade', label: 'Fade' },
		{ value: 'blur', label: 'Blur' },
		{ value: 'flip', label: 'Flip' },
		{ value: 'pop', label: 'Pop' },
		{ value: 'skew', label: 'Skew' },
		{ value: 'wave', label: 'Wave' }
	];

	const SPLIT_OPTIONS = [
		{ value: 'chars', label: 'Chars' },
		{ value: 'words', label: 'Words' },
		{ value: 'lines', label: 'Lines' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'view', label: 'In view' },
		{ value: 'load', label: 'Load' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' }
	];

	const HOVER_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'lift', label: 'Lift' },
		{ value: 'wave', label: 'Wave' }
	];

	const EASE_OPTIONS = [
		{ value: '', label: 'Auto' },
		{ value: 'power3.out', label: 'Power out' },
		{ value: 'expo.out', label: 'Expo out' },
		{ value: 'back.out(2)', label: 'Back out' },
		{ value: 'bounce.out', label: 'Bounce' },
		{ value: 'elastic.out(1, 0.3)', label: 'Elastic' }
	];

	const STAGGER_FROM_OPTIONS = [
		{ value: 'start', label: 'Start' },
		{ value: 'center', label: 'Center' },
		{ value: 'end', label: 'End' },
		{ value: 'edges', label: 'Edges' },
		{ value: 'random', label: 'Random' }
	];

	const propData: PropRow[] = [
		{
			name: 'tag',
			type: 'string',
			default: '"p"',
			description: 'HTML tag to render: "h1", "h2", "h3", "h4", "h5", "h6", "p" or "span".'
		},
		{ name: 'text', type: 'string', default: '""', description: 'The text content to animate.' },
		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Additional class names to style the component.'
		},
		{
			name: 'effect',
			type: '"rise" | "fade" | "blur" | "flip" | "pop" | "skew" | "wave"',
			default: '"rise"',
			description:
				'Reveal style. Rise slides pieces up, fade dissolves them in, blur pulls them into focus, flip swings them up in 3D, pop scales them in with a soft overshoot, skew slides them in leaning and wave lets a crest travel across. Ignored when from or to is set.'
		},
		{
			name: 'trigger',
			type: '"view" | "load" | "hover" | "click"',
			default: '"view"',
			description:
				'When the reveal plays. View waits until the text scrolls into view, load plays right away, hover and click play it in view and replay it on every hover or click.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'false',
			description: 'Animates the pieces out and back in again, over and over.'
		},
		{
			name: 'loopDelay',
			type: 'number',
			default: '1.5',
			description: 'Pause in seconds between the end of a reveal and the next loop.'
		},
		{
			name: 'hoverEffect',
			type: '"none" | "lift" | "wave"',
			default: '"none"',
			description:
				'Interaction after the reveal. Lift raises the pieces near the cursor with a soft falloff, wave sends a ripple through the text from where the cursor enters.'
		},
		{
			name: 'color',
			type: 'string',
			default: 'undefined',
			description: 'Text color. Follows the surrounding text color when not set.'
		},
		{
			name: 'accentColor',
			type: 'string',
			default: 'undefined',
			description: 'Color each piece passes through while it reveals before settling on the text color.'
		},
		{
			name: 'delay',
			type: 'number',
			default: '50',
			description: 'Delay between animations for each letter (in ms).'
		},
		{
			name: 'duration',
			type: 'number',
			default: '1.25',
			description: 'Duration of each letter animation (in seconds).'
		},
		{
			name: 'ease',
			type: 'string | function',
			default: 'undefined',
			description: 'GSAP easing for the reveal. Each effect brings its own ease when not set.'
		},
		{
			name: 'splitType',
			type: 'string',
			default: '"chars"',
			description: 'Split type: "chars", "words", "lines", or "words, chars".'
		},
		{
			name: 'staggerFrom',
			type: '"start" | "center" | "end" | "edges" | "random"',
			default: '"start"',
			description: 'Where the stagger starts, so pieces can ripple out from the middle, the ends or in random order.'
		},
		{
			name: 'mask',
			type: 'boolean',
			default: 'false',
			description: 'Clips each piece to its own box so it slides out from behind an edge instead of floating in.'
		},
		{
			name: 'from',
			type: 'object',
			default: 'undefined',
			description:
				'Custom starting GSAP properties for each piece, replacing the effect. Defaults to { opacity: 0, y: 40 }.'
		},
		{
			name: 'to',
			type: 'object',
			default: 'undefined',
			description: 'Custom target GSAP properties for each piece, replacing the effect. Defaults to { opacity: 1, y: 0 }.'
		},
		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'Intersection threshold to trigger the animation (0-1).'
		},
		{ name: 'rootMargin', type: 'string', default: '"-100px"', description: 'Root margin for the ScrollTrigger.' },
		{
			name: 'textAlign',
			type: 'string',
			default: '"center"',
			description: "Text alignment: 'left', 'center', 'right', etc."
		},
		{
			name: 'onLetterAnimationComplete',
			type: 'function',
			default: 'undefined',
			description: 'Callback function when the first reveal completes.'
		}
	];

	const usage = `<script lang="ts">
  import SplitText from '$lib/components/SplitText.svelte';

  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };
</${'script'}>

<SplitText
  text="Hello, GSAP!"
  class="text-2xl font-semibold text-center"
  effect="rise"
  splitType="chars"
  delay={50}
  duration={1.25}
  staggerFrom="start"
  trigger="view"
  hoverEffect="lift"
  loop={false}
  loopDelay={1.5}
  mask={false}
  threshold={0.1}
  rootMargin="-100px"
  textAlign="center"
  onLetterAnimationComplete={handleAnimationComplete}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const {
			preset: _preset,
			showCallback: _showCallback,
			ease: _ease,
			color: _color,
			accentColor: _accentColor,
			...rest
		} = settings;
		return rest;
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));

	const showToast = () => toast('✅ Animation Finished!');

	const updateAndReplay = <K extends keyof typeof DEFAULT_PROPS>(name: K, value: (typeof DEFAULT_PROPS)[K]) => {
		demo.updateProp(name, value);
		key++;
	};

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<typeof DEFAULT_PROPS>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};

	const computedProps = $derived({
		...(settings.ease ? { ease: settings.ease } : {}),
		...(settings.color ? { color: settings.color } : {}),
		...(settings.accentColor ? { accentColor: settings.accentColor } : {})
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="SplitText"
	{usage}
	{source}
	{propData}
	dependencies={['gsap']}
	demoOnlyProps={['preset', 'showCallback', 'ease', 'color', 'accentColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; min-height: 400px; overflow: hidden;">
			<RefreshButton onClick={() => key++} />
			{#key key}
				<SplitText
					{...componentProps}
					ease={settings.ease || undefined}
					color={settings.color || undefined}
					accentColor={settings.accentColor || undefined}
					class="split-text-demo"
					onLetterAnimationComplete={settings.showCallback ? showToast : undefined}
				/>
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />

			<PreviewColorPickerCustom
				title="Color"
				color={settings.color || ink}
				onChange={(v) => updateAndReplay('color', v)}
			/>

			<PreviewColorPickerCustom
				title="Accent"
				color={settings.accentColor || ink}
				onChange={(v) => updateAndReplay('accentColor', v)}
			/>

			<PreviewSelect
				title="Effect"
				options={EFFECT_OPTIONS}
				value={settings.effect}
				onChange={(v) => updateAndReplay('effect', v as Effect)}
			/>

			<PreviewSelect
				title="Split Type"
				options={SPLIT_OPTIONS}
				value={settings.splitType}
				onChange={(v) => updateAndReplay('splitType', v as SplitType)}
			/>

			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => updateAndReplay('trigger', v as Trigger)}
			/>

			<PreviewSelect
				title="Hover Effect"
				options={HOVER_OPTIONS}
				value={settings.hoverEffect}
				onChange={(v) => updateAndReplay('hoverEffect', v as HoverEffect)}
			/>

			<PreviewSelect
				title="Ease"
				options={EASE_OPTIONS}
				value={settings.ease}
				onChange={(v) => updateAndReplay('ease', String(v))}
			/>

			<PreviewSelect
				title="Stagger From"
				options={STAGGER_FROM_OPTIONS}
				value={settings.staggerFrom}
				onChange={(v) => updateAndReplay('staggerFrom', v as StaggerFrom)}
			/>

			<PreviewSlider
				title="Stagger Delay"
				min={10}
				max={500}
				step={5}
				value={settings.delay}
				valueUnit="ms"
				onChange={(v) => updateAndReplay('delay', v)}
			/>

			<PreviewSlider
				title="Duration"
				min={0.1}
				max={3}
				step={0.05}
				value={settings.duration}
				valueUnit="s"
				onChange={(v) => updateAndReplay('duration', v)}
			/>

			<PreviewSlider
				title="Loop Delay"
				min={0}
				max={5}
				step={0.1}
				value={settings.loopDelay}
				valueUnit="s"
				isDisabled={!settings.loop}
				onChange={(v) => updateAndReplay('loopDelay', v)}
			/>

			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(v) => updateAndReplay('loop', v)} />

			<PreviewSwitch title="Mask" isChecked={settings.mask} onChange={(v) => updateAndReplay('mask', v)} />

			<PreviewSwitch
				title="Show Completion Toast"
				isChecked={settings.showCallback}
				onChange={(v) => updateAndReplay('showCallback', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.demo-container :global(.split-text-demo) {
		margin: 0;
		letter-spacing: normal;
		font-size: 5rem;
		font-weight: bolder;
	}

	@media only screen and (max-width: 967px) {
		.demo-container :global(.split-text-demo) {
			font-size: 2rem;
		}
	}
</style>
