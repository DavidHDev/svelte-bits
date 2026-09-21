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
	import WarmTooltip, {
		type WarmTooltipProps,
	} from '$lib/components/library/Micro/WarmTooltip/WarmTooltip.svelte';
	import source from '$lib/components/library/Micro/WarmTooltip/WarmTooltip.svelte?raw';
	const Image01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'circle',
			{
				cx: '7.5',
				cy: '7.5',
				r: '1.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z',
				stroke: 'currentColor',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M5 21C9.37246 15.775 14.2741 8.88406 21.4975 13.5424',
				stroke: 'currentColor',
				'stroke-width': '1.5',
				key: '2',
			},
		],
	];
	const Link01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M9.14339 10.691L9.35031 10.4841C11.329 8.50532 14.5372 8.50532 16.5159 10.4841C18.4947 12.4628 18.4947 15.671 16.5159 17.6497L13.6497 20.5159C11.671 22.4947 8.46279 22.4947 6.48405 20.5159C4.50532 18.5372 4.50532 15.329 6.48405 13.3503L6.9484 12.886',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M17.0516 11.114L17.5159 10.6497C19.4947 8.67095 19.4947 5.46279 17.5159 3.48405C15.5372 1.50532 12.329 1.50532 10.3503 3.48405L7.48405 6.35031C5.50532 8.32904 5.50532 11.5372 7.48405 13.5159C9.46279 15.4947 12.671 15.4947 14.6497 13.5159L14.8566 13.309',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const MoreHorizontalIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M6.00449 12.5V12M18.0045 12.5V12M12.0045 12.5V12M7.00449 12.5C7.00449 11.9477 6.55677 11.5 6.00449 11.5C5.4522 11.5 5.00449 11.9477 5.00449 12.5C5.00449 13.0523 5.4522 13.5 6.00449 13.5C6.55677 13.5 7.00449 13.0523 7.00449 12.5ZM19.0045 12.5C19.0045 11.9477 18.5568 11.5 18.0045 11.5C17.4522 11.5 17.0045 11.9477 17.0045 12.5C17.0045 13.0523 17.4522 13.5 18.0045 13.5C18.5568 13.5 19.0045 13.0523 19.0045 12.5ZM13.0045 12.5C13.0045 11.9477 12.5568 11.5 12.0045 11.5C11.4522 11.5 11.0045 11.9477 11.0045 12.5C11.0045 13.0523 11.4522 13.5 12.0045 13.5C12.5568 13.5 13.0045 13.0523 13.0045 12.5Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const TextBoldIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M5 6C5 4.58579 5 3.87868 5.43934 3.43934C5.87868 3 6.58579 3 8 3H12.5789C15.0206 3 17 5.01472 17 7.5C17 9.98528 15.0206 12 12.5789 12H5V6Z',
				stroke: 'currentColor',
				'fill-rule': 'evenodd',
				'clip-rule': 'evenodd',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M12.4286 12H13.6667C16.0599 12 18 14.0147 18 16.5C18 18.9853 16.0599 21 13.6667 21H8C6.58579 21 5.87868 21 5.43934 20.5607C5 20.1213 5 19.4142 5 18V12',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const TextItalicIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M12 4H19',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M8 20L16 4',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M5 20H12',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
	];
	const TextUnderlineIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M5.5 3V11.5C5.5 15.0899 8.41015 18 12 18C15.5899 18 18.5 15.0899 18.5 11.5V3',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M3 21H21',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const DEFAULT_PROPS: Pick<
		Required<WarmTooltipProps>,
		| 'side'
		| 'surfaceColor'
		| 'inkColor'
		| 'size'
		| 'radius'
		| 'gap'
		| 'arrow'
		| 'delay'
		| 'warmWindow'
		| 'popDuration'
		| 'popScale'
		| 'popBlur'
		| 'showFuse'
	> & { travel: number; lean: boolean } = {
		side: 'top',
		surfaceColor: '#F5EFE9',
		inkColor: '#1D1814',
		size: 'md',
		radius: 8,
		gap: 8,
		arrow: true,
		delay: 400,
		warmWindow: 300,
		travel: 320,
		popDuration: 160,
		popScale: 0.94,
		popBlur: 4,
		lean: false,
		showFuse: false,
	};
	const TOOLS = [
		{ name: 'Bold', label: 'Bold', shortcut: '⌘B', icon: TextBoldIcon },
		{ name: 'Italic', label: 'Italic', shortcut: '⌘I', icon: TextItalicIcon },
		{ name: 'Underline', label: 'Underline', shortcut: '⌘U', icon: TextUnderlineIcon },
		{ name: 'Link', label: 'Add link', shortcut: '⌘K', icon: Link01Icon },
		{ name: 'Insert image', label: 'Insert image', icon: Image01Icon },
		{ name: 'More', label: 'More options', icon: MoreHorizontalIcon },
	];
	const SIDE_OPTIONS = [
		{ value: 'top', label: 'Top' },
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
	];
	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		side,
		surfaceColor,
		inkColor,
		size,
		radius,
		gap,
		arrow,
		delay,
		warmWindow,
		travel,
		popDuration,
		popScale,
		popBlur,
		lean,
		showFuse,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedSurface = $derived(surfaceColor);
	const renderedInk = $derived(inkColor);
	const propData: PropRow[] = [
		{
			name: 'travel',
			type: 'number',
			default: '320',
			description:
				'Milliseconds for the shared tooltip to travel between triggers. Zero moves instantly.',
		},
		{
			name: 'lean',
			type: 'number',
			default: '0',
			description: 'Maximum velocity-driven tilt in degrees.',
		},
		{
			name: 'onWarmChange',
			type: '(warm: boolean) => void',
			default: 'undefined',
			description: 'Called when the shared tooltip group warms up or cools down.',
		},
		{
			name: 'content',
			type: 'string | number | Snippet',
			default: '-',
			description: 'The label. Keep it to a few words.',
		},
		{
			name: 'shortcut',
			type: 'string | number | Snippet',
			default: 'undefined',
			description: 'Optional keyboard shortcut, drawn as a keycap beside the label.',
		},
		{
			name: 'children',
			type: 'Snippet',
			default: '-',
			description:
				'The trigger. It only receives aria-describedby; its own handlers and focus ring stay untouched.',
		},
		{
			name: 'side',
			type: '"top" | "bottom" | "left" | "right"',
			default: '"top"',
			description:
				'The edge the label hangs from; also where the fuse runs and the pop originates.',
		},
		{
			name: 'delay',
			type: 'number',
			default: '400',
			description:
				'How long a cold open waits, in milliseconds. Inherits the group value when omitted.',
		},
		{
			name: 'warmWindow',
			type: 'number',
			default: '300',
			description:
				'How long after this label closes the group stays warm. Inherits the group value when omitted.',
		},
		{
			name: 'surfaceColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Label background, arrow and fuse.',
		},
		{
			name: 'inkColor',
			type: 'string',
			default: '"#1D1814"',
			description: 'Label text; the keycap is tinted from it.',
		},
		{
			name: 'size',
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: 'Font size and padding of the label.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '8',
			description: 'Corner radius of the label in pixels.',
		},
		{
			name: 'gap',
			type: 'number',
			default: '8',
			description: 'Distance between the trigger edge and the label.',
		},
		{
			name: 'arrow',
			type: 'boolean',
			default: 'true',
			description: 'Shows the pointer on the anchored edge.',
		},
		{
			name: 'popDuration',
			type: 'number',
			default: '160',
			description: 'Cold pop-in time in milliseconds; the exit takes 0.8 of it.',
		},
		{
			name: 'popScale',
			type: 'number',
			default: '0.94',
			description: 'Scale the label pops from. 1 makes it a fade.',
		},
		{
			name: 'popBlur',
			type: 'number',
			default: '4',
			description: 'Blur in pixels the label arrives through.',
		},
		{
			name: 'showFuse',
			type: 'boolean',
			default: 'false',
			description:
				'Draws a thin line along the trigger edge that fills over the delay, or over the long press on touch.',
		},
		{
			name: 'longPress',
			type: 'number',
			default: '500',
			description:
				'Hold time in milliseconds that opens the label on touch; the click that follows is swallowed.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'No open path; an open label closes.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the trigger wrapper.',
		},
		{
			name: 'group',
			type: 'boolean',
			default: 'false',
			description:
				'Use <WarmTooltip group> around sibling tooltips to share one moving label and warm-up timer. The wrapper accepts delay, warmWindow, travel, lean and onWarmChange. Use bind:this to access reset().',
		},
	];
	const vertical = $derived(side === 'left' || side === 'right');
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import WarmTooltip from \'./WarmTooltip.svelte\';\n<\/script>\n\n<WarmTooltip\n' +
			Object.entries({ ...props, ...{ content: 'Save changes', shortcut: '⌘S' } })
				.filter(([key]) =>
					[
						'content',
						'shortcut',
						'children',
						'side',
						'delay',
						'warmWindow',
						'surfaceColor',
						'inkColor',
						'size',
						'radius',
						'gap',
						'arrow',
						'popDuration',
						'popScale',
						'popBlur',
						'showFuse',
						'longPress',
						'disabled',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n>\n  <button type="button">Save</button>\n</WarmTooltip>',
	);
	const hasChanges = $derived(JSON.stringify(props) !== JSON.stringify(DEFAULT_PROPS));
</script>

{#snippet iconSvg(
	shapes: readonly (readonly [string, Record<string, string | number>])[],
	size: number,
	strokeWidth: number,
)}<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		>{#each shapes as [tag, attrs]}<svelte:element this={tag} {...attrs} />{/each}</svg
	>{/snippet}

<svelte:head><title>Warm Tooltip - svelte-bits</title></svelte:head>
<h1 class="sub-category">Warm Tooltip</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="WarmTooltip"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<WarmTooltip group {delay} {warmWindow} {travel} lean={lean ? 5 : 0}
					><div
						class="inline-flex gap-1 rounded-2xl p-1.5"
						class:flex-col={vertical}
						style="background:#332B24"
					>
						{#each TOOLS as tool}<WarmTooltip
								{...props}
								lean={lean ? 5 : 0}
								content={tool.label}
								shortcut={tool.shortcut}
								><button
									type="button"
									aria-label={tool.name}
									class="grid size-10 place-items-center rounded-xl text-[#F5EFE9] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D6A46B]"
									>{@render iconSvg(tool.icon, 18, 1.8)}</button
								></WarmTooltip
							>{/each}
					</div></WarmTooltip
				>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="warm-tooltip" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewColorPicker
				title="Surface"
				value={renderedSurface}
				onChange={(val) => updateProp('surfaceColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Ink"
				value={renderedInk}
				onChange={(val) => updateProp('inkColor', val)}
			></PreviewColorPicker>
			<PreviewSelect
				title="Side"
				options={SIDE_OPTIONS}
				value={side}
				onChange={(val) => updateProp('side', val)}
			></PreviewSelect>
			<PreviewSelect
				title="Size"
				options={SIZE_OPTIONS}
				value={size}
				onChange={(val) => updateProp('size', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Radius"
				min={0}
				max={16}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Gap"
				min={2}
				max={20}
				step={1}
				value={gap}
				valueUnit="px"
				onChange={(val) => updateProp('gap', val)}
			></PreviewSlider>
			<PreviewSwitch title="Arrow" checked={arrow} onChange={(val) => updateProp('arrow', val)}
			></PreviewSwitch>
			<PreviewSlider
				title="Delay"
				min={0}
				max={1000}
				step={50}
				value={delay}
				valueUnit="ms"
				onChange={(val) => updateProp('delay', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Warm Window"
				min={0}
				max={2000}
				step={50}
				value={warmWindow}
				valueUnit="ms"
				onChange={(val) => updateProp('warmWindow', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Travel"
				min={0}
				max={800}
				step={20}
				value={travel}
				valueUnit="ms"
				onChange={(val) => updateProp('travel', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Pop Duration"
				min={0}
				max={300}
				step={5}
				value={popDuration}
				valueUnit="ms"
				onChange={(val) => updateProp('popDuration', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Pop Scale"
				min={0.8}
				max={1}
				step={0.01}
				value={popScale}
				onChange={(val) => updateProp('popScale', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Pop Blur"
				min={0}
				max={12}
				step={1}
				value={popBlur}
				valueUnit="px"
				onChange={(val) => updateProp('popBlur', val)}
			></PreviewSlider>
			<PreviewSwitch title="Lean" checked={lean} onChange={(val) => updateProp('lean', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Show Fuse"
				checked={showFuse}
				onChange={(val) => updateProp('showFuse', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
