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
	import BlurText, {
		type BlurTextEffect,
		type BlurTextStaggerFrom,
		type BlurTextTrigger
	} from '$lib/components/library/TextAnimations/BlurText/BlurText.svelte';
	import source from '$lib/components/library/TextAnimations/BlurText/BlurText.svelte?raw';

	type AnimateBy = 'words' | 'letters';
	type Direction = 'top' | 'bottom' | 'left' | 'right';

	type Look = {
		textColor: string;
		startColor: string;
		effect: BlurTextEffect;
		animateBy: AnimateBy;
		direction: Direction;
		staggerFrom: BlurTextStaggerFrom;
		trigger: BlurTextTrigger;
		delay: number;
		stepDuration: number;
		loop: boolean;
		loopDelay: number;
		blur: number;
		distance: number;
		focusOnHover: boolean;
	};

	const LOOK: Look = {
		textColor: '',
		startColor: '',
		effect: 'blur',
		animateBy: 'words',
		direction: 'top',
		staggerFrom: 'start',
		trigger: 'view',
		delay: 200,
		stepDuration: 0.35,
		loop: false,
		loopDelay: 2,
		blur: 10,
		distance: 50,
		focusOnHover: false
	};

	const PRESETS: Record<string, Look> = {
		soft: { ...LOOK },
		focus: {
			...LOOK,
			effect: 'focus',
			animateBy: 'letters',
			staggerFrom: 'center',
			delay: 35,
			stepDuration: 0.5,
			loop: true,
			loopDelay: 1.6,
			blur: 14,
			distance: 0
		},
		tilt: {
			...LOOK,
			startColor: '#ff5a36',
			effect: 'tilt',
			animateBy: 'letters',
			direction: 'bottom',
			delay: 40,
			stepDuration: 0.45,
			blur: 8,
			distance: 40
		},
		drift: {
			...LOOK,
			effect: 'drift',
			direction: 'left',
			staggerFrom: 'random',
			delay: 110,
			stepDuration: 0.5,
			blur: 12,
			distance: 70,
			focusOnHover: true
		}
	};

	const DEFAULT_PROPS = {
		preset: 'soft',
		text: "Isn't this so cool?!",
		...LOOK
	};

	const PRESET_OPTIONS = [
		{ value: 'soft', label: 'Soft' },
		{ value: 'focus', label: 'Focus' },
		{ value: 'tilt', label: 'Tilt' },
		{ value: 'drift', label: 'Drift' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'blur', label: 'Blur' },
		{ value: 'zoom', label: 'Zoom' },
		{ value: 'tilt', label: 'Tilt' },
		{ value: 'focus', label: 'Focus' },
		{ value: 'drift', label: 'Drift' }
	];

	const ANIMATE_BY_OPTIONS = [
		{ value: 'words', label: 'Words' },
		{ value: 'letters', label: 'Letters' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'top', label: 'Top' },
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	];

	const STAGGER_FROM_OPTIONS = [
		{ value: 'start', label: 'Start' },
		{ value: 'center', label: 'Center' },
		{ value: 'end', label: 'End' },
		{ value: 'random', label: 'Random' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'view', label: 'View' },
		{ value: 'load', label: 'Load' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'click', label: 'Click' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: '""',
			description: 'The text content to animate.'
		},
		{
			name: 'effect',
			type: '"blur" | "zoom" | "tilt" | "focus" | "drift"',
			default: '"blur"',
			description:
				'How each piece comes in. Blur slides in from a side, zoom shrinks down from large, tilt swings in on a slight 3D angle, focus sharpens in place like a camera focus pull and drift glides in sideways with a lean that relaxes.'
		},
		{
			name: 'animateBy',
			type: '"words" | "letters"',
			default: '"words"',
			description: 'Whether each word or each letter comes into focus on its own.'
		},
		{
			name: 'direction',
			type: '"top" | "bottom" | "left" | "right"',
			default: '"top"',
			description:
				'Side the words or letters move in from. Drift always glides sideways, from the right only when set to right.'
		},
		{
			name: 'staggerFrom',
			type: '"start" | "center" | "end" | "random"',
			default: '"start"',
			description: 'Where the stagger starts: the first piece, the middle, the last piece or a shuffled order.'
		},
		{
			name: 'trigger',
			type: '"view" | "load" | "hover" | "click"',
			default: '"view"',
			description:
				'When the text comes in. View waits until it scrolls into view and load starts right away. Hover and click show the text and replay it each time it is hovered or clicked.'
		},
		{
			name: 'delay',
			type: 'number',
			default: '200',
			description: 'Delay between animations for each word/letter (in ms).'
		},
		{
			name: 'stepDuration',
			type: 'number',
			default: '0.35',
			description: 'The time taken for each step of the animation (in seconds).'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'false',
			description: 'Keeps replaying: the text holds, blurs back out and comes in again.'
		},
		{
			name: 'loopDelay',
			type: 'number',
			default: '2',
			description: 'How long the text stays sharp before it blurs out again when looping, in seconds.'
		},
		{
			name: 'blur',
			type: 'number',
			default: '10',
			description: 'How blurred each word or letter starts, in px.'
		},
		{
			name: 'distance',
			type: 'number',
			default: '50',
			description:
				'How far each word or letter travels into place, in px. 0 keeps them still so they only come into focus.'
		},
		{
			name: 'color',
			type: 'string',
			default: '"currentColor"',
			description: 'Color of the text. Follows the surrounding text color by default.'
		},
		{
			name: 'fromColor',
			type: 'string',
			default: '-',
			description:
				'Color each word or letter starts in before it settles on the text color. Leave it out to keep one color.'
		},
		{
			name: 'focusOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Hovering a word keeps it sharp while the other words soften and dim.'
		},
		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'Intersection threshold for triggering the animation.'
		},
		{
			name: 'rootMargin',
			type: 'string',
			default: '"0px"',
			description: 'Root margin for the intersection observer.'
		},
		{
			name: 'animationFrom',
			type: 'object',
			default: 'undefined',
			description: 'Custom starting keyframe. Replaces the effect, blur, distance and direction settings.'
		},
		{
			name: 'animationTo',
			type: 'object[]',
			default: 'undefined',
			description: 'Custom keyframes to animate through after animationFrom.'
		},
		{
			name: 'easing',
			type: 'Easing | Easing[]',
			default: '-',
			description: 'Motion easing applied to every step. Each effect uses its own tuned curves when this is left out.'
		},
		{
			name: 'class',
			type: 'string',
			default: '""',
			description: 'Extra class names for the paragraph.'
		},
		{
			name: 'onAnimationComplete',
			type: 'function',
			default: 'undefined',
			description: 'Called each time the text finishes coming in.'
		}
	];

	const usage = `<script lang="ts">
  import BlurText from '$lib/components/BlurText.svelte';

  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };
</${'script'}>

<BlurText
  text="Isn't this so cool?!"
  effect="blur"
  animateBy="words"
  direction="top"
  staggerFrom="start"
  trigger="view"
  delay={200}
  stepDuration={0.35}
  blur={10}
  distance={50}
  onAnimationComplete={handleAnimationComplete}
  class="text-2xl mb-8"
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, textColor: _textColor, startColor: _startColor, ...rest } = settings;
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
		...(settings.textColor ? { color: settings.textColor } : {}),
		...(settings.startColor ? { fromColor: settings.startColor } : {})
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="BlurText"
	{usage}
	{source}
	{propData}
	dependencies={['motion']}
	demoOnlyProps={['preset', 'textColor', 'startColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; min-height: 400px; overflow: hidden;">
			<RefreshButton onClick={() => key++} />
			{#key key}
				<BlurText
					{...componentProps}
					color={settings.textColor || undefined}
					fromColor={settings.startColor || undefined}
					onAnimationComplete={settings.loop ? undefined : showToast}
					class="blur-text-demo"
				/>
			{/key}
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />

			<PreviewColorPickerCustom
				title="Text Color"
				color={settings.textColor || ink}
				onChange={(v) => demo.updateProp('textColor', v)}
			/>

			<PreviewColorPickerCustom
				title="From Color"
				color={settings.startColor || settings.textColor || ink}
				onChange={(v) => demo.updateProp('startColor', v)}
			/>

			<PreviewSelect
				title="Effect"
				options={EFFECT_OPTIONS}
				value={settings.effect}
				onChange={(v) => updateAndReplay('effect', v as BlurTextEffect)}
			/>

			<PreviewSelect
				title="Animate By"
				options={ANIMATE_BY_OPTIONS}
				value={settings.animateBy}
				onChange={(v) => updateAndReplay('animateBy', v as AnimateBy)}
			/>

			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(v) => updateAndReplay('direction', v as Direction)}
			/>

			<PreviewSelect
				title="Stagger From"
				options={STAGGER_FROM_OPTIONS}
				value={settings.staggerFrom}
				onChange={(v) => updateAndReplay('staggerFrom', v as BlurTextStaggerFrom)}
			/>

			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => updateAndReplay('trigger', v as BlurTextTrigger)}
			/>

			<PreviewSlider
				title="Delay"
				min={20}
				max={500}
				step={10}
				value={settings.delay}
				valueUnit="ms"
				onChange={(v) => updateAndReplay('delay', v)}
			/>

			<PreviewSlider
				title="Step Duration"
				min={0.1}
				max={1}
				step={0.05}
				value={settings.stepDuration}
				valueUnit="s"
				onChange={(v) => updateAndReplay('stepDuration', v)}
			/>

			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(v) => updateAndReplay('loop', v)} />

			<PreviewSlider
				title="Loop Delay"
				min={0.2}
				max={5}
				step={0.1}
				value={settings.loopDelay}
				valueUnit="s"
				isDisabled={!settings.loop}
				onChange={(v) => demo.updateProp('loopDelay', v)}
			/>

			<PreviewSlider
				title="Blur"
				min={0}
				max={30}
				step={1}
				value={settings.blur}
				valueUnit="px"
				onChange={(v) => updateAndReplay('blur', v)}
			/>

			<PreviewSlider
				title="Distance"
				min={0}
				max={120}
				step={5}
				value={settings.distance}
				valueUnit="px"
				onChange={(v) => updateAndReplay('distance', v)}
			/>

			<PreviewSwitch
				title="Focus On Hover"
				isChecked={settings.focusOnHover}
				onChange={(v) => demo.updateProp('focusOnHover', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['motion']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.demo-container :global(.blur-text-demo) {
		font-size: 5rem;
		font-weight: bolder;
	}

	@media only screen and (max-width: 967px) {
		.demo-container :global(.blur-text-demo) {
			font-size: 2rem;
			font-weight: bolder;
		}
	}
</style>
