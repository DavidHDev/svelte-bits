<!-- @svelte-bits
{
  "title": "Masonry",
  "description": "A masonry gallery that springs into place, reflows as it resizes and opens images in a lightbox.",
  "dependencies": ["@hugeicons/svelte", "@hugeicons/core-free-icons"]
}
-->
<script module lang="ts">
	export interface MasonryItem {
		id: string | number;
		img: string;
		width?: number;
		height?: number;
		title?: string;
		description?: string;
		alt?: string;
		url?: string;
		span?: number;
	}

	export interface MasonryProps {
		items?: MasonryItem[];
		columns?: 'auto' | number;
		columnWidth?: number;
		gap?: number;
		radius?: number;
		animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random' | 'none';
		stagger?: number;
		duration?: number;
		bounce?: number;
		blurToFocus?: boolean;
		revealOnScroll?: boolean;
		hoverEffect?: 'zoom' | 'lift' | 'tilt' | 'none';
		focusOnHover?: boolean;
		captions?: 'hover' | 'always' | 'none';
		parallax?: number;
		lightbox?: boolean;
		draggable?: boolean;
		onItemClick?: (item: MasonryItem, index: number, event: MouseEvent) => void;
		onReorder?: (items: MasonryItem[]) => void;
		class?: string;
		style?: string;
	}

	type Measured = Record<string, number>;

	interface Grid {
		count: number;
		size: number;
	}

	interface Rect {
		x: number;
		y: number;
		w: number;
		h: number;
	}

	interface Tile extends Rect {
		item: MasonryItem;
		id: string;
	}

	interface Layout {
		tiles: Tile[];
		height: number;
	}

	interface Spring {
		x: number;
		y: number;
		s: number;
		vx: number;
		vy: number;
		vs: number;
		tx: number;
		ty: number;
		w: number;
		h: number;
		shown: boolean;
		dragging: boolean;
		blur: boolean;
		reveal: number;
		start: number;
	}

	interface Ghost {
		id: string;
		item: MasonryItem;
		x: number;
		y: number;
		s: number;
		w: number;
		h: number;
	}

	interface Drag {
		id: string;
		pointerId: number;
		startX: number;
		startY: number;
		offsetX: number;
		offsetY: number;
		active: boolean;
		moved: boolean;
	}

	const ROOT = 'group/masonry relative w-full';
	const ITEM = 'group/item absolute top-0 left-0 will-change-transform data-[dragging]:z-10 data-[hidden]:invisible';
	const CARD =
		'group/card relative block h-full w-full cursor-pointer rounded-[var(--masonry-radius,12px)] border-0 bg-transparent p-0 text-left text-inherit no-underline outline-none [-webkit-tap-highlight-color:transparent] [font:inherit] [transform:perspective(900px)_rotateX(var(--masonry-tilt-x,0deg))_rotateY(var(--masonry-tilt-y,0deg))_translateY(var(--masonry-lift,0px))_scale(var(--masonry-scale,1))] [transition:transform_0.5s_cubic-bezier(0.2,0.8,0.2,1),box-shadow_0.5s_cubic-bezier(0.2,0.8,0.2,1),opacity_0.35s_ease] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current group-data-[hover=lift]/masonry:group-hover/item:shadow-[0_22px_40px_-22px_rgba(0,0,0,0.55)] group-data-[hover=lift]/masonry:group-hover/item:[--masonry-lift:-6px] group-data-[hover=lift]/masonry:group-hover/item:[--masonry-scale:1.02] group-data-[hover=tilt]/masonry:[transition:transform_0.25s_cubic-bezier(0.2,0.8,0.2,1),box-shadow_0.5s_cubic-bezier(0.2,0.8,0.2,1),opacity_0.35s_ease] group-data-[hover=tilt]/masonry:group-hover/item:shadow-[0_26px_44px_-24px_rgba(0,0,0,0.55)] group-data-[hover=tilt]/masonry:group-hover/item:[--masonry-scale:1.03] group-data-[dimmed]/item:opacity-35 group-data-[dragging]/item:cursor-grabbing group-data-[dragging]/item:shadow-[0_34px_60px_-26px_rgba(0,0,0,0.6)] group-data-[dragging]/item:[--masonry-scale:1.05]';
	const MEDIA =
		'relative isolate block h-full w-full overflow-hidden rounded-[var(--masonry-radius,12px)] bg-[rgba(127,127,127,0.14)]';
	const PARALLAX = 'absolute inset-0 block';
	const IMAGE =
		'pointer-events-none block h-full w-full object-cover opacity-0 select-none [-webkit-user-drag:none] [transition:opacity_0.5s_ease,transform_0.8s_cubic-bezier(0.2,0.8,0.2,1)] data-[loaded]:opacity-100 group-data-[hover=zoom]/masonry:group-hover/item:[transform:scale(1.07)]';
	const CAPTION =
		'pointer-events-none absolute right-0 bottom-0 left-0 flex flex-col gap-0.5 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.02)_15%,rgba(0,0,0,0.08)_30%,rgba(0,0,0,0.18)_45%,rgba(0,0,0,0.3)_60%,rgba(0,0,0,0.42)_75%,rgba(0,0,0,0.5)_88%,rgba(0,0,0,0.54)_100%)] px-3.5 pt-10 pb-3 text-white [transition:opacity_0.35s_ease,transform_0.5s_cubic-bezier(0.2,0.8,0.2,1)] data-[mode=hover]:[transform:translateY(6px)] data-[mode=hover]:opacity-0 data-[mode=hover]:group-hover/item:[transform:none] data-[mode=hover]:group-hover/item:opacity-100 data-[mode=hover]:group-focus-visible/card:[transform:none] data-[mode=hover]:group-focus-visible/card:opacity-100';
	const TITLE = 'text-sm leading-[1.3] font-semibold tracking-[-0.01em]';
	const TEXT = 'text-xs leading-[1.4] opacity-80';
	const GHOST = 'pointer-events-none absolute top-0 left-0';
	const BOX = 'fixed inset-0 z-[1000]';
	const BOX_BACKDROP = 'absolute inset-0 bg-[rgba(9,9,11,0.9)]';
	const BOX_IMAGE =
		'fixed top-0 left-0 block origin-top-left cursor-zoom-out object-cover will-change-transform select-none [-webkit-user-drag:none]';
	const BOX_CAPTION =
		'pointer-events-none fixed right-0 left-0 flex items-center justify-center gap-3.5 px-[72px] text-center text-sm leading-[1.4] text-white [&_a]:pointer-events-auto [&_a]:inline-flex [&_a]:items-center [&_a]:gap-1 [&_a]:font-semibold [&_a]:text-inherit [&_a]:no-underline [&_a]:opacity-80 [&_a]:transition-opacity [&_a:focus-visible]:opacity-100 [&_a:hover]:opacity-100';
	const BOX_MUTED = 'opacity-60';
	const BOX_CLOSE =
		'absolute grid h-11 w-11 cursor-pointer place-items-center rounded-full border-0 bg-white/8 p-0 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white top-4 right-4';
	const BOX_PREV =
		'absolute grid h-11 w-11 cursor-pointer place-items-center rounded-full border-0 bg-white/8 p-0 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white top-[calc(50%-22px)] left-4';
	const BOX_NEXT =
		'absolute grid h-11 w-11 cursor-pointer place-items-center rounded-full border-0 bg-white/8 p-0 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)] transition-colors hover:bg-white/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white top-[calc(50%-22px)] right-4';

	const DIRECTIONS = ['bottom', 'top', 'left', 'right'];
	const ANIMATE_FROM = ['bottom', 'top', 'left', 'right', 'center', 'random', 'none'];
	const HOVER_EFFECTS = ['zoom', 'lift', 'tilt', 'none'];
	const CAPTION_MODES = ['hover', 'always', 'none'];
	const EASE = 'cubic-bezier(0.2, 0.9, 0.2, 1)';

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

	const keyOf = (item: MasonryItem) => String(item.id);

	const aspectOf = (item: MasonryItem, measured: Measured) => {
		const width = item.width ?? 0;
		const height = item.height ?? 0;
		if (width > 0 && height > 0) return height / width;
		if (measured[keyOf(item)]) return measured[keyOf(item)];
		if (height > 0) return height / 600;
		return 1;
	};

	const needsMeasure = (item: MasonryItem) => !((item.height ?? 0) > 0);

	const gridOf = (width: number, columns: 'auto' | number, columnWidth: number, gap: number): Grid => {
		const fixed = Number(columns);
		const count =
			columns !== 'auto' && fixed > 0
				? Math.max(1, Math.round(fixed))
				: Math.max(1, Math.floor((width + gap) / (Math.max(40, columnWidth) + gap)));
		return { count, size: Math.max(1, (width - gap * (count - 1)) / count) };
	};

	const place = (
		heights: number[],
		item: MasonryItem,
		grid: Grid,
		gap: number,
		measured: Measured,
		commit: boolean
	): Rect => {
		const { count, size } = grid;
		const span = Math.min(count, Math.max(1, Math.round(item.span || 1)));
		let column = 0;
		let top = Infinity;
		for (let start = 0; start <= count - span; start++) {
			let y = 0;
			for (let k = start; k < start + span; k++) y = Math.max(y, heights[k]);
			if (y < top - 0.5) {
				top = y;
				column = start;
			}
		}
		const w = size * span + gap * (span - 1);
		const h = Math.max(1, w * aspectOf(item, measured));
		if (commit) for (let k = column; k < column + span; k++) heights[k] = top + h + gap;
		return { x: Math.round(column * (size + gap)), y: Math.round(top), w, h };
	};

	const scrollerOf = (element: HTMLElement | null): HTMLElement | null => {
		let node = element?.parentElement;
		while (node && node !== document.body && node !== document.documentElement) {
			const overflow = getComputedStyle(node).overflowY;
			if (
				(overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay') &&
				node.scrollHeight > node.clientHeight
			) {
				return node;
			}
			node = node.parentElement;
		}
		return null;
	};

	const layoutOf = (
		list: MasonryItem[],
		width: number,
		columns: 'auto' | number,
		columnWidth: number,
		gap: number,
		measured: Measured
	): Layout => {
		const grid = gridOf(width, columns, columnWidth, gap);
		const heights = new Array(grid.count).fill(0);
		const tiles = list.map((item) => ({ item, id: keyOf(item), ...place(heights, item, grid, gap, measured, true) }));
		return { tiles, height: Math.max(0, Math.max(...heights) - gap) };
	};

	const slotsFor = (
		others: MasonryItem[],
		dragged: MasonryItem,
		width: number,
		columns: 'auto' | number,
		columnWidth: number,
		gap: number,
		measured: Measured
	) => {
		const grid = gridOf(width, columns, columnWidth, gap);
		const heights = new Array(grid.count).fill(0);
		const slots: { x: number; y: number }[] = [];
		for (let i = 0; i <= others.length; i++) {
			const slot = place(heights, dragged, grid, gap, measured, false);
			slots.push({ x: slot.x + slot.w / 2, y: slot.y + slot.h / 2 });
			if (i < others.length) place(heights, others[i], grid, gap, measured, true);
		}
		return slots;
	};

	const reduced = () =>
		typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowLeft01Icon, ArrowRight01Icon, ArrowUpRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons';

	let {
		items = [],
		columns = 'auto',
		columnWidth = 240,
		gap = 12,
		radius = 12,
		animateFrom = 'bottom',
		stagger = 0.05,
		duration = 0.6,
		bounce = 0.15,
		blurToFocus = true,
		revealOnScroll = true,
		hoverEffect = 'zoom',
		focusOnHover = false,
		captions = 'hover',
		parallax = 0,
		lightbox = true,
		draggable = true,
		onItemClick,
		onReorder,
		class: className = '',
		style = ''
	}: MasonryProps = $props();

	let rootEl = $state<HTMLDivElement | null>(null);
	let boxEl = $state<HTMLDivElement | null>(null);
	const nodes = new Map<string, HTMLDivElement>();
	const springs = new Map<string, Spring>();
	const loaded = new Set<string>();
	const waiting = new Set<string>();
	const pending = new Set<string>();
	const engine = { raf: 0, last: 0, flush: 0 };
	const previous = new Map<string, { item: MasonryItem; w: number; h: number }>();
	let drag: Drag | null = null;
	let suppress = false;
	let token = 0;
	let lastShown: string | null = null;
	let opened: string | null = null;

	let width = $state(0);
	let order = $state.raw<string[] | null>(null);
	let measured = $state.raw<Measured>({});
	let ready = $state(untrack(() => !items.some(needsMeasure)));
	let ghosts = $state.raw<Ghost[]>([]);
	let openId = $state<string | null>(null);
	let closing = $state(false);

	const settings = $derived({
		gap: Math.max(0, gap),
		animateFrom: ANIMATE_FROM.includes(animateFrom) ? animateFrom : 'bottom',
		stagger: Math.max(0, stagger),
		duration: Math.max(0.05, duration),
		bounce: clamp(bounce, 0, 0.9),
		blurToFocus,
		revealOnScroll,
		hoverEffect: HOVER_EFFECTS.includes(hoverEffect) ? hoverEffect : 'zoom',
		focusOnHover,
		parallax: clamp(parallax, 0, 1),
		lightbox,
		draggable
	});

	const itemsKey = $derived(items.map(keyOf).join('\u0000'));

	const ordered = $derived.by<MasonryItem[]>(() => {
		const current = order;
		if (!current) return items;
		const byId = new Map(items.map((item) => [keyOf(item), item]));
		const list = current.filter((id) => byId.has(id)).map((id) => byId.get(id) as MasonryItem);
		items.forEach((item) => {
			if (!current.includes(keyOf(item))) list.push(item);
		});
		return list;
	});

	const layout = $derived<Layout | null>(
		width && ready ? layoutOf(ordered, width, columns, columnWidth, settings.gap, measured) : null
	);

	const syncNodes = () => {
		nodes.clear();
		rootEl?.querySelectorAll<HTMLDivElement>(':scope > [data-id]').forEach((node) => {
			const id = node.getAttribute('data-id');
			if (id !== null) nodes.set(id, node);
		});
	};

	$effect(() => {
		const root = rootEl;
		if (!root) return;
		const observer = new ResizeObserver(([entry]) => {
			width = Math.round(entry.contentRect.width);
		});
		observer.observe(root);
		width = Math.round(root.getBoundingClientRect().width);
		return () => observer.disconnect();
	});

	$effect(() => {
		void itemsKey;
		return untrack(() => {
			const known = measured;
			const missing = items.filter((item) => needsMeasure(item) && !known[keyOf(item)]);
			if (!missing.length) {
				ready = true;
				return undefined;
			}
			let cancelled = false;
			const timer = setTimeout(() => {
				if (!cancelled) ready = true;
			}, 2500);
			missing.forEach((item) => {
				const image = new Image();
				image.onload = () => {
					if (cancelled || !image.naturalWidth) return;
					measured = { ...measured, [keyOf(item)]: image.naturalHeight / image.naturalWidth };
				};
				image.src = item.img;
			});
			return () => {
				cancelled = true;
				clearTimeout(timer);
			};
		});
	});

	$effect(() => {
		if (ready) return;
		const known = measured;
		if (items.every((item) => !needsMeasure(item) || known[keyOf(item)])) ready = true;
	});

	const paint = (id: string, spring: Spring) => {
		const node = nodes.get(id);
		if (!node) return;
		node.style.transform = `translate3d(${spring.x}px, ${spring.y}px, 0) scale(${spring.s})`;
		if (spring.reveal < 1) {
			const eased = 1 - Math.pow(1 - Math.max(0, spring.reveal), 3);
			node.style.opacity = String(eased);
			node.style.filter = spring.blur ? `blur(${((1 - eased) * 12).toFixed(2)}px)` : '';
		} else if (node.style.opacity !== '') {
			node.style.opacity = '';
			node.style.filter = '';
		}
	};

	const frame = (now: number) => {
		const state = engine;
		state.raf = 0;
		const s = settings;
		const elapsed = clamp((now - state.last) / 1000, 0, 1 / 20);
		state.last = now;
		const omega = (Math.PI * 2) / s.duration;
		const zeta = clamp(1 - s.bounce, 0.1, 1);
		const steps = Math.max(1, Math.ceil(elapsed / (1 / 240)));
		const dt = elapsed / steps;
		let active = false;
		springs.forEach((spring, id) => {
			if (!spring.shown) return;
			if (spring.dragging) {
				paint(id, spring);
				return;
			}
			if (now < spring.start) {
				active = true;
				return;
			}
			for (let i = 0; i < steps; i++) {
				spring.vx += (-omega * omega * (spring.x - spring.tx) - 2 * zeta * omega * spring.vx) * dt;
				spring.vy += (-omega * omega * (spring.y - spring.ty) - 2 * zeta * omega * spring.vy) * dt;
				spring.vs += (-omega * omega * (spring.s - 1) - 2 * zeta * omega * spring.vs) * dt;
				spring.x += spring.vx * dt;
				spring.y += spring.vy * dt;
				spring.s += spring.vs * dt;
			}
			const resting =
				Math.abs(spring.x - spring.tx) < 0.05 &&
				Math.abs(spring.y - spring.ty) < 0.05 &&
				Math.abs(spring.s - 1) < 0.0005 &&
				Math.abs(spring.vx) + Math.abs(spring.vy) < 0.05 &&
				Math.abs(spring.vs) < 0.001;
			if (resting) {
				spring.x = spring.tx;
				spring.y = spring.ty;
				spring.s = 1;
				spring.vx = spring.vy = spring.vs = 0;
			} else active = true;
			if (spring.reveal < 1) {
				spring.reveal = clamp((now - spring.start) / (s.duration * 1000), 0, 1);
				if (spring.reveal < 1) active = true;
			}
			paint(id, spring);
		});
		if (active) state.raf = requestAnimationFrame(frame);
	};

	const kick = () => {
		if (engine.raf || typeof window === 'undefined') return;
		engine.last = performance.now();
		engine.raf = requestAnimationFrame(frame);
	};

	const visibleCenter = () => {
		const root = rootEl;
		if (!root) return 0;
		const rect = root.getBoundingClientRect();
		const top = Math.max(0, -rect.top);
		const bottom = Math.min(rect.height, window.innerHeight - rect.top);
		return bottom > top ? (top + bottom) / 2 : rect.height / 2;
	};

	const flushReveals = () => {
		engine.flush = 0;
		const s = settings;
		const batch: { id: string; spring: Spring }[] = [];
		pending.forEach((id) => {
			const spring = springs.get(id);
			if (spring && !spring.shown) batch.push({ id, spring });
		});
		pending.clear();
		if (!batch.length) return;
		batch.sort((a, b) => a.spring.ty - b.spring.ty || a.spring.tx - b.spring.tx);
		const now = performance.now();
		const still = reduced() || s.animateFrom === 'none';
		const rootWidth = rootEl?.clientWidth ?? 0;
		const centerY = visibleCenter();
		batch.forEach(({ id, spring }, rank) => {
			spring.shown = true;
			spring.blur = s.blurToFocus && !still;
			if (still) {
				spring.x = spring.tx;
				spring.y = spring.ty;
				spring.s = 1;
				spring.reveal = 1;
				spring.start = now;
				paint(id, spring);
				return;
			}
			const direction =
				s.animateFrom === 'random' ? DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)] : s.animateFrom;
			const distance = 60 + Math.min(spring.h, 280) * 0.35;
			spring.x = spring.tx;
			spring.y = spring.ty;
			spring.s = 0.96;
			if (direction === 'center') {
				spring.x = rootWidth / 2 - spring.w / 2;
				spring.y = centerY - spring.h / 2;
				spring.s = 0.55;
			} else if (direction === 'bottom') spring.y += distance;
			else if (direction === 'top') spring.y -= distance;
			else if (direction === 'left') spring.x -= distance;
			else if (direction === 'right') spring.x += distance;
			spring.vx = spring.vy = spring.vs = 0;
			spring.reveal = 0;
			spring.start = now + rank * s.stagger * 1000;
			paint(id, spring);
		});
		kick();
	};

	const requestReveal = (id: string) => {
		const spring = springs.get(id);
		if (!spring || spring.shown) return;
		if (!loaded.has(id)) {
			waiting.add(id);
			return;
		}
		waiting.delete(id);
		pending.add(id);
		if (!engine.flush) engine.flush = requestAnimationFrame(flushReveals);
	};

	const markLoaded = (id: string, image?: HTMLImageElement | null) => {
		loaded.add(id);
		const target = image ?? nodes.get(id)?.querySelector('img');
		target?.setAttribute('data-loaded', '');
		if (waiting.has(id)) requestReveal(id);
	};

	const imageReady = (image: HTMLImageElement, id: string) => {
		if (image.complete && image.naturalWidth && !loaded.has(id)) markLoaded(id, image);
	};

	const portal = (node: HTMLElement) => {
		if (node.parentNode !== document.body) document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	};

	$effect.pre(() => {
		void itemsKey;
		untrack(() => {
			const live = new Set(items.map(keyOf));
			const leaving: Ghost[] = [];
			previous.forEach((entry, id) => {
				if (live.has(id)) return;
				const spring = springs.get(id);
				previous.delete(id);
				if (!spring?.shown) return;
				leaving.push({ id, item: entry.item, x: spring.x, y: spring.y, s: spring.s, w: entry.w, h: entry.h });
				springs.delete(id);
			});
			if (leaving.length) ghosts = [...ghosts.filter((ghost) => !live.has(ghost.id)), ...leaving];
			order = null;
		});
	});

	$effect(() => {
		const current = layout;
		if (!current) return;
		untrack(() => {
			syncNodes();
			const instant = reduced();
			current.tiles.forEach((tile) => {
				const node = nodes.get(tile.id);
				let spring = springs.get(tile.id);
				if (!spring) {
					spring = {
						x: tile.x,
						y: tile.y,
						s: 1,
						vx: 0,
						vy: 0,
						vs: 0,
						tx: tile.x,
						ty: tile.y,
						w: tile.w,
						h: tile.h,
						shown: false,
						dragging: false,
						blur: false,
						reveal: 0,
						start: 0
					};
					springs.set(tile.id, spring);
					if (node) {
						node.style.opacity = '0';
						node.style.transform = `translate3d(${tile.x}px, ${tile.y}px, 0)`;
					}
				} else if (spring.shown && Math.abs(spring.w - tile.w) > 0.5 && !instant) {
					spring.s *= spring.w / tile.w;
				}
				spring.tx = tile.x;
				spring.ty = tile.y;
				spring.w = tile.w;
				spring.h = tile.h;
				if (!spring.shown) {
					spring.x = tile.x;
					spring.y = tile.y;
					if (node) node.style.transform = `translate3d(${tile.x}px, ${tile.y}px, 0)`;
				} else if (instant && !spring.dragging) {
					spring.x = tile.x;
					spring.y = tile.y;
					spring.s = 1;
					paint(tile.id, spring);
				}
				previous.set(tile.id, { item: tile.item, w: tile.w, h: tile.h });
			});
			kick();
		});
	});

	$effect(() => {
		const current = layout;
		void revealOnScroll;
		if (!current) return;
		return untrack(() => {
			const ids = current.tiles.map((tile) => tile.id);
			if (!settings.revealOnScroll || typeof IntersectionObserver === 'undefined') {
				ids.forEach(requestReveal);
				return undefined;
			}
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (!entry.isIntersecting) return;
						const id = entry.target.getAttribute('data-id');
						if (id) requestReveal(id);
						observer.unobserve(entry.target);
					});
				},
				{ rootMargin: '0px 0px -6% 0px' }
			);
			ids.forEach((id) => {
				const node = nodes.get(id);
				if (node && !springs.get(id)?.shown) observer.observe(node);
			});
			return () => observer.disconnect();
		});
	});

	$effect(() => {
		void layout;
		return untrack(() => {
			const timers: ReturnType<typeof setTimeout>[] = [];
			waiting.forEach((id) => {
				timers.push(
					setTimeout(() => {
						if (!waiting.has(id)) return;
						loaded.add(id);
						requestReveal(id);
					}, 2500)
				);
			});
			return () => timers.forEach(clearTimeout);
		});
	});

	$effect(() => {
		const list = ghosts;
		untrack(() => {
			list.forEach((ghost) => {
				const node = rootEl?.querySelector<HTMLDivElement>(`:scope > [data-ghost="${CSS.escape(ghost.id)}"]`);
				if (!node || node.getAttribute('data-leaving')) return;
				node.setAttribute('data-leaving', '');
				const from = `translate3d(${ghost.x}px, ${ghost.y}px, 0) scale(${ghost.s})`;
				const to = `translate3d(${ghost.x + ghost.w * 0.04}px, ${ghost.y + ghost.h * 0.04}px, 0) scale(${ghost.s * 0.92})`;
				const animation = node.animate(
					[
						{ transform: from, opacity: 1 },
						{ transform: to, opacity: 0 }
					],
					{ duration: reduced() ? 1 : 320, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
				);
				animation.finished
					.then(() => {
						ghosts = ghosts.filter((entry) => entry.id !== ghost.id);
					})
					.catch(() => {});
			});
		});
	});

	$effect(() => {
		const current = layout;
		const strength = settings.parallax;
		return untrack(() => {
			const layers = () => [...nodes.values()].map((node) => node.querySelector<HTMLElement>('[data-parallax]'));
			if (!strength || !current) {
				layers().forEach((layer) => {
					if (layer) layer.style.transform = '';
				});
				return undefined;
			}
			let raf = 0;
			const scroller = scrollerOf(rootEl);
			const update = () => {
				raf = 0;
				const bounds = scroller ? scroller.getBoundingClientRect() : { top: 0, bottom: window.innerHeight };
				const top = Math.max(bounds.top, 0);
				const bottom = Math.min(bounds.bottom, window.innerHeight);
				const center = (top + bottom) / 2;
				nodes.forEach((node) => {
					const layer = node.querySelector<HTMLElement>('[data-parallax]');
					if (!layer) return;
					const rect = node.getBoundingClientRect();
					if (rect.bottom < top - 200 || rect.top > bottom + 200) return;
					const reach = strength * 0.2 * rect.height;
					const shift = clamp(-(rect.top + rect.height / 2 - center) * strength * 0.25, -reach, reach);
					layer.style.transform = `translate3d(0, ${shift.toFixed(2)}px, 0) scale(${(1 + strength * 0.4 + 0.002).toFixed(3)})`;
				});
			};
			const schedule = () => {
				if (!raf) raf = requestAnimationFrame(update);
			};
			update();
			window.addEventListener('scroll', schedule, { capture: true, passive: true });
			window.addEventListener('resize', schedule, { passive: true });
			return () => {
				cancelAnimationFrame(raf);
				window.removeEventListener('scroll', schedule, { capture: true });
				window.removeEventListener('resize', schedule);
			};
		});
	});

	$effect(() => {
		return () => {
			cancelAnimationFrame(engine.raf);
			cancelAnimationFrame(engine.flush);
			window.removeEventListener('pointermove', moveDrag);
			window.removeEventListener('pointerup', finishDrag);
			window.removeEventListener('pointercancel', finishDrag);
		};
	});

	const setDimmed = (activeId: string | null) => {
		nodes.forEach((node, id) => {
			if (activeId && id !== activeId) node.setAttribute('data-dimmed', '');
			else node.removeAttribute('data-dimmed');
		});
	};

	const onEnter = (id: string) => {
		if (settings.focusOnHover && !drag?.active) setDimmed(id);
	};

	const onLeave = (event: PointerEvent) => {
		if (settings.focusOnHover) setDimmed(null);
		const card = event.currentTarget as HTMLElement;
		card.style.removeProperty('--masonry-tilt-x');
		card.style.removeProperty('--masonry-tilt-y');
	};

	const onTilt = (event: PointerEvent) => {
		if (settings.hoverEffect !== 'tilt' || drag?.active) return;
		const card = event.currentTarget as HTMLElement;
		const rect = card.getBoundingClientRect();
		const px = (event.clientX - rect.left) / rect.width - 0.5;
		const py = (event.clientY - rect.top) / rect.height - 0.5;
		card.style.setProperty('--masonry-tilt-x', `${(-py * 10).toFixed(2)}deg`);
		card.style.setProperty('--masonry-tilt-y', `${(px * 10).toFixed(2)}deg`);
	};

	function finishDrag() {
		const current = drag;
		window.removeEventListener('pointermove', moveDrag);
		window.removeEventListener('pointerup', finishDrag);
		window.removeEventListener('pointercancel', finishDrag);
		drag = null;
		if (!current?.active) return;
		const spring = springs.get(current.id);
		const node = nodes.get(current.id);
		if (spring) spring.dragging = false;
		node?.removeAttribute('data-dragging');
		rootEl?.removeAttribute('data-dragging');
		suppress = true;
		setTimeout(() => {
			suppress = false;
		}, 0);
		kick();
		if (current.moved) onReorder?.(ordered);
	}

	function moveDrag(event: PointerEvent) {
		const current = drag;
		const root = rootEl;
		if (!current || !root || event.pointerId !== current.pointerId) return;
		if (!current.active) {
			if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 6) return;
			const spring = springs.get(current.id);
			if (!spring?.shown) return;
			current.active = true;
			spring.dragging = true;
			spring.vx = spring.vy = spring.vs = 0;
			nodes.get(current.id)?.setAttribute('data-dragging', '');
			root.setAttribute('data-dragging', '');
			setDimmed(null);
		}
		const rect = root.getBoundingClientRect();
		const spring = springs.get(current.id);
		if (!spring) return;
		spring.x = event.clientX - rect.left - current.offsetX;
		spring.y = event.clientY - rect.top - current.offsetY;
		spring.s = 1;
		paint(current.id, spring);
		kick();
		const list = ordered;
		const dragged = list.find((item) => keyOf(item) === current.id);
		if (!dragged || !width) return;
		const others = list.filter((item) => keyOf(item) !== current.id);
		const slots = slotsFor(others, dragged, width, columns, columnWidth, settings.gap, measured);
		const cx = spring.x + spring.w / 2;
		const cy = spring.y + spring.h / 2;
		const index = list.indexOf(dragged);
		let best = index;
		let nearest = Math.hypot(slots[index].x - cx, slots[index].y - cy);
		const threshold = nearest * 0.8 - 6;
		slots.forEach((slot, slotIndex) => {
			const distance = Math.hypot(slot.x - cx, slot.y - cy);
			if (distance < nearest && distance < threshold) {
				nearest = distance;
				best = slotIndex;
			}
		});
		if (best === index) return;
		const ids = others.map(keyOf);
		ids.splice(best, 0, current.id);
		current.moved = true;
		order = ids;
	}

	const startDrag = (event: PointerEvent, id: string) => {
		const s = settings;
		if (!s.draggable || event.button !== 0 || event.pointerType === 'touch' || openId) return;
		const root = rootEl;
		const spring = springs.get(id);
		if (!root || !spring) return;
		const rect = root.getBoundingClientRect();
		drag = {
			id,
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			offsetX: event.clientX - rect.left - spring.x,
			offsetY: event.clientY - rect.top - spring.y,
			active: false,
			moved: false
		};
		window.addEventListener('pointermove', moveDrag);
		window.addEventListener('pointerup', finishDrag);
		window.addEventListener('pointercancel', finishDrag);
	};

	const onCardClick = (event: MouseEvent, item: MasonryItem, index: number) => {
		if (suppress) {
			event.preventDefault();
			return;
		}
		onItemClick?.(item, index, event);
		if (event.defaultPrevented) return;
		if (settings.lightbox) {
			event.preventDefault();
			token += 1;
			closing = false;
			openId = keyOf(item);
		}
	};

	const openIndex = $derived(openId ? ordered.findIndex((item) => keyOf(item) === openId) : -1);
	const openItem = $derived(openIndex >= 0 ? ordered[openIndex] : null);

	const mediaRect = (id: string) => nodes.get(id)?.querySelector('[data-media]')?.getBoundingClientRect() ?? null;

	const frameFor = (item: MasonryItem) => {
		const aspect = aspectOf(item, measured);
		const pad = window.innerWidth < 640 ? 16 : 72;
		const room = item.title || item.description || item.url ? 64 : 0;
		const maxW = Math.max(40, window.innerWidth - pad * 2);
		const maxH = Math.max(40, window.innerHeight - pad * 2 - room);
		let w = maxW;
		let h = w * aspect;
		if (h > maxH) {
			h = maxH;
			w = h / aspect;
		}
		const left = (window.innerWidth - w) / 2;
		const top = (window.innerHeight - room - h) / 2;
		return { left, top, width: w, height: h, room };
	};

	const closeBox = () => {
		const id = openId;
		if (!id || closing) return;
		token += 1;
		const current = token;
		const box = boxEl;
		const image = box?.querySelector<HTMLElement>('[data-box-image]');
		const backdrop = box?.querySelector<HTMLElement>('[data-box-backdrop]');
		const rect = mediaRect(id);
		closing = true;
		if (!image || !rect || reduced()) {
			openId = null;
			closing = false;
			return;
		}
		const bounds = image.getBoundingClientRect();
		const scale = rect.width / bounds.width;
		image.getAnimations().forEach((animation) => animation.cancel());
		const animation = image.animate(
			[
				{ transform: 'none', borderRadius: '6px' },
				{
					transform: `translate(${rect.left - bounds.left}px, ${rect.top - bounds.top}px) scale(${scale})`,
					borderRadius: `${radius / Math.max(scale, 0.01)}px`
				}
			],
			{ duration: 380, easing: EASE, fill: 'forwards' }
		);
		backdrop?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: 'ease', fill: 'forwards' });
		box
			?.querySelectorAll('[data-box-fade]')
			.forEach((node) => node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }));
		animation.finished
			.then(() => {
				if (current !== token) return;
				openId = null;
				closing = false;
			})
			.catch(() => {});
	};

	const stepBox = (direction: number) => {
		const list = ordered;
		if (!openItem || closing || list.length < 2) return;
		const next = list[(openIndex + direction + list.length) % list.length];
		openId = keyOf(next);
	};

	$effect.pre(() => {
		if (openId) lastShown = openId;
	});

	$effect(() => {
		const id = openId;
		if (!id) return;
		const node = untrack(() => nodes.get(id));
		node?.setAttribute('data-hidden', '');
		return () => node?.removeAttribute('data-hidden');
	});

	$effect(() => {
		const id = openId;
		const box = boxEl;
		untrack(() => {
			if (!id || !box) {
				opened = null;
				return;
			}
			if (box.parentNode !== document.body) document.body.appendChild(box);
			const image = box.querySelector<HTMLElement>('[data-box-image]');
			const backdrop = box.querySelector<HTMLElement>('[data-box-backdrop]');
			const fades = box.querySelectorAll('[data-box-fade]');
			if (!image) return;
			if (opened) {
				if (opened === id) return;
				image.animate(
					[
						{ opacity: 0, transform: 'scale(0.97)' },
						{ opacity: 1, transform: 'none' }
					],
					{ duration: reduced() ? 1 : 320, easing: EASE }
				);
				opened = id;
				return;
			}
			opened = id;
			box.querySelector<HTMLElement>('[data-box-close]')?.focus({ preventScroll: true });
			const rect = mediaRect(id);
			const target = image.getBoundingClientRect();
			if (rect && !reduced()) {
				const scale = rect.width / target.width;
				image.animate(
					[
						{
							transform: `translate(${rect.left - target.left}px, ${rect.top - target.top}px) scale(${scale})`,
							borderRadius: `${radius / Math.max(scale, 0.01)}px`
						},
						{ transform: 'none', borderRadius: '6px' }
					],
					{ duration: 520, easing: EASE }
				);
				backdrop?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, easing: 'ease' });
				fades.forEach((fade) =>
					fade.animate([{ opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1 }], { duration: 560, easing: 'ease' })
				);
			}
		});
	});

	const isOpen = $derived(Boolean(openId));

	$effect(() => {
		if (!isOpen) return;
		return untrack(() => {
			const before = document.documentElement.style.overflow;
			document.documentElement.style.overflow = 'hidden';
			return () => {
				document.documentElement.style.overflow = before;
				nodes
					.get(lastShown ?? '')
					?.querySelector<HTMLElement>('[data-card]')
					?.focus({ preventScroll: true });
			};
		});
	});

	const onKey = (event: KeyboardEvent) => {
		if (!openId) return;
		if (event.key === 'Escape') closeBox();
		else if (event.key === 'ArrowRight') stepBox(1);
		else if (event.key === 'ArrowLeft') stepBox(-1);
	};

	const captionMode = $derived(CAPTION_MODES.includes(captions) ? captions : 'hover');
	const box = $derived(openItem && typeof document !== 'undefined' ? frameFor(openItem) : null);

	const cardTag = (item: MasonryItem) =>
		!lightbox && item.url ? 'a' : lightbox || onItemClick ? 'button' : 'div';

	const cardAttrs = (item: MasonryItem): Record<string, unknown> => {
		const label = item.title || item.alt || undefined;
		const tag = cardTag(item);
		if (tag === 'a')
			return { href: item.url, target: '_blank', rel: 'noopener noreferrer', draggable: 'false', 'aria-label': label };
		if (tag === 'button') return { type: 'button', 'aria-label': label };
		return {};
	};
</script>

<svelte:window onkeydown={onKey} />

<div
	bind:this={rootEl}
	class={[ROOT, className].filter(Boolean).join(' ')}
	{style}
	style:--masonry-radius="{Math.max(0, radius)}px"
	style:height={layout ? `${layout.height}px` : undefined}
	data-hover={settings.hoverEffect}
	role="list"
>
	{#each layout?.tiles ?? [] as tile, index (tile.id)}
		<div
			class={ITEM}
			style:width="{tile.w}px"
			style:height="{tile.h}px"
			data-id={tile.id}
			role="listitem"
		>
			<svelte:element
				this={cardTag(tile.item)}
				{...cardAttrs(tile.item)}
				class={CARD}
				data-card=""
				onclick={(event: MouseEvent) => onCardClick(event, tile.item, index)}
				onpointerdown={(event: PointerEvent) => startDrag(event, tile.id)}
				onpointerenter={() => onEnter(tile.id)}
				onpointerleave={onLeave}
				onpointermove={onTilt}
			>
				<span class={MEDIA} data-media="">
					<span class={PARALLAX} data-parallax="">
						<img
							use:imageReady={tile.id}
							class={IMAGE}
							src={tile.item.img}
							alt={tile.item.alt ?? tile.item.title ?? ''}
							draggable="false"
							decoding="async"
							data-loaded={loaded.has(tile.id) ? '' : undefined}
							onload={(event) => markLoaded(tile.id, event.currentTarget as HTMLImageElement)}
							onerror={(event) => markLoaded(tile.id, event.currentTarget as HTMLImageElement)}
						/>
					</span>
					{#if captionMode !== 'none' && (tile.item.title || tile.item.description)}
						<span class={CAPTION} data-mode={captionMode}>
							{#if tile.item.title}<span class={TITLE}>{tile.item.title}</span>{/if}
							{#if tile.item.description}<span class={TEXT}>{tile.item.description}</span>{/if}
						</span>
					{/if}
				</span>
			</svelte:element>
		</div>
	{/each}
	{#each ghosts as ghost (`ghost-${ghost.id}`)}
		<div
			class={GHOST}
			data-ghost={ghost.id}
			style:width="{ghost.w}px"
			style:height="{ghost.h}px"
			style:transform="translate3d({ghost.x}px, {ghost.y}px, 0) scale({ghost.s})"
			aria-hidden="true"
		>
			<div class={MEDIA}>
				<img class={IMAGE} src={ghost.item.img} alt="" data-loaded="" draggable="false" />
			</div>
		</div>
	{/each}
	{#if openItem && box}
		<div
			bind:this={boxEl}
			use:portal
			class={BOX}
			role="dialog"
			aria-modal="true"
			aria-label={openItem.title || openItem.alt || 'Image'}
		>
			<div class={BOX_BACKDROP} data-box-backdrop="" role="presentation" onclick={closeBox}></div>
			<img
				class={BOX_IMAGE}
				data-box-image=""
				src={openItem.img}
				alt={openItem.alt ?? openItem.title ?? ''}
				draggable="false"
				style:width="{box.width}px"
				style:height="{box.height}px"
				style:left="{box.left}px"
				style:top="{box.top}px"
				style:border-radius="6px"
				onclick={closeBox}
			/>
			{#if box.room > 0}
				<div class={BOX_CAPTION} data-box-fade="" style:top="{box.top + box.height + 18}px">
					{#if openItem.title}<span>{openItem.title}</span>{/if}
					{#if openItem.description}<span class={BOX_MUTED}>{openItem.description}</span>{/if}
					{#if openItem.url}
						<a href={openItem.url} target="_blank" rel="noopener noreferrer">
							Open
							<HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={2} />
						</a>
					{/if}
				</div>
			{/if}
			<button type="button" class={BOX_CLOSE} data-box-fade="" data-box-close="" aria-label="Close" onclick={closeBox}>
				<HugeiconsIcon icon={Cancel01Icon} size={20} strokeWidth={2} />
			</button>
			{#if ordered.length > 1}
				<button type="button" class={BOX_PREV} data-box-fade="" aria-label="Previous" onclick={() => stepBox(-1)}>
					<HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={2} />
				</button>
				<button type="button" class={BOX_NEXT} data-box-fade="" aria-label="Next" onclick={() => stepBox(1)}>
					<HugeiconsIcon icon={ArrowRight01Icon} size={20} strokeWidth={2} />
				</button>
			{/if}
		</div>
	{/if}
</div>
