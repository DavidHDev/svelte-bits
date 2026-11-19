<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import ScrollFloat from '$lib/components/library/TextAnimations/ScrollFloat/ScrollFloat.svelte';
	import source from '$lib/components/library/TextAnimations/ScrollFloat/ScrollFloat.svelte?raw';

	type Effect = 'float' | 'flip' | 'scatter' | 'blur' | 'wave';
	type Split = 'chars' | 'words';
	type Direction = 'up' | 'down';
	type Order = 'start' | 'end' | 'center' | 'edges' | 'random';

	type Look = {
		colorShift: boolean;
		shiftColor: string;
		effect: Effect;
		splitBy: Split;
		direction: Direction;
		order: Order;
		ease: string;
		animationDuration: number;
		stagger: number;
		smoothing: number;
		distance: number;
		stretch: number;
	};

	const LOOK: Look = {
		colorShift: false,
		shiftColor: '#ff6b3d',
		effect: 'float',
		splitBy: 'chars',
		direction: 'up',
		order: 'start',
		ease: 'back.inOut(2)',
		animationDuration: 1,
		stagger: 0.03,
		smoothing: 0,
		distance: 120,
		stretch: 2.3
	};

	const PRESETS: Record<string, Look> = {
		float: { ...LOOK },
		flip: {
			...LOOK,
			effect: 'flip',
			direction: 'down',
			order: 'center',
			stagger: 0.12,
			smoothing: 0.4,
			distance: 140
		},
		scatter: {
			...LOOK,
			colorShift: true,
			effect: 'scatter',
			order: 'random',
			ease: 'sine.inOut',
			stagger: 0.09,
			smoothing: 0.5,
			distance: 170
		},
		wave: {
			...LOOK,
			colorShift: true,
			shiftColor: '#3d8bff',
			effect: 'wave',
			ease: 'none',
			animationDuration: 1.6,
			stagger: 0.11,
			smoothing: 0.3,
			distance: 130,
			stretch: 1.4
		}
	};

	const DEFAULT_PROPS = {
		preset: 'float',
		...LOOK
	};

	const PRESET_OPTIONS = [
		{ value: 'float', label: 'Float' },
		{ value: 'flip', label: 'Flip' },
		{ value: 'scatter', label: 'Scatter' },
		{ value: 'wave', label: 'Wave' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'float', label: 'Float' },
		{ value: 'flip', label: 'Flip' },
		{ value: 'scatter', label: 'Scatter' },
		{ value: 'blur', label: 'Blur' },
		{ value: 'wave', label: 'Wave' }
	];

	const SPLIT_OPTIONS = [
		{ value: 'chars', label: 'Letters' },
		{ value: 'words', label: 'Words' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'up', label: 'Up' },
		{ value: 'down', label: 'Down' }
	];

	const ORDER_OPTIONS = [
		{ value: 'start', label: 'Start' },
		{ value: 'end', label: 'End' },
		{ value: 'center', label: 'Center' },
		{ value: 'edges', label: 'Edges' },
		{ value: 'random', label: 'Random' }
	];

	const EASE_OPTIONS = [
		{ value: 'back.inOut(2)', label: 'Overshoot' },
		{ value: 'elastic.out(1, 0.45)', label: 'Elastic' },
		{ value: 'power3.out', label: 'Glide' },
		{ value: 'sine.inOut', label: 'Smooth' },
		{ value: 'expo.out', label: 'Expo' },
		{ value: 'none', label: 'Linear' }
	];

	const propData: PropRow[] = [
		{
			name: 'children',
			type: 'string | Snippet',
			default: '-',
			description: 'The text to animate. Plain text is split into letters or words, anything else moves in as one piece.'
		},
		{
			name: 'scrollContainerRef',
			type: 'HTMLElement | null',
			default: 'window',
			description: 'The element that scrolls. Leave it out to use the page.'
		},
		{
			name: 'effect',
			type: "'float' | 'flip' | 'scatter' | 'blur' | 'wave'",
			default: "'float'",
			description:
				'How the pieces arrive. Float stretches them up out of a slot, flip rolls them in on a drum, scatter assembles them from random spots, blur pulls them into focus and wave makes them swell in on a rolling wave.'
		},
		{
			name: 'splitBy',
			type: "'chars' | 'words'",
			default: "'chars'",
			description: 'Animate each letter on its own or each word as one piece.'
		},
		{
			name: 'direction',
			type: "'up' | 'down'",
			default: "'up'",
			description: 'Whether the pieces come in from below or from above.'
		},
		{
			name: 'order',
			type: "'start' | 'end' | 'center' | 'edges' | 'random'",
			default: "'start'",
			description: 'Which pieces go first. The order is fixed, so random looks the same on every visit.'
		},
		{
			name: 'fromColor',
			type: 'string',
			default: "'currentColor'",
			description:
				'Color the pieces start in before they settle into the text color. Keep currentColor for no color change.'
		},
		{
			name: 'animationDuration',
			type: 'number',
			default: '1',
			description: "Length of each piece's move compared to the stagger. Higher values move the pieces more together."
		},
		{
			name: 'ease',
			type: 'string',
			default: "'back.inOut(2)'",
			description: "Any GSAP ease, such as 'power3.out', 'elastic.out(1, 0.45)' or 'none'."
		},
		{
			name: 'stagger',
			type: 'number',
			default: '0.03',
			description: 'Delay between pieces. Higher values make the text form one piece at a time.'
		},
		{
			name: 'distance',
			type: 'number',
			default: '120',
			description:
				'How far the pieces travel, as a percentage of their height. For flip it sets the size of the drum they roll around, for scatter how widely they start apart.'
		},
		{
			name: 'stretch',
			type: 'number',
			default: '2.3',
			description: 'How tall the pieces are stretched while they rise in the float and wave effects. 1 keeps their shape.'
		},
		{
			name: 'smoothing',
			type: 'number',
			default: '0',
			description: 'Seconds the pieces take to catch up with the scroll. 0 ties them to it directly.'
		},
		{
			name: 'scrollStart',
			type: 'string',
			default: "'center bottom+=50%'",
			description: 'Scroll position where the animation starts, in ScrollTrigger syntax.'
		},
		{
			name: 'scrollEnd',
			type: 'string',
			default: "'bottom bottom-=40%'",
			description: 'Scroll position where the pieces settle. Text near the end of the page still settles fully.'
		},
		{ name: 'containerClassName', type: 'string', default: "''", description: 'Extra class names for the heading.' },
		{ name: 'textClassName', type: 'string', default: "''", description: 'Extra class names for the text.' }
	];

	const usage = `<script lang="ts">
  import ScrollFloat from '$lib/components/ScrollFloat.svelte';
</${'script'}>

<ScrollFloat
  effect="float"
  splitBy="chars"
  direction="up"
  order="start"
  fromColor="currentColor"
  animationDuration={1}
  ease="back.inOut(2)"
  scrollStart="center bottom+=50%"
  scrollEnd="bottom bottom-=40%"
  stagger={0.03}
  distance={120}
  stretch={2.3}
  smoothing={0}
>
  Svelte Bits
</ScrollFloat>`;

	const TAU = 0.055;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const componentProps = $derived.by(() => {
		const { preset: _preset, colorShift: _colorShift, shiftColor: _shiftColor, ...rest } = settings;
		return rest;
	});
	const fromColor = $derived(settings.colorShift ? settings.shiftColor : 'currentColor');
	const computedProps = $derived({ fromColor });

	let containerRef = $state<HTMLDivElement | null>(null);
	let hintRef = $state<HTMLDivElement | null>(null);

	$effect(() => {
		const scroller = containerRef;
		if (!scroller) return;
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
		let target = scroller.scrollTop;
		let middle = target;
		let current = target;
		let written = target;
		let raf = 0;
		let last = 0;

		const sync = () => {
			cancelAnimationFrame(raf);
			raf = 0;
			last = 0;
			target = middle = current = written = scroller.scrollTop;
		};

		const step = (now: number) => {
			const dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
			last = now;
			const blend = 1 - Math.exp(-dt / TAU);
			middle += (target - middle) * blend;
			current += (middle - current) * blend;
			if (Math.abs(target - current) < 0.3 && Math.abs(target - middle) < 0.3) {
				current = middle = target;
				raf = 0;
				last = 0;
			} else {
				raf = requestAnimationFrame(step);
			}
			written = current;
			scroller.scrollTop = current;
		};

		const onWheel = (event: WheelEvent) => {
			if (event.ctrlKey) return;
			if (!raf && Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
			if (!event.cancelable) {
				sync();
				return;
			}
			const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? scroller.clientHeight : 1;
			const delta = event.deltaY * unit;
			const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight - 1);
			if (!raf) target = middle = current = written = scroller.scrollTop;
			if (!raf && ((delta < 0 && target <= 1) || (delta > 0 && target >= max - 1))) return;
			event.preventDefault();
			target = Math.min(max, Math.max(0, target + delta));
			if (!raf && Math.abs(target - current) >= 0.3) raf = requestAnimationFrame(step);
		};

		const onScroll = () => {
			if (raf && Math.abs(scroller.scrollTop - written) < 2) return;
			sync();
		};

		scroller.addEventListener('wheel', onWheel, { passive: false });
		scroller.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(raf);
			scroller.removeEventListener('wheel', onWheel);
			scroller.removeEventListener('scroll', onScroll);
		};
	});

	const fadeHint = (event: Event) => {
		const hint = hintRef;
		if (!hint) return;
		const t = Math.min(1, (event.currentTarget as HTMLElement).scrollTop / 160);
		hint.style.opacity = String(1 - t * t * (3 - 2 * t));
	};

	const replay = () => containerRef?.scrollTo({ top: 0, behavior: 'smooth' });

	const applyPreset = (value: string) => {
		const defaults = demo.defaultProps as typeof DEFAULT_PROPS;
		const base = Object.fromEntries((Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, defaults[name]]));
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		replay();
	};
</script>

<TabsLayout
	propsState={demo}
	componentName="ScrollFloat"
	{usage}
	{source}
	{propData}
	dependencies={['gsap']}
	demoOnlyProps={['preset', 'colorShift', 'shiftColor']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			bind:this={containerRef}
			class="demo-container"
			style="height: 400px; max-height: 400px; overflow-y: scroll; overflow-x: hidden; position: relative; display: block;"
			onscroll={fadeHint}
		>
			<div
				bind:this={hintRef}
				class="demo-scroll-hint"
				style="position: absolute; top: 0; left: 0; right: 0; height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; pointer-events: none;"
			>
				<p style="font-size: 13px; font-weight: 500; margin: 0;">Scroll down in this box</p>
				<HugeiconsIcon icon={ArrowDown01Icon} size={16} strokeWidth={1.8} />
			</div>
			<div style="position: relative; padding: 760px 3rem 520px;">
				<ScrollFloat {...componentProps} {fromColor} scrollContainerRef={containerRef}>Svelte Bits</ScrollFloat>
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={(v) => applyPreset(String(v))} />

			<PreviewColorPickerCustom
				title="Start Color"
				color={settings.shiftColor}
				onChange={(value) => demo.updateProps({ shiftColor: value, colorShift: true })}
			/>
			<PreviewSwitch
				title="Color Shift"
				isChecked={settings.colorShift}
				onChange={(checked) => demo.updateProp('colorShift', checked)}
			/>

			<PreviewSelect
				title="Effect"
				options={EFFECT_OPTIONS}
				value={settings.effect}
				onChange={(value) => demo.updateProp('effect', value as Effect)}
			/>
			<PreviewSelect
				title="Split"
				options={SPLIT_OPTIONS}
				value={settings.splitBy}
				onChange={(value) => demo.updateProp('splitBy', value as Split)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(value) => demo.updateProp('direction', value as Direction)}
			/>
			<PreviewSelect
				title="Order"
				options={ORDER_OPTIONS}
				value={settings.order}
				onChange={(value) => demo.updateProp('order', value as Order)}
			/>
			<PreviewSelect
				title="Ease"
				options={EASE_OPTIONS}
				value={settings.ease}
				onChange={(value) => demo.updateProp('ease', String(value))}
			/>
			<PreviewSlider
				title="Stagger"
				min={0.01}
				max={0.2}
				step={0.01}
				value={settings.stagger}
				valueUnit="s"
				onChange={(value) => demo.updateProp('stagger', value)}
			/>
			<PreviewSlider
				title="Duration"
				min={0.2}
				max={3}
				step={0.1}
				value={settings.animationDuration}
				valueUnit="s"
				onChange={(value) => demo.updateProp('animationDuration', value)}
			/>
			<PreviewSlider
				title="Smoothing"
				min={0}
				max={2}
				step={0.1}
				value={settings.smoothing}
				valueUnit="s"
				onChange={(value) => demo.updateProp('smoothing', value)}
			/>

			<PreviewSlider
				title="Distance"
				min={0}
				max={300}
				step={10}
				value={settings.distance}
				valueUnit="%"
				onChange={(value) => demo.updateProp('distance', value)}
			/>
			<PreviewSlider
				title="Stretch"
				min={1}
				max={4}
				step={0.1}
				value={settings.stretch}
				isDisabled={settings.effect !== 'float' && settings.effect !== 'wave'}
				onChange={(value) => demo.updateProp('stretch', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
