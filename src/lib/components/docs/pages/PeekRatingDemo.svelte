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
	import PeekRating, {
		type PeekRatingProps,
	} from '$lib/components/library/Micro/PeekRating/PeekRating.svelte';
	import source from '$lib/components/library/Micro/PeekRating/PeekRating.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<PeekRatingProps>,
		| 'count'
		| 'shape'
		| 'activeColor'
		| 'idleColor'
		| 'tipColor'
		| 'tipTextColor'
		| 'size'
		| 'lift'
		| 'magnify'
		| 'riseDuration'
		| 'popScale'
		| 'showTip'
		| 'allowClear'
		| 'readOnly'
	> & { showLabels: boolean } = {
		count: 5,
		shape: 'star',
		showLabels: true,
		activeColor: '#DEA45E',
		idleColor: '#736153',
		tipColor: '#3A312A',
		tipTextColor: '#F5EFE9',
		size: 40,
		lift: 8,
		magnify: 1.15,
		riseDuration: 320,
		popScale: 1.3,
		showTip: true,
		allowClear: true,
		readOnly: false,
	};
	const LABELS = [
		'Poor',
		'Fair',
		'Good',
		'Great',
		'Superb',
		'Stellar',
		'Epic',
		'Legendary',
		'Mythic',
		'Perfect',
	];
	const SHAPE_OPTIONS = [
		{ value: 'star', label: 'Star' },
		{ value: 'heart', label: 'Heart' },
		{ value: 'bolt', label: 'Bolt' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		count,
		shape,
		showLabels,
		activeColor,
		idleColor,
		tipColor,
		tipTextColor,
		size,
		lift,
		magnify,
		riseDuration,
		popScale,
		showTip,
		allowClear,
		readOnly,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		value = 3;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedIdleColor = $derived(idleColor);
	const renderedTipColor = $derived(tipColor);
	const renderedTipTextColor = $derived(tipTextColor);
	const propData: PropRow[] = [
		{
			name: 'value',
			type: 'number',
			default: 'undefined',
			description: 'Controlled rating, from 0 to count.',
		},
		{
			name: 'defaultValue',
			type: 'number',
			default: '0',
			description: 'Initial rating when uncontrolled.',
		},
		{
			name: 'onChange',
			type: '(value: number) => void',
			default: '-',
			description: 'Called when a rating is committed by click, release or keyboard.',
		},
		{
			name: 'onPreview',
			type: '(value: number | null) => void',
			default: '-',
			description:
				'Called on every slot crossing while previewing, and with null when the preview clears.',
		},
		{ name: 'count', type: 'number', default: '5', description: 'Number of glyphs.' },
		{
			name: 'shape',
			type: '"star" | "heart" | "bolt"',
			default: '"star"',
			description: 'Built-in glyph shape.',
		},
		{
			name: 'icon',
			type: 'string | number | Snippet',
			default: 'undefined',
			description: 'Custom glyph that replaces the built-in shape.',
		},
		{
			name: 'labels',
			type: 'string[]',
			default: '[]',
			description:
				'One label per glyph, shown in the tip while previewing. Without labels the tip shows the number.',
		},
		{
			name: 'activeColor',
			type: 'string',
			default: '"#DEA45E"',
			description: 'Colour of lit glyphs and of the focus ring.',
		},
		{
			name: 'idleColor',
			type: 'string',
			default: '"#736153"',
			description: 'Colour of unlit glyphs.',
		},
		{
			name: 'tipColor',
			type: 'string',
			default: '"#3A312A"',
			description: 'Background of the tip that follows the pointer.',
		},
		{
			name: 'tipTextColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Text colour of the tip.',
		},
		{
			name: 'size',
			type: 'number',
			default: '28',
			description: 'Glyph size in pixels; spacing and the tip scale with it.',
		},
		{
			name: 'lift',
			type: 'number',
			default: '6',
			description: 'How far previewed glyphs rise, in pixels. 0 makes the preview colour-only.',
		},
		{
			name: 'magnify',
			type: 'number',
			default: '1.15',
			description: 'Scale of the glyph under the pointer.',
		},
		{
			name: 'riseDuration',
			type: 'number',
			default: '320',
			description: 'Duration in milliseconds of each glyph’s rise and fall, and of the tip’s hop.',
		},
		{
			name: 'popScale',
			type: 'number',
			default: '1.3',
			description: 'Peak scale of the pop on the committed glyph. 1 disables it.',
		},
		{
			name: 'showTip',
			type: 'boolean',
			default: 'true',
			description: 'Shows the tip above the pointer glyph while previewing.',
		},
		{
			name: 'allowClear',
			type: 'boolean',
			default: 'true',
			description: 'Clicking the current rating again, or Backspace, clears it to 0.',
		},
		{
			name: 'readOnly',
			type: 'boolean',
			default: 'false',
			description: 'Display only: no preview, no pop, announced as an image.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the control and ignores input.',
		},
		{
			name: 'ariaLabel',
			type: 'string',
			default: '"Rating"',
			description: 'Accessible name of the radio group.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root element.',
		},
	];
	let value = $state(3);
	function setValue(next: number) {
		value = next;
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import PeekRating from \'./PeekRating.svelte\';\n<\/script>\n\n<PeekRating\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'value',
						'defaultValue',
						'onChange',
						'onPreview',
						'count',
						'shape',
						'icon',
						'labels',
						'activeColor',
						'idleColor',
						'tipColor',
						'tipTextColor',
						'size',
						'lift',
						'magnify',
						'riseDuration',
						'popScale',
						'showTip',
						'allowClear',
						'readOnly',
						'disabled',
						'ariaLabel',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(
		JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS) || value !== 3,
	);
</script>

<svelte:head><title>Peek Rating - svelte-bits</title></svelte:head>
<h1 class="sub-category">Peek Rating</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="PeekRating"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<PeekRating {...props} {value} onChange={setValue} labels={showLabels ? LABELS : []} />
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="peek-rating" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSlider
				title="Value"
				min={0}
				max={count}
				step={1}
				value={Math.min(value, count)}
				onChange={setValue}
			></PreviewSlider>
			<PreviewSlider
				title="Count"
				min={3}
				max={10}
				step={1}
				value={count}
				onChange={(val) => {
					updateProp('count', val);
					setValue(Math.min(value, val));
				}}
			></PreviewSlider>
			<PreviewSelect
				title="Shape"
				options={SHAPE_OPTIONS}
				value={shape}
				onChange={(val) => updateProp('shape', val)}
			></PreviewSelect>
			<PreviewSwitch
				title="Labels"
				checked={showLabels}
				onChange={(val) => updateProp('showLabels', val)}
			></PreviewSwitch>
			<PreviewSwitch title="Tip" checked={showTip} onChange={(val) => updateProp('showTip', val)}
			></PreviewSwitch>
			<PreviewColorPicker
				title="Active"
				value={activeColor}
				onChange={(val) => updateProp('activeColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Idle"
				value={renderedIdleColor}
				onChange={(val) => updateProp('idleColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Tip"
				value={renderedTipColor}
				onChange={(val) => updateProp('tipColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Tip Text"
				value={renderedTipTextColor}
				onChange={(val) => updateProp('tipTextColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Size"
				min={16}
				max={48}
				step={1}
				value={size}
				valueUnit="px"
				onChange={(val) => updateProp('size', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Lift"
				min={0}
				max={16}
				step={1}
				value={lift}
				valueUnit="px"
				onChange={(val) => updateProp('lift', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Magnify"
				min={1}
				max={1.5}
				step={0.01}
				value={magnify}
				onChange={(val) => updateProp('magnify', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Rise"
				min={120}
				max={600}
				step={10}
				value={riseDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('riseDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Pop"
				min={1}
				max={1.6}
				step={0.05}
				value={popScale}
				onChange={(val) => updateProp('popScale', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Allow Clear"
				checked={allowClear}
				onChange={(val) => updateProp('allowClear', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Read Only"
				checked={readOnly}
				onChange={(val) => updateProp('readOnly', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
