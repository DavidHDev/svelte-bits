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
	import FuseButton, {
		type FuseButtonProps,
	} from '$lib/components/library/Micro/FuseButton/FuseButton.svelte';
	import source from '$lib/components/library/Micro/FuseButton/FuseButton.svelte?raw';
	const Archive02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M7 21H16.9999C19.3569 21 20.5354 21 21.2677 20.2678C21.9999 19.5355 21.9999 18.357 21.9999 16C21.9999 13.643 21.9999 12.4645 21.2677 11.7322C20.5354 11 19.3569 11 16.9999 11H7C4.64302 11 3.46453 11 2.7323 11.7322C2.00007 12.4644 2.00005 13.6429 2 15.9999C1.99995 18.357 1.99993 19.5355 2.73217 20.2677C3.4644 21 4.64294 21 7 21Z',
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
				d: 'M4 11C4.00005 9.59977 4.00008 8.89966 4.27263 8.36485C4.5123 7.89455 4.89469 7.51218 5.365 7.27253C5.89981 7 6.59993 7 8.00015 7H16C17.4001 7 18.1002 7 18.635 7.27248C19.1054 7.51217 19.4878 7.89462 19.7275 8.36502C20 8.8998 20 9.59987 20 11',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M6 7C6.00004 5.5998 6.00006 4.89969 6.27259 4.3649C6.51227 3.89457 6.89467 3.51218 7.36501 3.27252C7.89981 3 8.59991 3 10.0001 3H14C15.4001 3 16.1002 3 16.635 3.27248C17.1054 3.51217 17.4878 3.89462 17.7275 4.36502C18 4.8998 18 5.59987 18 7',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
		[
			'path',
			{
				d: 'M16 15L15.7 15.4C15.1111 16.1851 14.8167 16.5777 14.3944 16.7889C13.9721 17 13.4814 17 12.5 17H11.5C10.5186 17 10.0279 17 9.60557 16.7889C9.18328 16.5777 8.88885 16.1851 8.3 15.4L8 15',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '3',
			},
		],
	];
	const Delete02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M9.5 16.5L9.5 10.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
		[
			'path',
			{
				d: 'M14.5 16.5L14.5 10.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '3',
			},
		],
	];
	const SentIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z',
				stroke: 'currentColor',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M11.4999 12.5L14.9999 9',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const DEFAULT_PROPS: Pick<
		Required<FuseButtonProps>,
		| 'color'
		| 'background'
		| 'fuseColor'
		| 'size'
		| 'radius'
		| 'undoWindow'
		| 'fuse'
		| 'fuseThickness'
		| 'crossfadeMs'
		| 'commitOn'
		| 'pauseOnHover'
		| 'settle'
		| 'disabled'
	> & { preset: string } = {
		preset: 'archive',
		color: '#F5EFE9',
		background: '#3A312A',
		fuseColor: '#D6A46B',
		size: 'md',
		radius: 22,
		undoWindow: 4000,
		fuse: 'outline',
		fuseThickness: 1.5,
		crossfadeMs: 200,
		commitOn: 'press',
		pauseOnHover: true,
		settle: 'reset',
		disabled: false,
	};
	const PRESETS = {
		archive: {
			label: 'Archive',
			undoLabel: 'Undo',
			doneLabel: 'Archived',
			icon: Archive02Icon,
			fuse: '#D6A46B',
		},
		send: { label: 'Send', undoLabel: 'Undo', doneLabel: 'Sent', icon: SentIcon, fuse: '#D89D70' },
		delete: {
			label: 'Delete',
			undoLabel: 'Undo',
			doneLabel: 'Deleted',
			icon: Delete02Icon,
			fuse: '#e5484d',
		},
	};
	const PRESET_OPTIONS = [
		{ value: 'archive', label: 'Archive' },
		{ value: 'send', label: 'Send' },
		{ value: 'delete', label: 'Delete' },
	];
	const SIZE_OPTIONS = [
		{ value: 'sm', label: 'Small' },
		{ value: 'md', label: 'Medium' },
		{ value: 'lg', label: 'Large' },
	];
	const FUSE_OPTIONS = [
		{ value: 'outline', label: 'Outline' },
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'top', label: 'Top' },
	];
	const COMMIT_OPTIONS = [
		{ value: 'press', label: 'On press' },
		{ value: 'fuseEnd', label: 'When fuse ends' },
	];
	const SETTLE_OPTIONS = [
		{ value: 'reset', label: 'Reset' },
		{ value: 'stay', label: 'Stay done' },
	];
	let props = $state({ ...DEFAULT_PROPS });
	const {
		preset,
		color,
		background,
		fuseColor,
		size,
		radius,
		undoWindow,
		fuse,
		fuseThickness,
		crossfadeMs,
		commitOn,
		pauseOnHover,
		settle,
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
	const renderedColor = $derived(color);
	const renderedBackground = $derived(background);
	const content = $derived(PRESETS[preset as keyof typeof PRESETS] || PRESETS.archive);
	const renderedFuse = $derived(fuseColor === DEFAULT_PROPS.fuseColor ? content.fuse : fuseColor);
	const propData: PropRow[] = [
		{ name: 'label', type: 'string', default: '"Archive"', description: 'The idle action.' },
		{
			name: 'undoLabel',
			type: 'string',
			default: '"Undo"',
			description: 'The label while the fuse burns; the whole pill is the Undo button.',
		},
		{
			name: 'doneLabel',
			type: 'string',
			default: '"Archived"',
			description:
				'Shown with a check once the fuse burns out and settle is stay; announced to screen readers on arm.',
		},
		{
			name: 'icon',
			type: 'string | number | Snippet',
			default: 'undefined',
			description: 'The idle glyph; an archive icon when omitted.',
		},
		{
			name: 'color',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Ink for labels and icons; the seam and tints derive from it.',
		},
		{ name: 'background', type: 'string', default: '"#3A312A"', description: 'The pill surface.' },
		{
			name: 'fuseColor',
			type: 'string',
			default: '"#D6A46B"',
			description: 'The lit line or ring.',
		},
		{
			name: 'size',
			type: '"sm" | "md" | "lg"',
			default: '"md"',
			description: 'Height 36, 44 or 52 pixels with matching type and icons.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '22',
			description: 'Corner radius in pixels; 22 is a full pill at the medium size.',
		},
		{
			name: 'undoWindow',
			type: 'number',
			default: '4000',
			description: 'How long the fuse burns and Undo stays on offer, in milliseconds.',
		},
		{
			name: 'fuse',
			type: '"outline" | "bottom" | "top"',
			default: '"outline"',
			description: 'The pill rim burning down clockwise, or a line along the bottom or top edge.',
		},
		{
			name: 'fuseThickness',
			type: 'number',
			default: '1.5',
			description: 'Line height or rim stroke in pixels.',
		},
		{
			name: 'crossfadeMs',
			type: 'number',
			default: '200',
			description:
				'Blur crossfade between faces after a pointer press. Keyboard commits swap instantly.',
		},
		{
			name: 'commitOn',
			type: '"press" | "fuseEnd"',
			default: '"press"',
			description:
				'When onCommit fires: at the press, with Undo as the revert, or only once the fuse burns out.',
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'true',
			description:
				'Leaving and coming back with a mouse freezes the fuse until the pointer leaves again.',
		},
		{
			name: 'settle',
			type: '"reset" | "stay"',
			default: '"reset"',
			description:
				'After the fuse ends: return to the idle face, or stay on a terminal done face until remounted.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the idle face and ignores presses. Undo stays available while armed.',
		},
		{
			name: 'onCommit',
			type: '(reason: "press" | "fuseEnd") => void',
			default: '-',
			description: 'The action.',
		},
		{
			name: 'onUndo',
			type: '() => void',
			default: '-',
			description: 'Called when Undo or Escape runs the action back.',
		},
		{
			name: 'onFuseEnd',
			type: '() => void',
			default: '-',
			description: 'Called when the window closes without an undo.',
		},
		{
			name: 'onPhaseChange',
			type: '(phase: "idle" | "armed" | "settled") => void',
			default: '-',
			description: 'Called on every phase change.',
		},
		{
			name: 'type',
			type: '"button" | "submit" | "reset"',
			default: '"button"',
			description: 'Type of the idle button.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the pill.',
		},
	];
	const iconSize = $derived(size === 'sm' ? 14 : size === 'lg' ? 17 : 15);
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import FuseButton from \'./FuseButton.svelte\';\n<\/script>\n\n<FuseButton\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'label',
						'undoLabel',
						'doneLabel',
						'icon',
						'color',
						'background',
						'fuseColor',
						'size',
						'radius',
						'undoWindow',
						'fuse',
						'fuseThickness',
						'crossfadeMs',
						'commitOn',
						'pauseOnHover',
						'settle',
						'disabled',
						'onCommit',
						'onUndo',
						'onFuseEnd',
						'onPhaseChange',
						'className',
						'type',
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

<svelte:head><title>Fuse Button - svelte-bits</title></svelte:head>
<h1 class="sub-category">Fuse Button</h1>
<TabsLayout
	onreset={reset}
	{hasChanges}
	componentName="FuseButton"
	{usage}
	{source}
	props={propData}
>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				{#key preset + epoch}<FuseButton
						{...props}
						label={content.label}
						undoLabel={content.undoLabel}
						doneLabel={content.doneLabel}
						fuseColor={renderedFuse}
						>{#snippet icon()}{@render iconSvg(content.icon, iconSize, 1.8)}{/snippet}</FuseButton
					>{/key}
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="fuse-button" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Preset"
				options={PRESET_OPTIONS}
				value={preset}
				onChange={(val) => updateProp('preset', val)}
			></PreviewSelect>
			<PreviewColorPicker
				title="Text"
				value={renderedColor}
				onChange={(val) => updateProp('color', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Background"
				value={renderedBackground}
				onChange={(val) => updateProp('background', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Fuse"
				value={renderedFuse}
				onChange={(val) => updateProp('fuseColor', val)}
			></PreviewColorPicker>
			<PreviewSelect
				title="Size"
				options={SIZE_OPTIONS}
				value={size}
				onChange={(val) => updateProp('size', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Radius"
				min={0}
				max={26}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Undo Window"
				min={1000}
				max={10000}
				step={500}
				value={undoWindow}
				valueUnit="ms"
				onChange={(val) => updateProp('undoWindow', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Fuse"
				options={FUSE_OPTIONS}
				value={fuse}
				onChange={(val) => updateProp('fuse', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Fuse Thickness"
				min={1}
				max={4}
				step={0.5}
				value={fuseThickness}
				valueUnit="px"
				onChange={(val) => updateProp('fuseThickness', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Crossfade"
				min={100}
				max={300}
				step={10}
				value={crossfadeMs}
				valueUnit="ms"
				onChange={(val) => updateProp('crossfadeMs', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Commit On"
				options={COMMIT_OPTIONS}
				value={commitOn}
				onChange={(val) => updateProp('commitOn', val)}
			></PreviewSelect>
			<PreviewSelect
				title="After Fuse"
				options={SETTLE_OPTIONS}
				value={settle}
				onChange={(val) => updateProp('settle', val)}
			></PreviewSelect>
			<PreviewSwitch
				title="Pause On Hover"
				checked={pauseOnHover}
				onChange={(val) => updateProp('pauseOnHover', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
