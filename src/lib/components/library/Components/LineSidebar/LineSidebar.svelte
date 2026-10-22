<!-- @svelte-bits
{
  "title": "Line Sidebar",
  "description": "Static list navigation with a cursor-proximity effect that shifts and highlights nearby items.",
  "dependencies": []
}
-->
<script lang="ts">
	import { untrack } from 'svelte';

	type Falloff = 'linear' | 'smooth' | 'sharp';

	type Props = {
		items?: string[];
		accentColor?: string;
		textColor?: string;
		markerColor?: string;
		showIndex?: boolean;
		showMarker?: boolean;
		proximityRadius?: number;
		maxShift?: number;
		falloff?: Falloff;
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
	};

	const FALLOFF_CURVES: Record<Falloff, (p: number) => number> = {
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

	let {
		items = DEFAULT_ITEMS,
		accentColor = '#A855F7',
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
	}: Props = $props();

	let listEl!: HTMLUListElement;
	let itemEls: HTMLLIElement[] = [];
	let targets: number[] = [];
	let current: number[] = [];
	let raf: number | null = null;
	let last = 0;

	// Only the starting value matters, same as React's useState(defaultActive).
	let activeIndex = $state<number | null>(untrack(() => defaultActive));

	// Single rAF loop that eases every item's --effect toward its target using
	// frame-rate independent exponential smoothing, so color, shift and scale
	// all move together without staggering CSS transitions.
	function runFrame(now: number) {
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;
		const tau = Math.max(smoothing, 1) / 1000;
		const k = 1 - Math.exp(-dt / tau);

		let moving = false;
		for (let i = 0; i < itemEls.length; i++) {
			const el = itemEls[i];
			if (!el) continue;
			const target = Math.max(targets[i] || 0, activeIndex === i ? 1 : 0);
			const cur = current[i] || 0;
			const next = cur + (target - cur) * k;
			const settled = Math.abs(target - next) < 0.0015;
			const value = settled ? target : next;
			current[i] = value;
			el.style.setProperty('--effect', value.toFixed(4));
			if (!settled) moving = true;
		}

		raf = moving ? requestAnimationFrame(runFrame) : null;
	}

	function startLoop() {
		if (raf != null) cancelAnimationFrame(raf);
		last = performance.now();
		raf = requestAnimationFrame(runFrame);
	}

	function handlePointerMove(e: PointerEvent) {
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
	}

	function handlePointerLeave() {
		targets = targets.map(() => 0);
		startLoop();
	}

	function handleClick(index: number, label: string) {
		activeIndex = index;
		onItemClick?.(index, label);
	}

	// Ease toward the new active item whenever it changes (and once on mount); stop the loop on unmount.
	$effect(() => {
		void activeIndex;
		startLoop();
		return () => {
			if (raf != null) cancelAnimationFrame(raf);
			raf = null;
		};
	});

	const tickClass = $derived(
		showMarker
			? `after:absolute after:left-[calc(-1*var(--marker-length)-var(--marker-gap))] after:top-[calc(100%+var(--item-gap)/2)] after:h-px after:opacity-50 after:content-[''] last:after:content-none after:[background-color:var(--marker-color)] after:[width:calc(var(--marker-length)*var(--tick-scale))] ${
					scaleTick
						? 'after:origin-left after:[transform:translateY(-50%)_scaleX(calc(0.7+var(--effect,0)*0.6))]'
						: 'after:-translate-y-1/2'
				}`
			: ''
	);
</script>

<nav
	class="relative flex justify-start{showMarker
		? ' [padding-left:calc(var(--marker-length)+var(--marker-gap))]'
		: ''}{className ? ` ${className}` : ''}"
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
			<!-- Clickable <li> without keyboard handling, matching the React original. -->
			<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
			<li
				bind:this={itemEls[index]}
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
