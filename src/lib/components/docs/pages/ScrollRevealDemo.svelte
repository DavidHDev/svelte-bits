<script lang="ts">
	import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import ScrollReveal from '$lib/components/library/TextAnimations/ScrollReveal/ScrollReveal.svelte';
	import source from '$lib/components/library/TextAnimations/ScrollReveal/ScrollReveal.svelte?raw';

	type Mode = 'scrub' | 'enter';
	type Split = 'words' | 'chars' | 'lines';
	type Effect = 'fade' | 'rise' | 'flip' | 'scale';

	type Look = {
		highlight: boolean;
		highlightColor: string;
		mode: Mode;
		splitBy: Split;
		effect: Effect;
		stagger: number;
		duration: number;
		smoothing: number;
		baseOpacity: number;
		baseRotation: number;
		baseOffset: number;
		enableBlur: boolean;
		blurStrength: number;
	};

	const LOOK: Look = {
		highlight: false,
		highlightColor: '#ff5a1f',
		mode: 'scrub',
		splitBy: 'words',
		effect: 'fade',
		stagger: 0.05,
		duration: 0.8,
		smoothing: 0,
		baseOpacity: 0.1,
		baseRotation: 3,
		baseOffset: 0,
		enableBlur: true,
		blurStrength: 4
	};

	const PRESETS: Record<string, Look> = {
		reveal: { ...LOOK },
		highlight: { ...LOOK, highlight: true, stagger: 0.2, baseOpacity: 0.15, baseRotation: 0, enableBlur: false },
		rise: {
			...LOOK,
			mode: 'enter',
			splitBy: 'lines',
			effect: 'rise',
			stagger: 0.12,
			duration: 0.9,
			baseOpacity: 0,
			baseRotation: 0,
			enableBlur: false
		},
		flip: {
			...LOOK,
			splitBy: 'chars',
			effect: 'flip',
			stagger: 0.012,
			smoothing: 0.3,
			baseOpacity: 0,
			baseRotation: 0,
			enableBlur: false
		}
	};

	const DEFAULT_PROPS = {
		preset: 'reveal',
		...LOOK
	};

	const PRESET_OPTIONS = [
		{ value: 'reveal', label: 'Reveal' },
		{ value: 'highlight', label: 'Highlight' },
		{ value: 'rise', label: 'Rise' },
		{ value: 'flip', label: 'Flip' }
	];

	const MODE_OPTIONS = [
		{ value: 'scrub', label: 'Scrub' },
		{ value: 'enter', label: 'Enter' }
	];

	const SPLIT_OPTIONS = [
		{ value: 'words', label: 'Words' },
		{ value: 'chars', label: 'Chars' },
		{ value: 'lines', label: 'Lines' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'fade', label: 'Fade' },
		{ value: 'rise', label: 'Rise' },
		{ value: 'flip', label: 'Flip' },
		{ value: 'scale', label: 'Scale' }
	];

	const propData: PropRow[] = [
		{
			name: 'children',
			type: 'Snippet | string',
			default: '-',
			description:
				'The text to reveal. Plain text is split into words, characters or lines, anything else is revealed as one piece.'
		},
		{
			name: 'scrollContainerRef',
			type: 'HTMLElement | null',
			default: 'window',
			description: 'The element that scrolls. Leave it out to use the page.'
		},
		{
			name: 'highlightColor',
			type: 'string',
			default: "''",
			description:
				'Accent each word lights up to while it is being revealed, before it settles to the text color. Leave empty for no highlight.'
		},
		{
			name: 'mode',
			type: "'scrub' | 'enter'",
			default: "'scrub'",
			description:
				"'scrub' ties the reveal to the scroll position, 'enter' plays it once when the text scrolls into view."
		},
		{
			name: 'splitBy',
			type: "'words' | 'chars' | 'lines'",
			default: "'words'",
			description:
				"What each step of the reveal is. 'lines' groups the words of each rendered line and regroups on resize."
		},
		{
			name: 'effect',
			type: "'fade' | 'rise' | 'flip' | 'scale'",
			default: "'fade'",
			description:
				"How each piece appears. 'fade' brightens in place, 'rise' slides up from behind its own baseline, 'flip' stands up from flat and 'scale' pops up from small."
		},
		{
			name: 'stagger',
			type: 'number',
			default: '0.05',
			description:
				'Spacing between pieces. Higher values reveal them one at a time instead of in a soft wave. In enter mode it is in seconds.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '0.8',
			description: "Seconds each piece takes to appear when mode is 'enter'."
		},
		{
			name: 'smoothing',
			type: 'number',
			default: '0',
			description: 'Seconds the reveal takes to catch up with the scroll. 0 ties it to the scroll directly.'
		},
		{
			name: 'enableBlur',
			type: 'boolean',
			default: 'true',
			description: 'Starts each piece out of focus and sharpens it as it appears.'
		},
		{
			name: 'blurStrength',
			type: 'number',
			default: '4',
			description: 'How blurred the pieces start, in px.'
		},
		{
			name: 'baseOpacity',
			type: 'number',
			default: '0.1',
			description: 'Opacity of the pieces before they are revealed, from 0 to 1.'
		},
		{
			name: 'baseRotation',
			type: 'number',
			default: '3',
			description: 'Tilt of the whole block before it levels out, in degrees. 0 keeps it level.'
		},
		{
			name: 'baseOffset',
			type: 'number',
			default: '0',
			description: 'How far below its place each piece starts, in px. Pieces rise into place as they appear.'
		},
		{
			name: 'rotationEnd',
			type: 'string',
			default: "'bottom bottom'",
			description: 'Scroll position where the block finishes leveling out in scrub mode, in ScrollTrigger syntax.'
		},
		{
			name: 'wordAnimationEnd',
			type: 'string',
			default: "'bottom bottom'",
			description:
				'Scroll position where every piece is fully revealed in scrub mode. Text near the end of the page still finishes.'
		},
		{
			name: 'containerClassName',
			type: 'string',
			default: "''",
			description: 'Extra class names for the heading.'
		},
		{
			name: 'textClassName',
			type: 'string',
			default: "''",
			description: 'Extra class names for the text.'
		}
	];

	const usage = `<script lang="ts">
  import ScrollReveal from '$lib/components/ScrollReveal.svelte';
</${'script'}>

<ScrollReveal
  highlightColor=""
  mode="scrub"
  splitBy="words"
  effect="fade"
  stagger={0.05}
  duration={0.8}
  smoothing={0}
  baseOpacity={0.1}
  baseRotation={3}
  baseOffset={0}
  enableBlur={true}
  blurStrength={4}
>
  When does a man die? When he is hit by a bullet? No! When he suffers a disease?
  No! When he ate a soup made out of a poisonous mushroom?
  No! A man dies when he is forgotten!
</ScrollReveal>`;

	const TAU = 0.055;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const props = $derived(demo.props);
	const settings = $derived.by(() => {
		const { preset: _preset, highlight: _highlight, highlightColor: _highlightColor, ...rest } = props;
		return rest;
	});
	const computedProps = $derived({ highlightColor: props.highlight ? props.highlightColor : undefined });

	let key = $state(0);
	let scroller = $state<HTMLDivElement | null>(null);
	let hint = $state<HTMLDivElement | null>(null);

	const fadeHint = (event: Event) => {
		if (!hint) return;
		const t = Math.min(1, (event.currentTarget as HTMLElement).scrollTop / 160);
		hint.style.opacity = String(1 - t * t * (3 - 2 * t));
	};

	const applyPreset = (value: string) => {
		const base = Object.fromEntries(
			(Object.keys(LOOK) as (keyof Look)[]).map((name) => [name, demo.defaultProps[name]])
		) as Partial<Look>;
		demo.updateProps({ ...base, ...PRESETS[value], preset: value });
		key++;
	};

	$effect(() => {
		const node = scroller;
		if (!node) return;
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
		let target = node.scrollTop;
		let middle = target;
		let current = target;
		let written = target;
		let raf = 0;
		let last = 0;

		const sync = () => {
			cancelAnimationFrame(raf);
			raf = 0;
			last = 0;
			target = middle = current = written = node.scrollTop;
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
			node.scrollTop = current;
		};

		const onWheel = (event: WheelEvent) => {
			if (event.ctrlKey) return;
			if (!raf && Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
			if (!event.cancelable) {
				sync();
				return;
			}
			const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? node.clientHeight : 1;
			const delta = event.deltaY * unit;
			const max = Math.max(0, node.scrollHeight - node.clientHeight - 1);
			if (!raf) target = middle = current = written = node.scrollTop;
			if (!raf && ((delta < 0 && target <= 1) || (delta > 0 && target >= max - 1))) return;
			event.preventDefault();
			target = Math.min(max, Math.max(0, target + delta));
			if (!raf && Math.abs(target - current) >= 0.3) raf = requestAnimationFrame(step);
		};

		const onScroll = () => {
			if (raf && Math.abs(node.scrollTop - written) < 2) return;
			sync();
		};

		node.addEventListener('wheel', onWheel, { passive: false });
		node.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(raf);
			node.removeEventListener('wheel', onWheel);
			node.removeEventListener('scroll', onScroll);
		};
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="ScrollReveal"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset', 'highlight']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			bind:this={scroller}
			class="demo-container"
			style="height: 400px; max-height: 400px; overflow-y: scroll; overflow-x: hidden; position: relative; display: block;"
			onscroll={fadeHint}
		>
			{#if settings.mode === 'enter'}
				<RefreshButton onClick={() => key++} />
			{/if}
			<div
				bind:this={hint}
				class="demo-scroll-hint"
				style="position: absolute; top: 0; left: 0; right: 0; height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; pointer-events: none;"
			>
				<p style="font-size: 13px; font-weight: 500; margin: 0;">Scroll down in this box</p>
				<HugeiconsIcon icon={ArrowDown01Icon} size={16} strokeWidth={1.8} />
			</div>
			<div style="position: relative; padding: 640px 3rem 480px;">
				{#key key}
					<ScrollReveal
						{...settings}
						highlightColor={props.highlight ? props.highlightColor : ''}
						scrollContainerRef={scroller}
					>
						When does a man die? When he is hit by a bullet? No! When he suffers a disease? No! When he ate a soup made
						out of a poisonous mushroom? No! A man dies when he is forgotten!
					</ScrollReveal>
				{/key}
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={props.preset} onChange={applyPreset} />
			<PreviewSwitch title="Highlight" isChecked={props.highlight} onChange={(v) => demo.updateProp('highlight', v)} />
			<PreviewColorPickerCustom
				title="Highlight Color"
				color={props.highlightColor}
				onChange={(v) => demo.updateProps({ highlightColor: v, highlight: true })}
			/>
			<PreviewSelect title="Mode" options={MODE_OPTIONS} value={settings.mode} onChange={(v) => demo.updateProp('mode', v)} />
			<PreviewSelect
				title="Split By"
				options={SPLIT_OPTIONS}
				value={settings.splitBy}
				onChange={(v) => demo.updateProp('splitBy', v)}
			/>
			<PreviewSelect
				title="Effect"
				options={EFFECT_OPTIONS}
				value={settings.effect}
				onChange={(v) => demo.updateProp('effect', v)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.5}
				step={0.005}
				value={settings.stagger}
				onChange={(v) => demo.updateProp('stagger', v)}
			/>
			<PreviewSlider
				title="Duration"
				min={0.2}
				max={2}
				step={0.05}
				value={settings.duration}
				valueUnit="s"
				isDisabled={settings.mode !== 'enter'}
				onChange={(v) => demo.updateProp('duration', v)}
			/>
			<PreviewSlider
				title="Smoothing"
				min={0}
				max={2}
				step={0.1}
				value={settings.smoothing}
				valueUnit="s"
				isDisabled={settings.mode !== 'scrub'}
				onChange={(v) => demo.updateProp('smoothing', v)}
			/>
			<PreviewSlider
				title="Starting Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.baseOpacity}
				onChange={(v) => demo.updateProp('baseOpacity', v)}
			/>
			<PreviewSlider
				title="Starting Rotation"
				min={0}
				max={10}
				step={1}
				value={settings.baseRotation}
				valueUnit="°"
				onChange={(v) => demo.updateProp('baseRotation', v)}
			/>
			<PreviewSlider
				title="Starting Offset"
				min={0}
				max={60}
				step={1}
				value={settings.baseOffset}
				valueUnit="px"
				onChange={(v) => demo.updateProp('baseOffset', v)}
			/>
			<PreviewSlider
				title="Blur Strength"
				min={0}
				max={20}
				step={1}
				value={settings.blurStrength}
				valueUnit="px"
				isDisabled={!settings.enableBlur}
				onChange={(v) => demo.updateProp('blurStrength', v)}
			/>
			<PreviewSwitch
				title="Enable Blur"
				isChecked={settings.enableBlur}
				onChange={(v) => demo.updateProp('enableBlur', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
