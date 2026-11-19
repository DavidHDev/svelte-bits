<!-- @svelte-bits
{
  "title": "Chroma Grid",
  "description": "A grid of grayscale photo cards where a spotlight follows the cursor and brings back color.",
  "dependencies": []
}
-->
<script module lang="ts">
	export type ChromaItem = {
		image: string;
		title?: string;
		subtitle?: string;
		accent?: string;
		url?: string;
		alt?: string;
		borderColor?: string;
	};

	export type ChromaGridProps = {
		items?: ChromaItem[];
		columns?: number;
		minCardWidth?: number;
		gap?: number;
		radius?: number;
		softness?: number;
		damping?: number;
		fadeOut?: number;
		grayscale?: number;
		dim?: number;
		glow?: number;
		borderGlow?: number;
		reveal?: 'spotlight' | 'card';
		aspectRatio?: string;
		cardRadius?: number;
		showInfo?: boolean;
		frame?: boolean;
		theme?: 'dark' | 'light';
		class?: string;
	};

	const THEMES: Record<'dark' | 'light', Record<string, string>> = {
		dark: {
			'--chroma-frame': 'rgba(40, 35, 30, 0.66)',
			'--chroma-frame-edge': 'rgba(255, 255, 255, 0.08)',
			'--chroma-frame-highlight': 'rgba(255, 255, 255, 0.07)',
			'--chroma-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
			'--chroma-tile': 'linear-gradient(180deg, #3d3630 0%, #29241f 100%)',
			'--chroma-tile-edge': 'rgba(255, 255, 255, 0.07)',
			'--chroma-tile-highlight': 'rgba(255, 255, 255, 0.12)',
			'--chroma-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
			'--chroma-media-edge': 'rgba(255, 255, 255, 0.06)',
			'--chroma-well': 'rgba(255, 255, 255, 0.08)',
			'--chroma-ink': '#f5f5f4',
			'--chroma-muted': 'rgba(245, 245, 244, 0.55)',
			'--chroma-hover': 'brightness(1.12)',
			'--chroma-press': 'brightness(0.85)'
		},
		light: {
			'--chroma-frame': 'rgba(243, 242, 240, 0.8)',
			'--chroma-frame-edge': 'rgba(28, 25, 23, 0.07)',
			'--chroma-frame-highlight': 'rgba(255, 255, 255, 0.95)',
			'--chroma-frame-shadow': '0 22px 44px -22px rgba(28, 25, 23, 0.3), 0 6px 16px -10px rgba(28, 25, 23, 0.16)',
			'--chroma-tile': 'linear-gradient(180deg, #ffffff 0%, #f7f6f4 100%)',
			'--chroma-tile-edge': 'rgba(28, 25, 23, 0.08)',
			'--chroma-tile-highlight': 'rgba(255, 255, 255, 1)',
			'--chroma-tile-shadow': '0 4px 10px -5px rgba(28, 25, 23, 0.25)',
			'--chroma-media-edge': 'rgba(28, 25, 23, 0.06)',
			'--chroma-well': 'rgba(28, 25, 23, 0.05)',
			'--chroma-ink': '#292524',
			'--chroma-muted': 'rgba(41, 37, 36, 0.55)',
			'--chroma-hover': 'brightness(0.97)',
			'--chroma-press': 'brightness(0.92)'
		}
	};

	const DEFAULT_ITEMS: ChromaItem[] = [
		{
			image: 'https://images.unsplash.com/photo-1514519334989-3d5c8b1a9f91?w=800&q=80&auto=format&fit=crop',
			title: 'Golden Hour',
			subtitle: 'Sky study',
			accent: '#ff8a4c'
		},
		{
			image: 'https://images.unsplash.com/photo-1520930528075-4ea5ead759f5?w=800&q=80&auto=format&fit=crop',
			title: 'Steel Arches',
			subtitle: 'Sculpture',
			accent: '#ff5a36'
		},
		{
			image: 'https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=800&q=80&auto=format&fit=crop',
			title: 'Black Beach',
			subtitle: 'Landscape',
			accent: '#ff3e00'
		},
		{
			image: 'https://images.unsplash.com/photo-1524400968894-6e997a66e03f?w=800&q=80&auto=format&fit=crop',
			title: 'Cloud Front',
			subtitle: 'Weather',
			accent: '#ffb27a'
		},
		{
			image: 'https://images.unsplash.com/photo-1778849097774-0ab2a873a858?w=800&q=80&auto=format&fit=crop',
			title: 'Pink Drift',
			subtitle: 'Sky study',
			accent: '#ffa25e'
		},
		{
			image: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=800&q=80&auto=format&fit=crop',
			title: 'Cumulus',
			subtitle: 'Weather',
			accent: '#7cc4ff'
		}
	];

	const SPOT_MASK =
		'radial-gradient(circle var(--chroma-r) at calc(var(--chroma-x, -9999px) - var(--chroma-ox, 0px)) calc(var(--chroma-y, -9999px) - var(--chroma-oy, 0px)), var(--chroma-stops))';
	const GRID_COLUMNS =
		'repeat(auto-fill, minmax(min(100%, max(var(--chroma-min), calc((100% - (var(--chroma-cols) - 1) * var(--chroma-gap)) / var(--chroma-cols)))), 1fr))';
	const WASH = 'radial-gradient(130% 70% at 50% 100%, var(--chroma-accent), transparent 72%)';
	const TILE_RIM = 'inset 0 0 0 1px var(--chroma-tile-edge), inset 0 1px 0 var(--chroma-tile-highlight)';
	const GLOW_RIM = 'inset 0 0 0 1px var(--chroma-accent), inset 0 0 16px -8px var(--chroma-accent)';
	const FRAME_RIM = 'inset 0 0 0 1px var(--chroma-frame-edge), inset 0 1px 0 var(--chroma-frame-highlight)';
	const IMAGE_CLASS = 'absolute inset-0 block h-full w-full select-none object-cover [-webkit-user-drag:none]';
	const CARD_CLASS =
		'group relative box-border flex min-w-0 flex-col gap-[10px] overflow-hidden p-2 no-underline [isolation:isolate] transition-[filter] duration-[250ms] ease-[ease] hover:[filter:var(--chroma-hover)]';
	const LINK_CLASS =
		'active:[filter:var(--chroma-press)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid focus-visible:[outline-color:var(--chroma-ink)]';
	const FADE_CLASS = 'opacity-0 transition-opacity duration-[var(--chroma-fade)] ease-[ease] group-hover:duration-300';
	const WASH_HOVER_CLASS = 'group-hover:opacity-[calc(var(--chroma-glow)*0.45)]';
	const COLOR_HOVER_CLASS = 'group-hover:opacity-100';
	const GLOW_HOVER_CLASS = 'group-hover:opacity-[var(--chroma-border)]';

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

	const falloffStops = (softness: number) => {
		const core = clamp(1 - softness, 0, 0.95);
		const stops: string[] = [];
		for (let i = 0; i <= 12; i++) {
			const t = i / 12;
			const u = clamp((t - core) / Math.max(0.0001, 1 - core), 0, 1);
			const alpha = 1 - u * u * u * (u * (u * 6 - 15) + 10);
			stops.push(`rgba(0, 0, 0, ${alpha.toFixed(3)}) ${(t * 100).toFixed(1)}%`);
		}
		return stops.join(', ');
	};

	const toStyle = (entries: Record<string, string | number>) =>
		Object.entries(entries)
			.map(([key, value]) => `${key}: ${value}`)
			.join('; ');
</script>

<script lang="ts">
	let {
		items,
		columns = 3,
		minCardWidth = 180,
		gap = 12,
		radius = 260,
		softness = 0.6,
		damping = 0.45,
		fadeOut = 0.6,
		grayscale = 1,
		dim = 0.12,
		glow = 0.5,
		borderGlow = 1,
		reveal = 'spotlight',
		aspectRatio = '3 / 2',
		cardRadius = 22,
		showInfo = true,
		frame = false,
		theme = 'dark',
		class: className = ''
	}: ChromaGridProps = $props();

	let root = $state<HTMLDivElement | null>(null);
	let place: (() => void) | null = null;

	const data = $derived(items?.length ? items : DEFAULT_ITEMS);
	const spotlight = $derived(reveal !== 'card');

	$effect(() => {
		const el = root;
		if (!el) return;
		const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
		const state = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0, primed: false };
		let raf = 0;
		let last = 0;

		const placeAreas = () => {
			if (state.primed) {
				el.style.setProperty('--chroma-x', `${state.x.toFixed(2)}px`);
				el.style.setProperty('--chroma-y', `${state.y.toFixed(2)}px`);
				el.style.setProperty('--chroma-power', state.power.toFixed(4));
			}
			const box = el.getBoundingClientRect();
			el.querySelectorAll<HTMLElement>('[data-chroma-area]').forEach((node) => {
				const rect = node.getBoundingClientRect();
				node.style.setProperty('--chroma-ox', `${rect.left - box.left}px`);
				node.style.setProperty('--chroma-oy', `${rect.top - box.top}px`);
			});
		};
		place = placeAreas;

		const tick = (now: number) => {
			raf = 0;
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
			last = now;
			const follow = reduce ? 1 : 1 - Math.exp(-dt / Math.max(0.01, damping * 0.32));
			state.x += (state.tx - state.x) * follow;
			state.y += (state.ty - state.y) * follow;
			const span = state.target > state.power ? 0.1 : Math.max(0.02, fadeOut * 0.35);
			state.power += (state.target - state.power) * (reduce ? 1 : 1 - Math.exp(-dt / span));
			el.style.setProperty('--chroma-x', `${state.x.toFixed(2)}px`);
			el.style.setProperty('--chroma-y', `${state.y.toFixed(2)}px`);
			el.style.setProperty('--chroma-power', state.power.toFixed(4));
			const settled =
				Math.abs(state.tx - state.x) < 0.1 &&
				Math.abs(state.ty - state.y) < 0.1 &&
				Math.abs(state.target - state.power) < 0.002;
			if (settled) {
				state.power = state.target;
				el.style.setProperty('--chroma-power', state.power.toFixed(4));
				last = 0;
			} else {
				raf = requestAnimationFrame(tick);
			}
		};

		const wake = () => {
			if (!raf) raf = requestAnimationFrame(tick);
		};

		const onMove = (event: PointerEvent) => {
			if (reveal === 'card') return;
			const box = el.getBoundingClientRect();
			state.tx = event.clientX - box.left;
			state.ty = event.clientY - box.top;
			if (!state.primed || state.power < 0.02) {
				state.x = state.tx;
				state.y = state.ty;
				state.primed = true;
			}
			state.target = 1;
			wake();
		};

		const onLeave = () => {
			state.target = 0;
			wake();
		};

		const resizeObserver = new ResizeObserver(placeAreas);
		resizeObserver.observe(el);
		el.addEventListener('pointermove', onMove);
		el.addEventListener('pointerdown', onMove);
		el.addEventListener('pointerleave', onLeave);
		el.addEventListener('pointercancel', onLeave);
		placeAreas();

		return () => {
			cancelAnimationFrame(raf);
			resizeObserver.disconnect();
			el.removeEventListener('pointermove', onMove);
			el.removeEventListener('pointerdown', onMove);
			el.removeEventListener('pointerleave', onLeave);
			el.removeEventListener('pointercancel', onLeave);
			place = null;
		};
	});

	const rootStyle = $derived(
		toStyle({
			...(THEMES[theme] ?? THEMES.dark),
			'--chroma-cols': Math.max(1, Math.round(columns)),
			'--chroma-min': `${Math.max(80, minCardWidth)}px`,
			'--chroma-gap': `${Math.max(0, gap)}px`,
			'--chroma-r': `${Math.max(20, radius)}px`,
			'--chroma-stops': falloffStops(clamp(softness, 0, 1)),
			'--chroma-gray': clamp(grayscale, 0, 1),
			'--chroma-dim': clamp(dim, 0, 0.9),
			'--chroma-glow': clamp(glow, 0, 1),
			'--chroma-border': clamp(borderGlow, 0, 1),
			'--chroma-fade': `${Math.max(0, fadeOut)}s`,
			'--chroma-ratio': aspectRatio,
			'--chroma-radius': `${Math.max(0, cardRadius)}px`,
			...(frame
				? {
						padding: '10px',
						'border-radius': 'calc(var(--chroma-radius) + 10px)',
						background: 'var(--chroma-frame)',
						'box-shadow': 'var(--chroma-frame-shadow)',
						'-webkit-backdrop-filter': 'blur(20px) saturate(1.6)',
						'backdrop-filter': 'blur(20px) saturate(1.6)'
					}
				: {})
		})
	);

	$effect(() => {
		void [data, columns, minCardWidth, gap, aspectRatio, cardRadius, showInfo, frame, reveal, rootStyle];
		place?.();
	});

	const washStyle = $derived(
		spotlight
			? toStyle({
					background: WASH,
					opacity: 'calc(var(--chroma-glow) * var(--chroma-power, 0) * 0.45)',
					'-webkit-mask-image': SPOT_MASK,
					'mask-image': SPOT_MASK
				})
			: toStyle({ background: WASH })
	);
	const colorStyle = $derived(
		spotlight
			? toStyle({ opacity: 'var(--chroma-power, 0)', '-webkit-mask-image': SPOT_MASK, 'mask-image': SPOT_MASK })
			: ''
	);
	const glowStyle = $derived(
		spotlight
			? toStyle({
					'box-shadow': GLOW_RIM,
					opacity: 'calc(var(--chroma-border) * var(--chroma-power, 0))',
					'-webkit-mask-image': SPOT_MASK,
					'mask-image': SPOT_MASK
				})
			: toStyle({ 'box-shadow': GLOW_RIM })
	);

	const cardStyle = (item: ChromaItem) =>
		toStyle({
			'--chroma-accent': item.accent ?? item.borderColor ?? '#ffffff',
			'border-radius': 'var(--chroma-radius)',
			background: 'var(--chroma-tile)',
			'box-shadow': 'var(--chroma-tile-shadow)',
			color: 'var(--chroma-ink)'
		});
</script>

{#snippet body(item: ChromaItem)}
	<span
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 z-0 {spotlight ? '' : `${FADE_CLASS} ${WASH_HOVER_CLASS}`}"
		style={washStyle}
	></span>
	<div
		data-chroma-area=""
		class="relative z-[1] overflow-hidden"
		style="aspect-ratio: var(--chroma-ratio); border-radius: max(0px, calc(var(--chroma-radius) - 8px)); background: var(--chroma-well)"
	>
		<img
			class={IMAGE_CLASS}
			style="filter: grayscale(var(--chroma-gray)) brightness(calc(1 - var(--chroma-dim)))"
			src={item.image}
			alt={item.alt ?? item.title ?? ''}
			loading="lazy"
		/>
		<img
			class="{IMAGE_CLASS} {spotlight ? '' : `${FADE_CLASS} ${COLOR_HOVER_CLASS}`}"
			style={colorStyle}
			src={item.image}
			alt=""
			aria-hidden="true"
			loading="lazy"
		/>
		<span
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 rounded-[inherit]"
			style="box-shadow: inset 0 0 0 1px var(--chroma-media-edge)"
		></span>
	</div>
	{#if showInfo && (item.title || item.subtitle)}
		<div class="relative z-[1] flex min-w-0 flex-col gap-0.5 px-1.5 pt-0.5 pb-1">
			{#if item.title}
				<span
					class="overflow-hidden text-[15px] leading-[1.3] font-semibold tracking-[-0.01em] text-ellipsis whitespace-nowrap"
				>
					{item.title}
				</span>
			{/if}
			{#if item.subtitle}
				<span
					class="overflow-hidden text-[13px] leading-[1.35] text-ellipsis whitespace-nowrap"
					style="color: var(--chroma-muted)"
				>
					{item.subtitle}
				</span>
			{/if}
		</div>
	{/if}
	<span
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 z-[2] rounded-[inherit]"
		style="box-shadow: {TILE_RIM}"
	></span>
	<span
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 z-[2] rounded-[inherit] {spotlight ? '' : `${FADE_CLASS} ${GLOW_HOVER_CLASS}`}"
		style={glowStyle}
	></span>
{/snippet}

<div
	bind:this={root}
	class={`relative box-border w-full [-webkit-tap-highlight-color:transparent] ${className}`.trim()}
	style={rootStyle}
>
	<div class="grid" style="gap: var(--chroma-gap); grid-template-columns: {GRID_COLUMNS}">
		{#each data as item, index (`${item.title}-${index}`)}
			{#if item.url}
				<a
					data-chroma-area=""
					class="{CARD_CLASS} {LINK_CLASS}"
					style={cardStyle(item)}
					href={item.url}
					target="_blank"
					rel="noopener noreferrer"
				>
					{@render body(item)}
				</a>
			{:else}
				<article data-chroma-area="" class={CARD_CLASS} style={cardStyle(item)}>
					{@render body(item)}
				</article>
			{/if}
		{/each}
	</div>
	{#if frame}
		<span
			aria-hidden="true"
			class="pointer-events-none absolute inset-0 rounded-[inherit]"
			style="box-shadow: {FRAME_RIM}"
		></span>
	{/if}
</div>
