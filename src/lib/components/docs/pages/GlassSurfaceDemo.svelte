<script lang="ts">
	import { onMount } from 'svelte';
	import TabsLayout from '$lib/components/docs/preview/TabsLayout.svelte';
	import Customize from '$lib/components/docs/preview/Customize.svelte';
	import PreviewSlider from '$lib/components/docs/preview/PreviewSlider.svelte';
	import PreviewSelect from '$lib/components/docs/preview/PreviewSelect.svelte';
	import PropTable from '$lib/components/docs/preview/PropTable.svelte';
	import CodeExample from '$lib/components/docs/preview/CodeExample.svelte';
	import { createComponentProps } from '$lib/components/docs/preview/lib/componentProps.svelte';
	import HugeiconsIcon from '$lib/components/common/HugeIcon.svelte';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import {
		FavouriteIcon,
		Home01Icon,
		NextIcon,
		PauseIcon,
		PreviousIcon,
		Search01Icon,
		UserIcon
	} from '@hugeicons/core-free-icons';
	import GlassSurface, {
		type GlassSurfaceRenderer
	} from '$lib/components/library/Components/GlassSurface/GlassSurface.svelte';
	import source from '$lib/components/library/Components/GlassSurface/GlassSurface.svelte?raw';
	import logo from '$lib/assets/logo/svelte-bits-icon-logo.svg';

	type Preset = 'tabs' | 'lens' | 'player' | 'prism' | 'frost' | 'logo';
	type Icon = typeof Home01Icon;

	const DRIFT = [24, 16];

	const LOOK = {
		borderWidth: 0.07,
		brightness: 50,
		opacity: 0.93,
		blur: 11,
		displace: 0.5,
		backgroundOpacity: 0.1,
		saturation: 1,
		distortionScale: -180,
		redOffset: 0,
		greenOffset: 10,
		blueOffset: 20
	};

	const DEFAULT_PROPS = {
		preset: 'tabs' as Preset,
		width: 320,
		height: 76,
		borderRadius: 38,
		...LOOK,
		refraction: true,
		renderer: 'auto' as GlassSurfaceRenderer
	};

	type DemoProps = typeof DEFAULT_PROPS;

	const PRESETS: Record<Preset, Partial<DemoProps>> = {
		tabs: { ...LOOK, width: 320, height: 76, borderRadius: 38 },
		lens: { ...LOOK, width: 200, height: 200, borderRadius: 100, borderWidth: 0.12, distortionScale: -240 },
		player: { ...LOOK, width: 260, height: 96, borderRadius: 30 },
		prism: {
			...LOOK,
			width: 320,
			height: 76,
			borderRadius: 38,
			distortionScale: -220,
			redOffset: 0,
			greenOffset: 28,
			blueOffset: 56
		},
		frost: { ...LOOK, width: 320, height: 76, borderRadius: 38, displace: 3, backgroundOpacity: 0.28 },
		logo: { ...LOOK, width: 280, height: 280, borderRadius: 38 }
	};

	const RENDERER_OPTIONS = [
		{ value: 'auto', label: 'Auto' },
		{ value: 'svg', label: 'SVG' },
		{ value: 'webgl', label: 'WebGL' },
		{ value: 'frosted', label: 'Frosted' }
	];

	const PRESET_OPTIONS = [
		{ value: 'tabs', label: 'Tab Bar' },
		{ value: 'lens', label: 'Lens' },
		{ value: 'player', label: 'Player' },
		{ value: 'prism', label: 'Prism' },
		{ value: 'frost', label: 'Frost' },
		{ value: 'logo', label: 'Logo' }
	];

	const CONTENT: Record<Preset, Icon[]> = {
		tabs: [Home01Icon, Search01Icon, FavouriteIcon, UserIcon],
		prism: [Home01Icon, Search01Icon, FavouriteIcon, UserIcon],
		frost: [Home01Icon, Search01Icon, FavouriteIcon, UserIcon],
		player: [PreviousIcon, PauseIcon, NextIcon],
		lens: [],
		logo: []
	};

	const propData = [
		{ name: 'children', type: 'Snippet', default: '-', description: 'Content shown on the glass.' },
		{
			name: 'width',
			type: 'number | string',
			default: '200',
			description: "Width in px, or any CSS value like '100%'."
		},
		{
			name: 'height',
			type: 'number | string',
			default: '80',
			description: "Height in px, or any CSS value like '100vh'."
		},
		{ name: 'borderRadius', type: 'number', default: '20', description: 'Corner radius in px. Not used with a shape.' },
		{
			name: 'shape',
			type: 'string',
			default: '-',
			description:
				'URL of an SVG or transparent PNG that gives the glass its outline, fitted inside the width and height. Files from another origin need CORS headers.'
		},
		{
			name: 'refraction',
			type: 'boolean',
			default: 'true',
			description:
				'Bends what is behind the glass at its edges. Set it to false to use the frosted glass look everywhere.'
		},
		{
			name: 'renderer',
			type: "'auto' | 'svg' | 'webgl'",
			default: "'auto'",
			description:
				'How the glass bends light. Auto uses SVG filters in Chromium, which bend anything behind the glass, and WebGL in Safari and Firefox when a backdrop is given. Without a backdrop, those browsers get a frosted glass look. WebGL forces the WebGL glass whenever a backdrop is given.'
		},
		{
			name: 'backdrop',
			type: 'HTMLImageElement | HTMLVideoElement | HTMLCanvasElement',
			default: '-',
			description:
				'The image, video or canvas behind the glass. WebGL can only bend what it is given, so pass this to get real refraction outside Chromium. Images from another origin need CORS headers.'
		},
		{
			name: 'distortionScale',
			type: 'number',
			default: '-180',
			description: 'How strongly the edge bends what is behind it. Negative values pull the view inward.'
		},
		{
			name: 'borderWidth',
			type: 'number',
			default: '0.07',
			description: 'Width of the bending edge, as a fraction of the shorter side.'
		},
		{
			name: 'blur',
			type: 'number',
			default: '11',
			description: 'Softness of the transition from the bending edge to the calm center, in px.'
		},
		{
			name: 'brightness',
			type: 'number',
			default: '50',
			description: 'Brightness of the calm center, in %. 50 leaves it undistorted.'
		},
		{
			name: 'opacity',
			type: 'number',
			default: '0.93',
			description: 'How strongly the calm center holds the view still, from 0 to 1.'
		},
		{
			name: 'displace',
			type: 'number',
			default: '0',
			description: 'Blurs the light coming through the glass, for a frosted look.'
		},
		{
			name: 'redOffset',
			type: 'number',
			default: '0',
			description: 'Extra bending for the red channel. Different offsets split light into colored fringes.'
		},
		{ name: 'greenOffset', type: 'number', default: '10', description: 'Extra bending for the green channel.' },
		{ name: 'blueOffset', type: 'number', default: '20', description: 'Extra bending for the blue channel.' },
		{
			name: 'backgroundOpacity',
			type: 'number',
			default: '0',
			description: 'Opacity of a soft frosted tint over the glass, from 0 to 1.'
		},
		{ name: 'saturation', type: 'number', default: '1', description: 'Saturation of what is seen through the glass.' },
		{
			name: 'xChannel',
			type: "'R' | 'G' | 'B'",
			default: "'R'",
			description: 'Channel of the displacement map that moves pixels sideways.'
		},
		{
			name: 'yChannel',
			type: "'R' | 'G' | 'B'",
			default: "'G'",
			description: 'Channel of the displacement map that moves pixels up and down.'
		},
		{
			name: 'mixBlendMode',
			type: 'BlendMode',
			default: "'difference'",
			description: 'How the two edge gradients of the displacement map are combined.'
		},
		{ name: 'class', type: 'string', default: "''", description: 'Extra class names for the glass.' },
		{ name: 'style', type: 'string', default: "''", description: 'Inline styles for the glass.' }
	];

	const scriptOpen = '<' + 'script lang="ts">';
	const scriptClose = '</' + 'script>';

	const usage = `${scriptOpen}
  import GlassSurface from '$lib/components/GlassSurface.svelte';

  let photo = $state<HTMLImageElement>();
${scriptClose}

<GlassSurface
  width={320}
  height={76}
  borderRadius={38}
  distortionScale={-180}
  displace={0.5}
  backgroundOpacity={0.1}
>
  <span>Your content</span>
</GlassSurface>

<GlassSurface shape="/logo.svg" width={280} height={280} />

<img bind:this={photo} src="/photo.jpg" alt="" />
<GlassSurface backdrop={photo} width={320} height={76} borderRadius={38} />`;

	const demo = createComponentProps(DEFAULT_PROPS);
	const settings = $derived(demo.props);
	const glassProps = $derived.by(() => {
		const { preset: _preset, ...rest } = settings;
		return rest;
	});
	const theme = $derived<'light' | 'dark'>(colorTheme.isLight ? 'light' : 'dark');

	let stageRef = $state<HTMLDivElement>();
	let backdropRef = $state<HTMLImageElement>();
	let glassRef = $state<HTMLDivElement>();
	let inputRef = $state<HTMLInputElement>();
	let stageWidth = $state(0);
	let upload = $state.raw<{ url: string; name: string } | null>(null);

	let offset = { x: 0, y: 0 };
	let shown = { x: 0, y: 0 };
	let drag: { x: number; y: number; pointerX: number; pointerY: number } | null = null;
	const drift = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, time: 0, frame: 0 };

	const place = () => {
		const stage = stageRef;
		const glass = glassRef;
		if (!stage || !glass) return;
		const { x: driftX, y: driftY } = drift;
		const ratio = window.devicePixelRatio || 1;
		const limitX = Math.max(0, (stage.clientWidth - glass.offsetWidth) / 2 - 16);
		const limitY = Math.max(0, (stage.clientHeight - glass.offsetHeight) / 2 - 16);
		const leanX = driftX * DRIFT[0];
		const leanY = driftY * DRIFT[1];
		const grab = drag;
		const x = Math.min(limitX, Math.max(-limitX, grab ? grab.pointerX - grab.x : offset.x + leanX));
		const y = Math.min(limitY, Math.max(-limitY, grab ? grab.pointerY - grab.y : offset.y + leanY));
		if (grab) offset = { x: x - leanX, y: y - leanY };
		shown = { x, y };
		glass.style.transform = `translate(${Math.round(x * ratio) / ratio}px, ${Math.round(y * ratio) / ratio}px)`;
	};

	const step = (now: number) => {
		const state = drift;
		const dt = Math.min(0.05, (now - state.time) / 1000);
		state.time = now;
		state.vx += (50 * (state.tx - state.x) - 14 * state.vx) * dt;
		state.vy += (50 * (state.ty - state.y) - 14 * state.vy) * dt;
		state.x += state.vx * dt;
		state.y += state.vy * dt;
		const resting =
			Math.abs(state.tx - state.x) + Math.abs(state.ty - state.y) + Math.abs(state.vx) + Math.abs(state.vy) < 0.0005;
		if (resting) {
			state.x = state.tx;
			state.y = state.ty;
			state.vx = 0;
			state.vy = 0;
		}
		place();
		state.frame = resting ? 0 : requestAnimationFrame(step);
	};

	const wake = () => {
		if (drift.frame) return;
		drift.time = performance.now();
		drift.frame = requestAnimationFrame(step);
	};

	$effect(() => {
		void [settings, stageWidth, upload];
		place();
	});

	onMount(() => {
		const stage = stageRef;
		if (!stage) return;
		const observer = new ResizeObserver(() => {
			stageWidth = stage.clientWidth;
			place();
		});
		observer.observe(stage);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(drift.frame);
			drift.frame = 0;
		};
	});

	$effect(() => {
		const current = upload;
		if (!current) return;
		return () => URL.revokeObjectURL(current.url);
	});

	const onStageMove = (event: PointerEvent) => {
		const stage = stageRef;
		const grab = drag;
		if (grab) {
			grab.pointerX = event.clientX;
			grab.pointerY = event.clientY;
			place();
		}
		if (stage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			const rect = stage.getBoundingClientRect();
			drift.tx = Math.min(1, Math.max(-1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
			drift.ty = Math.min(1, Math.max(-1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
			wake();
		}
	};

	const onStageLeave = () => {
		drift.tx = 0;
		drift.ty = 0;
		wake();
	};

	const onPointerDown = (event: PointerEvent) => {
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		drag = {
			x: event.clientX - shown.x,
			y: event.clientY - shown.y,
			pointerX: event.clientX,
			pointerY: event.clientY
		};
		if (glassRef) glassRef.style.cursor = 'grabbing';
	};

	const onPointerUp = () => {
		drag = null;
		if (glassRef) glassRef.style.cursor = 'grab';
	};

	const onFile = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		target.value = '';
		if (!file) return;
		upload = { url: URL.createObjectURL(file), name: file.name };
	};

	const onRenderer = (value: string) =>
		demo.updateProps(
			value === 'frosted'
				? { refraction: false, renderer: 'auto' }
				: { refraction: true, renderer: value as GlassSurfaceRenderer }
		);

	const applyPreset = (value: Preset) => {
		const defaults = demo.defaultProps;
		const base = Object.fromEntries(
			Object.keys(DEFAULT_PROPS).map((name) => [name, defaults[name as keyof DemoProps]])
		) as DemoProps;
		demo.updateProps({
			...base,
			...PRESETS[value],
			refraction: settings.refraction,
			renderer: settings.renderer,
			preset: value
		});
	};

	const resetProps = demo.resetProps;
	demo.resetProps = () => {
		resetProps();
		upload = null;
	};

	const icons = $derived(CONTENT[settings.preset] ?? CONTENT.tabs);
	const shape = $derived(settings.preset === 'logo' ? upload?.url || logo : undefined);
</script>

<TabsLayout
	propsState={demo}
	componentName="GlassSurface"
	{usage}
	{source}
	{propData}
	demoOnlyProps={['preset']}
	dependencies={[]}
>
	{#snippet previewTab()}
		<div
			bind:this={stageRef}
			class="demo-container"
			style="position: relative; height: 500px; padding: 0; overflow: hidden; display: flex; align-items: center; justify-content: center;"
			onpointermove={onStageMove}
			onpointerleave={onStageLeave}
			role="presentation"
		>
			<img
				bind:this={backdropRef}
				src="/assets/demo/{theme === 'light' ? 'day' : 'night'}-sky.webp"
				alt=""
				draggable="false"
				style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; user-select: none;"
			/>
			<div
				bind:this={glassRef}
				style="cursor: grab; user-select: none; touch-action: none;"
				onpointerdown={onPointerDown}
				onpointerup={onPointerUp}
				onpointercancel={onPointerUp}
				role="presentation"
			>
				<GlassSurface
					{...glassProps}
					backdrop={backdropRef}
					{shape}
					width={stageWidth ? Math.min(settings.width, stageWidth - 32) : settings.width}
				>
					{#if icons.length > 0}
						<div
							style="display: flex; align-items: center; justify-content: space-around; width: 100%; padding-left: 12px; padding-right: 12px; color: {theme ===
							'light'
								? '#18181b'
								: '#ffffff'};"
						>
							{#each icons as icon, index (index)}
								<HugeiconsIcon {icon} size={settings.preset === 'player' ? 28 : 24} strokeWidth={1.8} />
							{/each}
						</div>
					{/if}
				</GlassSurface>
			</div>
		</div>

		<Customize>
			<PreviewSelect
				title="Preset"
				options={PRESET_OPTIONS}
				value={settings.preset}
				onChange={(value: string) => applyPreset(value as Preset)}
			/>
			{#if settings.preset === 'logo'}
				<div class="scrubber">
					<button type="button" class="scrubber-track scrubber-track--select" onclick={() => inputRef?.click()}>
						<span class="scrubber-label">Upload</span>
						<span class="scrubber-select-right">
							<span
								class="scrubber-value"
								style="max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
							>
								{upload ? upload.name : 'SVG or PNG'}
							</span>
						</span>
					</button>
					<input bind:this={inputRef} type="file" accept="image/svg+xml,image/png,image/webp" hidden onchange={onFile} />
				</div>
			{/if}
			<PreviewSelect
				title="Renderer"
				options={RENDERER_OPTIONS}
				value={settings.refraction ? settings.renderer : 'frosted'}
				onChange={onRenderer}
			/>
			<PreviewSlider
				title="Width"
				min={120}
				max={600}
				step={2}
				value={settings.width}
				valueUnit="px"
				onChange={(value: number) => demo.updateProp('width', value)}
			/>
			<PreviewSlider
				title="Height"
				min={48}
				max={320}
				step={2}
				value={settings.height}
				valueUnit="px"
				onChange={(value: number) => demo.updateProp('height', value)}
			/>
			{#if settings.preset !== 'logo'}
				<PreviewSlider
					title="Border Radius"
					min={0}
					max={160}
					step={1}
					value={settings.borderRadius}
					valueUnit="px"
					onChange={(value: number) => demo.updateProp('borderRadius', value)}
				/>
			{/if}
			<PreviewSlider
				title="Distortion Scale"
				min={-300}
				max={300}
				step={10}
				value={settings.distortionScale}
				onChange={(value: number) => demo.updateProp('distortionScale', value)}
			/>
			<PreviewSlider
				title="Border Width"
				min={0}
				max={0.3}
				step={0.01}
				value={settings.borderWidth}
				onChange={(value: number) => demo.updateProp('borderWidth', value)}
			/>
			<PreviewSlider
				title="Blur"
				min={0}
				max={30}
				step={1}
				value={settings.blur}
				valueUnit="px"
				onChange={(value: number) => demo.updateProp('blur', value)}
			/>
			<PreviewSlider
				title="Brightness"
				min={0}
				max={100}
				step={1}
				value={settings.brightness}
				valueUnit="%"
				onChange={(value: number) => demo.updateProp('brightness', value)}
			/>
			<PreviewSlider
				title="Opacity"
				min={0}
				max={1}
				step={0.01}
				value={settings.opacity}
				onChange={(value: number) => demo.updateProp('opacity', value)}
			/>
			<PreviewSlider
				title="Displace"
				min={0}
				max={5}
				step={0.1}
				value={settings.displace}
				onChange={(value: number) => demo.updateProp('displace', value)}
			/>
			<PreviewSlider
				title="Red Offset"
				min={-50}
				max={50}
				step={1}
				value={settings.redOffset}
				onChange={(value: number) => demo.updateProp('redOffset', value)}
			/>
			<PreviewSlider
				title="Green Offset"
				min={-50}
				max={50}
				step={1}
				value={settings.greenOffset}
				onChange={(value: number) => demo.updateProp('greenOffset', value)}
			/>
			<PreviewSlider
				title="Blue Offset"
				min={-50}
				max={50}
				step={1}
				value={settings.blueOffset}
				onChange={(value: number) => demo.updateProp('blueOffset', value)}
			/>
			<PreviewSlider
				title="Background Opacity"
				min={0}
				max={1}
				step={0.01}
				value={settings.backgroundOpacity}
				onChange={(value: number) => demo.updateProp('backgroundOpacity', value)}
			/>
			<PreviewSlider
				title="Saturation"
				min={0}
				max={3}
				step={0.1}
				value={settings.saturation}
				onChange={(value: number) => demo.updateProp('saturation', value)}
			/>
		</Customize>

		<PropTable data={propData} />
	{/snippet}
	{#snippet codeTab()}
		<CodeExample />
	{/snippet}
</TabsLayout>
