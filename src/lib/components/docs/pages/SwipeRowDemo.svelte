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
	import SwipeRow, {
		type SwipeRowProps,
	} from '$lib/components/library/Micro/SwipeRow/SwipeRow.svelte';
	import source from '$lib/components/library/Micro/SwipeRow/SwipeRow.svelte?raw';
	const AirplaneTakeOff01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M2.00031 20H18.0003',
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
				d: 'M3.82527 12.1661C3.55027 11.9661 3.30027 11.7161 3.00028 10.8411C2.91891 10.6241 2.61139 9.53619 2.35028 8.54109C2.13003 7.7017 1.93377 6.93555 2.02528 6.74109C2.10029 6.54109 2.20027 6.39109 2.52527 6.19109C2.72527 6.06802 3.75027 5.81609 3.95027 5.76609C4.15027 5.71609 4.42526 5.69109 4.65027 5.76609C5.07527 5.84109 5.95027 7.11609 6.17527 7.26609C6.27526 7.36609 6.60027 7.657 6.97527 7.69109C7.25027 7.71609 7.52527 7.64109 7.82528 7.51609C8.10027 7.40151 13.5253 4.76609 14.0253 4.54109C18.1003 2.84109 21.0603 5.63609 21.5103 6.23609C21.9753 6.81609 22.0753 6.99109 21.9503 7.49109C21.7887 8.01609 21.3503 8.11609 21.1003 8.19109C20.8503 8.26609 17.4003 9.19109 16.0503 9.56609C15.7554 9.6621 15.6114 9.85492 15.5753 9.89109C15.4003 10.1411 14.6053 11.8411 14.3803 12.2161C14.2253 12.6161 13.8003 13.1161 13.2503 13.3161C12.6753 13.5161 11.6753 13.7411 11.4503 13.8161C11.2253 13.8911 10.7003 14.0411 10.5253 13.9911C10.3003 13.9411 10.0853 13.7161 10.1853 13.3661C10.2853 13.0161 10.4753 12.0411 10.5003 11.8911C10.5253 11.7411 10.7753 11.1161 10.5003 11.0911C10.4503 11.0161 9.92527 11.2411 9.15027 11.4161C8.57449 11.5782 7.9715 11.7386 7.55027 11.8411C5.92527 12.3161 5.04521 12.4411 4.85027 12.4411C4.47527 12.4411 4.20027 12.3911 3.82527 12.1661Z',
				stroke: 'currentColor',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
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
	const Flag02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M4 7L4 21',
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
				d: 'M11.7576 3.90865C8.45236 2.22497 5.85125 3.21144 4.55426 4.2192C4.32048 4.40085 4.20358 4.49167 4.10179 4.69967C4 4.90767 4 5.10138 4 5.4888V14.7319C4.9697 13.6342 7.87879 11.9328 11.7576 13.9086C15.224 15.6744 18.1741 14.9424 19.5697 14.1795C19.7633 14.0737 19.8601 14.0207 19.9301 13.9028C20 13.7849 20 13.6569 20 13.4009V5.87389C20 5.04538 20 4.63113 19.8027 4.48106C19.6053 4.33099 19.1436 4.459 18.2202 4.71504C16.64 5.15319 14.3423 5.22532 11.7576 3.90865Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const Invoice01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M4 18.6458V8.05426C4 5.20025 4 3.77325 4.87868 2.88663C5.75736 2 7.17157 2 10 2H14C16.8284 2 18.2426 2 19.1213 2.88663C20 3.77325 20 5.20025 20 8.05426V18.6458C20 20.1575 20 20.9133 19.538 21.2108C18.7831 21.6971 17.6161 20.6774 17.0291 20.3073C16.5441 20.0014 16.3017 19.8485 16.0325 19.8397C15.7417 19.8301 15.4949 19.9768 14.9709 20.3073L13.06 21.5124C12.5445 21.8374 12.2868 22 12 22C11.7132 22 11.4555 21.8374 10.94 21.5124L9.02913 20.3073C8.54415 20.0014 8.30166 19.8485 8.03253 19.8397C7.74172 19.8301 7.49493 19.9768 6.97087 20.3073C6.38395 20.6774 5.21687 21.6971 4.46195 21.2108C4 20.9133 4 20.1575 4 18.6458Z',
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
				d: 'M11 11H8',
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
				d: 'M14 7L8 7',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
	];
	const Note01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M16.5 2V5M7.5 2V5M12 2V5',
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
				d: 'M13 3.5H11C7.70017 3.5 6.05025 3.5 5.02513 4.52513C4 5.55025 4 7.20017 4 10.5V15C4 18.2998 4 19.9497 5.02513 20.9749C6.05025 22 7.70017 22 11 22H13C16.2998 22 17.9497 22 18.9749 20.9749C20 19.9497 20 18.2998 20 15V10.5C20 7.20017 20 5.55025 18.9749 4.52512C17.9497 3.5 16.2998 3.5 13 3.5Z',
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
				d: 'M8 15H12M8 11H16',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
	];
	const DEFAULT_PROPS: Pick<
		Required<SwipeRowProps>,
		| 'actionColor'
		| 'drawerColor'
		| 'rowColor'
		| 'textColor'
		| 'height'
		| 'radius'
		| 'actionWidth'
		| 'direction'
		| 'snapBounce'
		| 'resistance'
		| 'collapseMs'
		| 'commitAt'
		| 'fullSwipe'
		| 'disabled'
	> & { drawer: string } = {
		drawer: 'two',
		actionColor: '#e5484d',
		drawerColor: '#4D4036',
		rowColor: '#3A312A',
		textColor: '#F5EFE9',
		height: 64,
		radius: 16,
		actionWidth: 80,
		direction: 'left',
		snapBounce: 0.2,
		resistance: 0.55,
		collapseMs: 200,
		commitAt: 0.6,
		fullSwipe: true,
		disabled: false,
	};
	const DRAWER_OPTIONS = [
		{ value: 'one', label: 'Delete' },
		{ value: 'two', label: 'Archive, Delete' },
		{ value: 'three', label: 'Flag, Archive, Delete' },
	];
	const DIRECTION_OPTIONS = [
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
	];
	const ACTION_SETS = {
		one: [{ id: 'delete', label: 'Delete', icon: deleteIcon }],
		two: [
			{ id: 'delete', label: 'Delete', icon: deleteIcon },
			{ id: 'archive', label: 'Archive', icon: archiveIcon, dismiss: true },
		],
		three: [
			{ id: 'delete', label: 'Delete', icon: deleteIcon },
			{ id: 'archive', label: 'Archive', icon: archiveIcon, dismiss: true },
			{ id: 'flag', label: 'Flag', icon: flagIcon },
		],
	};
	const ROWS = [
		{
			id: 'notes',
			icon: Note01Icon,
			title: 'Design review notes',
			subtitle: 'Edited 2 min ago',
			meta: '9:41',
		},
		{
			id: 'flight',
			icon: AirplaneTakeOff01Icon,
			title: 'Flight to Lisbon',
			subtitle: 'Gate changes to B12',
			meta: 'Tue',
		},
		{
			id: 'invoice',
			icon: Invoice01Icon,
			title: 'Invoice #1042',
			subtitle: 'Due in 3 days',
			meta: '$1,280',
		},
	];
	const RETURN_MS = 1200;
	const GAP = 8;
	let props = $state({ ...DEFAULT_PROPS });
	const {
		drawer,
		actionColor,
		drawerColor,
		rowColor,
		textColor,
		height,
		radius,
		actionWidth,
		direction,
		snapBounce,
		resistance,
		collapseMs,
		commitAt,
		fullSwipe,
		disabled,
	} = $derived(props);
	let epoch = $state(0);

	function reset() {
		props = { ...DEFAULT_PROPS };
		epoch++;
		timers.forEach(clearTimeout);
		timers.length = 0;
		openId = null;
		rows = ROWS.map((r) => ({ ...r, returning: false }));
	}
	function updateProp<K extends keyof typeof props>(key: K, value: unknown) {
		props[key] = value as (typeof props)[K];
	}
	const renderedRow = $derived(rowColor);
	const renderedText = $derived(textColor);
	const renderedDrawer = $derived(drawerColor);
	const propData: PropRow[] = [
		{
			name: 'children',
			type: 'string | number | Snippet',
			default: '-',
			description: 'The row content you drag.',
		},
		{
			name: 'actions',
			type: 'SwipeAction[]',
			default: '[{ id: "delete", label: "Delete" }]',
			description:
				'The drawer, outermost first. Each has id, label, an optional icon, an optional color for secondary actions, dismiss to fold the row when pressed, and onSelect. The first is the full-swipe action and always folds the row.',
		},
		{
			name: 'actionColor',
			type: 'string',
			default: '"#e5484d"',
			description: 'The full-swipe block that leaps and fills the row.',
		},
		{
			name: 'drawerColor',
			type: 'string',
			default: '"#4D4036"',
			description: 'The drawer base and the secondary actions.',
		},
		{ name: 'rowColor', type: 'string', default: '"#3A312A"', description: 'The surface.' },
		{
			name: 'textColor',
			type: 'string',
			default: '"#F5EFE9"',
			description: 'Row text and the keyboard toggle.',
		},
		{
			name: 'height',
			type: 'number',
			default: '64',
			description: 'Row height in pixels. The fold closes from it.',
		},
		{
			name: 'radius',
			type: 'number',
			default: '16',
			description: 'Corner radius of the row and the clipped drawer.',
		},
		{
			name: 'actionWidth',
			type: 'number',
			default: '80',
			description: 'Width of each action in pixels, so the drawer width too.',
		},
		{
			name: 'direction',
			type: '"left" | "right"',
			default: '"left"',
			description: 'Which way you swipe. Everything mirrors.',
		},
		{
			name: 'snapBounce',
			type: 'number',
			default: '0.2',
			description:
				'Overshoot of the open or close settle after a flick. Slow releases never bounce.',
		},
		{
			name: 'resistance',
			type: 'number',
			default: '0.55',
			description:
				'How much of the finger the row keeps past the drawer, and the rubber-band beyond the commit point.',
		},
		{
			name: 'collapseMs',
			type: 'number',
			default: '200',
			description: 'How long a deleted row takes to fold shut.',
		},
		{
			name: 'commitAt',
			type: 'number',
			default: '0.6',
			description:
				'Fraction of the row width the surface must uncover for the block to leap and a release to delete.',
		},
		{
			name: 'fullSwipe',
			type: 'boolean',
			default: 'true',
			description: 'Off, the drawer is the end: no leap, no delete.',
		},
		{
			name: 'disabled',
			type: 'boolean',
			default: 'false',
			description: 'Dims the row and ignores input.',
		},
		{
			name: 'open',
			type: 'boolean',
			default: 'undefined',
			description: 'Controlled open state. Outside changes settle the row.',
		},
		{
			name: 'onOpenChange',
			type: '(open: boolean) => void',
			default: '-',
			description: 'Called when a gesture or key opens or closes the drawer.',
		},
		{
			name: 'onAction',
			type: '(action: SwipeAction) => void',
			default: '-',
			description: 'Called when any action button is pressed.',
		},
		{
			name: 'onCommit',
			type: '(action: SwipeAction) => void',
			default: '-',
			description:
				'Called after a full swipe or a press on a folding action, once the row has shut. Remove the row here.',
		},
		{
			name: 'closeOnAction',
			type: 'boolean',
			default: 'true',
			description: 'Closes the drawer after an action is pressed.',
		},
		{
			name: 'haptic',
			type: 'boolean',
			default: 'true',
			description: 'A short vibration on touch when the block leaps.',
		},
		{
			name: 'label',
			type: 'string',
			default: '"List item"',
			description: 'Accessible name of the row.',
		},
		{
			name: 'className',
			type: 'string',
			default: '""',
			description: 'Extra classes for the root.',
		},
		{
			name: 'style',
			type: 'CSSProperties',
			default: 'undefined',
			description: 'Inline styles merged onto the root.',
		},
	];
	import { onMount } from 'svelte';
	let rows = $state(ROWS.map((r) => ({ ...r, returning: false })));
	let openId = $state<string | null>(null);
	const timers: ReturnType<typeof setTimeout>[] = [];
	function remove(id: string) {
		const index = rows.findIndex((r) => r.id === id);
		rows = rows.filter((r) => r.id !== id);
		if (openId === id) openId = null;
		timers.push(
			setTimeout(() => {
				const original = ROWS.find((r) => r.id === id);
				if (!original) return;
				const next = rows.filter((r) => r.id !== id);
				next.splice(Math.min(Math.max(0, index), next.length), 0, { ...original, returning: true });
				rows = next;
			}, RETURN_MS),
		);
	}
	onMount(() => () => timers.forEach(clearTimeout));
	function entrance(node: HTMLElement, data: { returning: boolean; height: number }) {
		if (!data.returning) return;
		node.style.overflow = 'hidden';
		const animation = node.animate(
			[
				{ height: '0px', opacity: 0 },
				{ height: data.height + GAP + 'px', opacity: 1 },
			],
			{ duration: 200, easing: 'cubic-bezier(0.23,1,0.32,1)' },
		);
		animation.onfinish = () => (node.style.overflow = '');
		return {
			destroy() {
				animation.cancel();
			},
		};
	}
	function usageProp(key: string, value: unknown) {
		return typeof value === 'string'
			? '  ' + key + '=' + JSON.stringify(value)
			: '  ' + key + '={' + JSON.stringify(value) + '}';
	}
	const usage = $derived(
		'<script lang="ts">\n  import SwipeRow from \'./SwipeRow.svelte\';\n<\/script>\n\n<SwipeRow\n' +
			Object.entries({ ...props, ...{} })
				.filter(([key]) =>
					[
						'children',
						'actions',
						'actionColor',
						'drawerColor',
						'rowColor',
						'textColor',
						'height',
						'radius',
						'actionWidth',
						'direction',
						'snapBounce',
						'resistance',
						'collapseMs',
						'commitAt',
						'fullSwipe',
						'disabled',
						'open',
						'onOpenChange',
						'onAction',
						'onCommit',
						'closeOnAction',
						'haptic',
						'label',
						'className',
						'style',
					].includes(key),
				)
				.map(([key, value]) => usageProp(key, value))
				.join('\n') +
			'\n>\n  <span>Your message</span>\n</SwipeRow>',
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
{#snippet deleteIcon()}{@render iconSvg(Delete02Icon, 20, 2)}{/snippet}
{#snippet archiveIcon()}{@render iconSvg(Archive02Icon, 20, 2)}{/snippet}
{#snippet flagIcon()}{@render iconSvg(Flag02Icon, 20, 2)}{/snippet}
<svelte:head><title>Swipe Row - svelte-bits</title></svelte:head>
<h1 class="sub-category">Swipe Row</h1>
<TabsLayout onreset={reset} {hasChanges} componentName="SwipeRow" {usage} {source} props={propData}>
	{#snippet preview()}{#key epoch}<div
				class="demo-container relative flex items-center justify-center overflow-hidden"
				style="height:400px;"
			>
				<div class="w-[min(360px,calc(100%-48px))]">
					{#each rows as row (row.id)}<div use:entrance={{ returning: row.returning, height }}>
							<SwipeRow
								{...props}
								label={row.title}
								actions={ACTION_SETS[drawer as keyof typeof ACTION_SETS] ?? ACTION_SETS.two}
								open={openId === row.id}
								onOpenChange={(isOpen) =>
									(openId = isOpen ? row.id : openId === row.id ? null : openId)}
								onCommit={() => remove(row.id)}
								style={{ marginBottom: GAP }}
								><span class="inline-flex shrink-0 opacity-60"
									>{@render iconSvg(row.icon, 20, 1.8)}</span
								><span class="grid min-w-0 flex-auto gap-0.5"
									><span class="truncate text-sm font-medium leading-[1.2]">{row.title}</span><span
										class="truncate text-xs leading-[1.2] opacity-60">{row.subtitle}</span
									></span
								><span class="shrink-0 text-xs opacity-50">{row.meta}</span></SwipeRow
							>
						</div>{/each}
				</div>
			</div>{/key}{/snippet}
	{#snippet code()}<DemoCodeTab slug="swipe-row" {usage} {source} />{/snippet}
	{#snippet customize()}<Customize>
			<PreviewSelect
				title="Drawer"
				options={DRAWER_OPTIONS}
				value={drawer}
				onChange={(val) => updateProp('drawer', val)}
			></PreviewSelect>
			<PreviewColorPicker
				title="Action"
				value={actionColor}
				onChange={(val) => updateProp('actionColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Drawer Color"
				value={renderedDrawer}
				onChange={(val) => updateProp('drawerColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Row"
				value={renderedRow}
				onChange={(val) => updateProp('rowColor', val)}
			></PreviewColorPicker>
			<PreviewColorPicker
				title="Text"
				value={renderedText}
				onChange={(val) => updateProp('textColor', val)}
			></PreviewColorPicker>
			<PreviewSlider
				title="Height"
				min={48}
				max={88}
				step={2}
				value={height}
				valueUnit="px"
				onChange={(val) => updateProp('height', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Radius"
				min={0}
				max={32}
				step={1}
				value={radius}
				valueUnit="px"
				onChange={(val) => updateProp('radius', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Action Width"
				min={56}
				max={120}
				step={4}
				value={actionWidth}
				valueUnit="px"
				onChange={(val) => updateProp('actionWidth', val)}
			></PreviewSlider>
			<PreviewSelect
				title="Swipe"
				options={DIRECTION_OPTIONS}
				value={direction}
				onChange={(val) => updateProp('direction', val)}
			></PreviewSelect>
			<PreviewSlider
				title="Flick Bounce"
				min={0}
				max={0.3}
				step={0.02}
				value={snapBounce}
				onChange={(val) => updateProp('snapBounce', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Resistance"
				min={0.4}
				max={1}
				step={0.05}
				value={resistance}
				onChange={(val) => updateProp('resistance', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Collapse"
				min={100}
				max={400}
				step={20}
				value={collapseMs}
				valueUnit="ms"
				onChange={(val) => updateProp('collapseMs', val)}
			></PreviewSlider>
			<PreviewSlider
				title="Commit At"
				min={0.4}
				max={0.9}
				step={0.05}
				value={commitAt}
				onChange={(val) => updateProp('commitAt', val)}
			></PreviewSlider>
			<PreviewSwitch
				title="Full Swipe"
				checked={fullSwipe}
				onChange={(val) => updateProp('fullSwipe', val)}
			></PreviewSwitch>
			<PreviewSwitch
				title="Disabled"
				checked={disabled}
				onChange={(val) => updateProp('disabled', val)}
			></PreviewSwitch>
		</Customize>{/snippet}
	{#snippet propTable()}<PropTable rows={propData} />{/snippet}
</TabsLayout>
