<!-- @svelte-bits
{ "title": "LineSidebar", "description": "Static list navigation with a cursor-proximity effect that shifts and highlights nearby items.", "dependencies": [] }
-->
<script module lang="ts">
	export type LineSidebarFalloff = 'linear' | 'smooth' | 'sharp';

	export interface LineSidebarProps {
		items?: string[];
		accentColor?: string;
		textColor?: string;
		markerColor?: string;
		showIndex?: boolean;
		showMarker?: boolean;
		proximityRadius?: number;
		maxShift?: number;
		falloff?: LineSidebarFalloff;
		markerLength?: number;
		markerGap?: number;
		tickScale?: number;
		scaleTick?: boolean;
		itemGap?: number;
		fontSize?: number;
		smoothing?: number;
		defaultActive?: number | null;
		onItemClick?: (index: number, label: string) => void;
		class?: string;
	}

	const FALLOFF_CURVES: Record<LineSidebarFalloff, (p: number) => number> = {
		linear: (p) => p,
		smooth: (p) => p * p * (3 - 2 * p),
		sharp: (p) => p * p * p
	};

	const DEFAULT_ITEMS = [
		'Overview',
		'Components',
		'Animations',
		'Backgrounds',
		'Showcase',
		'Playground',
		'Templates',
		'Changelog',
		'Community',
		'Resources',
		'Documentation',
		'Support'
	];

	const TICK_BASE =
		"after:absolute after:left-[calc(-1*var(--marker-length)-var(--marker-gap))] after:top-[calc(100%+var(--item-gap)/2)] after:h-px after:opacity-50 after:content-[''] last:after:content-none after:[background-color:var(--marker-color)] after:[width:calc(var(--marker-length)*var(--tick-scale))]";
	const TICK_SCALED = 'after:origin-left after:[transform:translateY(-50%)_scaleX(calc(0.7+var(--effect,0)*0.6))]';
	const TICK_STATIC = 'after:-translate-y-1/2';
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';

	let {
		items = DEFAULT_ITEMS,
		accentColor = '#FF8A4C',
		textColor = '#c4c4c4',
		markerColor = '#6c6c6c',
		showIndex = true,
		showMarker = true,
		proximityRadius = 100,
		maxShift = 30,
		falloff = 'smooth',
		markerLength = 60,
		markerGap = 0,
		tickScale = 0.5,
		scaleTick = true,
		itemGap = 20,
		fontSize = 1.1,
		smoothing = 100,
		defaultActive = null,
		onItemClick,
		class: className = ''
	}: LineSidebarProps = $props();

	let listEl = $state<HTMLUListElement | null>(null);
	let itemEls: (HTMLLIElement | null)[] = [];
	let targets: number[] = [];
	let current: number[] = [];
	let raf: number | null = null;
	let last = 0;
	let activeIndex = $state<number | null>(untrack(() => defaultActive));

	const runFrame = (now: number) => {
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;
		const tau = Math.max(smoothing, 1) / 1000;
		const k = 1 - Math.exp(-dt / tau);
		const active = activeIndex;

		let moving = false;
		for (let i = 0; i < itemEls.length; i++) {
			const el = itemEls[i];
			if (!el) continue;
			const target = Math.max(targets[i] || 0, active === i ? 1 : 0);
			const cur = current[i] || 0;
			const next = cur + (target - cur) * k;
			const settled = Math.abs(target - next) < 0.0015;
			const value = settled ? target : next;
			current[i] = value;
			el.style.setProperty('--effect', value.toFixed(4));
			if (!settled) moving = true;
		}

		raf = moving ? requestAnimationFrame(runFrame) : null;
	};

	const startLoop = () => {
		if (raf != null) cancelAnimationFrame(raf);
		last = performance.now();
		raf = requestAnimationFrame(runFrame);
	};

	const handlePointerMove = (e: PointerEvent) => {
		if (!listEl) return;
		const rect = listEl.getBoundingClientRect();
		const pointerY = e.clientY - rect.top;
		const ease = FALLOFF_CURVES[falloff] ?? FALLOFF_CURVES.linear;
		for (let i = 0; i < itemEls.length; i++) {
			const el = itemEls[i];
			if (!el) continue;
			const center = el.offsetTop + el.offsetHeight / 2;
			const distance = Math.abs(pointerY - center);
			targets[i] = ease(Math.max(0, 1 - distance / proximityRadius));
		}
		startLoop();
	};

	const handlePointerLeave = () => {
		targets = targets.map(() => 0);
		startLoop();
	};

	const handleClick = (index: number, label: string) => {
		activeIndex = index;
		onItemClick?.(index, label);
	};

	const itemRef = (node: HTMLLIElement, index: number) => {
		let i = index;
		itemEls[i] = node;
		return {
			update(next: number) {
				if (itemEls[i] === node) itemEls[i] = null;
				i = next;
				itemEls[i] = node;
			},
			destroy() {
				if (itemEls[i] === node) itemEls[i] = null;
			}
		};
	};

	$effect(() => {
		void activeIndex;
		untrack(startLoop);
	});

	onDestroy(() => {
		if (raf != null) cancelAnimationFrame(raf);
		raf = null;
	});

	const tickClass = $derived(showMarker ? `${TICK_BASE} ${scaleTick ? TICK_SCALED : TICK_STATIC}` : '');
</script>

<nav
	class="relative flex justify-start {showMarker
		? '[padding-left:calc(var(--marker-length)+var(--marker-gap))]'
		: ''} {className}"
	style:--accent-color={accentColor}
	style:--text-color={textColor}
	style:--marker-color={markerColor}
	style:--marker-length="{markerLength}px"
	style:--marker-gap="{markerGap}px"
	style:--tick-scale={tickScale}
	style:--max-shift="{maxShift}px"
	style:--item-gap="{itemGap}px"
	style:--font-size="{fontSize}rem"
	style:--smoothing="{smoothing}ms"
>
	<ul
		bind:this={listEl}
		onpointermove={handlePointerMove}
		onpointerleave={handlePointerLeave}
		class="m-0 flex list-none flex-col py-4 [gap:var(--item-gap)]"
	>
		{#each items as label, index (`${label}-${index}`)}
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<li
				use:itemRef={index}
				aria-current={activeIndex === index ? 'true' : undefined}
				onclick={() => handleClick(index, label)}
				class="relative cursor-pointer before:absolute before:-inset-x-12 before:-inset-y-[6px] before:content-[''] {tickClass}"
			>
				{#if showMarker}
					<span
						aria-hidden="true"
						class="absolute left-[calc(-1*var(--marker-length)-var(--marker-gap))] top-1/2 h-px w-[length:var(--marker-length)] origin-left [background-color:color-mix(in_srgb,var(--accent-color)_calc(var(--effect,0)*100%),var(--marker-color))] [transform:translateY(-50%)_scaleX(calc(0.7+var(--effect,0)*0.5))]"
					></span>
				{/if}
				<span
					class="relative inline-flex items-baseline leading-[1.2] [color:color-mix(in_srgb,var(--accent-color)_calc(var(--effect,0)*100%),var(--text-color))] [font-size:var(--font-size)] [transform:translateX(calc(var(--effect,0)*var(--max-shift)))]"
				>
					{#if showIndex}
						<span class="mr-[0.6rem] font-mono text-[0.85em] [opacity:calc(0.55+var(--effect,0)*0.45)]">
							{String(index + 1).padStart(2, '0')}
						</span>
					{/if}
					<span>{label}</span>
				</span>
			</li>
		{/each}
	</ul>
</nav>
