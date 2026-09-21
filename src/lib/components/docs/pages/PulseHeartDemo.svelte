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
	import PulseHeart, {
		type PulseHeartProps,
	} from '$lib/components/library/Micro/PulseHeart/PulseHeart.svelte';
	import source from '$lib/components/library/Micro/PulseHeart/PulseHeart.svelte?raw';
	const DEFAULT_PROPS: Pick<
		Required<PulseHeartProps>,
		| 'count'
		| 'showCount'
		| 'icon'
		| 'idleOutline'
		| 'likedColor'
		| 'idleColor'
		| 'pillColor'
		| 'textColor'
		| 'size'
		| 'corner'
		| 'duration'
		| 'dotSize'
		| 'overshoot'
		| 'beat'
		| 'rollDuration'
		| 'disabled'
	> = {
		count: 1204,
		showCount: true,
		icon: 'heart',
		idleOutline: true,
		likedColor: '#D9896A',
		idleColor: '#9F8C7B',
		pillColor: '#332B24',
		textColor: '#F5EFE9',
		size: 40,
		corner: 32,
		duration: 560,
		dotSize: 0.3,
		overshoot: 1.7,
		beat: 3,
		rollDuration: 350,
		disabled: false,
	};
	const ICON_OPTIONS = [
		{ value: 'heart', label: 'Heart' },
		{ value: 'star', label: 'Star' },
		{ value: 'thumb', label: 'Thumb' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		count,
		showCount,
		icon,
		idleOutline,
		likedColor,
		idleColor,
		pillColor,
		textColor,
		size,
		corner,
		duration,
		dotSize,
		overshoot,
		beat,
		rollDuration,
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
	const renderedIdle = $derived(idleColor);
	const renderedPill = $derived(pillColor);
	const renderedText = $derived(textColor);
	const propData: PropRow[] = [
		{
			name: 'liked',
			type: 'boolean',
			default: 'undefined',
			description: 'Controlled state. Changes from outside land without a run.',
		},
		{
			name: 'defaultLiked',
			type: 'boolean',
			default: 'false',
			description: 'Initial state when uncontrolled.',
		},
		{
			name: 'count',
			type: 'number',
			default: '0',
			description:
				'The number shown; a press adds or removes one. Rolls one glyph per press. For a multi-digit odometer with places and decimals, use Counter.',
		},
		{
			name: 'onChange',
			type: '(liked: boolean, count: number) => void',
			default: '-',
			description: 'Called on every press with the new state and count.',
		},
		{
			name: 'showCount',
			type: 'boolean',
			default: 'true',
			description: 'Shows the count; off collapses the pill to a circle.',
		},
		{
			name: 'icon',
			type: '"heart" | "star" | "thumb" | string | number | Snippet',
			default: '"heart"',
			description: 'Built-in glyph, or a custom element.',
		},
		{
			name: 'idleOutline',
			type: 'boolean',
			default: 'true',
			description: 'Draws the idle glyph as an outline. Off draws it as a muted solid.',
		},
		{
			name: 'size',
			type: 'number',
			default: '40',
			description: 'Glyph size in pixels; padding, gap and count size derive from it.',
		},
		{ name: 'corner', type: 'number', default: '32', description: 'Pill corner radius in pixels.' },
		{
			name: 'likedColor',
			type: 'string',
			default: '"#D9896A"',
			description: 'Colour after the flip, and of the hover tint and focus ring.',
		},
		{
			name: 'idleColor',
			type: 'string',
			default: '"#9F8C7B"',
			description: 'Colour before the flip.',
		},
		{
			name: 'pillColor',
			type: 'string',
			default: '"#332B24"',
			description: 'Background of the pill that beats under the glyph.',
		},
		{
			name: 'textColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Colour of the count.',
		},
		{
			name: 'duration',
			type: 'number',
			default: '560',
			description: 'Length of the whole run in milliseconds; the flip is always at 40% of it.',
		},
		{
			name: 'dotSize',
			type: 'number',
			default: '0.3',
			description: 'How small the glyph gets at the flip, as a fraction of its size.',
		},
		{
			name: 'overshoot',
			type: 'number',
			default: '1.7',
			description:
				'How far the glyph rebounds past rest on the way back. 0 lands without a rebound.',
		},
		{
			name: 'beat',
			type: 'number',
			default: '3',
			description: 'Percent the pill dips at the flip.',
		},
		{
			name: 'rollDuration',
			type: 'number',
			default: '350',
			description: 'How long the changed glyph of the count takes to roll, in milliseconds.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the button and ignores input.',
		},
		{
			name: 'label',
			type: 'string',
			default: '"Like"',
			description: 'Accessible name; the count is appended to it.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the button.',
		},
	];
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import PulseHeart from \'./PulseHeart.svelte\';\n<\/script>\n\n<PulseHeart\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'liked',
						'defaultLiked',
						'count',
						'onChange',
						'showCount',
						'icon',
						'idleOutline',
						'size',
						'corner',
						'likedColor',
						'idleColor',
						'pillColor',
						'textColor',
						'duration',
						'dotSize',
						'overshoot',
						'beat',
						'rollDuration',
						'disabled',
						'label',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

<svelte:head><title>Pulse Heart - svelte-bits</title></svelte:head>
<h1 class="sub-category">Pulse Heart</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="PulseHeart"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				{#key epoch}<PulseHeart {...props} />{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="pulse-heart" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSlider
				title="Count"
				min={0}
				max={2000}
				step={1}
				value={count}
				onChange={(val) => updateProp('count', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Show Count"
				checked={showCount}
				onChange={(val) => updateProp('showCount', val)}
			></PreviewSwitch>
			<PreviewSelect
				title="Icon"
				options={ICON_OPTIONS}
				value={String(icon)}
				onChange={(val) => updateProp('icon', val)}
			></PreviewSelect>
			<PreviewSwitch
				title="Idle Outline"
				checked={idleOutline}
				onChange={(val) => updateProp('idleOutline', val)}
			></PreviewSwitch>
			<PreviewColorPicker
				title="Liked"
				value={likedColor}
				onChange={(val) => updateProp('likedColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Idle"
				value={renderedIdle}
				onChange={(val) => updateProp('idleColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Pill"
				value={renderedPill}
				onChange={(val) => updateProp('pillColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Text"
				value={renderedText}
				onChange={(val) => updateProp('textColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Size"
				min={24}
				max={64}
				step={2}
				value={size}
				valueUnit="px"
				onChange={(val) => updateProp('size', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Corner"
				min={6}
				max={40}
				step={1}
				value={corner}
				valueUnit="px"
				onChange={(val) => updateProp('corner', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Duration"
				min={300}
				max={900}
				step={20}
				value={duration}
				valueUnit="ms"
				onChange={(val) => updateProp('duration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Dot Size"
				min={0.15}
				max={0.6}
				step={0.05}
				value={dotSize}
				onChange={(val) => updateProp('dotSize', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Overshoot"
				min={0}
				max={3}
				step={0.1}
				value={overshoot}
				onChange={(val) => updateProp('overshoot', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Beat"
				min={2}
				max={4}
				step={0.25}
				value={beat}
				valueUnit="%"
				onChange={(val) => updateProp('beat', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Roll"
				min={150}
				max={600}
				step={10}
				value={rollDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('rollDuration', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
