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
	import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/svelte';
	import {
		ArrowRight01Icon,
		ChartLineData01Icon,
		CloudIcon,
		CommandIcon,
		Database01Icon,
		FingerPrintIcon,
		FlashIcon,
		Globe02Icon,
		Layers01Icon,
		Notification01Icon,
		SecurityCheckIcon,
		Settings01Icon,
		UserGroupIcon
	} from '@hugeicons/core-free-icons';
	import AnimatedContent, {
		type AnimatedContentStaggerFrom,
		type AnimatedContentWipe
	} from '$lib/components/library/Animations/AnimatedContent/AnimatedContent.svelte';
	import source from '$lib/components/library/Animations/AnimatedContent/AnimatedContent.svelte?raw';

	type Direction = 'vertical' | 'horizontal';

	const INK = {
		dark: {
			text: '#f4f4f5',
			muted: 'rgba(244, 244, 245, 0.62)',
			faint: 'rgba(244, 244, 245, 0.4)',
			tile: 'linear-gradient(180deg, #3d3630 0%, #2a2420 100%)',
			rim: 'inset 0 0 0 1px rgba(255, 255, 255, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			card: 'linear-gradient(180deg, #26201b 0%, #1d1814 100%)',
			solid: '#f4f4f5',
			solidText: '#14110E',
			photo: '/assets/demo/night-landscape.webp'
		},
		light: {
			text: '#18181b',
			muted: 'rgba(24, 24, 27, 0.62)',
			faint: 'rgba(24, 24, 27, 0.4)',
			tile: 'linear-gradient(180deg, #ffffff 0%, #f7f6f4 100%)',
			rim: 'inset 0 0 0 1px rgba(24, 24, 27, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(24, 24, 27, 0.25)',
			card: 'linear-gradient(180deg, #ffffff 0%, #f9f8f6 100%)',
			solid: '#18181b',
			solidText: '#ffffff',
			photo: '/assets/demo/day-landscape.webp'
		}
	};

	const FEATURES = [
		{ icon: FlashIcon, title: 'Instant deploys', text: 'Push to main and it is live in seconds.' },
		{ icon: Layers01Icon, title: 'Preview builds', text: 'Every branch gets its own shareable URL.' },
		{ icon: SecurityCheckIcon, title: 'Built-in safety', text: 'Roll back any release with one click.' }
	];

	const STATS = [
		{ value: '99.99%', label: 'Uptime' },
		{ value: '42ms', label: 'Median latency' },
		{ value: '180+', label: 'Edge regions' }
	];

	const TILES = [
		CommandIcon,
		CloudIcon,
		Database01Icon,
		FingerPrintIcon,
		Globe02Icon,
		Notification01Icon,
		Settings01Icon,
		UserGroupIcon
	];

	const LOOK = {
		direction: 'vertical' as Direction,
		distance: 100,
		reverse: false,
		duration: 0.8,
		ease: 'power3.out',
		initialOpacity: 0,
		animateOpacity: true,
		scale: 1,
		blur: 0,
		rotate: 0,
		tilt: 0,
		wipe: 'none' as AnimatedContentWipe,
		stagger: 0.08,
		staggerFrom: 'start' as AnimatedContentStaggerFrom,
		scrub: false
	};

	const DEFAULT_PROPS = {
		demo: 'scroll',
		preset: 'rise',
		smoothScroll: true,
		...LOOK,
		delay: 0,
		threshold: 0.1,
		once: true,
		disappearAfter: 0,
		disappearDuration: 0.5,
		disappearEase: 'power3.in'
	};

	const PRESETS: Record<string, Partial<typeof LOOK>> = {
		rise: {},
		blur: { distance: 40, blur: 12, duration: 1 },
		flip: { distance: 40, tilt: 60, duration: 1.1 },
		wipe: { distance: 0, wipe: 'up', duration: 1.2, ease: 'power2.out' },
		slide: { direction: 'horizontal', distance: 140, duration: 1.1, ease: 'expo.out', blur: 4 },
		spring: { distance: 120, duration: 1.6, ease: 'elastic.out(1, 0.55)' },
		zoom: { distance: 0, scale: 0.85, blur: 6, duration: 0.9 },
		scrub: { distance: 80, blur: 10, scrub: true }
	};

	const DEMO_OPTIONS = [
		{ value: 'scroll', label: 'Scroll' },
		{ value: 'stagger', label: 'Stagger' },
		{ value: 'basic', label: 'Basic' }
	];

	const PRESET_OPTIONS = [
		{ value: 'rise', label: 'Rise' },
		{ value: 'blur', label: 'Blur' },
		{ value: 'flip', label: 'Flip' },
		{ value: 'wipe', label: 'Wipe' },
		{ value: 'slide', label: 'Slide' },
		{ value: 'spring', label: 'Spring' },
		{ value: 'zoom', label: 'Zoom' },
		{ value: 'scrub', label: 'Scrub' }
	];

	const DIRECTION_OPTIONS = [
		{ value: 'vertical', label: 'Vertical' },
		{ value: 'horizontal', label: 'Horizontal' }
	];

	const EASE_OPTIONS = [
		{ value: 'power3.out', label: 'Power' },
		{ value: 'expo.out', label: 'Expo' },
		{ value: 'power2.out', label: 'Soft' },
		{ value: 'back.out(1.6)', label: 'Back' },
		{ value: 'elastic.out(1, 0.55)', label: 'Elastic' },
		{ value: 'bounce.out', label: 'Bounce' },
		{ value: 'none', label: 'Linear' }
	];

	const DISAPPEAR_EASE_OPTIONS = [
		{ value: 'power3.in', label: 'Power' },
		{ value: 'expo.in', label: 'Expo' },
		{ value: 'back.in(1.6)', label: 'Back' }
	];

	const WIPE_OPTIONS = [
		{ value: 'none', label: 'None' },
		{ value: 'up', label: 'Up' },
		{ value: 'down', label: 'Down' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' },
		{ value: 'center', label: 'Center' }
	];

	const STAGGER_FROM_OPTIONS = [
		{ value: 'start', label: 'Start' },
		{ value: 'end', label: 'End' },
		{ value: 'center', label: 'Center' },
		{ value: 'edges', label: 'Edges' },
		{ value: 'random', label: 'Random' }
	];

	const propData: PropRow[] = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'The content to animate.' },
		{
			name: 'container',
			type: 'string | HTMLElement',
			default: 'window',
			description: 'Scroll container that drives the animation, as a selector or an element. Defaults to the page.'
		},
		{
			name: 'distance',
			type: 'number',
			default: '100',
			description: 'How far the content travels into place, in px.'
		},
		{
			name: 'direction',
			type: "'vertical' | 'horizontal'",
			default: "'vertical'",
			description: 'Axis the content travels along.'
		},
		{
			name: 'reverse',
			type: 'boolean',
			default: 'false',
			description: 'Comes in from the opposite side: from above, or from the left.'
		},
		{ name: 'duration', type: 'number', default: '0.8', description: 'Length of the animation, in seconds.' },
		{
			name: 'ease',
			type: 'string',
			default: "'power3.out'",
			description: "Any GSAP ease, such as 'expo.out', 'back.out(1.6)' or 'elastic.out(1, 0.5)'."
		},
		{ name: 'initialOpacity', type: 'number', default: '0', description: 'Opacity the content starts from.' },
		{
			name: 'animateOpacity',
			type: 'boolean',
			default: 'true',
			description: 'Fades the content in. Turn off to keep it fully opaque while it moves.'
		},
		{ name: 'scale', type: 'number', default: '1', description: 'Scale the content starts from.' },
		{
			name: 'blur',
			type: 'number',
			default: '0',
			description: 'Blur the content starts from, in px. It comes into focus as it lands.'
		},
		{ name: 'rotate', type: 'number', default: '0', description: 'Rotation the content starts from, in degrees.' },
		{
			name: 'tilt',
			type: 'number',
			default: '0',
			description: 'Tips the content back in 3D, in degrees, so it flips up into place.'
		},
		{
			name: 'wipe',
			type: "'none' | 'up' | 'down' | 'left' | 'right' | 'center'",
			default: "'none'",
			description: 'Reveals the content behind a soft moving edge instead of all at once.'
		},
		{
			name: 'threshold',
			type: 'number',
			default: '0.1',
			description: 'How far into the viewport the top of the content must be before it animates, from 0 to 1.'
		},
		{ name: 'delay', type: 'number', default: '0', description: 'Wait before the animation starts, in seconds.' },
		{
			name: 'stagger',
			type: 'number',
			default: '0',
			description: 'Animates each direct child in turn, this many seconds apart. Great for lists and grids.'
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
			description: 'Animate when the content scrolls into view, or right away.'
		},
		{
			name: 'once',
			type: 'boolean',
			default: 'true',
			description:
				'Plays once. Turn off to replay every time the content scrolls in, and reverse when it scrolls back out.'
		},
		{
			name: 'scrub',
			type: 'boolean | number',
			default: 'false',
			description: 'Ties the animation to the scroll position. A number smooths it, in seconds.'
		},
		{
			name: 'disappearAfter',
			type: 'number',
			default: '0',
			description: 'Hides the content again this many seconds after it appears. 0 keeps it shown.'
		},
		{
			name: 'disappearDuration',
			type: 'number',
			default: '0.5',
			description: 'Length of the hide animation, in seconds.'
		},
		{ name: 'disappearEase', type: 'string', default: "'power3.in'", description: 'GSAP ease of the hide animation.' },
		{ name: 'onStart', type: '() => void', default: '-', description: 'Called when the animation starts.' },
		{ name: 'onComplete', type: '() => void', default: '-', description: 'Called when the animation finishes.' },
		{
			name: 'onDisappearanceComplete',
			type: '() => void',
			default: '-',
			description: 'Called when the hide animation finishes.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the wrapper.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the wrapper.' }
	];

	const usage = `<script lang="ts">
  import AnimatedContent from '$lib/components/AnimatedContent.svelte';
</${'script'}>

<AnimatedContent
  distance={100}
  direction="vertical"
  duration={0.8}
  ease="power3.out"
  blur={0}
  stagger={0.08}
  threshold={0.1}
>
  <h2>Ship it before lunch</h2>
  <p>Every child animates in turn.</p>
</AnimatedContent>`;

	const TAU = 0.055;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const props = $derived(demo.props);
	const settings = $derived.by(() => {
		const { demo: _demo, preset: _preset, smoothScroll: _smoothScroll, ...rest } = props;
		return rest;
	});
	const theme = $derived(colorModeValue<'light' | 'dark'>('light', 'dark'));
	const ink = $derived(INK[theme]);

	let key = $state(0);
	const sceneKey = $derived(`${props.demo}-${key}`);
	let scroller = $state<HTMLElement | null>(null);
	let scrollerFor = $state('');
	const scrollReady = $derived(scroller !== null && scrollerFor === sceneKey);
	const motion = $derived({ ...settings, container: scroller });

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
		const enabled = props.smoothScroll;
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

{#snippet iconTile(icon: IconSvgElement, size: number)}
	<div
		style="width: {size}px; height: {size}px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; background: {ink.tile}; box-shadow: {ink.rim};"
	>
		<HugeiconsIcon {icon} size={Math.round(size * 0.5)} color={ink.text} strokeWidth={1.6} />
	</div>
{/snippet}

<TabsLayout
	propsState={demo}
	componentName="AnimatedContent"
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
				{#if props.demo === 'stagger'}
					<div
						style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; padding: 0 24px;"
					>
						<AnimatedContent
							{...settings}
							stagger={settings.stagger > 0 ? settings.stagger : 0.08}
							style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; width: min(100%, 460px);"
						>
							{#each TILES as icon, index (index)}
								<div
									style="aspect-ratio: 1; border-radius: 18px; display: grid; place-items: center; background: {ink.card}; box-shadow: {ink.rim};"
								>
									<HugeiconsIcon {icon} size={24} color={ink.text} strokeWidth={1.6} />
								</div>
							{/each}
						</AnimatedContent>
					</div>
				{:else if props.demo === 'basic'}
					<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;">
						<AnimatedContent {...settings}>
							<div
								style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; width: 220px; height: 150px; border-radius: 22px; background: {ink.card}; box-shadow: {ink.rim};"
							>
								{@render iconTile(FlashIcon, 40)}
								<p style="margin: 0; font-size: 15px; font-weight: 600;">Animated content</p>
							</div>
						</AnimatedContent>
					</div>
				{:else}
					<div
						{@attach attachScroller(sceneKey)}
						style="position: absolute; inset: 0; overflow-y: auto; scrollbar-width: none;"
					>
						{#if scrollReady}
							<div
								style="display: flex; flex-direction: column; align-items: center; gap: 72px; padding: 96px 24px 140px; max-width: 720px; margin: 0 auto;"
							>
								<AnimatedContent {...motion} style="text-align: center;">
									<p
										style="margin: 0; font-size: clamp(26px, 7cqi, 40px); font-weight: 600; letter-spacing: -0.035em; line-height: 1.1;"
									>
										Ship it before lunch
									</p>
									<p
										style="margin: 14px auto 0; font-size: 15px; color: {ink.muted}; max-width: 420px; line-height: 1.6;"
									>
										Every push becomes a live preview, every merge a release, with nothing to configure.
									</p>
								</AnimatedContent>

								<AnimatedContent
									{...motion}
									style="display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; width: 100%;"
								>
									{#each FEATURES as item (item.title)}
										<div style="padding: 20px; border-radius: 18px; background: {ink.card}; box-shadow: {ink.rim};">
											{@render iconTile(item.icon, 36)}
											<p style="margin: 18px 0 0; font-size: 15px; font-weight: 600;">{item.title}</p>
											<p style="margin: 6px 0 0; font-size: 13px; line-height: 1.5; color: {ink.muted};">
												{item.text}
											</p>
										</div>
									{/each}
								</AnimatedContent>

								<AnimatedContent {...motion} style="width: 100%;">
									<div class="ac-demo-photo" style="box-shadow: {ink.rim};">
										<img
											src={ink.photo}
											alt=""
											draggable="false"
											style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;"
										/>
									</div>
								</AnimatedContent>

								<AnimatedContent
									{...motion}
									style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; width: 100%;"
								>
									{#each STATS as item (item.label)}
										<div style="text-align: center; padding: 6px 0;">
											<p
												style="margin: 0; font-size: clamp(18px, 5.4cqi, 32px); font-weight: 600; letter-spacing: -0.03em; white-space: nowrap;"
											>
												{item.value}
											</p>
											<p style="margin: 4px 0 0; font-size: 13px; color: {ink.muted};">{item.label}</p>
										</div>
									{/each}
								</AnimatedContent>

								<AnimatedContent {...motion} style="width: 100%;">
									<div
										style="display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; padding: 24px; border-radius: 20px; background: {ink.card}; box-shadow: {ink.rim};"
									>
										<div style="display: flex; align-items: center; gap: 14px;">
											{@render iconTile(ChartLineData01Icon, 40)}
											<div>
												<p style="margin: 0; font-size: 16px; font-weight: 600;">Start shipping today</p>
												<p style="margin: 2px 0 0; font-size: 13px; color: {ink.muted};">Free for personal projects.</p>
											</div>
										</div>
										<span
											style="display: flex; align-items: center; gap: 6px; height: 40px; padding: 0 16px; border-radius: 11px; font-size: 14px; font-weight: 500; background: {ink.solid}; color: {ink.solidText};"
										>
											Get started
											<HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={1.8} />
										</span>
									</div>
								</AnimatedContent>
							</div>
						{/if}
					</div>
				{/if}
			{/key}
			<RefreshButton onClick={() => key++} />
		</div>

		<Customize>
			<PreviewSelect title="Demo" options={DEMO_OPTIONS} value={props.demo} onChange={(v) => demo.updateProp('demo', v)} />
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={props.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Direction"
				options={DIRECTION_OPTIONS}
				value={settings.direction}
				onChange={(v) => demo.updateProp('direction', v as Direction)}
			/>
			<PreviewSelect title="Ease" options={EASE_OPTIONS} value={settings.ease} onChange={(v) => demo.updateProp('ease', v)} />
			<PreviewSelect
				title="Wipe"
				options={WIPE_OPTIONS}
				value={settings.wipe}
				onChange={(v) => demo.updateProp('wipe', v as AnimatedContentWipe)}
			/>
			<PreviewSelect
				title="Stagger From"
				options={STAGGER_FROM_OPTIONS}
				value={settings.staggerFrom}
				onChange={(v) => demo.updateProp('staggerFrom', v as AnimatedContentStaggerFrom)}
			/>
			<PreviewSlider
				title="Distance"
				min={0}
				max={300}
				step={10}
				value={settings.distance}
				valueUnit="px"
				onChange={(v) => demo.updateProp('distance', v)}
			/>
			<PreviewSlider
				title="Duration"
				min={0.1}
				max={3}
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
				max={0.4}
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
				title="Initial Scale"
				min={0.5}
				max={1.5}
				step={0.01}
				value={settings.scale}
				onChange={(v) => demo.updateProp('scale', v)}
			/>
			<PreviewSlider
				title="Rotate"
				min={-45}
				max={45}
				step={1}
				value={settings.rotate}
				valueUnit="°"
				onChange={(v) => demo.updateProp('rotate', v)}
			/>
			<PreviewSlider
				title="Tilt"
				min={0}
				max={90}
				step={1}
				value={settings.tilt}
				valueUnit="°"
				onChange={(v) => demo.updateProp('tilt', v)}
			/>
			<PreviewSlider
				title="Initial Opacity"
				min={0}
				max={1}
				step={0.05}
				value={settings.initialOpacity}
				isDisabled={!settings.animateOpacity}
				onChange={(v) => demo.updateProp('initialOpacity', v)}
			/>
			<PreviewSlider
				title="Threshold"
				min={0}
				max={0.9}
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
				isDisabled={!settings.once || settings.scrub}
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
			<PreviewSelect
				title="Disappear Ease"
				options={DISAPPEAR_EASE_OPTIONS}
				value={settings.disappearEase}
				onChange={(v) => demo.updateProp('disappearEase', v)}
			/>
			<PreviewSwitch title="Reverse" isChecked={settings.reverse} onChange={(v) => demo.updateProp('reverse', v)} />
			<PreviewSwitch
				title="Animate Opacity"
				isChecked={settings.animateOpacity}
				onChange={(v) => demo.updateProp('animateOpacity', v)}
			/>
			<PreviewSwitch
				title="Smooth Scroll"
				isChecked={props.smoothScroll}
				isDisabled={props.demo !== 'scroll'}
				onChange={(v) => demo.updateProp('smoothScroll', v)}
			/>
			<PreviewSwitch title="Once" isChecked={settings.once} onChange={(v) => demo.updateProp('once', v)} />
			<PreviewSwitch title="Scrub" isChecked={settings.scrub} onChange={(v) => demo.updateProp('scrub', v)} />
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={['gsap']} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>

<style>
	.ac-demo-photo {
		position: relative;
		height: 200px;
		border-radius: 22px;
		overflow: hidden;
	}

	@media (min-width: 768px) {
		.ac-demo-photo {
			height: 260px;
		}
	}
</style>
