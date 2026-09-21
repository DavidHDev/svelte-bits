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
	import SwipeToast, {
		type SwipeToastProps,
	} from '$lib/components/library/Micro/SwipeToast/SwipeToast.svelte';
	import source from '$lib/components/library/Micro/SwipeToast/SwipeToast.svelte?raw';
	const CheckmarkCircle02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z',
				stroke: 'currentColor',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M8 12.5L10.5 15L16 9',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const DEFAULT_PROPS: Pick<
		Required<SwipeToastProps>,
		| 'title'
		| 'description'
		| 'actionLabel'
		| 'background'
		| 'color'
		| 'fuseColor'
		| 'width'
		| 'radius'
		| 'slideMs'
		| 'settleBounce'
		| 'swipeDistance'
		| 'duration'
		| 'fuse'
		| 'pauseOnHover'
		| 'closeButton'
		| 'inline'
	> = {
		title: 'File archived',
		description: 'Moved to Archive',
		actionLabel: 'Undo',
		background: '#3A312A',
		color: '#F5EFE9',
		fuseColor: '#D6A46B',
		width: 356,
		radius: 12,
		slideMs: 400,
		settleBounce: 0.2,
		swipeDistance: 40,
		duration: 4000,
		fuse: 'bottom',
		pauseOnHover: true,
		closeButton: false,
		inline: true,
	};
	const FUSE_OPTIONS = [
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'top', label: 'Top' },
		{ value: 'none', label: 'None' },
	];
	const MAX_TOASTS = 3;
	let props = $state({ ...DEFAULT_PROPS });
	const {
		title,
		description,
		actionLabel,
		background,
		color,
		fuseColor,
		width,
		radius,
		slideMs,
		settleBounce,
		swipeDistance,
		duration,
		fuse,
		pauseOnHover,
		closeButton,
		inline,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		replay();
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedBackground = $derived(background);
	const renderedColor = $derived(color);
	const propData: PropRow[] = [
		{
			name: 'title',
			type: 'string | number | Snippet',
			default: '"File archived"',
			description: 'The first line.',
		},
		{
			name: 'description',
			type: 'string | number | Snippet',
			default: '""',
			description: 'The dimmer second line. Empty hides it.',
		},
		{
			name: 'icon',
			type: 'string | number | Snippet',
			default: 'undefined',
			description: 'An 18px icon before the text.',
		},
		{
			name: 'actionLabel',
			type: 'string | number | Snippet',
			default: '""',
			description: 'The inverted button. Empty hides it.',
		},
		{
			name: 'onAction',
			type: '() => void',
			default: '-',
			description: 'Called when the action is pressed, before the close.',
		},
		{
			name: 'open',
			type: 'boolean',
			default: 'true',
			description: 'Flip to false to close from outside. True again re-enters.',
		},
		{
			name: 'onClose',
			type: '(reason) => void',
			default: '-',
			description:
				'Called after the exit, and after the inline slot has collapsed. Reason is timeout, swipe, action, close, escape or programmatic.',
		},
		{
			name: 'background',
			type: 'string',
			default: '"#3A312A"',
			description: 'The card surface, and the action text.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Ink: title, description at 62% and the action fill.',
		},
		{ name: 'fuseColor', type: 'string', default: '"#D6A46B"', description: 'The burning line.' },
		{
			name: 'width',
			type: 'number',
			default: '356',
			description: 'Card width in pixels, capped at the parent when inline.',
		},
		{ name: 'radius', type: 'number', default: '12', description: 'Corner radius in pixels.' },
		{
			name: 'slideMs',
			type: 'number',
			default: '400',
			description: 'How long the rise and the drop take.',
		},
		{
			name: 'settleBounce',
			type: 'number',
			default: '0.2',
			description: 'Overshoot of the return after an abandoned swipe. 0 stops dead.',
		},
		{
			name: 'swipeDistance',
			type: 'number',
			default: '40',
			description: 'How far a slow drag must go before release dismisses. A flick always does.',
		},
		{
			name: 'duration',
			type: 'number',
			default: '4000',
			description:
				'Milliseconds until it closes itself. Changing it re-arms the fuse. 0 keeps it until dismissed.',
		},
		{
			name: 'fuse',
			type: '"bottom" | "top" | "none"',
			default: '"bottom"',
			description: 'Which edge the line burns along. None keeps the timer but shows nothing.',
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'true',
			description: 'Hovering freezes the line and the timer.',
		},
		{
			name: 'closeButton',
			type: 'boolean',
			default: 'false',
			description: 'Adds a cross at the end of the row.',
		},
		{
			name: 'inline',
			type: 'boolean',
			default: 'false',
			description:
				'In flow inside the parent instead of fixed to the bottom-right of the viewport.',
		},
		{
			name: 'dismissible',
			type: 'boolean',
			default: 'true',
			description: 'Off removes the swipe and Escape.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
	];
	let nextId = 1;
	let toasts = $state([{ id: 0, open: true }]);
	function show() {
		const next = [...toasts, { id: nextId++, open: true }];
		const live = next.filter((t) => t.open);
		toasts =
			live.length > MAX_TOASTS
				? next.map((t) => (t.id === live[0].id ? { ...t, open: false } : t))
				: next;
	}
	function remove(id: number) {
		toasts = toasts.filter((t) => t.id !== id);
	}
	function replay() {
		toasts = [];
		show();
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import SwipeToast from \'./SwipeToast.svelte\';\n<\/script>\n\n<SwipeToast\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'title',
						'description',
						'icon',
						'actionLabel',
						'onAction',
						'open',
						'onClose',
						'background',
						'color',
						'fuseColor',
						'width',
						'radius',
						'slideMs',
						'settleBounce',
						'swipeDistance',
						'duration',
						'fuse',
						'pauseOnHover',
						'closeButton',
						'inline',
						'dismissible',
						'className',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n/>',
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

<svelte:head><title>Swipe Toast - svelte-bits</title></svelte:head>
<h1 class="sub-category">Swipe Toast</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="SwipeToast"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<ReplayButton onClick={replay} /><button
					type="button"
					class="absolute top-6 left-1/2 -translate-x-1/2 rounded-full px-3 py-2 text-[13px] font-medium hover:bg-white/5"
					onclick={show}>Show toast</button
				>
				<div class="absolute right-6 bottom-8 left-6 flex flex-col items-end">
					{#each toasts as toast (toast.id)}<SwipeToast
							{...props}
							open={toast.open}
							onClose={() => remove(toast.id)}
							>{#snippet icon()}{@render iconSvg(
									CheckmarkCircle02Icon,
									18,
									2,
								)}{/snippet}</SwipeToast
						>{/each}
				</div>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="swipe-toast" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewInput
				title="Title"
				value={String(title)}
				maxlength={32}
				onChange={(val) => updateProp('title', val)}
			></PreviewInput>
			<PreviewInput
				title="Description"
				value={String(description)}
				maxlength={48}
				onChange={(val) => updateProp('description', val)}
			></PreviewInput>
			<PreviewInput
				title="Action Label"
				value={String(actionLabel)}
				maxlength={12}
				onChange={(val) => updateProp('actionLabel', val)}
			></PreviewInput>
			<PreviewColorPicker
				title="Background"
				value={renderedBackground}
				onChange={(val) => updateProp('background', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Text"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Fuse"
				value={fuseColor}
				onChange={(val) => updateProp('fuseColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Width"
				min={280}
				max={420}
				step={4}
				value={width}
				valueUnit="px"
				onChange={(val) => updateProp('width', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={24}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Slide"
				min={200}
				max={700}
				step={20}
				value={slideMs}
				valueUnit="ms"
				onChange={(val) => updateProp('slideMs', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Settle Bounce"
				min={0}
				max={0.4}
				step={0.02}
				value={settleBounce}
				onChange={(val) => updateProp('settleBounce', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Swipe Distance"
				min={12}
				max={96}
				step={2}
				value={swipeDistance}
				valueUnit="px"
				onChange={(val) => updateProp('swipeDistance', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Duration"
				min={0}
				max={10000}
				step={250}
				value={duration}
				valueUnit="ms"
				onChange={(val) => updateProp('duration', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Fuse"
				options={FUSE_OPTIONS}
				value={fuse}
				onChange={(val) => updateProp('fuse', val)}
			></PreviewSelect>
			<PreviewSwitch
				title="Pause On Hover"
				checked={pauseOnHover}
				onChange={(val) => updateProp('pauseOnHover', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Close Button"
				checked={closeButton}
				onChange={(val) => updateProp('closeButton', val)}
			></PreviewSwitch>
			<PreviewSwitch title="Inline" checked={inline} onChange={(val) => updateProp('inline', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
