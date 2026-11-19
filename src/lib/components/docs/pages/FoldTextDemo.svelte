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
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import FoldText, {
		type FoldStyle,
		type Hinge,
		type SplitBy,
		type StaggerFrom,
		type Trigger
	} from '$lib/components/library/TextAnimations/FoldText/FoldText.svelte';
	import source from '$lib/components/library/TextAnimations/FoldText/FoldText.svelte?raw';

	type Look = {
		foldStyle: FoldStyle;
		trigger: Trigger;
		splitBy: SplitBy;
		hinge: Hinge;
		staggerFrom: StaggerFrom;
		ease: string;
		foldAngle: number;
		duration: number;
		stagger: number;
		loopDelay: number;
		hoverRefold: boolean;
		refoldRadius: number;
		refoldAngle: number;
		perspective: number;
		creaseShading: number;
	};

	const LOOK: Look = {
		foldStyle: 'paper',
		trigger: 'mount',
		splitBy: 'char',
		hinge: 'top',
		staggerFrom: 'start',
		ease: 'power3.out',
		foldAngle: 92,
		duration: 0.65,
		stagger: 0.045,
		loopDelay: 1.4,
		hoverRefold: true,
		refoldRadius: 140,
		refoldAngle: 45,
		perspective: 700,
		creaseShading: 0.55
	};

	const PRESETS: Record<string, Look> = {
		paper: { ...LOOK },
		blinds: {
			...LOOK,
			foldStyle: 'blinds',
			trigger: 'loop',
			staggerFrom: 'center',
			ease: 'expo.out',
			foldAngle: 90,
			duration: 1.1,
			stagger: 0.05,
			loopDelay: 1.6,
			refoldRadius: 150,
			refoldAngle: 60,
			perspective: 500,
			creaseShading: 0.8
		},
		flip: {
			...LOOK,
			foldStyle: 'flip',
			hinge: 'left',
			ease: 'back.out(1.2)',
			duration: 1.15,
			stagger: 0.06,
			refoldRadius: 120,
			refoldAngle: 40,
			perspective: 900,
			creaseShading: 0.45
		},
		swing: {
			...LOOK,
			trigger: 'loop',
			splitBy: 'word',
			hinge: 'right',
			staggerFrom: 'end',
			ease: 'circ.out',
			foldAngle: 112,
			duration: 0.95,
			stagger: 0.14,
			loopDelay: 0.9,
			hoverRefold: false,
			perspective: 420,
			creaseShading: 0.7
		}
	};

	const DEFAULT_PROPS = {
		preset: 'paper',
		text: 'Design unfolds',
		textColor: '',
		...LOOK,
		fontSize: 80,
		fontWeight: 800
	};

	const PRESET_OPTIONS = [
		{ value: 'paper', label: 'Paper' },
		{ value: 'blinds', label: 'Blinds' },
		{ value: 'flip', label: 'Flip' },
		{ value: 'swing', label: 'Swing' }
	];

	const FOLD_STYLE_OPTIONS = [
		{ value: 'paper', label: 'Paper' },
		{ value: 'blinds', label: 'Blinds' },
		{ value: 'flip', label: 'Flip' }
	];

	const SPLIT_OPTIONS = [
		{ value: 'char', label: 'Character' },
		{ value: 'word', label: 'Word' },
		{ value: 'line', label: 'Line' }
	];

	const HINGE_OPTIONS = [
		{ value: 'top', label: 'Top' },
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	];

	const STAGGER_FROM_OPTIONS = [
		{ value: 'start', label: 'Start' },
		{ value: 'center', label: 'Center' },
		{ value: 'end', label: 'End' },
		{ value: 'edges', label: 'Edges' },
		{ value: 'random', label: 'Random' }
	];

	const TRIGGER_OPTIONS = [
		{ value: 'mount', label: 'Mount' },
		{ value: 'hover', label: 'Hover' },
		{ value: 'scroll', label: 'Scroll' },
		{ value: 'loop', label: 'Loop' }
	];

	const EASE_OPTIONS = [
		{ value: 'power3.out', label: 'Power out' },
		{ value: 'expo.out', label: 'Expo out' },
		{ value: 'back.out(1.2)', label: 'Soft back' },
		{ value: 'circ.out', label: 'Circular' }
	];

	const propData: PropRow[] = [
		{
			name: 'text',
			type: 'string',
			default: '"Design unfolds"',
			description: 'The text to split and fold into place. Line breaks are kept.'
		},
		{
			name: 'foldStyle',
			type: '"paper" | "blinds" | "flip"',
			default: '"paper"',
			description:
				'How each piece folds. Paper swings open from its hinge edge, blinds splits it into two slats that turn open one after the other, and flip turns it over like a card, lifting toward you mid-turn.'
		},
		{
			name: 'splitBy',
			type: '"char" | "word" | "line"',
			default: '"char"',
			description: 'Whether each character, word or line folds as its own panel.'
		},
		{
			name: 'hinge',
			type: '"top" | "bottom" | "left" | "right"',
			default: '"top"',
			description: 'The edge each panel folds around. For blinds and flip it picks the axis and the turning direction.'
		},
		{
			name: 'foldAngle',
			type: 'number',
			default: '92',
			description:
				'How far the panels start folded away, in degrees. Past 90 they flip over from behind. Flip always turns a full half turn.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '0.65',
			description: 'How long each panel takes to unfold, in seconds.'
		},
		{
			name: 'stagger',
			type: 'number',
			default: '0.045',
			description: 'Delay between panels, in seconds.'
		},
		{
			name: 'staggerFrom',
			type: '"start" | "center" | "end" | "edges" | "random"',
			default: '"start"',
			description: 'Where the cascade starts.'
		},
		{
			name: 'ease',
			type: 'string',
			default: '"power3.out"',
			description: 'GSAP ease used for the unfold.'
		},
		{
			name: 'perspective',
			type: 'number',
			default: '700',
			description: 'Camera distance for the fold, in px. Lower values look deeper.'
		},
		{
			name: 'creaseShading',
			type: 'number',
			default: '0.55',
			description: 'How dark the crease shading gets while a panel is folded, from 0 to 1.'
		},
		{
			name: 'trigger',
			type: '"mount" | "hover" | "scroll" | "loop"',
			default: '"mount"',
			description: 'When the text unfolds. Loop holds the text, folds it back up and plays again.'
		},
		{
			name: 'loopDelay',
			type: 'number',
			default: '1.4',
			description:
				"How long the unfolded text holds before folding back up, in seconds. Only applies when trigger is 'loop'."
		},
		{
			name: 'hoverRefold',
			type: 'boolean',
			default: 'false',
			description: 'Panels near the cursor fold partly away and ease back open once it passes.'
		},
		{
			name: 'refoldRadius',
			type: 'number',
			default: '140',
			description: 'How far from the cursor panels react with hoverRefold, in px. The fold fades out toward the edge.'
		},
		{
			name: 'refoldAngle',
			type: 'number',
			default: '45',
			description: 'How far a panel right under the cursor folds away with hoverRefold, in degrees.'
		},
		{
			name: 'fontSize',
			type: 'string | number',
			default: '80',
			description: 'Font size of the text. Numbers are in px.'
		},
		{
			name: 'fontWeight',
			type: 'string | number',
			default: '800',
			description: 'Font weight of the text.'
		},
		{
			name: 'color',
			type: 'string',
			default: '"currentColor"',
			description: 'Color of the text. Follows the surrounding text color by default.'
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra class names for the root element.'
		},
		{
			name: 'style',
			type: 'Record<string, string | number>',
			default: '{}',
			description: 'Inline styles for the root element.'
		}
	];

	const usage = `<script lang="ts">
  import FoldText from '$lib/components/FoldText.svelte';
</${'script'}>

<FoldText
  text="Launch with clarity"
  foldStyle="paper"
  splitBy="char"
  hinge="top"
  trigger="scroll"
  foldAngle={92}
  duration={0.65}
  stagger={0.045}
  staggerFrom="start"
  ease="power3.out"
  loopDelay={1.4}
  hoverRefold={true}
  refoldRadius={140}
  refoldAngle={45}
  perspective={700}
  creaseShading={0.55}
  fontSize="clamp(3rem, 10vw, 7rem)"
  fontWeight={800}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, textColor: _textColor, ...rest } = settings;
		return rest;
	});
	let key = $state(0);
	const ink = $derived(colorModeValue('#18181b', '#ffffff'));
	const computedProps = $derived(settings.textColor ? { color: settings.textColor } : {});

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
</script>

<TabsLayout
	propsState={demo}
	componentName="FoldText"
	{usage}
	{source}
	{propData}
	dependencies={['gsap']}
	demoOnlyProps={['preset', 'textColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; min-height: 430px; overflow: hidden;">
			<RefreshButton onClick={() => key++} />
			<div
				style="position: relative; min-height: 430px; display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center; padding-left: 2rem; padding-right: 2rem;"
			>
				{#key key}
					<FoldText {...componentProps} color={settings.textColor || 'currentColor'} />
				{/key}
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Text Color"
				color={settings.textColor || ink}
				onChange={(v) => demo.updateProp('textColor', v)}
			/>
			<PreviewSelect
				title="Fold Style"
				options={FOLD_STYLE_OPTIONS}
				value={settings.foldStyle}
				onChange={(v) => updateAndReplay('foldStyle', v as FoldStyle)}
			/>
			<PreviewSelect
				title="Trigger"
				options={TRIGGER_OPTIONS}
				value={settings.trigger}
				onChange={(v) => updateAndReplay('trigger', v as Trigger)}
			/>
			<PreviewSelect
				title="Split By"
				options={SPLIT_OPTIONS}
				value={settings.splitBy}
				onChange={(v) => updateAndReplay('splitBy', v as SplitBy)}
			/>
			<PreviewSelect
				title="Hinge"
				options={HINGE_OPTIONS}
				value={settings.hinge}
				onChange={(v) => updateAndReplay('hinge', v as Hinge)}
			/>
			<PreviewSelect
				title="Stagger From"
				options={STAGGER_FROM_OPTIONS}
				value={settings.staggerFrom}
				onChange={(v) => updateAndReplay('staggerFrom', v as StaggerFrom)}
			/>
			<PreviewSelect
				title="Ease"
				options={EASE_OPTIONS}
				value={settings.ease}
				onChange={(v) => updateAndReplay('ease', String(v))}
			/>
			<PreviewSlider
				title="Fold Angle"
				min={30}
				max={180}
				step={1}
				value={settings.foldAngle}
				valueUnit="°"
				isDisabled={settings.foldStyle === 'flip'}
				onChange={(v) => updateAndReplay('foldAngle', v)}
			/>
			<PreviewSlider
				title="Duration"
				min={0.3}
				max={1.6}
				step={0.05}
				value={settings.duration}
				valueUnit="s"
				onChange={(v) => updateAndReplay('duration', v)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0.01}
				max={0.2}
				step={0.005}
				value={settings.stagger}
				valueUnit="s"
				onChange={(v) => updateAndReplay('stagger', v)}
			/>
			<PreviewSlider
				title="Loop Delay"
				min={0}
				max={4}
				step={0.1}
				value={settings.loopDelay}
				valueUnit="s"
				isDisabled={settings.trigger !== 'loop'}
				onChange={(v) => updateAndReplay('loopDelay', v)}
			/>
			<PreviewSwitch
				title="Hover Refold"
				isChecked={settings.hoverRefold}
				onChange={(v) => updateAndReplay('hoverRefold', v)}
			/>
			<PreviewSlider
				title="Refold Radius"
				min={40}
				max={320}
				step={10}
				value={settings.refoldRadius}
				valueUnit="px"
				isDisabled={!settings.hoverRefold}
				onChange={(v) => updateAndReplay('refoldRadius', v)}
			/>
			<PreviewSlider
				title="Refold Angle"
				min={10}
				max={120}
				step={5}
				value={settings.refoldAngle}
				valueUnit="°"
				isDisabled={!settings.hoverRefold}
				onChange={(v) => updateAndReplay('refoldAngle', v)}
			/>
			<PreviewSlider
				title="Perspective"
				min={300}
				max={1200}
				step={25}
				value={settings.perspective}
				valueUnit="px"
				onChange={(v) => updateAndReplay('perspective', v)}
			/>
			<PreviewSlider
				title="Crease Shading"
				min={0}
				max={1}
				step={0.05}
				value={settings.creaseShading}
				onChange={(v) => updateAndReplay('creaseShading', v)}
			/>
			<PreviewSlider
				title="Font Size"
				min={44}
				max={112}
				step={2}
				value={settings.fontSize}
				valueUnit="px"
				onChange={(v) => updateAndReplay('fontSize', v)}
			/>
			<PreviewSlider
				title="Font Weight"
				min={300}
				max={900}
				step={50}
				value={settings.fontWeight}
				onChange={(v) => updateAndReplay('fontWeight', v)}
			/>
			<PreviewInput
				title="Text"
				value={settings.text}
				placeholder="Enter heading text"
				maxLength={34}
				onChange={(v) => updateAndReplay('text', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
