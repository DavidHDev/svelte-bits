<script lang="ts">
	import ReplayButton from '$lib/components/docs/preview/ReplayButton.svelte';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewInput from '$lib/components/docs/preview/PreviewInput.svelte';
	import PreviewColorPicker from '$lib/components/docs/preview/PreviewColorPicker.svelte';
	import DemoCodeTab from '$lib/components/docs/preview/DemoCodeTab.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import DodgeField, {
		type DodgeFieldProps,
	} from '$lib/components/library/Micro/DodgeField/DodgeField.svelte';
	import source from '$lib/components/library/Micro/DodgeField/DodgeField.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<DodgeFieldProps>,
		| 'inkColor'
		| 'contrastColor'
		| 'fieldHeight'
		| 'reach'
		| 'radius'
		| 'falloff'
		| 'fleeDuration'
		| 'returnDuration'
		| 'returnBounce'
		| 'patience'
		| 'axis'
		| 'wall'
		| 'disabled'
	> = {
		inkColor: '#F5EFE9',
		contrastColor: '#1D1814',
		fieldHeight: 240,
		reach: 72,
		radius: 120,
		falloff: 2,
		fleeDuration: 130,
		returnDuration: 620,
		returnBounce: 0.1,
		patience: 4,
		axis: 'both',
		wall: 'clamp',
		disabled: false,
	};
	const AXIS_OPTIONS = [
		{ value: 'both', label: 'Both' },
		{ value: 'x', label: 'Horizontal' },
		{ value: 'y', label: 'Vertical' },
	];
	const WALL_OPTIONS = [
		{ value: 'clamp', label: 'Clamp' },
		{ value: 'bounce', label: 'Bounce' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		inkColor,
		contrastColor,
		fieldHeight,
		reach,
		radius,
		falloff,
		fleeDuration,
		returnDuration,
		returnBounce,
		patience,
		axis,
		wall,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedInk = $derived(inkColor);
	const renderedContrast = $derived(contrastColor);
	const propData: PropRow[] = [
		{
			name: 'children',
			type: 'string | number | Snippet | (state) => string | number | Snippet',
			default: 'undefined',
			description:
				'What flees. Omit it for the built-in pill, pass any element, or pass a function of { dodges, gave, caught, fleeing }.',
		},
		{
			name: 'taunts',
			type: 'string[]',
			default: '["Catch me", "Nope", "Too slow", "Almost", "Okay, okay"]',
			description:
				'Labels for the built-in pill: the first at rest, then one per dodge, the last once it relents.',
		},
		{
			name: 'notice',
			type: 'string',
			default: '""',
			description: 'One line shown under the child on touch devices, where nothing dodges.',
		},
		{
			name: 'inkColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'The pill tint and text, the caught fill and the focus ring all derive from it.',
		},
		{
			name: 'contrastColor',
			type: 'string',
			default: '"#1D1814"',
			description: 'Text colour while the pill is caught.',
		},
		{
			name: 'fieldHeight',
			type: 'number',
			default: '240',
			description: 'Height of the invisible field in pixels; its width is the container.',
		},
		{
			name: 'reach',
			type: 'number',
			default: '72',
			description: 'How far it bolts, in pixels, with the pointer on its home.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '120',
			description: 'Distance from home at which it starts to react, in pixels.',
		},
		{
			name: 'falloff',
			type: 'number',
			default: '2',
			description:
				'Exponent of the reaction curve. 1 drifts away from far off; 4 only flinches at the last moment.',
		},
		{
			name: 'fleeDuration',
			type: 'number',
			default: '130',
			description: 'Settle time of the dart, in milliseconds.',
		},
		{
			name: 'returnDuration',
			type: 'number',
			default: '620',
			description: 'Settle time of the glide home, in milliseconds.',
		},
		{
			name: 'returnBounce',
			type: 'number',
			default: '0.1',
			description: 'Overshoot on the way home. 0.1 is a hair, 0.3 a visible wobble.',
		},
		{
			name: 'axis',
			type: '"both" | "x" | "y"',
			default: '"both"',
			description: 'Which way it may flee.',
		},
		{
			name: 'wall',
			type: '"clamp" | "bounce"',
			default: '"clamp"',
			description: 'At the edge of the field: stop dead, or fold the overflow back so it rebounds.',
		},
		{
			name: 'patience',
			type: 'number',
			default: '4',
			description:
				'Dodges before it gives in and sits still, at least 1. Never wrap a decline or close control in a field that dodges.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Sits still and stops counting; the child stays clickable.',
		},
		{
			name: 'onDodge',
			type: '(count: number) => void',
			default: '-',
			description: 'Called on each counted dodge.',
		},
		{ name: 'onRelent', type: '() => void', default: '-', description: 'Called when it gives in.' },
		{
			name: 'onCatch',
			type: '() => void',
			default: '-',
			description: 'Called when the child is clicked.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the field.',
		},
		{
			name: 'style',
			type: 'CSSProperties',
			default: 'undefined',
			description: 'Inline styles merged onto the field.',
		},
	];
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import DodgeField from \'./DodgeField.svelte\';\n<\/script>\n\n<DodgeField\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'children',
						'taunts',
						'notice',
						'inkColor',
						'contrastColor',
						'fieldHeight',
						'reach',
						'radius',
						'falloff',
						'fleeDuration',
						'returnDuration',
						'returnBounce',
						'axis',
						'wall',
						'patience',
						'disabled',
						'onDodge',
						'onRelent',
						'onCatch',
						'className',
						'style',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Dodge Field - svelte-bits</title></svelte:head>
<h1 class="sub-category">Dodge Field</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="DodgeField"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				{#key epoch}<DodgeField {...props} />{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="dodge-field" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Ink"
				value={renderedInk}
				onChange={(val) => updateProp('inkColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Contrast"
				value={renderedContrast}
				onChange={(val) => updateProp('contrastColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Field Height"
				min={120}
				max={360}
				step={10}
				value={fieldHeight}
				valueUnit="px"
				onChange={(val) => updateProp('fieldHeight', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Reach"
				min={14}
				max={120}
				step={2}
				value={reach}
				valueUnit="px"
				onChange={(val) => updateProp('reach', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={60}
				max={200}
				step={5}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Falloff"
				min={1}
				max={4}
				step={0.5}
				value={falloff}
				onChange={(val) => updateProp('falloff', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Flee"
				min={60}
				max={300}
				step={10}
				value={fleeDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('fleeDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Return"
				min={200}
				max={1000}
				step={20}
				value={returnDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('returnDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Return Bounce"
				min={0}
				max={0.3}
				step={0.05}
				value={returnBounce}
				onChange={(val) => updateProp('returnBounce', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Patience"
				min={1}
				max={8}
				step={1}
				value={patience}
				onChange={(val) => updateProp('patience', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Axis"
				options={AXIS_OPTIONS}
				value={axis}
				onChange={(val) => updateProp('axis', val)}
			></PreviewSelect>
			<PreviewSelect
				title="Wall"
				options={WALL_OPTIONS}
				value={wall}
				onChange={(val) => updateProp('wall', val)}
			></PreviewSelect>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
