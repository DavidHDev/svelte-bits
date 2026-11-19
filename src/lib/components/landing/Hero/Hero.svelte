<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { ArrowRight02Icon, ArrowUpRight01Icon, Copy01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
	import HugeIcon from '$lib/components/common/HugeIcon.svelte';
	import { theme } from '$lib/theme.svelte';
	import { GITHUB_URL } from '$lib/constants/site';
	import { jsrepoAddSnippet } from '$lib/constants/cli';
	import { TOTAL_COMPONENTS } from '../shared/catalog';
	import { gradientWavesPresets, loadLibrary, type LibraryComponent } from '../shared/library';
	import { adaptiveQuality } from '../shared/adaptiveQuality.svelte';
	import HeroChip from './HeroChip.svelte';
	import HeroWindow from './HeroWindow.svelte';
	import HeroTerminal from './HeroTerminal.svelte';
	import ScrubNumber from './ScrubNumber.svelte';
	import ScrubColor from './ScrubColor.svelte';
	import DotFrame from './DotFrame.svelte';
	import GhostReveal from './GhostReveal.svelte';
	import { DOT, dotTint, tween, type Field } from './hero';
	import './HeroFrame.css';

	const FALLBACK_LOOK = {
		horizonColor: '#ff3e00',
		waveColor: '#ffb089',
		crestColor: '#ffffff',
		lightMode: false,
		speed: 0.4,
		amplitude: 2.5,
		waveScale: 0.6,
		waveRatio: 0.9,
		swell: 35,
		turbulence: 20,
		tilt: 64,
		zoom: 1,
		height: 5.5,
		fogDepth: 15,
		relief: 1,
		lightAngle: 120,
		sheen: 0,
		brightness: 1,
		opacity: 1,
		grain: 0.2
	};

	const LOOK = gradientWavesPresets?.LOOK ?? FALLBACK_LOOK;
	const presetProps = (value: string, options: { light: boolean; defaults: Record<string, unknown> }) =>
		gradientWavesPresets ? gradientWavesPresets.presetProps(value, options) : { ...FALLBACK_LOOK };

	const ORDER = ['ocean', 'dune', 'dusk', 'silk', 'aurora'];
	const presetOptions = gradientWavesPresets?.PRESET_OPTIONS ?? [];
	const OPTIONS = presetOptions.length
		? ORDER.map((value) => presetOptions.find((option) => option.value === value)).filter(
				(option): option is { value: string; label: string } => Boolean(option)
			)
		: [];
	const FIRST = 'dusk';
	const STAGE = { tilt: 40 };
	const INSTALL = jsrepoAddSnippet('gradient-waves', 'npm');
	const FIELDS: Field[] = [
		{ name: 'waveColor', type: 'color', label: 'Wave color' },
		{ name: 'amplitude', min: 0, max: 5, step: 0.05, label: 'Amplitude' },
		{ name: 'swell', min: 0, max: 40, step: 0.5, label: 'Swell' },
		{ name: 'lightAngle', min: -180, max: 180, step: 1, label: 'Light angle' },
		{ name: 'speed', min: 0, max: 1.5, step: 0.01, label: 'Speed' }
	];
	const HINTS = ['amplitude', 'swell'];
	const SWATCHES = {
		dark: ['#fb923c', '#f9a8d4', '#ff3e00', '#38bdf8', '#34d399', '#fde68a', '#e4e4e7'],
		light: ['#fb923c', '#f472b6', '#ff3e00', '#38bdf8', '#34d399', '#facc15', '#a1a1aa']
	};
	const CYCLE_MS = 6000;
	const IDLE_MS = 2600;

	type Values = Record<string, unknown> & { horizonColor: string; waveColor: string; crestColor: string };

	const lookFor = (preset: string, light: boolean) =>
		({ ...presetProps(preset, { light, defaults: LOOK }), ...STAGE }) as unknown as Values;

	let mounted = $state(false);
	const light = $derived(mounted && theme.isLight);
	let preset = $state<string | null>(FIRST);
	let values = $state<Values>(lookFor(FIRST, false));
	let visible = $state(true);
	let hover = $state(false);
	const quality = adaptiveQuality(() => visible);
	const step = $derived(quality.step);
	let idle = $state(true);
	let auto = $state(true);
	let hold = $state(false);
	let stageEl = $state<HTMLDivElement | null>(null);
	let pointer: { x: number; y: number } | null = null;
	let idleFlag = true;
	let stop: (() => void) | null = null;
	let copied = $state(false);
	let GradientWaves = $state<LibraryComponent | null>(null);
	let DotGrid = $state<LibraryComponent | null>(null);

	onMount(() => {
		mounted = true;
		hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
		loadLibrary('Backgrounds/GradientWaves').then((component) => (GradientWaves = component));
		return () => stop?.();
	});

	$effect(() => {
		if (!hover || step.lite || DotGrid) return;
		loadLibrary('Backgrounds/DotGrid').then((component) => (DotGrid = component));
	});

	$effect(() => {
		const isLight = light;
		untrack(() => {
			stop?.();
			values = lookFor(preset || FIRST, isLight);
		});
	});

	$effect(() => {
		let timer = 0;
		const rest = () => {
			window.clearTimeout(timer);
			timer = window.setTimeout(() => {
				idleFlag = true;
				idle = true;
			}, IDLE_MS);
		};
		const move = (event: PointerEvent) => {
			if (event.pointerType === 'touch') return;
			pointer = { x: event.clientX, y: event.clientY };
			if (idleFlag) {
				idleFlag = false;
				idle = false;
			}
			rest();
		};
		window.addEventListener('pointermove', move, { passive: true });
		return () => {
			window.clearTimeout(timer);
			window.removeEventListener('pointermove', move);
		};
	});

	$effect(() => {
		if (!stageEl || typeof IntersectionObserver === 'undefined') return;
		const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { rootMargin: '80px' });
		observer.observe(stageEl);
		return () => observer.disconnect();
	});

	const choose = (value: string) => {
		preset = value;
		stop?.();
		stop = tween($state.snapshot(values) as Values, lookFor(value, light), (next) => (values = next), 900);
	};

	const pick = (value: string) => {
		auto = false;
		choose(value);
	};

	const set = (name: string, value: unknown) => {
		stop?.();
		auto = false;
		preset = null;
		values = { ...values, [name]: value };
	};

	$effect(() => {
		if (!auto || hold || !visible || !preset || OPTIONS.length === 0) return;
		const timer = window.setTimeout(() => {
			const index = OPTIONS.findIndex((option) => option.value === untrack(() => preset));
			choose(OPTIONS[(index + 1) % OPTIONS.length].value);
		}, CYCLE_MS);
		return () => window.clearTimeout(timer);
	});

	$effect(() => {
		const stage = stageEl;
		if (!stage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const state = { x: 0, y: 0, tx: 0, ty: 0, frame: 0 };
		const tick = () => {
			state.x += (state.tx - state.x) * 0.07;
			state.y += (state.ty - state.y) * 0.07;
			stage.style.setProperty('--lh-px', state.x.toFixed(4));
			stage.style.setProperty('--lh-py', state.y.toFixed(4));
			const moving = Math.abs(state.tx - state.x) + Math.abs(state.ty - state.y) > 0.0004;
			state.frame = moving ? requestAnimationFrame(tick) : 0;
		};
		const move = (event: PointerEvent) => {
			if (event.pointerType === 'touch') return;
			state.tx = event.clientX / window.innerWidth - 0.5;
			state.ty = event.clientY / window.innerHeight - 0.5;
			if (!state.frame) state.frame = requestAnimationFrame(tick);
		};
		window.addEventListener('pointermove', move, { passive: true });
		return () => {
			window.removeEventListener('pointermove', move);
			cancelAnimationFrame(state.frame);
		};
	});

	const presets = $derived(
		OPTIONS.map((option) => {
			const look = lookFor(option.value, light);
			return {
				...option,
				colors: [look.horizonColor, look.waveColor, look.crestColor],
				hint: HINTS.map((name) => `${name} ${look[name]}`).join(' · ')
			};
		})
	);

	const activeIndex = $derived(OPTIONS.findIndex((option) => option.value === preset));
	const tint = $derived(dotTint(values.waveColor, light));

	const copy = () => {
		navigator.clipboard?.writeText(INSTALL);
		copied = true;
		window.setTimeout(() => (copied = false), 1400);
	};
</script>

<section class="ln-hero lh" style:--lh-accent={values.waveColor}>
	{#if mounted && hover && !step.lite && DotGrid}
		<div class="lh-dots" aria-hidden="true">
			<DotGrid
				dpr={Math.min(window.devicePixelRatio || 1, 1.5)}
				dotSize={DOT.size}
				gap={DOT.gap}
				baseColor={light ? '#f5f5f5' : '#14110e'}
				activeColor={tint}
				proximity={DOT.radius}
				strength={1.15}
				bounce={0.7}
				tension={0.35}
				swell={1.4}
				stretch={0.5}
				glow={0.15}
				opacity={0.55}
				shockRadius={380}
				shockStrength={4}
				intro={false}
				mouseInteraction={!idle}
			/>
		</div>
	{/if}
	<DotFrame color={tint} live={!idle} />
	{#if mounted && !step.lite}
		<GhostReveal active={idle && visible} start={() => pointer} color={tint} />
	{/if}
	<div class="lh-inner">
		<header class="lh-top">
			<HeroChip />
			<h1 class="lh-title">
				Animated Svelte components for <br />
				websites people remember.
			</h1>
			<p class="lh-lede">
				<span>{TOTAL_COMPONENTS} animated components and backgrounds for Svelte.</span>
				<span>Tune them yourself, or hand them to your agent.</span>
			</p>
			<div class="lh-actions">
				<a href="/get-started/index" class="lh-btn lh-btn--primary">
					Browse components
					<HugeIcon icon={ArrowRight02Icon} size={17} strokeWidth={1.8} />
				</a>
				<a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" class="lh-btn lh-btn--ghost">
					Star on GitHub
				</a>
			</div>
		</header>

		<div class="lh-stage" bind:this={stageEl}>
			<div class="lh-art" aria-hidden="true">
				{#if GradientWaves}
					<div class="lh-art-layer">
						<GradientWaves {...values} dpr={step.dpr} quality={step.quality} intro paused={!visible} />
					</div>
				{/if}
			</div>

			<HeroWindow title="Terminal" class="lh-terminal">
				{#snippet action()}
					<button type="button" class="lh-window-action" onclick={copy} aria-label="Copy install command">
						<HugeIcon icon={copied ? Tick02Icon : Copy01Icon} size={13} strokeWidth={1.8} />
					</button>
				{/snippet}
				<HeroTerminal command={INSTALL} />
			</HeroWindow>

			<HeroWindow title="Hero.svelte" class="lh-code">
				<pre class="lh-pre"><code><span class="lh-line"><span class="lh-punc">&lt;</span><span class="lh-kw">script</span> <span class="lh-attr">lang</span><span class="lh-punc">=</span><span class="lh-str">"ts"</span><span class="lh-punc">&gt;</span></span><span class="lh-line">  <span class="lh-kw">import</span> GradientWaves <span class="lh-kw">from</span> <span class="lh-str">'./GradientWaves.svelte'</span>;</span><span class="lh-line"><span class="lh-punc">&lt;/</span><span class="lh-kw">script</span><span class="lh-punc">&gt;</span></span><span class="lh-line"> </span><span class="lh-line"><span class="lh-punc">&lt;</span>GradientWaves</span>{#each FIELDS as field (field.name)}<span class="lh-line">  <span class="lh-attr">{field.name}</span><span class="lh-punc">=</span>{#if field.type === 'color'}<ScrubColor
										value={String(values[field.name])}
										label={field.label}
										swatches={SWATCHES[light ? 'light' : 'dark']}
										onChange={(value) => set(field.name, value)}
									/>{:else}<span class="lh-punc">{'{'}</span><ScrubNumber
										value={Number(values[field.name])}
										field={{ ...field, min: field.min ?? 0, max: field.max ?? 1, step: field.step ?? 1 }}
										onChange={(value) => set(field.name, value)}
									/><span class="lh-punc">{'}'}</span>{/if}</span>{/each}<span class="lh-line"><span class="lh-punc">/&gt;</span></span></code></pre>
			</HeroWindow>

			{#if presets.length > 0}
				<HeroWindow
					title="Presets"
					class="lh-presets"
					onpointerenter={() => (hold = true)}
					onpointerleave={() => (hold = false)}
				>
					{#snippet status()}
						<a href="/backgrounds/gradient-waves" class="lh-studio">
							Open Gradient Waves
							<HugeIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={1.8} />
						</a>
					{/snippet}
					<div class="lh-preset-list" role="radiogroup" aria-label="Presets">
						<span
							class="lh-preset-thumb"
							aria-hidden="true"
							data-hidden={activeIndex < 0 ? '' : undefined}
							style:--i={Math.max(0, activeIndex)}
						></span>
						{#each presets as option (option.value)}
							<button
								type="button"
								role="radio"
								aria-checked={preset === option.value}
								class="lh-preset"
								onclick={() => pick(option.value)}
							>
								<span class="lh-preset-swatches" aria-hidden="true">
									{#each option.colors as color, index (`${color}-${index}`)}
										<i style:background={color}></i>
									{/each}
								</span>
								<span class="lh-preset-name">{option.label}</span>
								<span class="lh-preset-hint">{option.hint}</span>
							</button>
						{/each}
					</div>
				</HeroWindow>
			{/if}
		</div>
	</div>
</section>
