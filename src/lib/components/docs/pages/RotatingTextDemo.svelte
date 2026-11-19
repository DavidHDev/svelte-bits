<script lang="ts">
	import { animate, motionValue } from 'motion';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewColorPickerCustom from '$lib/components/docs/preview/PreviewColorPickerCustom.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import RotatingText from '$lib/components/library/TextAnimations/RotatingText/RotatingText.svelte';
	import source from '$lib/components/library/TextAnimations/RotatingText/RotatingText.svelte?raw';

	type Effect = 'slide' | 'flip' | 'blur' | 'scale' | 'drop';
	type Direction = 'up' | 'down';
	type StaggerFrom = 'first' | 'last' | 'center' | 'random';

	const WORDS = ['thinking', 'coding', 'components!'];

	const LOOK = {
		highlightColor: '',
		effect: 'slide' as Effect,
		direction: 'up' as Direction,
		rotationInterval: 2000,
		staggerDuration: 0.025,
		staggerFrom: 'last' as StaggerFrom,
		splitBy: 'characters',
		blur: 0,
		highlight: true
	};

	type Look = typeof LOOK;

	const PRESETS: Record<string, Look> = {
		slide: { ...LOOK },
		flip: {
			...LOOK,
			effect: 'flip',
			rotationInterval: 2200,
			staggerDuration: 0.035,
			staggerFrom: 'first',
			highlight: false
		},
		blur: {
			...LOOK,
			effect: 'blur',
			direction: 'down',
			rotationInterval: 2400,
			staggerDuration: 0.03,
			staggerFrom: 'center',
			blur: 12,
			highlight: false
		},
		drop: {
			...LOOK,
			highlightColor: '#facc15',
			effect: 'drop',
			staggerDuration: 0.04,
			staggerFrom: 'first'
		}
	};

	const DEFAULT_PROPS = {
		preset: 'slide',
		...LOOK,
		auto: true,
		loop: true,
		pauseOnHover: false
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESET_OPTIONS = [
		{ value: 'slide', label: 'Slide' },
		{ value: 'flip', label: 'Flip' },
		{ value: 'blur', label: 'Blur' },
		{ value: 'drop', label: 'Drop' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'slide', label: 'Slide' },
		{ value: 'flip', label: 'Flip' },
		{ value: 'blur', label: 'Blur' },
		{ value: 'scale', label: 'Scale' },
		{ value: 'drop', label: 'Drop' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'up', label: 'Up' },
		{ value: 'down', label: 'Down' }
	];

	const STAGGER_FROM_OPTIONS = [
		{ value: 'first', label: 'First' },
		{ value: 'last', label: 'Last' },
		{ value: 'center', label: 'Center' },
		{ value: 'random', label: 'Random' }
	];

	const SPLIT_BY_OPTIONS = [
		{ value: 'characters', label: 'Characters' },
		{ value: 'words', label: 'Words' },
		{ value: 'lines', label: 'Lines' }
	];

	const propData: PropRow[] = [
		{
			name: 'texts',
			type: 'string[]',
			default: '[]',
			description: 'The texts to rotate through.'
		},
		{
			name: 'effect',
			type: "'slide' | 'flip' | 'blur' | 'scale' | 'drop'",
			default: '"slide"',
			description:
				'How letters swap. Flip rolls them over like a drum, blur dissolves them, scale zooms through and drop lets them fall in with a small bounce.'
		},
		{
			name: 'direction',
			type: "'up' | 'down'",
			default: '"up"',
			description: 'Which way letters travel. Drop always falls from above.'
		},
		{
			name: 'highlight',
			type: 'boolean',
			default: 'false',
			description:
				'Puts the rotating text on a colored block that smoothly resizes to fit each new text, with a text color picked for contrast.'
		},
		{
			name: 'highlightColor',
			type: 'string',
			default: '"#FF8A4C"',
			description: 'Color of the highlight block. Hex or rgb colors also set a readable text color automatically.'
		},
		{
			name: 'rotationInterval',
			type: 'number',
			default: '2000',
			description: 'Time each text stays on screen, in milliseconds.'
		},
		{
			name: 'blur',
			type: 'number',
			default: '0',
			description: 'Blurs letters as they come and go, in px. The blur effect uses 10 when this is 0.'
		},
		{
			name: 'staggerDuration',
			type: 'number',
			default: '0',
			description: 'Delay between letters, in seconds.'
		},
		{
			name: 'staggerFrom',
			type: "'first' | 'last' | 'center' | 'random' | number",
			default: '"first"',
			description: 'Which letter moves first. A number starts from that letter, random shuffles the order.'
		},
		{
			name: 'splitBy',
			type: "'characters' | 'words' | 'lines' | string",
			default: '"characters"',
			description: 'How each text is split into moving pieces. Any other string is used as the separator.'
		},
		{
			name: 'loop',
			type: 'boolean',
			default: 'true',
			description: 'Goes back to the first text after the last one.'
		},
		{
			name: 'auto',
			type: 'boolean',
			default: 'true',
			description: 'Rotates on its own. Turn off to drive it with the ref methods.'
		},
		{
			name: 'pauseOnHover',
			type: 'boolean',
			default: 'false',
			description: 'Holds the current text while the pointer is over it.'
		},
		{
			name: 'initial',
			type: 'object',
			default: '-',
			description: 'Overrides the state each letter enters from. Leave unset to use the effect.'
		},
		{
			name: 'animate',
			type: 'object',
			default: '-',
			description: 'Overrides the state each letter settles into.'
		},
		{
			name: 'exit',
			type: 'object',
			default: '-',
			description: 'Overrides the state each letter leaves to.'
		},
		{
			name: 'transition',
			type: 'object',
			default: '-',
			description: 'Overrides the Motion transition used for every letter. Each effect brings its own by default.'
		},
		{
			name: 'animatePresenceMode',
			type: "'wait' | 'sync'",
			default: '"wait"',
			description: "'wait' lets the old text leave before the new one enters, 'sync' runs both at once."
		},
		{
			name: 'animatePresenceInitial',
			type: 'boolean',
			default: 'false',
			description: 'Animates the first text in on mount.'
		},
		{
			name: 'onNext',
			type: '(index: number) => void',
			default: 'undefined',
			description: 'Called with the new index whenever the text changes.'
		},
		{
			name: 'mainClassName',
			type: 'string',
			default: "''",
			description: 'Extra class names for the outer element.'
		},
		{
			name: 'splitLevelClassName',
			type: 'string',
			default: "''",
			description: 'Extra class names for each group of letters. Add overflow hidden here for a masked slide.'
		},
		{
			name: 'elementLevelClassName',
			type: 'string',
			default: "''",
			description: 'Extra class names for each moving letter.'
		}
	];
	const usage = `<script lang="ts">
  import RotatingText from '$lib/components/RotatingText.svelte';
</${'script'}>

<RotatingText
  texts={['Svelte', 'Bits', 'Is', 'Cool!']}
  effect="slide"
  direction="up"
  highlight={true}
  highlightColor="#FF8A4C"
  staggerFrom="last"
  staggerDuration={0.025}
  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
  rotationInterval={2000}
/>`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const props = $derived(demo.props);
	const settings = $derived.by(() => {
		const { preset: _preset, highlightColor: _highlightColor, ...rest } = props;
		return rest;
	});
	const primary = $derived(colorModeValue('#ff3e00', '#FF8A4C'));
	const blockColor = $derived(props.highlightColor || primary);
	const masked = $derived(settings.effect === 'slide' || settings.effect === 'drop');
	let key = $state(0);

	const updateAndReplay = <K extends keyof DemoProps>(name: K, value: DemoProps[K]) => {
		demo.updateProp(name, value);
		key++;
	};

	const applyPreset = (value: string) => {
		const defaults = demo.defaultProps as Record<string, unknown>;
		const base = Object.fromEntries(Object.keys(LOOK).map((name) => [name, defaults[name]]));
		demo.updateProps({ ...base, ...PRESETS[value], preset: value } as Partial<DemoProps>);
		key++;
	};

	const computedProps = $derived({ highlightColor: blockColor });

	let pEl = $state<HTMLParagraphElement | null>(null);
	let creativeEl = $state<HTMLSpanElement | null>(null);

	$effect(() => {
		const p = pEl;
		const creative = creativeEl;
		if (!p || !creative) return;
		const rect = (el: HTMLElement) => el.getBoundingClientRect();
		const layouts = [
			{
				el: p,
				parent: () => p.parentElement ?? p,
				transition: { duration: 0.45, ease: [0.4, 0, 0.1, 1] }
			},
			{
				el: creative,
				parent: () => p,
				transition: { type: 'spring', damping: 30, stiffness: 400 }
			}
		].map((node) => {
			const x = motionValue(0);
			const y = motionValue(0);
			const write = () => {
				node.el.style.transform = x.get() || y.get() ? `translateX(${x.get()}px) translateY(${y.get()}px)` : '';
			};
			x.on('change', write);
			y.on('change', write);
			const origin = () => {
				const a = rect(node.el);
				const b = rect(node.parent());
				return { x: a.left - b.left - x.get(), y: a.top - b.top - y.get() };
			};
			return { ...node, x, y, origin, last: { x: 0, y: 0 } };
		});
		for (const node of layouts) node.last = node.origin();
		const measure = () => {
			const origins = layouts.map((node) => node.origin());
			layouts.forEach((node, i) => {
				const now = origins[i];
				const dx = node.last.x + node.x.get() - now.x;
				const dy = node.last.y + node.y.get() - now.y;
				node.last = now;
				if (settings.highlight) return;
				if (Math.abs(dx) >= 0.5) {
					node.x.set(dx);
					animate(node.x, 0, node.transition as never);
				}
				if (Math.abs(dy) >= 0.5) {
					node.y.set(dy);
					animate(node.y, 0, node.transition as never);
				}
			});
		};
		const observer = new ResizeObserver(measure);
		observer.observe(p);
		return () => {
			observer.disconnect();
			for (const node of layouts) {
				node.x.stop();
				node.y.stop();
				node.el.style.transform = '';
			}
		};
	});
</script>

<TabsLayout
	propsState={demo}
	componentName="RotatingText"
	{usage}
	{source}
	{propData}
	dependencies={['motion']}
	demoOnlyProps={['preset']}
	{computedProps}
>
	{#snippet previewTab()}
		<div class="demo-container" style="position: relative; min-height: 400px; max-height: 400px; overflow: hidden;">
			<div class="rotating-text-demo">
				<p bind:this={pEl} class="rotating-text-ptag">
					<span bind:this={creativeEl} class="pt-0.5 sm:pt-1 md:pt-2">Creative{' '}</span>
					{#key key}
						<RotatingText
							texts={WORDS}
							splitLevelClassName={masked ? 'rotating-text-split' : undefined}
							animatePresenceInitial
							{...settings}
							highlightColor={blockColor}
						/>
					{/key}
				</p>
			</div>
		</div>

		<Customize>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={props.preset} onChange={applyPreset} />
			<PreviewColorPickerCustom
				title="Highlight Color"
				color={blockColor}
				onChange={(value) => demo.updateProp('highlightColor', value)}
			/>
			<PreviewSelect
				title="Effect"
				options={EFFECT_OPTIONS}
				value={settings.effect}
				onChange={(value) => updateAndReplay('effect', value as Effect)}
			/>
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				isDisabled={settings.effect === 'drop'}
				onChange={(value) => updateAndReplay('direction', value as Direction)}
			/>
			<PreviewSlider
				title="Rotation Interval"
				min={500}
				max={5000}
				step={100}
				value={settings.rotationInterval}
				valueUnit="ms"
				onChange={(value) => demo.updateProp('rotationInterval', value)}
			/>
			<PreviewSlider
				title="Stagger Duration"
				min={0}
				max={0.1}
				step={0.005}
				value={settings.staggerDuration}
				valueUnit="s"
				onChange={(value) => demo.updateProp('staggerDuration', value)}
			/>
			<PreviewSelect
				title="Stagger From"
				options={STAGGER_FROM_OPTIONS}
				value={settings.staggerFrom}
				onChange={(value) => demo.updateProp('staggerFrom', value as StaggerFrom)}
			/>
			<PreviewSelect
				title="Split By"
				options={SPLIT_BY_OPTIONS}
				value={settings.splitBy}
				onChange={(value) => updateAndReplay('splitBy', String(value))}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={16}
				step={1}
				value={settings.blur}
				valueUnit="px"
				onChange={(value) => demo.updateProp('blur', value)}
			/>
			<PreviewSwitch title="Auto" isChecked={settings.auto} onChange={(value) => demo.updateProp('auto', value)} />
			<PreviewSwitch title="Loop" isChecked={settings.loop} onChange={(value) => demo.updateProp('loop', value)} />
			<PreviewSwitch
				title="Pause On Hover"
				isChecked={settings.pauseOnHover}
				onChange={(value) => demo.updateProp('pauseOnHover', value)}
			/>
			<PreviewSwitch
				title="Highlight"
				isChecked={settings.highlight}
				onChange={(value) => updateAndReplay('highlight', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['motion']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	:global(.rotating-text-demo) {
		width: 100%;
		height: 100%;
		font-size: 1.5rem;
		line-height: 2rem;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		font-weight: 300;
		overflow: hidden;
		padding: 3rem;
		color: #fff;
	}

	:global(.rotating-text-split) {
		overflow: hidden;
		padding-bottom: 0.125rem;
	}

	:global(.rotating-text-ptag) {
		font-weight: 900;
		display: flex;
		align-items: center;
		gap: 0.2em;
	}

	@media (min-width: 640px) {
		:global(.rotating-text-demo) {
			font-size: 1.875rem;
			line-height: 2.25rem;
			padding: 5rem;
		}

		:global(.rotating-text-split) {
			padding-bottom: 0.25rem;
		}
	}

	@media (min-width: 768px) {
		:global(.rotating-text-demo) {
			font-size: 3rem;
			line-height: 1;
			padding: 6rem;
		}
	}
</style>
