<script module lang="ts">
	type IconSvgElement = readonly (readonly [string, Record<string, string | number>])[];
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	const Tick02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M5 14L8.5 17.5L19 6.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const SparklesIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M15 2L15.5387 4.39157C15.9957 6.42015 17.5798 8.00431 19.6084 8.46127L22 9L19.6084 9.53873C17.5798 9.99569 15.9957 11.5798 15.5387 13.6084L15 16L14.4613 13.6084C14.0043 11.5798 12.4202 9.99569 10.3916 9.53873L8 9L10.3916 8.46127C12.4201 8.00431 14.0043 6.42015 14.4613 4.39158L15 2Z',
				stroke: 'currentColor',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M7 12L7.38481 13.7083C7.71121 15.1572 8.84275 16.2888 10.2917 16.6152L12 17L10.2917 17.3848C8.84275 17.7112 7.71121 18.8427 7.38481 20.2917L7 22L6.61519 20.2917C6.28879 18.8427 5.15725 17.7112 3.70827 17.3848L2 17L3.70827 16.6152C5.15725 16.2888 6.28879 15.1573 6.61519 13.7083L7 12Z',
				stroke: 'currentColor',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const PlusSignIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M12 4V20M20 12H4',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const Mic01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M7 6.5C7 4.01472 9.01472 2 11.5 2C13.9853 2 16 4.01472 16 6.5V11.5C16 13.9853 13.9853 16 11.5 16C9.01472 16 7 13.9853 7 11.5V6.5Z',
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
				d: 'M11.5 19H11.0828C7.57267 19 4.57706 16.4623 4 13M11.5 19H11.9172C15.4273 19 18.4229 16.4623 19 13M11.5 19V22',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const Mail01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M2 6L8.91302 9.91697C11.4616 11.361 12.5384 11.361 15.087 9.91697L22 6',
				stroke: 'currentColor',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z',
				stroke: 'currentColor',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const HelpCircleIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'circle',
			{
				cx: '12',
				cy: '12',
				r: '10',
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
				d: 'M9.5 9.5C9.5 8.11929 10.6193 7 12 7C13.3807 7 14.5 8.11929 14.5 9.5C14.5 10.3569 14.0689 11.1131 13.4117 11.5636C12.7283 12.0319 12 12.6716 12 13.5',
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
				d: 'M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
	];
	const Globe02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'circle',
			{ cx: '12', cy: '12', r: '10', stroke: 'currentColor', 'stroke-width': '1.5', key: '0' },
		],
		[
			'path',
			{
				d: 'M8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2C12 2 8 6 8 12Z',
				stroke: 'currentColor',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M21 15H3',
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
				d: 'M21 9H3',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '3',
			},
		],
	];
	const File02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M8 17H16',
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
				d: 'M8 13H12',
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
				d: 'M13 2.5V3C13 5.82843 13 7.24264 13.8787 8.12132C14.7574 9 16.1716 9 19 9H19.5M20 10.6569V14C20 17.7712 20 19.6569 18.8284 20.8284C17.6569 22 15.7712 22 12 22C8.22876 22 6.34315 22 5.17157 20.8284C4 19.6569 4 17.7712 4 14V9.45584C4 6.21082 4 4.58831 4.88607 3.48933C5.06508 3.26731 5.26731 3.06508 5.48933 2.88607C6.58831 2 8.21082 2 11.4558 2C12.1614 2 12.5141 2 12.8372 2.11401C12.9044 2.13772 12.9702 2.165 13.0345 2.19575C13.3436 2.34355 13.593 2.593 14.0919 3.09188L18.8284 7.82843C19.4065 8.40649 19.6955 8.69552 19.8478 9.06306C20 9.4306 20 9.83935 20 10.6569Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
	];
	const ChartLineData01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M21 21H10C6.70017 21 5.05025 21 4.02513 19.9749C3 18.9497 3 17.2998 3 14V3',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M5 20C5.43938 16.8438 7.67642 8.7643 10.4282 8.7643C12.3301 8.7643 12.8226 12.6353 14.6864 12.6353C17.8931 12.6353 17.4282 4 21 4',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const Cancel01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M18 6L6.00081 17.9992M17.9992 18L6 6.00085',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const Calendar03Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M16 2V6M8 2V6',
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
				d: 'M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z',
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
				d: 'M3 10H21',
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
				d: 'M12.1258 14H12.0008M12.1258 18H12.0008M7.625 14H7.5M7.625 18H7.5M16.625 14H16.5M12.2508 14C12.2508 14.1381 12.1389 14.25 12.0008 14.25C11.8628 14.25 11.7508 14.1381 11.7508 14C11.7508 13.8619 11.8628 13.75 12.0008 13.75C12.1389 13.75 12.2508 13.8619 12.2508 14ZM12.2508 18C12.2508 18.1381 12.1389 18.25 12.0008 18.25C11.8628 18.25 11.7508 18.1381 11.7508 18C11.7508 17.8619 11.8628 17.75 12.0008 17.75C12.1389 17.75 12.2508 17.8619 12.2508 18ZM7.75 14C7.75 14.1381 7.63807 14.25 7.5 14.25C7.36193 14.25 7.25 14.1381 7.25 14C7.25 13.8619 7.36193 13.75 7.5 13.75C7.63807 13.75 7.75 13.8619 7.75 14ZM7.75 18C7.75 18.1381 7.63807 18.25 7.5 18.25C7.36193 18.25 7.25 18.1381 7.25 18C7.25 17.8619 7.36193 17.75 7.5 17.75C7.63807 17.75 7.75 17.8619 7.75 18ZM16.75 14C16.75 14.1381 16.6381 14.25 16.5 14.25C16.3619 14.25 16.25 14.1381 16.25 14C16.25 13.8619 16.3619 13.75 16.5 13.75C16.6381 13.75 16.75 13.8619 16.75 14Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '3',
			},
		],
	];
	const Attachment01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M5.82338 12L4.27922 10.4558C2.57359 8.75022 2.57359 5.98485 4.27922 4.27922C5.98485 2.57359 8.75022 2.57359 10.4558 4.27922L19.7208 13.5442C21.4264 15.2498 21.4264 18.0152 19.7208 19.7208C18.0152 21.4264 15.2498 21.4264 13.5442 19.7208L10.0698 16.2464C9.00379 15.1804 9.00379 13.4521 10.0698 12.386C11.1358 11.32 12.8642 11.32 13.9302 12.386L15.8604 14.3162',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const ArrowDown01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	export interface PromptBarSource {
		key: string;
		name: string;
		description?: string;
		icon?: Snippet | string | number | null | IconSvgElement;
		attach?: boolean;
	}
	export interface PromptBarCommand {
		key: string;
		name: string;
		description?: string;
	}
	export interface PromptBarModel {
		key: string;
		name: string;
		tag?: string;
	}
	export interface PromptBarSendDetail {
		attachments: string[];
		model?: PromptBarModel;
		effort?: string;
	}
	export interface PromptBarProps {
		placeholder?: string;
		sources?: PromptBarSource[];
		commands?: PromptBarCommand[];
		models?: PromptBarModel[];
		defaultModel?: string;
		efforts?: string[];
		defaultEffort?: string;
		onEffortChange?: (effort: string) => void;
		busy?: boolean;
		onSend?: (text: string, detail: PromptBarSendDetail) => void;
		onStop?: () => void;
		onAttach?: () => string | string[] | void | Promise<string | string[] | void>;
		onDictate?: () => string | void | Promise<string | void>;
		background?: string;
		color?: string;
		menuBackground?: string;
		sparkColor?: string;
		sparkBoost?: number;
		width?: number;
		radius?: number;
		maxRows?: number;
		morphDuration?: number;
		squash?: number;
		tilt?: number;
		pressScale?: number;
		className?: string;
	}
	type Row = {
		key: string;
		name: string;
		description?: string;
		tag?: string;
		icon?: Snippet | string | number | null | IconSvgElement;
		attach?: boolean;
	};
	type Token = { kind: 'at' | 'slash'; query: string; start: number };
	type Latest = Pick<
		PromptBarProps,
		'onSend' | 'onStop' | 'onAttach' | 'onDictate' | 'onEffortChange'
	>;
	type Spark = {
		x: number;
		y: number;
		r: number;
		vy: number;
		sway: number;
		phase: number;
		life: number;
		span: number;
	};
	interface SendGlyphProps {
		busy: boolean;
		morphDuration: number;
		squash: number;
		tilt: number;
	}
	const ARROW_UP = [12, 4.5, 18.5, 11, 14.25, 11, 14.25, 19.5, 9.75, 19.5, 9.75, 11, 5.5, 11];
	const SQUARE = [12, 6, 18, 6, 18, 12, 18, 18, 6, 18, 6, 12, 6, 6];
	const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
	const LINE = 22;
	const EDGE = 11;
	const DEFAULT_SOURCES: PromptBarSource[] = [
		{
			key: 'files',
			name: 'Photos & files',
			description: 'Upload from this device',
			icon: Attachment01Icon,
			attach: true,
		},
		{ key: 'web', name: 'Web search', description: 'Live results', icon: Globe02Icon },
		{
			key: 'sales',
			name: 'Sales data',
			description: 'Revenue and churn',
			icon: ChartLineData01Icon,
		},
		{ key: 'docs', name: 'Documents', description: 'Specs, notes, briefs', icon: File02Icon },
		{ key: 'mail', name: 'Mail', description: 'Read and draft mail', icon: Mail01Icon },
		{
			key: 'calendar',
			name: 'Calendar',
			description: 'Events and availability',
			icon: Calendar03Icon,
		},
	];
	const DEFAULT_COMMANDS: PromptBarCommand[] = [
		{ key: 'summarize', name: '/summarize', description: 'Digest the thread so far' },
		{ key: 'compare', name: '/compare', description: 'Two options side by side' },
		{ key: 'draft', name: '/draft', description: 'Write a first version' },
		{ key: 'explain', name: '/explain', description: 'A plain-language walkthrough' },
		{ key: 'tasks', name: '/tasks', description: 'Turn this into a to-do list' },
	];
	const DEFAULT_MODELS: PromptBarModel[] = [
		{ key: 'nova-3', name: 'Nova 3', tag: 'Flagship' },
		{ key: 'nova-mini', name: 'Nova Mini', tag: 'Fast' },
		{ key: 'nova-2', name: 'Nova 2', tag: 'Legacy' },
	];
	const DEFAULT_EFFORTS = ['Low', 'Medium', 'High', 'Extra', 'Max'];
	const mix = (a: number, b: number, t: number) => a + (b - a) * t;
	const pathAt = (a: number[], b: number[], t: number) => {
		let d = '';
		for (let i = 0; i < a.length; i += 2) {
			d += `${i ? 'L' : 'M'}${mix(a[i], b[i], t).toFixed(2)} ${mix(a[i + 1], b[i + 1], t).toFixed(2)}`;
		}
		return `${d}Z`;
	};
	const parseToken = (draft: string): Token | null => {
		const m = /(^|\s)([@/])([\w-]*)$/.exec(draft);
		if (!m) return null;
		return {
			kind: m[2] === '@' ? 'at' : 'slash',
			query: m[3].toLowerCase(),
			start: m.index + m[1].length,
		};
	};

	function css(value: CSSProperties | undefined): string {
		const unitless =
			/^(opacity|zIndex|fontWeight|lineHeight|flex|flexGrow|flexShrink|order|scale|aspectRatio|strokeWidth|strokeDashoffset|strokeDasharray|fillOpacity|strokeOpacity|stopOpacity|pathLength)$/;
		return Object.entries(value ?? {})
			.filter(([, v]) => v !== undefined && v !== null)
			.map(([key, value]) => {
				const name = key.startsWith('--')
					? key
					: key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
				return (
					name +
					':' +
					(typeof value === 'number' && value !== 0 && !key.startsWith('--') && !unitless.test(key)
						? value + 'px'
						: value)
				);
			})
			.join(';');
	}
</script>

<script lang="ts">
	import { untrack, onMount } from 'svelte';
	import { animate, motionValue } from 'motion';
	let {
		placeholder = 'Ask anything',
		sources = DEFAULT_SOURCES,
		commands = DEFAULT_COMMANDS,
		models = DEFAULT_MODELS,
		defaultModel = '',
		efforts = DEFAULT_EFFORTS,
		defaultEffort = '',
		onEffortChange,
		busy = false,
		onSend,
		onStop,
		onAttach,
		onDictate,
		background = '#3A312A',
		color = '#F5EFE9',
		menuBackground = '#493D33',
		sparkColor = '#FFB089',
		sparkBoost = 1,
		width = 400,
		radius = 16,
		maxRows = 5,
		morphDuration = 240,
		squash = 0.12,
		tilt = 8,
		pressScale = 0.96,
		className = '',
	}: PromptBarProps = $props();
	let reduce = $state(false);
	onMount(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduce = media.matches;
		const change = () => {
			reduce = media.matches;
		};
		media.addEventListener('change', change);
		return () => media.removeEventListener('change', change);
	});
	const rootRef = { current: untrack(() => null) as HTMLDivElement | null };
	const inputRef = { current: untrack(() => null) as HTMLTextAreaElement | null };
	const glowRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const sparkRef = { current: untrack(() => null) as HTMLCanvasElement | null };
	const typing = { current: untrack(() => ({ energy: 0, strokes: 0 })) };
	const boost = { current: untrack(() => sparkBoost) };
	$effect.pre(() => {
		boost.current = sparkBoost;
	});
	const rowRefs = { current: untrack(() => []) as (HTMLButtonElement | null)[] };
	const lastOpen = { current: untrack(() => null) as string | null };
	const dictation = { current: untrack(() => 0) };
	const latest = { current: untrack(() => ({})) as Latest };
	$effect.pre(() => {
		latest.current = { onSend, onStop, onAttach, onDictate, onEffortChange };
	});
	let draft = $state(untrack(() => ''));
	function setDraft(nextState: typeof draft | ((previous: typeof draft) => typeof draft)) {
		draft = typeof nextState === 'function' ? nextState(draft) : nextState;
	}
	let attachments = $state<string[]>(untrack(() => []));
	function setAttachments(
		nextState: typeof attachments | ((previous: typeof attachments) => typeof attachments),
	) {
		attachments = typeof nextState === 'function' ? nextState(attachments) : nextState;
	}
	let modelKey = $state(untrack(() => defaultModel));
	function setModelKey(
		nextState: typeof modelKey | ((previous: typeof modelKey) => typeof modelKey),
	) {
		modelKey = typeof nextState === 'function' ? nextState(modelKey) : nextState;
	}
	let plusOpen = $state(untrack(() => false));
	function setPlusOpen(
		nextState: typeof plusOpen | ((previous: typeof plusOpen) => typeof plusOpen),
	) {
		plusOpen = typeof nextState === 'function' ? nextState(plusOpen) : nextState;
	}
	let modelOpen = $state(untrack(() => false));
	function setModelOpen(
		nextState: typeof modelOpen | ((previous: typeof modelOpen) => typeof modelOpen),
	) {
		modelOpen = typeof nextState === 'function' ? nextState(modelOpen) : nextState;
	}
	let effortOpen = $state(untrack(() => false));
	function setEffortOpen(
		nextState: typeof effortOpen | ((previous: typeof effortOpen) => typeof effortOpen),
	) {
		effortOpen = typeof nextState === 'function' ? nextState(effortOpen) : nextState;
	}
	let effortIndex = $state(
		untrack(() =>
			(() => {
				const i = efforts.indexOf(defaultEffort);
				return i >= 0 ? i : Math.max(0, Math.floor((efforts.length - 1) / 2));
			})(),
		),
	);
	function setEffortIndex(
		nextState: typeof effortIndex | ((previous: typeof effortIndex) => typeof effortIndex),
	) {
		effortIndex = typeof nextState === 'function' ? nextState(effortIndex) : nextState;
	}
	let dismissed = $state(untrack(() => false));
	function setDismissed(
		nextState: typeof dismissed | ((previous: typeof dismissed) => typeof dismissed),
	) {
		dismissed = typeof nextState === 'function' ? nextState(dismissed) : nextState;
	}
	let active = $state(untrack(() => 0));
	function setActive(nextState: typeof active | ((previous: typeof active) => typeof active)) {
		active = typeof nextState === 'function' ? nextState(active) : nextState;
	}
	let listening = $state(untrack(() => false));
	function setListening(
		nextState: typeof listening | ((previous: typeof listening) => typeof listening),
	) {
		listening = typeof nextState === 'function' ? nextState(listening) : nextState;
	}
	let pressed = $state(untrack(() => false));
	function setPressed(nextState: typeof pressed | ((previous: typeof pressed) => typeof pressed)) {
		pressed = typeof nextState === 'function' ? nextState(pressed) : nextState;
	}
	const model = $derived(models.find((m) => m.key === modelKey) ?? models[0]);
	const token = $derived(dismissed ? null : parseToken(draft));
	const open = $derived(
		plusOpen ? 'at' : (token?.kind ?? (modelOpen ? 'model' : effortOpen ? 'effort' : null)),
	);
	const query = $derived(plusOpen ? '' : (token?.query ?? ''));
	const list: Row[] = $derived.by(() => {
		if (open === 'at') return sources.filter((s) => s.name.toLowerCase().includes(query));
		if (open === 'slash')
			return commands.filter((c) => c.name.replace(/^\//, '').toLowerCase().startsWith(query));
		if (open === 'model') return models;
		return [];
	});
	const cursor = $derived(Math.min(active, Math.max(0, list.length - 1)));
	const canSend = $derived(draft.trim().length > 0 || attachments.length > 0);
	const armed = $derived(busy || canSend);
	const level = $derived(efforts[effortIndex] ?? '');
	const maxed = $derived(efforts.length > 1 && effortIndex === efforts.length - 1);
	const focusInput = () => inputRef.current?.focus({ preventScroll: true });
	const closeMenus = () => {
		setPlusOpen(false);
		setModelOpen(false);
		setEffortOpen(false);
	};
	$effect(() => {
		open;
		cursor;
		list;
		return untrack(() => {
			const glow = glowRef.current;
			if (!glow || !open) return;
			const row = rowRefs.current[cursor];
			if (!row) {
				glow.style.opacity = '0';
				return;
			}
			const fresh = lastOpen.current !== open;
			lastOpen.current = open;
			if (fresh) glow.style.transition = 'none';
			glow.style.top = `${row.offsetTop}px`;
			glow.style.height = `${row.offsetHeight}px`;
			glow.style.opacity = '1';
			if (fresh) {
				void glow.offsetHeight;
				glow.style.transition = '';
			}
		});
	});
	$effect(() => {
		open;
		return untrack(() => {
			if (!open) lastOpen.current = null;
		});
	});
	$effect(() => {
		plusOpen;
		modelOpen;
		effortOpen;
		closeMenus;
		return untrack(() => {
			if (!plusOpen && !modelOpen && !effortOpen) return undefined;
			const onDown = (e: globalThis.PointerEvent) => {
				if (!rootRef.current?.contains(e.target as Node)) closeMenus();
			};
			document.addEventListener('pointerdown', onDown);
			return () => document.removeEventListener('pointerdown', onDown);
		});
	});
	$effect(() => {
		draft;
		maxRows;
		return untrack(() => {
			const el = inputRef.current;
			if (!el) return;
			el.style.height = '0px';
			const max = LINE * maxRows;
			el.style.height = `${Math.min(el.scrollHeight, max)}px`;
			el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
		});
	});
	$effect(() => {
		return untrack(() => () => {
			dictation.current += 1;
		});
	});
	$effect(() => {
		maxed;
		reduce;
		sparkColor;
		return untrack(() => {
			const canvas = sparkRef.current;
			if (!maxed || reduce || !canvas) return undefined;
			const ctx = canvas.getContext('2d');
			if (!ctx) return undefined;
			typing.current.strokes = 0;
			let raf = 0;
			let last = performance.now();
			let w = 0;
			let h = 0;
			let due = 0;
			let speed = 1;
			let pulse = 0;
			const parts: Spark[] = [];
			const resize = () => {
				const rect = canvas.getBoundingClientRect();
				const dpr = Math.min(2, window.devicePixelRatio || 1);
				w = rect.width;
				h = rect.height;
				canvas.width = Math.round(w * dpr);
				canvas.height = Math.round(h * dpr);
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			};
			const spawn = (burst: boolean) => {
				parts.push({
					x: Math.random() * w,
					y: burst ? h * (0.2 + Math.random() * 0.8) : h + 3,
					r: 0.9 + Math.random() * 1.1,
					vy: -(7 + Math.random() * 9),
					sway: (Math.random() - 0.5) * 10,
					phase: Math.random() * Math.PI * 2,
					life: burst ? Math.random() * 1.2 : 0,
					span: 2.4 + Math.random() * 2.4,
				});
			};
			const tick = (now: number) => {
				const dt = Math.min(0.05, (now - last) / 1000);
				last = now;
				const typed = typing.current;
				const gain = boost.current;
				typed.energy *= Math.exp(-dt / 0.8);
				pulse *= Math.exp(-dt / 0.16);
				if (typed.strokes > 0) {
					typed.strokes = 0;
					if (gain > 0) pulse = 1;
				}
				const energy = typed.energy * gain;
				speed += (1 + energy * 6 - speed) * (1 - Math.exp(-dt / 0.15));
				due += dt;
				while (due > 0.14) {
					due -= 0.14;
					if (parts.length < 30) spawn(false);
				}
				ctx.clearRect(0, 0, w, h);
				ctx.fillStyle = sparkColor;
				ctx.shadowColor = sparkColor;
				ctx.shadowBlur = 6 + energy * 10 + pulse * 6;
				for (let i = parts.length - 1; i >= 0; i -= 1) {
					const p = parts[i];
					p.life += dt;
					if (p.life > p.span) {
						parts.splice(i, 1);
						continue;
					}
					const k = p.life / p.span;
					const twinkle = 0.7 + 0.3 * Math.sin((now / 160) * (1 + energy) + p.phase);
					p.y += p.vy * dt * speed;
					if (p.y < -4) {
						p.y = h + 3;
						p.x = Math.random() * w;
					}
					const edge = Math.min(1, Math.max(0, p.y / 14), Math.max(0, (h - p.y) / 14));
					ctx.globalAlpha =
						Math.min(1, Math.sin(k * Math.PI) * (0.9 + energy * 0.25) * twinkle) * edge;
					ctx.beginPath();
					ctx.arc(
						p.x + Math.sin((now / 900) * (1 + energy * 0.8) + p.phase) * p.sway,
						p.y,
						p.r * twinkle * (1 + energy * 0.35),
						0,
						Math.PI * 2,
					);
					ctx.fill();
				}
				raf = requestAnimationFrame(tick);
			};
			resize();
			for (let i = 0; i < 26; i += 1) spawn(true);
			const ro = new ResizeObserver(resize);
			ro.observe(canvas);
			raf = requestAnimationFrame(tick);
			return () => {
				cancelAnimationFrame(raf);
				ro.disconnect();
				ctx.clearRect(0, 0, w, h);
			};
		});
	});
	const setEffort = (i: number) => {
		const next = Math.max(0, Math.min(efforts.length - 1, i));
		if (next === effortIndex) return;
		setEffortIndex(next);
		latest.current.onEffortChange?.(efforts[next]);
	};
	const effortFromPointer = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const k = (e.clientX - rect.left - EDGE) / Math.max(1, rect.width - 2 * EDGE);
		setEffort(Math.round(k * (efforts.length - 1)));
	};
	const onEffortKey = (e: KeyboardEvent & { currentTarget: HTMLDivElement }) => {
		const step =
			e.key === 'ArrowRight' || e.key === 'ArrowUp'
				? 1
				: e.key === 'ArrowLeft' || e.key === 'ArrowDown'
					? -1
					: 0;
		if (step) {
			e.preventDefault();
			setEffort(effortIndex + step);
		} else if (e.key === 'Home') {
			e.preventDefault();
			setEffort(0);
		} else if (e.key === 'End') {
			e.preventDefault();
			setEffort(efforts.length - 1);
		} else if (e.key === 'Escape') {
			setEffortOpen(false);
			focusInput();
		}
	};
	const stepAt = (i: number) =>
		`calc(${EDGE}px + (100% - ${EDGE * 2}px) * ${i / Math.max(1, efforts.length - 1)})`;
	const fillAt = (i: number) => (i === efforts.length - 1 ? '100%' : `calc(${stepAt(i)} + 7px)`);
	const pick = (row: Row) => {
		if (open === 'model') {
			setModelKey(row.key);
			setModelOpen(false);
			focusInput();
			return;
		}
		const head = token ? draft.slice(0, token.start) : draft;
		if (row.attach) {
			setDraft(head);
			Promise.resolve(latest.current.onAttach?.()).then((files) => {
				if (!files) return;
				setAttachments((a) => [...a, ...(Array.isArray(files) ? files : [files])]);
			});
		} else if (open === 'at') {
			setDraft(`${head}@${row.name} `);
		} else {
			setDraft(`${head}${row.name} `);
		}
		setPlusOpen(false);
		setDismissed(false);
		focusInput();
	};
	const send = () => {
		if (!canSend || busy) return;
		latest.current.onSend?.(draft.trim(), { attachments, model, effort: level });
		setDraft('');
		setAttachments([]);
		setDismissed(false);
		closeMenus();
		focusInput();
	};
	const toggleListen = () => {
		if (listening) {
			dictation.current += 1;
			setListening(false);
			return;
		}
		const seq = ++dictation.current;
		setListening(true);
		Promise.resolve(latest.current.onDictate?.()).then(
			(text) => {
				if (seq !== dictation.current) return;
				setListening(false);
				if (text) setDraft((d) => (d.trim() ? `${d.trimEnd()} ${text}` : text));
				focusInput();
			},
			() => {
				if (seq === dictation.current) setListening(false);
			},
		);
	};
	const onKeyDown = (e: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) => {
		if (open && list.length) {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				setActive((cursor + (e.key === 'ArrowDown' ? 1 : list.length - 1)) % list.length);
				return;
			}
			if ((e.key === 'Enter' && !e.shiftKey) || e.key === 'Tab') {
				e.preventDefault();
				pick(list[cursor]);
				return;
			}
		}
		if (e.key === 'Escape') {
			if (open) {
				e.preventDefault();
				setDismissed(true);
				closeMenus();
			}
			return;
		}
		if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
			e.preventDefault();
			send();
		}
	};
	const down = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		if (e.button !== 0 || !armed) return;
		setPressed(true);
	};
	const up = () => setPressed(false);

	function sendGlyph(node: SVGSVGElement, data: SendGlyphProps & { reduce: boolean }) {
		const t = motionValue(data.busy ? 1 : 0);
		let direction = data.busy ? 1 : -1;
		let controls: ReturnType<typeof animate> | undefined;
		const off = t.on('change', (v) => {
			node.querySelector('path')?.setAttribute('d', pathAt(ARROW_UP, SQUARE, v));
			const goo = data.reduce ? 0 : Math.sin(v * Math.PI);
			const sx = 1 - data.squash * goo;
			node.style.transform = goo
				? `rotate(${direction * data.tilt * goo}deg) scale(${sx}, ${1 / sx})`
				: '';
		});
		return {
			update(next: typeof data) {
				data = next;
				direction = data.busy ? 1 : -1;
				controls?.stop();
				controls = animate(
					t,
					data.busy ? 1 : 0,
					data.reduce
						? { duration: 0 }
						: { duration: data.morphDuration / 1000, ease: EASE_IN_OUT },
				);
			},
			destroy() {
				controls?.stop();
				off();
				t.destroy();
			},
		};
	}
</script>

{#snippet renderIcon(icon: Row['icon'], size: number)}{#if Array.isArray(icon)}{@render iconSvg(
			icon as IconSvgElement,
			size,
			1.8,
		)}{:else if typeof icon === 'function'}{@render icon()}{:else}{icon}{/if}{/snippet}
{#snippet iconSvg(
	shapes: readonly (readonly [string, Record<string, string | number>])[],
	size: number | string,
	strokeWidth: number,
	fill: string = 'none',
)}<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		{fill}
		stroke="currentColor"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		>{#each shapes as [tag, attributes]}<svelte:element this={tag} {...attributes} />{/each}</svg
	>{/snippet}
<div
	bind:this={rootRef.current}
	class={`group relative text-[14px] leading-[22px] [width:min(var(--pb-w),100%)] [color:var(--pb-ink)] ${className ? ` ${className}` : ''}`}
	data-busy={busy ? '' : undefined}
	data-max={maxed ? '' : undefined}
	style={css({
		'--pb-bg': background,
		'--pb-ink': color,
		'--pb-menu': menuBackground,
		'--pb-w': `${width}px`,
		'--pb-radius': `${radius}px`,
		'--pb-spark': sparkColor,
		'--pb-press': pressScale,
	} as CSSProperties)}
>
	{#if open}<div
			class="absolute inset-x-0 bottom-[calc(100%+8px)] z-[2] origin-bottom rounded-xl p-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.08)] [animation:prompt-bar-pop_180ms_cubic-bezier(0.23,1,0.32,1)_both] [background:var(--pb-menu)] data-[kind=model]:right-auto data-[kind=model]:w-[200px] data-[kind=model]:origin-bottom-left data-[kind=effort]:right-auto data-[kind=effort]:w-[248px] data-[kind=effort]:origin-bottom-left data-[kind=effort]:px-3.5 data-[kind=effort]:pt-3 data-[kind=effort]:pb-3.5 motion-reduce:[animation:none]"
			role={open === 'effort' ? 'dialog' : 'listbox'}
			aria-label={open === 'at'
				? 'Sources'
				: open === 'slash'
					? 'Commands'
					: open === 'model'
						? 'Models'
						: 'Effort'}
			data-kind={open}
		>
			{#if open === 'effort'}
				<div class="flex items-center gap-2 text-[13px] leading-[18px]">
					<span class="[color:color-mix(in_srgb,var(--pb-ink)_55%,transparent)]">Effort</span>
					<span class="font-medium">{level}</span>
					<span
						class="ml-auto inline-flex [color:color-mix(in_srgb,var(--pb-ink)_55%,transparent)]"
						title="Higher effort thinks longer before answering"
					>
						{@render iconSvg(HelpCircleIcon, 14, 1.8, 'none')}
					</span>
				</div>
				<div
					class="mt-3 flex justify-between text-[12px] leading-4 [color:color-mix(in_srgb,var(--pb-ink)_55%,transparent)]"
				>
					<span>Faster</span> <span>Smarter</span>
				</div>
				<div
					class="relative mt-2 h-[22px] cursor-pointer touch-none rounded-[11px] outline-none select-none [background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)]"
					role="slider"
					tabindex={0}
					aria-label="Effort"
					aria-valuemin={0}
					aria-valuemax={efforts.length - 1}
					aria-valuenow={effortIndex}
					aria-valuetext={level}
					style={css({
						'--pb-effort-x': stepAt(effortIndex),
						'--pb-effort-fill': fillAt(effortIndex),
					} as CSSProperties)}
					onpointerdown={(e) => {
						if (e.button !== 0) return;
						try {
							e.currentTarget.setPointerCapture(e.pointerId);
						} catch {}
						e.currentTarget.focus({ preventScroll: true });
						effortFromPointer(e);
					}}
					onpointermove={(e) => {
						if (e.buttons & 1) effortFromPointer(e);
					}}
					onkeydown={onEffortKey}
				>
					<span
						class="absolute inset-y-0 left-0 rounded-[11px] [width:var(--pb-effort-fill)] [background:color-mix(in_srgb,var(--pb-ink)_18%,transparent)] [transition:width_220ms_cubic-bezier(0.23,1,0.32,1),background-color_300ms_ease] group-data-[max]:[background:color-mix(in_srgb,var(--pb-spark)_35%,transparent)] motion-reduce:[transition:background-color_300ms_ease]"
					></span>
					{#each efforts as label, i}<i
							class="absolute top-1/2 -mt-0.5 -ml-0.5 h-1 w-1 rounded-full [background:color-mix(in_srgb,var(--pb-ink)_30%,transparent)]"
							style={css({ left: stepAt(i) })}
						></i>{/each}
					<span
						class="absolute -top-[3px] -ml-[7px] h-7 w-3.5 rounded-[7px] shadow-[0_2px_6px_rgba(0,0,0,0.25)] [left:var(--pb-effort-x)] [background:var(--pb-ink)] [transition:left_220ms_cubic-bezier(0.23,1,0.32,1),background-color_300ms_ease] group-data-[max]:[background:var(--pb-spark)] motion-reduce:[transition:background-color_300ms_ease]"
					></span>
				</div>
			{:else}
				<span
					bind:this={glowRef.current}
					class="pointer-events-none absolute inset-x-1 rounded-lg opacity-0 [background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] [transition:top_220ms_cubic-bezier(0.23,1,0.32,1),height_220ms_cubic-bezier(0.23,1,0.32,1),opacity_150ms_ease] motion-reduce:[transition:opacity_150ms_ease]"
					aria-hidden="true"
				></span>
				{#each list as row, i}<button
						bind:this={rowRefs.current[i]}
						type="button"
						role="option"
						aria-selected={i === cursor}
						class="relative z-[1] flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-lg border-0 bg-transparent px-2 text-left text-inherit outline-none [font:inherit] [-webkit-tap-highlight-color:transparent]"
						onmousedown={(e) => e.preventDefault()}
						onpointerenter={() => setActive(i)}
						onclick={() => pick(row)}
					>
						{#if open === 'at'}<span
								class="inline-flex w-5 flex-none justify-center [color:color-mix(in_srgb,var(--pb-ink)_70%,transparent)]"
							>
								{@render renderIcon(row.icon, 15)}
							</span>{:else}{/if} <span class="flex-none text-[13px] font-medium">{row.name}</span>
						{#if row.description}<span
								class="min-w-0 flex-auto truncate text-[12px] [color:color-mix(in_srgb,var(--pb-ink)_55%,transparent)]"
							>
								{row.description}
							</span>{:else}{/if}
						{#if open === 'model'}
							<span
								class="ml-auto flex-none text-[11px] [color:color-mix(in_srgb,var(--pb-ink)_55%,transparent)]"
							>
								{row.tag}
							</span>
							<span
								class="inline-flex w-4 flex-none justify-center opacity-0 data-[on]:opacity-100"
								data-on={row.key === model?.key ? '' : undefined}
							>
								{@render iconSvg(Tick02Icon, 13, 2.5, 'none')}
							</span>
						{:else}{/if}
					</button>{/each}
				{#if list.length === 0}<div
						class="flex h-9 items-center px-2 text-[12px] [color:color-mix(in_srgb,var(--pb-ink)_55%,transparent)]"
					>
						No matches for “{query}”
					</div>{:else}{/if}
			{/if}
		</div>{:else}{/if}
	<div
		class="relative isolate flex cursor-text flex-col gap-2 p-3 [background:var(--pb-bg)] [border-radius:var(--pb-radius)] before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:opacity-0 before:content-[''] before:[background:radial-gradient(140%_120%_at_0%_100%,color-mix(in_srgb,var(--pb-spark)_26%,transparent),transparent_62%)] before:[transition:opacity_500ms_ease] data-[max]:before:opacity-100"
		role="presentation"
		data-max={maxed ? '' : undefined}
		onpointerdown={(e) => {
			if (e.target === e.currentTarget || e.target === inputRef.current) closeMenus();
		}}
		onclick={focusInput}
	>
		<canvas
			bind:this={sparkRef.current}
			class="pointer-events-none absolute inset-0 -z-10 h-full w-full rounded-[inherit]"
			aria-hidden="true"
		></canvas>
		{#if attachments.length > 0}<div class="flex flex-wrap gap-1.5">
				{#each attachments as file, i}<span
						class="inline-flex h-[26px] items-center gap-1.5 rounded-lg pr-1 pl-2 text-[12px] [animation:prompt-bar-pop_200ms_cubic-bezier(0.23,1,0.32,1)_both] [background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] motion-reduce:[animation:none]"
					>
						{@render iconSvg(File02Icon, 12, 2, 'none')}
						<span class="max-w-[144px] truncate">{file}</span>
						<button
							type="button"
							class="inline-grid h-[18px] w-[18px] cursor-pointer place-items-center rounded-[5px] border-0 bg-transparent p-0 text-inherit opacity-60 outline-none [transition:opacity_120ms_ease,background-color_120ms_ease] hover:opacity-100 hover:[background:color-mix(in_srgb,var(--pb-ink)_10%,transparent)]"
							aria-label={`Remove ${file}`}
							onclick={() => setAttachments((a) => a.filter((_, j) => j !== i))}
						>
							{@render iconSvg(Cancel01Icon, 10, 2.5, 'none')}
						</button>
					</span>{/each}
			</div>{:else}{/if}
		<textarea
			bind:this={inputRef.current}
			class="block w-full resize-none border-0 bg-transparent p-0 text-[14px] leading-[22px] text-inherit outline-none [font:inherit] [overflow-wrap:anywhere] placeholder:[color:color-mix(in_srgb,var(--pb-ink)_45%,transparent)] [@media(pointer:coarse)]:text-[16px]"
			rows={1}
			value={draft}
			placeholder={listening ? 'Listening…' : placeholder}
			aria-label="Prompt"
			oninput={(e) => {
				setDraft(e.currentTarget.value);
				typing.current.energy = Math.min(1.6, typing.current.energy + 0.22);
				typing.current.strokes = Math.min(4, typing.current.strokes + 1);
				setDismissed(false);
				closeMenus();
				setActive(0);
			}}
			onfocus={closeMenus}
			onkeydown={onKeyDown}></textarea>
		<div class="flex items-center gap-1">
			<button
				type="button"
				class="inline-grid h-7 w-7 flex-none cursor-pointer touch-manipulation place-items-center rounded-lg border-0 bg-transparent p-0 outline-none select-none [color:color-mix(in_srgb,var(--pb-ink)_60%,transparent)] [font:inherit] [-webkit-tap-highlight-color:transparent] [transition:background-color_150ms_ease,color_150ms_ease,transform_160ms_cubic-bezier(0.23,1,0.32,1)] active:[transform:scale(0.94)] data-[on]:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] data-[on]:[color:var(--pb-ink)] motion-reduce:active:[transform:none] [@media(hover:hover)_and_(pointer:fine)]:hover:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] [@media(hover:hover)_and_(pointer:fine)]:hover:[color:var(--pb-ink)]"
				aria-label="Add files and sources"
				aria-expanded={plusOpen}
				data-on={plusOpen ? '' : undefined}
				onmousedown={(e) => e.preventDefault()}
				onclick={() => {
					setModelOpen(false);
					setEffortOpen(false);
					setActive(0);
					setPlusOpen((v) => !v);
					focusInput();
				}}
			>
				{@render iconSvg(PlusSignIcon, 16, 2, 'none')}
			</button>
			{#if models.length > 0}<button
					type="button"
					class="inline-flex h-7 flex-none cursor-pointer touch-manipulation items-center gap-1 rounded-lg border-0 bg-transparent px-2 text-[12px] font-medium outline-none select-none [color:color-mix(in_srgb,var(--pb-ink)_70%,transparent)] [font:inherit] [-webkit-tap-highlight-color:transparent] [transition:background-color_150ms_ease,color_150ms_ease] data-[on]:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] data-[on]:[color:var(--pb-ink)] [@media(hover:hover)_and_(pointer:fine)]:hover:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] [@media(hover:hover)_and_(pointer:fine)]:hover:[color:var(--pb-ink)] data-[max]:[color:var(--pb-spark)]!"
					aria-label="Choose model"
					aria-expanded={modelOpen}
					data-on={modelOpen ? '' : undefined}
					onmousedown={(e) => e.preventDefault()}
					onclick={() => {
						setPlusOpen(false);
						setEffortOpen(false);
						setActive(Math.max(0, models.indexOf(model)));
						setModelOpen((v) => !v);
						focusInput();
					}}
				>
					<span>{model.name}</span>
					{@render iconSvg(ArrowDown01Icon, 12, 2.4, 'none')}
				</button>{:else}{/if}
			{#if efforts.length > 0}<button
					type="button"
					class="inline-flex h-7 flex-none cursor-pointer touch-manipulation items-center gap-1 rounded-lg border-0 bg-transparent px-2 text-[12px] font-medium outline-none select-none [color:color-mix(in_srgb,var(--pb-ink)_70%,transparent)] [font:inherit] [-webkit-tap-highlight-color:transparent] [transition:background-color_150ms_ease,color_150ms_ease] data-[on]:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] data-[on]:[color:var(--pb-ink)] [@media(hover:hover)_and_(pointer:fine)]:hover:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] [@media(hover:hover)_and_(pointer:fine)]:hover:[color:var(--pb-ink)] data-[max]:[color:var(--pb-spark)]!"
					aria-label="Choose effort"
					aria-expanded={effortOpen}
					data-on={effortOpen ? '' : undefined}
					data-max={maxed ? '' : undefined}
					onmousedown={(e) => e.preventDefault()}
					onclick={() => {
						setPlusOpen(false);
						setModelOpen(false);
						setEffortOpen((v) => !v);
						focusInput();
					}}
				>
					{@render iconSvg(SparklesIcon, 13, 2, 'none')} <span>{level}</span>
				</button>{:else}{/if} <span class="flex-auto"></span>
			{#if onDictate}<button
					type="button"
					class="inline-grid h-7 w-7 flex-none cursor-pointer touch-manipulation place-items-center rounded-lg border-0 bg-transparent p-0 outline-none select-none [color:color-mix(in_srgb,var(--pb-ink)_60%,transparent)] [font:inherit] [-webkit-tap-highlight-color:transparent] [transition:background-color_150ms_ease,color_150ms_ease,transform_160ms_cubic-bezier(0.23,1,0.32,1)] active:[transform:scale(0.94)] data-[on]:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] data-[on]:[color:var(--pb-ink)] motion-reduce:active:[transform:none] [@media(hover:hover)_and_(pointer:fine)]:hover:[background:color-mix(in_srgb,var(--pb-ink)_8%,transparent)] [@media(hover:hover)_and_(pointer:fine)]:hover:[color:var(--pb-ink)]"
					aria-label={listening ? 'Stop dictation' : 'Dictate'}
					aria-pressed={listening}
					data-on={listening ? '' : undefined}
					onmousedown={(e) => e.preventDefault()}
					onclick={toggleListen}
				>
					{#if listening}<span
							class="flex h-3.5 items-center gap-[2.5px] [&>i]:block [&>i]:h-full [&>i]:w-[2.5px] [&>i]:origin-center [&>i]:rounded-full [&>i]:bg-current [&>i]:[animation:prompt-bar-eq_900ms_ease-in-out_infinite] [&>i:nth-child(2)]:[animation-delay:150ms] [&>i:nth-child(3)]:[animation-delay:300ms]"
							aria-hidden="true"
						>
							<i></i> <i></i> <i></i>
						</span>{:else}{@render iconSvg(Mic01Icon, 15, 2, 'none')}{/if}
				</button>{:else}{/if}
			<button
				type="button"
				class="relative inline-grid h-7 w-7 flex-none cursor-pointer touch-manipulation place-items-center rounded-lg border-0 p-0 outline-none select-none [background:color-mix(in_srgb,var(--pb-ink)_12%,var(--pb-bg))] [color:color-mix(in_srgb,var(--pb-ink)_55%,var(--pb-bg))] [font:inherit] [-webkit-tap-highlight-color:transparent] [transition:background-color_200ms_ease,color_200ms_ease,transform_160ms_cubic-bezier(0.23,1,0.32,1)] disabled:cursor-default data-[armed]:[background:var(--pb-ink)] data-[armed]:[color:var(--pb-bg)] data-[pressed]:[transform:scale(var(--pb-press))] motion-reduce:data-[pressed]:[transform:none]"
				disabled={!armed}
				aria-label={busy ? 'Stop' : 'Send'}
				data-armed={armed ? '' : undefined}
				data-pressed={pressed ? '' : undefined}
				onmousedown={(e) => e.preventDefault()}
				onpointerdown={down}
				onpointerup={up}
				onpointercancel={up}
				onpointerleave={up}
				onclick={() => {
					if (busy) latest.current.onStop?.();
					else send();
				}}
			>
				<svg
					use:sendGlyph={{ busy, morphDuration, squash, tilt, reduce }}
					class="block h-4 w-4 origin-center"
					viewBox="0 0 24 24"
					aria-hidden="true"
					fill="currentColor"
					stroke="currentColor"
					stroke-width="2"
					stroke-linejoin="round"><path d={pathAt(ARROW_UP, SQUARE, busy ? 1 : 0)} /></svg
				>
			</button>
		</div>
	</div>
</div>

<style>
	@keyframes -global-prompt-bar-pop {
		from {
			opacity: 0;
			transform: translateY(4px) scale(0.98);
		}
	}
	@keyframes -global-prompt-bar-eq {
		0%,
		100% {
			transform: scaleY(0.35);
		}
		50% {
			transform: scaleY(1);
		}
	}
</style>
