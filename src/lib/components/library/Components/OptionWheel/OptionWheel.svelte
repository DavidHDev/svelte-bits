<!-- @svelte-bits
{ "title": "OptionWheel", "description": "Curved option picker that spins with scroll, drag or arrow keys, tilting items away.", "dependencies": [] }
-->
<script module lang="ts">
	export type OptionWheelSide = 'left' | 'right';

	export interface OptionWheelProps {
		items?: string[];
		defaultSelected?: number;
		onChange?: (index: number, item: string) => void;
		textColor?: string;
		activeColor?: string;
		side?: OptionWheelSide;
		fontSize?: number;
		spacing?: number;
		curve?: number;
		tilt?: number;
		blur?: number;
		fade?: number;
		minOpacity?: number;
		smoothing?: number;
		inset?: number;
		loop?: boolean;
		draggable?: boolean;
		soundUrl?: string;
		soundVolume?: number;
		class?: string;
	}

	const DEFAULT_ITEMS = [
		'Ambient',
		'House',
		'Techno',
		'Jazz',
		'Lo-Fi',
		'Synthwave',
		'Trance',
		'Funk',
		'Disco',
		'Hip-Hop',
		'Chillwave',
		'Drum & Bass'
	];
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let {
		items = DEFAULT_ITEMS,
		defaultSelected = 3,
		onChange,
		textColor = '#a6a6a6',
		activeColor = '#ffffff',
		side = 'left',
		fontSize = 3,
		spacing = 1.4,
		curve = 1,
		tilt = 6,
		blur = 2,
		fade = 0.25,
		minOpacity = 0.05,
		smoothing = 200,
		inset = 80,
		loop = false,
		draggable = true,
		soundUrl = '',
		soundVolume = 0.5,
		class: className = ''
	}: OptionWheelProps = $props();

	const initialSelected = untrack(() => defaultSelected);

	let rootEl = $state<HTMLDivElement | null>(null);
	let itemEls = $state<(HTMLDivElement | null)[]>([]);
	let selectedIndex = $state(initialSelected);
	let isDragging = $state(false);

	let pos = initialSelected;
	let target = initialSelected;
	let raf: number | null = null;
	let last = 0;
	let selected = initialSelected;
	let wheelTimer: ReturnType<typeof setTimeout> | null = null;
	let drag: { y: number; start: number; id: number } | null = null;
	let dragMoved = false;
	let audio: HTMLAudioElement | null = null;
	let audioUrl = '';
	let lastTick = 0;

	const remPx = typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;

	const rowH = () => Math.max(fontSize * spacing * remPx, 1);

	const runFrame = (now: number) => {
		const dt = Math.min((now - last) / 1000, 0.05);
		last = now;
		const tau = Math.max(smoothing, 1) / 1000;
		const k = 1 - Math.exp(-dt / tau);

		const cur = pos;
		let next = cur + (target - cur) * k;
		const settled = Math.abs(target - next) < 0.001;
		if (settled) next = target;
		pos = next;

		const els = itemEls;
		const n = items.length;
		const row = rowH();
		const mirror = side === 'right' ? -1 : 1;
		const tiltRad = (tilt * Math.PI) / 180;
		const R = tiltRad > 0.0005 ? row / tiltRad : 0;
		for (let i = 0; i < n; i++) {
			const el = els[i];
			if (!el) continue;
			let d = i - next;
			if (loop && n > 1) {
				d = ((d % n) + n) % n;
				if (d > n / 2) d -= n;
			}
			const dist = Math.abs(d);
			let x = 0;
			let y = d * row;
			let rot = 0;
			if (R > 0) {
				const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
				y = R * Math.sin(ang);
				x = -mirror * R * (1 - Math.cos(ang)) * curve;
				rot = (mirror * ang * 180) / Math.PI;
			}
			el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
			el.style.opacity = String(Math.max(minOpacity, 1 - dist * fade));
			el.style.filter = blur > 0 ? `blur(${(dist * blur).toFixed(2)}px)` : 'none';
			el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
		}

		raf = settled ? null : requestAnimationFrame(runFrame);
	};

	const startLoop = () => {
		if (raf != null) cancelAnimationFrame(raf);
		last = performance.now();
		raf = requestAnimationFrame(runFrame);
	};

	const playTick = () => {
		if (!soundUrl) return;
		const now = performance.now();
		if (now - lastTick < 70) return;
		lastTick = now;
		if (!audio || audioUrl !== soundUrl) {
			audio = new Audio(soundUrl);
			audio.preload = 'auto';
			audioUrl = soundUrl;
		}
		audio.volume = Math.min(Math.max(soundVolume, 0), 1);
		audio.currentTime = 0;
		audio.play()?.catch(() => {});
	};

	const applyTarget = (value: number, snap: boolean) => {
		const count = items.length;
		let v = value;
		if (!loop) v = Math.min(Math.max(v, 0), Math.max(count - 1, 0));
		if (snap) v = Math.round(v);
		target = v;
		const idx = ((Math.round(v) % count) + count) % count;
		if (idx !== selected) {
			selected = idx;
			selectedIndex = idx;
			onChange?.(idx, items[idx]);
			playTick();
		}
		startLoop();
	};

	$effect(() => {
		const el = rootEl;
		if (!el) return;
		const onWheel = (e: WheelEvent) => {
			e.preventDefault();
			const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
			const step = Math.max(-1, Math.min(1, delta / rowH()));
			applyTarget(target + step, false);
			if (wheelTimer) clearTimeout(wheelTimer);
			wheelTimer = setTimeout(() => applyTarget(target, true), 140);
		};
		el.addEventListener('wheel', onWheel, { passive: false });
		return () => {
			el.removeEventListener('wheel', onWheel);
			if (wheelTimer) clearTimeout(wheelTimer);
		};
	});

	const handlePointerDown = (e: PointerEvent) => {
		if (!draggable) return;
		drag = { y: e.clientY, start: target, id: e.pointerId };
		dragMoved = false;
		isDragging = true;
	};

	const handlePointerMove = (e: PointerEvent) => {
		const current = drag;
		if (!current) return;
		const dy = e.clientY - current.y;
		if (!dragMoved && Math.abs(dy) > 4) {
			dragMoved = true;
			rootEl?.setPointerCapture(current.id);
		}
		if (dragMoved) applyTarget(current.start - dy / rowH(), false);
	};

	const handlePointerEnd = () => {
		if (!drag) return;
		drag = null;
		isDragging = false;
		if (dragMoved) applyTarget(target, true);
	};

	const handleItemClick = (index: number) => {
		if (dragMoved) return;
		const count = items.length;
		const cur = target;
		let d = index - (((cur % count) + count) % count);
		if (loop && count > 1) {
			if (d > count / 2) d -= count;
			else if (d < -count / 2) d += count;
		}
		applyTarget(cur + d, true);
	};

	const handleRootClick = (e: MouseEvent) => {
		const option = (e.target as Element | null)?.closest?.('[data-index]');
		if (!option || !rootEl?.contains(option)) return;
		handleItemClick(Number(option.getAttribute('data-index')));
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		let delta: number | null = null;
		if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1;
		else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
		if (delta == null) return;
		e.preventDefault();
		applyTarget(Math.round(target) + delta, true);
	};

	$effect(() => {
		void [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, itemEls.length];
		untrack(() => applyTarget(target, false));
	});

	$effect(() => () => {
		if (raf != null) cancelAnimationFrame(raf);
		raf = null;
		audio?.pause();
	});
</script>

<div
	bind:this={rootEl}
	role="listbox"
	tabindex="0"
	aria-label="Option wheel"
	class="relative h-full w-full select-none overflow-hidden outline-none [touch-action:none] {isDragging
		? 'cursor-grabbing'
		: 'cursor-grab'}{className ? ` ${className}` : ''}"
	style:--ow-text-color={textColor}
	style:--ow-active-color={activeColor}
	style:--ow-font-size="{fontSize}rem"
	style:--ow-inset="{inset}px"
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={handlePointerEnd}
	onpointercancel={handlePointerEnd}
	onkeydown={handleKeyDown}
	onclick={handleRootClick}
>
	{#each items as label, index (`${label}-${index}`)}
		<div
			bind:this={itemEls[index]}
			role="option"
			data-index={index}
			aria-selected={selectedIndex === index}
			class="absolute top-1/2 cursor-pointer whitespace-nowrap leading-none will-change-[transform,opacity,filter] [font-size:var(--ow-font-size)] [color:color-mix(in_srgb,var(--ow-active-color)_calc(var(--ow-p,0)*100%),var(--ow-text-color))] {side ===
			'right'
				? 'right-[var(--ow-inset)] origin-right'
				: 'left-[var(--ow-inset)] origin-left'} {selectedIndex === index ? 'font-medium' : 'font-extralight'}"
		>
			{label}
		</div>
	{/each}
</div>
