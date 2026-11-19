<script lang="ts">
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PreviewSwitch from '$lib/components/docs/preview/PreviewSwitch.svelte';
	import PropTable, { type PropRow } from '$lib/components/docs/preview/PropTable.svelte';
	import Dependencies from '$lib/components/docs/preview/Dependencies.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import RefreshButton from '$lib/components/docs/preview/RefreshButton.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import { colorModeValue } from '$lib/theme.svelte';
	import FadeContent, {
		type FadeContentEffect,
		type FadeContentStaggerFrom
	} from '$lib/components/library/Animations/FadeContent/FadeContent.svelte';
	import source from '$lib/components/library/Animations/FadeContent/FadeContent.svelte?raw';

	type Photo = 'sky' | 'portrait' | 'landscape';

	const INK = {
		dark: {
			text: '#f4f4f5',
			muted: 'rgba(244, 244, 245, 0.62)',
			faint: 'rgba(244, 244, 245, 0.4)',
			rim: 'inset 0 0 0 1px rgba(255, 255, 255, 0.07)',
			sky: '/assets/demo/night-sky.webp',
			portrait: '/assets/demo/night-portrait.webp',
			landscape: '/assets/demo/night-landscape.webp'
		},
		light: {
			text: '#18181b',
			muted: 'rgba(24, 24, 27, 0.62)',
			faint: 'rgba(24, 24, 27, 0.4)',
			rim: 'inset 0 0 0 1px rgba(24, 24, 27, 0.08)',
			sky: '/assets/demo/day-sky.webp',
			portrait: '/assets/demo/day-portrait.webp',
			landscape: '/assets/demo/day-landscape.webp'
		}
	};

	const TILES: { photo: Photo; position: string }[] = [
		{ photo: 'sky', position: '18% 40%' },
		{ photo: 'portrait', position: '50% 30%' },
		{ photo: 'landscape', position: '20% 60%' },
		{ photo: 'landscape', position: '82% 45%' },
		{ photo: 'sky', position: '85% 55%' },
		{ photo: 'portrait', position: '50% 88%' }
	];

	const LOOK = {
		effect: 'fade' as FadeContentEffect,
		blur: 0,
		duration: 1,
		ease: 'power2.out',
		initialOpacity: 0,
		stagger: 0.1,
		staggerFrom: 'start' as FadeContentStaggerFrom,
		exit: false,
		scrub: false as boolean | number
	};

	const DEFAULT_PROPS = {
		demo: 'journal',
		preset: 'mist',
		smoothScroll: true,
		...LOOK,
		effect: 'mist' as FadeContentEffect,
		duration: 1.8,
		delay: 0,
		threshold: 0.1,
		once: true,
		disappearAfter: 0,
		disappearDuration: 0.5,
		disappearEase: 'power2.in'
	};

	const PRESETS: Record<string, Partial<typeof LOOK>> = {
		fade: {},
		soft: { blur: 10, duration: 1.2 },
		focus: { effect: 'focus', duration: 1.2, ease: 'power3.out' },
		develop: { effect: 'develop', duration: 2 },
		dissolve: { effect: 'dissolve', duration: 1.4, ease: 'power1.inOut' },
		mist: { effect: 'mist', duration: 1.8 },
		pixel: { effect: 'pixel', duration: 1.2, ease: 'power1.inOut' },
		spotlight: { effect: 'focus', exit: true, scrub: 0.5 }
	};

	const DEMO_OPTIONS = [
		{ value: 'journal', label: 'Journal' },
		{ value: 'gallery', label: 'Gallery' },
		{ value: 'basic', label: 'Basic' }
	];

	const PRESET_OPTIONS = [
		{ value: 'fade', label: 'Fade' },
		{ value: 'soft', label: 'Soft' },
		{ value: 'focus', label: 'Focus' },
		{ value: 'develop', label: 'Develop' },
		{ value: 'dissolve', label: 'Dissolve' },
		{ value: 'mist', label: 'Mist' },
		{ value: 'pixel', label: 'Pixel' },
		{ value: 'spotlight', label: 'Spotlight' }
	];

	const EFFECT_OPTIONS = [
		{ value: 'fade', label: 'Fade' },
		{ value: 'focus', label: 'Focus' },
		{ value: 'develop', label: 'Develop' },
		{ value: 'dissolve', label: 'Dissolve' },
		{ value: 'mist', label: 'Mist' },
		{ value: 'pixel', label: 'Pixel' }
	];

	const EASE_OPTIONS = [
		{ value: 'power2.out', label: 'Soft' },
		{ value: 'power3.out', label: 'Power' },
		{ value: 'expo.out', label: 'Expo' },
		{ value: 'power1.inOut', label: 'Even' },
		{ value: 'sine.in', label: 'Slow Start' },
		{ value: 'none', label: 'Linear' }
	];

	const DISAPPEAR_EASE_OPTIONS = [
		{ value: 'power2.in', label: 'Soft' },
		{ value: 'power3.in', label: 'Power' },
		{ value: 'expo.in', label: 'Expo' }
	];

	const STAGGER_FROM_OPTIONS = [
		{ value: 'start', label: 'Start' },
		{ value: 'end', label: 'End' },
		{ value: 'center', label: 'Center' },
		{ value: 'edges', label: 'Edges' },
		{ value: 'random', label: 'Random' }
	];

	const propData: PropRow[] = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'The content to fade in.' },
		{
			name: 'container',
			type: 'string | HTMLElement',
			default: 'window',
			description: 'Scroll container that drives the fade, as a selector or an element. Defaults to the page.'
		},
		{
			name: 'effect',
			type: "'fade' | 'focus' | 'develop' | 'dissolve' | 'mist' | 'pixel'",
			default: "'fade'",
			description:
				'How the content appears: a plain fade, out of focus, from washed-out gray, through fine grain, through drifting mist, or block by block.'
		},
		{
			name: 'blur',
			type: 'boolean | number',
			default: 'false',
			description: 'Extra blur the content starts from, in px. true adds 10px.'
		},
		{
			name: 'duration',
			type: 'number',
			default: '1',
			description: 'Length of the fade, in seconds. Values above 10 are read as milliseconds.'
		},
		{
			name: 'ease',
			type: 'string',
			default: "'power2.out'",
			description: "Any GSAP ease, such as 'power3.out', 'expo.out' or 'none'."
		},
		{
			name: 'delay',
			type: 'number',
			default: '0',
			description: 'Wait before the fade starts, in seconds. Values above 10 are read as milliseconds.'
		},
		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'How far into the viewport the top of the content must be before it fades in, from 0 to 1.'
		},
		{ name: 'initialOpacity', type: 'number', default: '0', description: 'Opacity the content starts from.' },
		{
			name: 'stagger',
			type: 'number',
			default: '0',
			description: 'Fades each direct child in turn, this many seconds apart. Great for lists and grids.'
		},
		{
			name: 'staggerFrom',
			type: "'start' | 'end' | 'center' | 'edges' | 'random'",
			default: "'start'",
			description: 'Which child goes first when staggering.'
		},
		{
			name: 'trigger',
			type: "'scroll' | 'mount'",
			default: "'scroll'",
			description: 'Fade in when the content scrolls into view, or right away.'
		},
		{
			name: 'once',
			type: 'boolean',
			default: 'true',
			description: 'Fades in once. Turn off to fade back out whenever the content scrolls back below the view.'
		},
		{
			name: 'exit',
			type: 'boolean',
			default: 'false',
			description: 'Fades the content back out as it scrolls off the top, and in again when it comes back.'
		},
		{
			name: 'scrub',
			type: 'boolean | number',
			default: 'false',
			description: 'Ties the fade to the scroll position instead of playing it. A number smooths it, in seconds.'
		},
		{
			name: 'disappearAfter',
			type: 'number',
			default: '0',
			description: 'Fades the content out again this many seconds after it appears. 0 keeps it shown.'
		},
		{
			name: 'disappearDuration',
			type: 'number',
			default: '0.5',
			description: 'Length of the fade out, in seconds.'
		},
		{ name: 'disappearEase', type: 'string', default: "'power2.in'", description: 'GSAP ease of the fade out.' },
		{ name: 'onStart', type: '() => void', default: '-', description: 'Called when the fade starts.' },
		{ name: 'onComplete', type: '() => void', default: '-', description: 'Called when the fade finishes.' },
		{
			name: 'onDisappearanceComplete',
			type: '() => void',
			default: '-',
			description: 'Called when the fade out finishes.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the wrapper.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the wrapper.' }
	];

	const usage = `<script lang="ts">
  import FadeContent from '$lib/components/FadeContent.svelte';
</${'script'}>

<FadeContent
  effect="mist"
  duration={1.8}
  ease="power2.out"
  stagger={0.1}
  threshold={0.1}
>
  <h2>Slow light over the bay</h2>
  <p>Every child fades in turn.</p>
</FadeContent>`;

	const TAU = 0.055;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const props = $derived(demo.props);
	const settings = $derived.by(() => {
		const { demo: _demo, preset: _preset, smoothScroll: _smoothScroll, ...rest } = props;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const ink = $derived(INK[theme]);
	const scrolling = $derived(props.demo === 'journal');
	const fade = $derived(scrolling ? settings : { ...settings, exit: false, scrub: false as boolean | number });

	let key = $state(0);
	const sceneKey = $derived(`${props.demo}-${key}`);
	let scroller = $state<HTMLElement | null>(null);
	let scrollerFor = $state('');
	const journalReady = $derived(scroller !== null && scrollerFor === sceneKey);

	const attachScroller = (forKey: string) => (node: HTMLElement) => {
		scroller = node;
		scrollerFor = forKey;
		return () => {
			if (scroller === node) {
				scroller = null;
				scrollerFor = '';
			}
		};
	};

	$effect(() => {
		const node = scroller;
		const enabled = props.smoothScroll && scrolling;
		if (!node || !enabled) return;
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

	const applyPreset = (value: string) => {
		demo.updateProps({ ...LOOK, ...PRESETS[value], preset: value });
		key++;
	};
</script>

{#snippet photo(src: string, position = '50% 50%', h = '', ratio = '', radius = '22px')}
	<div
		style="position: relative; width: 100%; {h ? `height: ${h};` : ''} {ratio
			? `aspect-ratio: ${ratio};`
			: ''} border-radius: {radius}; overflow: hidden; box-shadow: {ink.rim};"
	>
		<img
			{src}
			alt=""
			draggable="false"
			style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: {position};"
		/>
	</div>
{/snippet}

<TabsLayout
	propsState={demo}
	componentName="FadeContent"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['demo', 'preset', 'smoothScroll']}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 500px; padding: 0; overflow: hidden; color: {ink.text}; container-type: inline-size;"
		>
			{#key sceneKey}
				{#if props.demo === 'journal'}
					<div
						{@attach attachScroller(sceneKey)}
						style="position: absolute; inset: 0; overflow-y: auto; scrollbar-width: none;"
					>
						{#if journalReady}
							<div
								style="display: flex; flex-direction: column; align-items: center; gap: 64px; padding: 92px 24px 140px; max-width: 680px; margin: 0 auto;"
							>
								<FadeContent {...fade} container={scroller} style="text-align: center;">
									<p style="margin: 0; font-size: 13px; color: {ink.faint};">Field notes, October</p>
									<p
										style="margin: 10px 0 0; font-size: clamp(28px, 7.4cqi, 44px); font-weight: 600; letter-spacing: -0.035em; line-height: 1.08;"
									>
										Slow light over the bay
									</p>
									<p
										style="margin: 14px auto 0; font-size: 15px; color: {ink.muted}; max-width: 400px; line-height: 1.6;"
									>
										Shot in the last minutes of daylight, when the clouds turn and the water goes still.
									</p>
								</FadeContent>

								<FadeContent {...fade} container={scroller} style="width: 100%;">
									{@render photo(ink.sky, '50% 50%', 'clamp(220px, 50cqi, 340px)')}
								</FadeContent>

								<FadeContent
									{...fade}
									container={scroller}
									style="display: flex; flex-wrap: wrap; gap: 28px; width: 100%; align-items: center;"
								>
									<div style="flex: 1 1 240px; min-width: 0;">
										<p style="margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em;">
											The walk out
										</p>
										<p style="margin: 10px 0 0; font-size: 15px; line-height: 1.65; color: {ink.muted};">
											The pier is a twenty minute walk from the station. Most evenings it is empty by the time
											the sky starts to change, so you get the whole thing to yourself.
										</p>
									</div>
									<div style="flex: 1 1 240px; min-width: 0;">
										{@render photo(ink.portrait, '50% 50%', '', '4 / 5', '18px')}
									</div>
								</FadeContent>

								<FadeContent {...fade} container={scroller} style="text-align: center; max-width: 460px;">
									<p
										style="margin: 0; font-size: clamp(20px, 5cqi, 28px); font-weight: 500; letter-spacing: -0.02em; line-height: 1.3;"
									>
										The good light lasts about four minutes. You learn to wait for it.
									</p>
								</FadeContent>

								<FadeContent {...fade} container={scroller} style="width: 100%;">
									{@render photo(ink.landscape, '50% 60%', 'clamp(200px, 44cqi, 300px)')}
								</FadeContent>

								<FadeContent {...fade} container={scroller} style="text-align: center;">
									<p style="margin: 0; font-size: 15px; color: {ink.muted};">More from the coast next spring.</p>
								</FadeContent>
							</div>
						{/if}
					</div>
				{:else if props.demo === 'gallery'}
					<div
						style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 0 24px;"
					>
						<FadeContent
							{...fade}
							stagger={fade.stagger > 0 ? fade.stagger : 0.1}
							style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; width: min(100%, 520px);"
						>
							{#each TILES as tile, index (index)}
								{@render photo(ink[tile.photo], tile.position, '', '1', '16px')}
							{/each}
						</FadeContent>
					</div>
				{:else}
					<div
						style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 0 24px;"
					>
						<FadeContent {...fade} style="width: min(100%, 320px);">
							{@render photo(ink.sky, '50% 50%', '', '3 / 2', '20px')}
						</FadeContent>
					</div>
				{/if}
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Demo" options={DEMO_OPTIONS} value={props.demo} onChange={(v) => demo.updateProp('demo', v)} />
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={props.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Effect"
				options={EFFECT_OPTIONS}
				value={settings.effect}
				onChange={(v) => demo.updateProp('effect', v as FadeContentEffect)}
			/>
			<PreviewSelect
				title="Ease"
				options={EASE_OPTIONS}
				value={settings.ease}
				onChange={(v) => demo.updateProp('ease', v)}
			/>
			<PreviewSelect
				title="Stagger From"
				options={STAGGER_FROM_OPTIONS}
				value={settings.staggerFrom}
				onChange={(v) => demo.updateProp('staggerFrom', v as FadeContentStaggerFrom)}
			/>
			<PreviewSelect
				title="Disappear Ease"
				options={DISAPPEAR_EASE_OPTIONS}
				value={settings.disappearEase}
				onChange={(v) => demo.updateProp('disappearEase', v)}
			/>
			<PreviewSlider
				title="Duration"
				min={0.2}
				max={4}
				step={0.1}
				value={settings.duration}
				valueUnit="s"
				onChange={(v) => demo.updateProp('duration', v)}
			/>
			<PreviewSlider
				title="Delay"
				min={0}
				max={2}
				step={0.1}
				value={settings.delay}
				valueUnit="s"
				onChange={(v) => demo.updateProp('delay', v)}
			/>
			<PreviewSlider
				title="Stagger"
				min={0}
				max={0.5}
				step={0.01}
				value={settings.stagger}
				valueUnit="s"
				onChange={(v) => demo.updateProp('stagger', v)}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={30}
				step={1}
				value={settings.blur}
				valueUnit="px"
				onChange={(v) => demo.updateProp('blur', v)}
			/>
			<PreviewSlider
				title="Initial Opacity"
				min={0}
				max={0.9}
				step={0.05}
				value={settings.initialOpacity}
				onChange={(v) => demo.updateProp('initialOpacity', v)}
			/>
			<PreviewSlider
				title="Threshold"
				min={0}
				max={0.45}
				step={0.05}
				value={settings.threshold}
				onChange={(v) => demo.updateProp('threshold', v)}
			/>
			<PreviewSlider
				title="Disappear After"
				min={0}
				max={5}
				step={0.1}
				value={settings.disappearAfter}
				valueUnit="s"
				isDisabled={!settings.once || settings.exit || (scrolling && Boolean(settings.scrub))}
				onChange={(v) => demo.updateProp('disappearAfter', v)}
			/>
			<PreviewSlider
				title="Disappear Duration"
				min={0.1}
				max={3}
				step={0.1}
				value={settings.disappearDuration}
				valueUnit="s"
				isDisabled={!settings.disappearAfter}
				onChange={(v) => demo.updateProp('disappearDuration', v)}
			/>
			<PreviewSwitch title="Once" isChecked={settings.once} onChange={(v) => demo.updateProp('once', v)} />
			<PreviewSwitch
				title="Exit"
				isChecked={settings.exit}
				isDisabled={!scrolling}
				onChange={(v) => demo.updateProp('exit', v)}
			/>
			<PreviewSwitch
				title="Scrub"
				isChecked={Boolean(settings.scrub)}
				isDisabled={!scrolling}
				onChange={(v) => demo.updateProp('scrub', v)}
			/>
			<PreviewSwitch
				title="Smooth Scroll"
				isChecked={props.smoothScroll}
				isDisabled={!scrolling}
				onChange={(v) => demo.updateProp('smoothScroll', v)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
