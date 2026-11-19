<script lang="ts">
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import {
		Album02Icon,
		ArrowLeft01Icon,
		ArrowRight01Icon,
		FavouriteIcon,
		Image01Icon,
		MoreHorizontalIcon,
		Search01Icon
	} from '@hugeicons/core-free-icons';
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
	import { theme } from '$lib/theme.svelte';
	import GradualBlur, {
		type GradualBlurCurve,
		type GradualBlurPosition
	} from '$lib/components/library/Animations/GradualBlur/GradualBlur.svelte';
	import source from '$lib/components/library/Animations/GradualBlur/GradualBlur.svelte?raw';

	type Photo = 'sky' | 'portrait' | 'landscape';
	type Shot = { photo: Photo; position: string; zoom: number };

	const INK = {
		dark: {
			page: '#14110E',
			text: '#f5f5f5',
			muted: 'rgba(245, 245, 245, 0.6)',
			rim: 'inset 0 0 0 1px rgba(255, 255, 255, 0.07)',
			tile: 'linear-gradient(180deg, #3d362f 0%, #2a241f 100%)',
			tileRim:
				'inset 0 0 0 1px rgba(255, 255, 255, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			sky: '/assets/demo/night-sky.webp',
			portrait: '/assets/demo/night-portrait.webp',
			landscape: '/assets/demo/night-landscape.webp'
		},
		light: {
			page: '#ffffff',
			text: '#18181b',
			muted: 'rgba(24, 24, 27, 0.6)',
			rim: 'inset 0 0 0 1px rgba(24, 24, 27, 0.08)',
			tile: 'linear-gradient(180deg, #ffffff 0%, #f7f6f4 100%)',
			tileRim:
				'inset 0 0 0 1px rgba(24, 24, 27, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1), 0 4px 10px -5px rgba(24, 24, 27, 0.25)',
			sky: '/assets/demo/day-sky.webp',
			portrait: '/assets/demo/day-portrait.webp',
			landscape: '/assets/demo/day-landscape.webp'
		}
	};

	const SHOTS: Shot[] = [
		{ photo: 'sky', position: '20% 40%', zoom: 1 },
		{ photo: 'portrait', position: '50% 35%', zoom: 1.15 },
		{ photo: 'landscape', position: '30% 60%', zoom: 1 },
		{ photo: 'landscape', position: '82% 40%', zoom: 1.7 },
		{ photo: 'sky', position: '85% 60%', zoom: 1.5 },
		{ photo: 'portrait', position: '45% 85%', zoom: 1 },
		{ photo: 'portrait', position: '70% 55%', zoom: 1.9 },
		{ photo: 'sky', position: '50% 80%', zoom: 1.2 },
		{ photo: 'landscape', position: '55% 25%', zoom: 1.4 }
	];

	const SECTIONS = [
		{ title: 'Today', shots: [0, 1, 2, 3, 4, 5] },
		{ title: 'Yesterday', shots: [6, 7, 8, 2, 0, 1] },
		{ title: 'Last week', shots: [3, 4, 5, 6, 7, 8, 1, 2, 0] }
	];

	const TABS = [
		{ icon: Image01Icon, label: 'Library' },
		{ icon: Album02Icon, label: 'Albums' },
		{ icon: FavouriteIcon, label: 'Favorites' },
		{ icon: Search01Icon, label: 'Search' }
	];

	const BUTTONS = [
		{ icon: ArrowLeft01Icon, label: 'Previous', direction: -1 },
		{ icon: ArrowRight01Icon, label: 'Next', direction: 1 }
	];

	const LOOK = {
		strength: 2,
		depth: 6,
		layers: 8,
		curve: 'linear' as GradualBlurCurve,
		exponential: true,
		opacity: 1,
		saturation: 1,
		hoverIntensity: 1,
		tintAmount: 0.6
	};

	const DEFAULT_PROPS = {
		demo: 'feed',
		preset: 'soft',
		smoothScroll: true,
		tintColor: null as string | null,
		position: 'bottom' as GradualBlurPosition,
		target: 'parent' as 'parent' | 'page',
		autoHide: true,
		...LOOK
	};

	const PRESETS: Record<string, Partial<typeof LOOK>> = {
		soft: {},
		clear: { tintAmount: 0 },
		deep: { strength: 4, depth: 10, tintAmount: 0.45 },
		subtle: { strength: 1, depth: 4, tintAmount: 0.3 },
		vibrant: { strength: 3, saturation: 1.8, tintAmount: 0 },
		fog: { strength: 2.5, exponential: false, curve: 'ease-out', tintAmount: 0.92 },
		peek: { strength: 3, hoverIntensity: 0, tintAmount: 0.3 },
		steps: { layers: 3, exponential: false, curve: 'linear', tintAmount: 0 }
	};

	const DEMO_OPTIONS = [
		{ value: 'feed', label: 'Feed' },
		{ value: 'photo', label: 'Photo' },
		{ value: 'carousel', label: 'Carousel' },
		{ value: 'basic', label: 'Basic' }
	];

	const PRESET_OPTIONS = [
		{ value: 'soft', label: 'Soft' },
		{ value: 'clear', label: 'Clear' },
		{ value: 'deep', label: 'Deep' },
		{ value: 'subtle', label: 'Subtle' },
		{ value: 'vibrant', label: 'Vibrant' },
		{ value: 'fog', label: 'Fog' },
		{ value: 'peek', label: 'Peek' },
		{ value: 'steps', label: 'Steps' }
	];

	const POSITION_OPTIONS = [
		{ value: 'bottom', label: 'Bottom' },
		{ value: 'top', label: 'Top' },
		{ value: 'left', label: 'Left' },
		{ value: 'right', label: 'Right' }
	];

	const TARGET_OPTIONS = [
		{ value: 'parent', label: 'Parent' },
		{ value: 'page', label: 'Page' }
	];

	const CURVE_OPTIONS = [
		{ value: 'linear', label: 'Linear' },
		{ value: 'bezier', label: 'Smooth' },
		{ value: 'ease-in', label: 'Ease In' },
		{ value: 'ease-out', label: 'Ease Out' },
		{ value: 'ease-in-out', label: 'Ease In Out' }
	];

	const propData: PropRow[] = [
		{
			name: 'position',
			type: "'top' | 'bottom' | 'left' | 'right'",
			default: "'bottom'",
			description: 'Edge the blur grows toward.'
		},
		{
			name: 'target',
			type: "'parent' | 'page'",
			default: "'parent'",
			description: 'Sit inside the nearest positioned parent, or stay fixed to the edge of the viewport.'
		},
		{
			name: 'height',
			type: 'string | number',
			default: "'6rem'",
			description: 'How far the blur reaches in from the edge. For left and right this is its width. Numbers are px.'
		},
		{
			name: 'width',
			type: 'string | number',
			default: '-',
			description: 'For top and bottom, a narrower centered band. For left and right, overrides height.'
		},
		{
			name: 'strength',
			type: 'number',
			default: '2',
			description: 'How blurry the very edge gets. Each step adds about 12px of blur.'
		},
		{
			name: 'layers',
			type: 'number',
			default: '8',
			description: 'Blur layers stacked across the ramp. More layers give a smoother falloff, fewer show visible steps.'
		},
		{
			name: 'curve',
			type: "'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out'",
			default: "'linear'",
			description: 'How the blur builds across the ramp. bezier is a smooth S-curve.'
		},
		{
			name: 'exponential',
			type: 'boolean',
			default: 'true',
			description: 'Doubles the blur toward the edge so it starts gently. Turn off for an even ramp.'
		},
		{
			name: 'opacity',
			type: 'number',
			default: '1',
			description: 'Opacity of the blur layers. Lower values let the sharp content show through.'
		},
		{
			name: 'saturation',
			type: 'number',
			default: '1',
			description: 'Color boost of the blurred content, building toward the edge, for a glassy look.'
		},
		{
			name: 'tint',
			type: 'string',
			default: "'transparent'",
			description: 'Color the content fades into at the edge, such as your page background. Use rgba for a lighter wash.'
		},
		{
			name: 'autoHide',
			type: 'boolean',
			default: 'false',
			description:
				'Fades the blur out when the scroll container reaches this edge, so it only shows while there is more to scroll.'
		},
		{
			name: 'container',
			type: 'string | HTMLElement | { current }',
			default: '-',
			description:
				'Scroll container watched by autoHide. Defaults to a scrollable sibling or the parent, or the page when target is page.'
		},
		{
			name: 'hoverIntensity',
			type: 'number',
			default: '1',
			description: 'Multiplies the blur while the cursor is over it. 0 clears it on hover, 2 doubles it.'
		},
		{
			name: 'duration',
			type: 'number | string',
			default: '0.3',
			description: 'Length of the hover and autoHide transitions, in seconds or as a CSS time.'
		},
		{ name: 'easing', type: 'string', default: "'ease-out'", description: 'CSS easing of those transitions.' },
		{ name: 'zIndex', type: 'number', default: '1000', description: 'Stacking order of the overlay.' },
		{ name: 'className', type: 'string', default: "''", description: 'Extra class names for the overlay.' },
		{ name: 'style', type: 'string', default: '-', description: 'Inline styles for the overlay.' }
	];

	const usage = `<!-- Component added by Ansh - github.com/ansh-dhanani -->

<script lang="ts">
  import GradualBlur from '$lib/components/GradualBlur.svelte';
</${'script'}>

<section style="position: relative; height: 500px; overflow: hidden;">
  <div style="height: 100%; overflow-y: auto;">
    <!-- Scrolling content -->
  </div>

  <GradualBlur
    position="bottom"
    height="6rem"
    strength={2}
    layers={8}
    curve="linear"
    exponential
    tint="rgba(20, 17, 14, 0.6)"
    autoHide
  />
</section>`;

	const TAU = 0.055;

	const smoothScroll = (scroller: HTMLElement) => {
		if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
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
	};

	const toRgba = (hex: string, alpha: number) => {
		const value = hex.replace('#', '');
		const full =
			value.length === 3
				? value
						.split('')
						.map((c) => c + c)
						.join('')
				: value;
		const r = parseInt(full.slice(0, 2), 16);
		const g = parseInt(full.slice(2, 4), 16);
		const b = parseInt(full.slice(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	};

	const shotStyle = (shot: Shot) =>
		`object-position: ${shot.position}; transform: scale(${shot.zoom}); transform-origin: ${shot.position};`;

	const demo = createComponentProps(DEFAULT_PROPS, { lightProps: null });
	const settings = $derived(demo.props);
	const ink = $derived(theme.isLight ? INK.light : INK.dark);
	const basic = $derived(settings.demo === 'basic');
	const scrim = $derived(settings.demo === 'photo' || (basic && settings.target !== 'page'));
	const tintHex = $derived(settings.tintColor ?? (scrim ? '#000000' : ink.page));
	const tint = $derived(settings.tintAmount > 0 ? toRgba(tintHex, settings.tintAmount) : 'transparent');
	const height = $derived(`${settings.depth}rem`);
	const blur = $derived.by(() => {
		const {
			demo: _demo,
			preset: _preset,
			smoothScroll: _smoothScroll,
			tintColor: _tintColor,
			tintAmount: _tintAmount,
			depth: _depth,
			position: _position,
			target: _target,
			...look
		} = settings;
		return { ...look, height, tint };
	});
	const computedProps = $derived({ height, tint });

	const applyPreset = (value: string) => demo.updateProps({ ...LOOK, ...PRESETS[value], preset: value });

	let scroller = $state<HTMLDivElement | null>(null);
	let strip = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!scroller || !settings.smoothScroll) return;
		return smoothScroll(scroller);
	});

	const move = (direction: number) => strip?.scrollBy({ left: direction * 212, behavior: 'smooth' });

	$effect(() => {
		const el = strip;
		if (!el) return;
		const onWheel = (event: WheelEvent) => {
			if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
			const max = el.scrollWidth - el.clientWidth;
			if ((event.deltaY < 0 && el.scrollLeft <= 1) || (event.deltaY > 0 && el.scrollLeft >= max - 1)) return;
			event.preventDefault();
			el.scrollLeft += event.deltaY;
		};
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => el.removeEventListener('wheel', onWheel);
	});
</script>

{#snippet shotTile(shot: Shot, radius: string, ratio: string)}
	<div class="relative overflow-hidden" style="aspect-ratio: {ratio}; border-radius: {radius};">
		<img
			src={ink[shot.photo]}
			alt=""
			draggable="false"
			class="absolute inset-0 h-full w-full object-cover"
			style={shotStyle(shot)}
		/>
	</div>
{/snippet}

<TabsLayout
	propsState={demo}
	componentName="GradualBlur"
	{usage}
	{source}
	{propData}
	dependencies={[]}
	demoOnlyProps={['demo', 'preset', 'smoothScroll', 'tintColor', 'tintAmount', 'depth']}
	{computedProps}
>
	{#snippet previewTab()}
		<div
			class="demo-container"
			style="position: relative; height: 500px; padding: 0; overflow: hidden; color: {ink.text}; container-type: inline-size;"
		>
			{#key settings.demo}
				{#if settings.demo === 'photo'}
					<div class="absolute inset-0 flex items-center justify-center px-6">
						<div
							class="relative overflow-hidden"
							style="width: min(100%, 560px); aspect-ratio: 3 / 2; border-radius: 22px; box-shadow: {ink.rim};"
						>
							<img
								src={ink.landscape}
								alt=""
								draggable="false"
								class="absolute inset-0 h-full w-full object-cover"
								style="object-position: 50% 60%;"
							/>
							<GradualBlur {...blur} position="bottom" target="parent" zIndex={2} />
							<div class="absolute right-[22px] bottom-5 left-[22px] z-[3] flex items-end gap-3">
								<div class="min-w-0 flex-1 text-white">
									<p class="m-0 font-semibold tracking-[-0.01em]" style="font-size: clamp(16px, 3.6cqi, 20px);">
										Canola field
									</p>
									<p class="m-0 mt-0.5 text-[13px] opacity-[0.78]">Gippsland, 35mm</p>
								</div>
								<div class="flex gap-3.5 pb-0.5 text-white">
									<HugeiconsIcon icon={FavouriteIcon} size={20} color="currentColor" strokeWidth={1.7} />
									<HugeiconsIcon icon={MoreHorizontalIcon} size={20} color="currentColor" strokeWidth={1.7} />
								</div>
							</div>
						</div>
					</div>
				{:else if settings.demo === 'carousel'}
					<div class="absolute inset-0 flex flex-col items-center justify-center gap-[22px]">
						<div class="relative w-full">
							<div bind:this={strip} class="overflow-x-auto" style="scrollbar-width: none;">
								<div class="flex w-max gap-3 px-6 py-0.5">
									{#each SHOTS as shot, i (i)}
										<div class="w-[200px] shrink-0" style="box-shadow: {ink.rim}; border-radius: 18px;">
											{@render shotTile(shot, '18px', '4 / 5')}
										</div>
									{/each}
								</div>
							</div>
							<GradualBlur {...blur} position="left" target="parent" zIndex={2} />
							<GradualBlur {...blur} position="right" target="parent" zIndex={2} />
						</div>
						<div class="flex gap-2.5">
							{#each BUTTONS as button (button.label)}
								<button
									type="button"
									aria-label={button.label}
									onclick={() => move(button.direction)}
									class="grid h-10 w-10 cursor-pointer place-items-center rounded-xl border-0 p-0"
									style="background: {ink.tile}; box-shadow: {ink.tileRim};"
								>
									<HugeiconsIcon icon={button.icon} size={18} color={ink.text} strokeWidth={1.8} />
								</button>
							{/each}
						</div>
					</div>
				{:else if settings.demo === 'basic'}
					<div class="absolute inset-0 flex items-center justify-center px-6">
						<div
							class="relative overflow-hidden"
							style="width: min(100%, 480px); aspect-ratio: 3 / 2; border-radius: 20px; box-shadow: {ink.rim};"
						>
							<img src={ink.sky} alt="" draggable="false" class="absolute inset-0 h-full w-full object-cover" />
							<GradualBlur
								{...blur}
								position={settings.position}
								target={settings.target}
								zIndex={settings.target === 'page' ? 1000 : 2}
							/>
						</div>
					</div>
				{:else}
					<div class="absolute inset-0">
						<div bind:this={scroller} class="absolute inset-0 overflow-y-auto" style="scrollbar-width: none;">
							<div class="mx-auto max-w-[720px] px-4 pt-[76px] pb-[104px]">
								{#each SECTIONS as section, index (section.title)}
									<div style="margin-top: {index ? '28px' : '0'};">
										<div class="mb-2.5 flex items-baseline justify-between px-1">
											<p class="m-0 text-[15px] font-semibold">{section.title}</p>
											<p class="m-0 text-[13px]" style="color: {ink.muted};">{section.shots.length} photos</p>
										</div>
										<div class="grid grid-cols-3 gap-1">
											{#each section.shots as shot, i (i)}
												{@render shotTile(SHOTS[shot], '6px', '1')}
											{/each}
										</div>
									</div>
								{/each}
							</div>
						</div>

						<GradualBlur {...blur} position="top" target="parent" zIndex={2} />
						<GradualBlur {...blur} position="bottom" target="parent" zIndex={2} />

						<div
							class="pointer-events-none absolute top-0 right-0 left-0 z-[3] flex h-16 items-center justify-between px-6"
						>
							<p class="m-0 text-[22px] font-semibold tracking-[-0.02em]">Library</p>
							<div class="flex items-center gap-[18px]">
								<HugeiconsIcon icon={Search01Icon} size={20} color={ink.text} strokeWidth={1.7} />
								<HugeiconsIcon icon={MoreHorizontalIcon} size={20} color={ink.text} strokeWidth={1.7} />
							</div>
						</div>

						<div
							class="pointer-events-none absolute right-0 bottom-3.5 left-0 z-[3] flex justify-center"
							style="gap: clamp(20px, 7cqi, 44px);"
						>
							{#each TABS as tab, index (tab.label)}
								<div class="flex flex-col items-center gap-1" style="color: {index ? ink.muted : ink.text};">
									<HugeiconsIcon icon={tab.icon} size={21} color="currentColor" strokeWidth={1.7} />
									<p class="m-0 text-[11px] font-medium">{tab.label}</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/key}
		</div>

		<Customize>
			<PreviewSelect
				title="Demo"
				options={DEMO_OPTIONS}
				value={settings.demo}
				onChange={(value) => demo.updateProp('demo', value)}
			/>
			<PreviewSelect title="Preset" options={PRESET_OPTIONS} value={settings.preset} onChange={applyPreset} />
			<PreviewSelect
				title="Position"
				options={POSITION_OPTIONS}
				value={settings.position}
				isDisabled={!basic}
				onChange={(value) => demo.updateProp('position', value)}
			/>
			<PreviewSelect
				title="Target"
				options={TARGET_OPTIONS}
				value={settings.target}
				isDisabled={!basic}
				onChange={(value) => demo.updateProp('target', value)}
			/>
			<PreviewSelect
				title="Curve"
				options={CURVE_OPTIONS}
				value={settings.curve}
				onChange={(value) => demo.updateProp('curve', value)}
			/>
			<PreviewColorPickerCustom title="Tint" color={tintHex} onChange={(value) => demo.updateProp('tintColor', value)} />
			<PreviewSlider
				title="Tint Amount"
				min={0}
				max={1}
				step={0.05}
				value={settings.tintAmount}
				onChange={(value) => demo.updateProp('tintAmount', value)}
			/>
			<PreviewSlider
				title="Strength"
				min={0.5}
				max={6}
				step={0.25}
				value={settings.strength}
				onChange={(value) => demo.updateProp('strength', value)}
			/>
			<PreviewSlider
				title="Height"
				min={2}
				max={14}
				step={0.5}
				value={settings.depth}
				valueUnit="rem"
				onChange={(value) => demo.updateProp('depth', value)}
			/>
			<PreviewSlider
				title="Layers"
				min={1}
				max={16}
				step={1}
				value={settings.layers}
				onChange={(value) => demo.updateProp('layers', value)}
			/>
			<PreviewSlider
				title="Saturation"
				min={0}
				max={2.5}
				step={0.05}
				value={settings.saturation}
				onChange={(value) => demo.updateProp('saturation', value)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0.1}
				max={1}
				step={0.05}
				value={settings.opacity}
				onChange={(value) => demo.updateProp('opacity', value)}
			/>
			<PreviewSlider
				title="Hover Intensity"
				min={0}
				max={3}
				step={0.1}
				value={settings.hoverIntensity}
				onChange={(value) => demo.updateProp('hoverIntensity', value)}
			/>
			<PreviewSwitch
				title="Exponential"
				isChecked={settings.exponential}
				onChange={(value) => demo.updateProp('exponential', value)}
			/>
			<PreviewSwitch
				title="Auto Hide"
				isChecked={settings.autoHide}
				isDisabled={settings.demo !== 'feed' && settings.demo !== 'carousel'}
				onChange={(value) => demo.updateProp('autoHide', value)}
			/>
			<PreviewSwitch
				title="Smooth Scroll"
				isChecked={settings.smoothScroll}
				isDisabled={settings.demo !== 'feed'}
				onChange={(value) => demo.updateProp('smoothScroll', value)}
			/>
		</Customize>

		<PropTable data={propData} />
		<Dependencies dependencyList={[]} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
