<!-- @svelte-bits
{
  "title": "DriftWall",
  "description": "An endless perspective wall of tiles drifting past, lifting on hover.",
  "dependencies": []
}
-->
<script module lang="ts">
	export interface DriftWallItem {
		image: string;
		title?: string;
		href?: string;
	}

	export interface DriftWallProps {
		items?: DriftWallItem[];
		columns?: number;
		tileWidth?: number;
		tileHeight?: number;
		gap?: number;
		radius?: number;
		tilt?: number;
		turn?: number;
		roll?: number;
		perspective?: number;
		depth?: number;
		speed?: number;
		direction?: 'up' | 'down';
		variance?: number;
		parallax?: number;
		pauseOnHover?: boolean;
		lift?: number;
		fade?: number;
		dim?: number;
		grayscale?: boolean;
		overlayColor?: string;
		class?: string;
		style?: string;
	}

	interface ColumnMeta {
		copyHeight: number;
		copies: number;
	}

	const DEFAULT_ITEMS: DriftWallItem[] = Array.from({ length: 15 }, (_, i) => {
		const ids = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164];
		return {
			image: `https://picsum.photos/id/${ids[i % ids.length]}/600/400`,
			title: `Tile ${i + 1}`,
			href: undefined
		};
	});

	const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

	const prefersReducedMotion = (): boolean =>
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	const columnFactor = (index: number, variance: number): number => {
		const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
		return 1 + variance * pseudo;
	};

	const MASK_STYLE =
		'radial-gradient(ellipse 78% 82% at 50% 46%, #000 var(--dw-edge), transparent 100%), ' +
		'linear-gradient(to top, #000 var(--dw-edge), transparent 100%)';

	const TILE_CLASS = cx(
		'group/tile relative block flex-none cursor-pointer outline-none',
		'w-full h-[calc(var(--dw-tile-h)+var(--dw-gap))] [transform-style:preserve-3d]'
	);
	const INNER_CLASS = cx(
		'pointer-events-none absolute inset-[calc(var(--dw-gap)/2)] block overflow-hidden bg-[#0d0a08]',
		'rounded-[var(--dw-radius)] opacity-[var(--dw-dim)] [transform:translateZ(0)]',
		'transition-[transform,opacity,box-shadow] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
		'group-[.is-active]/tile:opacity-100 group-[.is-active]/tile:[transform:translateZ(var(--dw-lift))]',
		'group-[.is-active]/tile:shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)]',
		'group-focus-visible/tile:opacity-100 group-focus-visible/tile:[transform:translateZ(var(--dw-lift))]',
		'group-focus-visible/tile:shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7),0_0_0_2px_rgba(255,255,255,0.9)]'
	);
	const IMG_CLASS = cx(
		'block h-full w-full select-none object-cover',
		'[filter:grayscale(var(--dw-gray))_saturate(0.92)]',
		'transition-[filter] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
		'group-[.is-active]/tile:[filter:grayscale(0)_saturate(1.05)] group-focus-visible/tile:[filter:grayscale(0)_saturate(1.05)]'
	);
	const OVERLAY_CLASS = cx(
		'pointer-events-none absolute inset-0 bg-[var(--dw-overlay)] opacity-[0.42]',
		'transition-opacity duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
		'group-[.is-active]/tile:opacity-0 group-focus-visible/tile:opacity-0'
	);
</script>

<script lang="ts">
	let {
		items = DEFAULT_ITEMS,
		columns = 5,
		tileWidth = 200,
		tileHeight = 132,
		gap = 18,
		radius = 14,
		tilt = 16,
		turn = -14,
		roll = 0,
		perspective = 1200,
		depth = 120,
		speed = 42,
		direction = 'up',
		variance = 0.45,
		parallax = 0.6,
		pauseOnHover = false,
		lift = 64,
		fade = 0.6,
		dim = 0.55,
		grayscale = false,
		overlayColor = '#0a0704',
		class: className = '',
		style = ''
	}: DriftWallProps = $props();

	let containerEl: HTMLDivElement | null = $state(null);
	let planeEl: HTMLDivElement | null = $state(null);
	let trackEls: (HTMLDivElement | null)[] = $state([]);

	let offsets: number[] = [];
	let velocities: number[] = [];
	let hoveredCol = -1;
	let wallHovered = false;
	let pointer = { x: 0, y: 0 };
	const pointerDamped = { x: 0, y: 0 };

	let containerHeight = $state(600);
	let activeId: string | null = $state(null);
	let activeIdCurrent: string | null = null;
	let reduced = $state(false);

	$effect(() => {
		reduced = prefersReducedMotion();
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		const onChange = (e: MediaQueryListEvent) => (reduced = e.matches);
		mq.addEventListener('change', onChange);
		return () => mq.removeEventListener('change', onChange);
	});

	const columnItems = $derived.by<DriftWallItem[][]>(() => {
		const cols: DriftWallItem[][] = Array.from({ length: columns }, () => []);
		items.forEach((item, i) => cols[i % columns].push(item));
		return cols.map((col) => (col.length ? col : items.slice(0, 1)));
	});

	const columnMeta = $derived.by<ColumnMeta[]>(() => {
		const unit = tileHeight + gap;
		return columnItems.map((col) => {
			const copyHeight = Math.max(unit, col.length * unit);
			const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
			return { copyHeight, copies };
		});
	});

	$effect(() => {
		if (!containerEl) return;
		const ro = new ResizeObserver(([entry]) => {
			containerHeight = entry.contentRect.height || 600;
		});
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	const baseVelocities = $derived.by<number[]>(() => {
		const dirSign = direction === 'up' ? 1 : -1;
		return columnItems.map((_, c) => {
			const altSign = c % 2 === 0 ? 1 : -1;
			return speed * columnFactor(c, variance) * dirSign * altSign;
		});
	});

	$effect(() => {
		const meta = columnMeta;
		const cols = columnItems;
		offsets = meta.map((m, c) => m.copyHeight * ((c * 0.37) % 1));
		velocities = cols.map(() => 0);
	});

	$effect(() => {
		const velocitiesBase = baseVelocities;
		const meta = columnMeta;
		const pauseHover = pauseOnHover;
		const parallaxAmount = parallax;
		const isReduced = reduced;
		const pitch = tilt;
		const yaw = turn;
		const spin = roll;
		const push = depth;
		const tracks = trackEls;
		const plane = planeEl;

		const applyPlaneTransform = (px: number, py: number) => {
			if (!plane) return;
			plane.style.transform =
				`translate(-50%, -50%) scale(1.18) ` +
				`rotateX(${pitch + py}deg) rotateY(${yaw + px}deg) rotateZ(${spin}deg) ` +
				`translateZ(${-push}px)`;
		};

		let lastTs: number | null = null;
		let raf: number | null = null;

		const animate = (ts: number) => {
			if (lastTs === null) lastTs = ts;
			const dt = Math.min(0.05, Math.max(0, ts - lastTs) / 1000);
			lastTs = ts;

			const maxTilt = parallaxAmount * 8;
			const targetX = pointer.x * maxTilt;
			const targetY = -pointer.y * maxTilt;
			const damp = 1 - Math.exp(-dt / 0.12);
			pointerDamped.x += (targetX - pointerDamped.x) * damp;
			pointerDamped.y += (targetY - pointerDamped.y) * damp;
			applyPlaneTransform(pointerDamped.x, pointerDamped.y);

			if (!isReduced) {
				for (let c = 0; c < tracks.length; c++) {
					const m = meta[c];
					if (!m) continue;
					const paused = wallHovered && pauseHover;
					const factor = paused || hoveredCol === c ? 0 : 1;
					const target = velocitiesBase[c] * factor;

					const ease = 1 - Math.exp(-dt / (target === 0 ? 0.16 : 0.28));
					velocities[c] = (velocities[c] ?? 0) + (target - (velocities[c] ?? 0)) * ease;
					let next = (offsets[c] ?? 0) + velocities[c] * dt;
					next = ((next % m.copyHeight) + m.copyHeight) % m.copyHeight;
					offsets[c] = next;

					const el = tracks[c];
					if (el) el.style.transform = `translate3d(0, ${-next}px, 0)`;
				}
			} else {
				for (let c = 0; c < tracks.length; c++) {
					const el = tracks[c];
					const m = meta[c];
					if (el && m) el.style.transform = `translate3d(0, ${-(offsets[c] ?? 0)}px, 0)`;
				}
			}

			raf = requestAnimationFrame(animate);
		};

		raf = requestAnimationFrame(animate);
		return () => {
			if (raf) cancelAnimationFrame(raf);
			raf = null;
			lastTs = null;
		};
	});

	const activate = (id: string, index: number): void => {
		activeIdCurrent = id;
		hoveredCol = index;
		activeId = id;
	};

	const release = (): void => {
		activeIdCurrent = null;
		hoveredCol = -1;
		activeId = null;
	};

	const handlePointerMove = (e: PointerEvent) => {
		const rect = containerEl?.getBoundingClientRect();
		if (!rect) return;
		if (parallax > 0 && !reduced) {
			pointer = {
				x: (e.clientX - rect.left) / rect.width - 0.5,
				y: (e.clientY - rect.top) / rect.height - 0.5
			};
		}
		const hit = document.elementFromPoint(e.clientX, e.clientY);
		const tile = hit && hit.closest ? (hit.closest('[data-tile-id]') as HTMLElement | null) : null;
		if (!tile) return;
		const id = tile.dataset.tileId ?? null;
		if (id === activeIdCurrent) return;
		activeIdCurrent = id;
		hoveredCol = Number(tile.dataset.col);
		activeId = id;
	};

	const handlePointerLeaveWall = (): void => {
		wallHovered = false;
		pointer = { x: 0, y: 0 };
		release();
	};

	const cssVars = $derived(
		[
			`--dw-tile-w: ${tileWidth}px`,
			`--dw-tile-h: ${tileHeight}px`,
			`--dw-gap: ${gap}px`,
			`--dw-radius: ${radius}px`,
			`--dw-lift: ${lift}px`,
			`--dw-dim: ${dim}`,
			`--dw-gray: ${grayscale ? 1 : 0}`,
			`--dw-overlay: ${overlayColor}`,
			`--dw-edge: ${Math.max(0, (1 - fade) * 100)}%`,
			`perspective: ${perspective}px`,
			'perspective-origin: 50% 50%',
			`-webkit-mask-image: ${MASK_STYLE}`,
			`mask-image: ${MASK_STYLE}`,
			'-webkit-mask-composite: source-in',
			'mask-composite: intersect',
			style
		]
			.filter(Boolean)
			.join('; ')
	);
</script>

{#snippet tileInner(item: DriftWallItem)}
	<span class={INNER_CLASS}>
		<img
			src={item.image}
			alt={item.title ?? ''}
			loading="lazy"
			decoding="async"
			draggable="false"
			class={IMG_CLASS}
		/>
		<span class={OVERLAY_CLASS} aria-hidden="true"></span>
	</span>
{/snippet}

<div
	bind:this={containerEl}
	class={cx('relative h-full w-full overflow-hidden', className)}
	style={cssVars}
	onpointermove={handlePointerMove}
	onpointerenter={() => {
		wallHovered = true;
	}}
	onpointerleave={handlePointerLeaveWall}
	role="group"
	aria-label="Drifting wall of tiles"
>
	<div
		bind:this={planeEl}
		class="absolute left-1/2 top-1/2 flex cursor-pointer flex-row [transform-style:preserve-3d] [transform-origin:50%_50%] will-change-transform"
	>
		{#each columnItems as col, c (c)}
			{@const meta = columnMeta[c]}
			<div class="relative w-[calc(var(--dw-tile-w)+var(--dw-gap))] [transform-style:preserve-3d]">
				<div class="flex flex-col [transform-style:preserve-3d] will-change-transform" bind:this={trackEls[c]}>
					{#each Array.from({ length: meta.copies }) as _, copyIndex (copyIndex)}
						{#each col as item, itemIndex (itemIndex)}
							{@const id = `${c}-${copyIndex}-${itemIndex}`}
							{#if item.href}
								<a
									href={item.href}
									target="_blank"
									rel="noreferrer noopener"
									class={cx(TILE_CLASS, activeId === id && 'is-active')}
									data-tile-id={id}
									data-col={c}
									onfocus={() => activate(id, c)}
									onblur={release}
								>
									{@render tileInner(item)}
								</a>
							{:else}
								<div
									tabindex="0"
									role="button"
									aria-label={item.title ?? 'tile'}
									class={cx(TILE_CLASS, activeId === id && 'is-active')}
									data-tile-id={id}
									data-col={c}
									onfocus={() => activate(id, c)}
									onblur={release}
								>
									{@render tileInner(item)}
								</div>
							{/if}
						{/each}
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
