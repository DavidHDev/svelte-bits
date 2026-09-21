<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	const Tick02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M5 14L8.5 17.5L19 6.5',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const RefreshIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M20.0092 2V5.13219C20.0092 5.42605 19.6418 5.55908 19.4537 5.33333C17.6226 3.2875 14.9617 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const Loading03Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M12 3V6',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M12 18V21',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M21 12L18 12',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
		[
			'path',
			{
				d: 'M6 12L3 12',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '3',
			},
		],
		[
			'path',
			{
				d: 'M18.3635 5.63672L16.2422 7.75804',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '4',
			},
		],
		[
			'path',
			{
				d: 'M7.75804 16.2422L5.63672 18.3635',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '5',
			},
		],
		[
			'path',
			{
				d: 'M18.3635 18.3635L16.2422 16.2422',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '6',
			},
		],
		[
			'path',
			{
				d: 'M7.75804 7.75804L5.63672 5.63672',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '7',
			},
		],
	];
	const Alert02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M13.9248 21H10.0752C5.44476 21 3.12955 21 2.27636 19.4939C1.42317 17.9879 2.60736 15.9914 4.97574 11.9985L6.90057 8.75333C9.17559 4.91778 10.3131 3 12 3C13.6869 3 14.8244 4.91777 17.0994 8.75332L19.0243 11.9985C21.3926 15.9914 22.5768 17.9879 21.7236 19.4939C20.8704 21 18.5552 21 13.9248 21Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M12 9V13',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
		[
			'path',
			{
				d: 'M12.125 16.75H12M12.25 16.75C12.25 16.8881 12.1381 17 12 17C11.8619 17 11.75 16.8881 11.75 16.75C11.75 16.6119 11.8619 16.5 12 16.5C12.1381 16.5 12.25 16.6119 12.25 16.75Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
	];
	export type RefineFrameStatus = 'queued' | 'generating' | 'refining' | 'complete' | 'error';
	export interface RefineFrameProps {
		status?: RefineFrameStatus;
		children?: Snippet | string | number | null;
		aspectRatio?: string;
		width?: number;
		radius?: number;
		background?: string;
		color?: string;
		stageDuration?: number;
		sweep?: boolean;
		showStatus?: boolean;
		hideAfter?: number;
		labels?: Partial<Record<RefineFrameStatus, string>>;
		retryLabel?: string;
		onRetry?: () => void;
		className?: string;
	}
	type Stage = { blur: number; sat: number; scale: number; opacity: number };
	interface Sim {
		p: number;
		raf: number;
		last: number;
		key: string;
		w: number;
		h: number;
		levels: HTMLCanvasElement[];
		glint: CanvasGradient | null;
		sent: boolean;
	}
	interface Live {
		status: RefineFrameStatus;
		stageDuration: number;
		sweep: boolean;
		reduce: boolean;
	}
	const STAGES: Record<RefineFrameStatus, Stage> = {
		queued: { blur: 4, sat: 0.6, scale: 1.04, opacity: 0.55 },
		generating: { blur: 1.5, sat: 0.8, scale: 1.02, opacity: 0.85 },
		refining: { blur: 0.5, sat: 0.95, scale: 1.005, opacity: 1 },
		complete: { blur: 0, sat: 1, scale: 1, opacity: 1 },
		error: { blur: 2, sat: 0.5, scale: 1, opacity: 0.28 },
	};
	const TARGET: Partial<Record<RefineFrameStatus, number>> = {
		queued: 0,
		generating: 0.5,
		refining: 0.875,
		complete: 1,
	};
	const LEVELS = [48, 32, 20, 12, 8, 5, 3, 2, 1];
	const EDGE = 28;
	const STRIPS = 14;
	const DEFAULT_LABELS: Record<RefineFrameStatus, string> = {
		queued: 'Queued',
		generating: 'Generating',
		refining: 'Refining',
		complete: 'Ready',
		error: 'Failed',
	};
	const ACTIVE = new Set<string>(['queued', 'generating', 'refining']);
	const build = (s: Sim, canvas: HTMLCanvasElement, img: HTMLImageElement, dpr: number) => {
		const rect = canvas.getBoundingClientRect();
		const W = Math.max(1, Math.round(rect.width * dpr));
		const H = Math.max(1, Math.round(rect.height * dpr));
		const key = `${img.currentSrc}|${W}x${H}`;
		if (s.key === key) return;
		s.key = key;
		s.w = W;
		s.h = H;
		canvas.width = W;
		canvas.height = H;
		const iw = img.naturalWidth;
		const ih = img.naturalHeight;
		const cover = Math.max(W / iw, H / ih);
		const sw = W / cover;
		const sh = H / cover;
		const sx = (iw - sw) / 2;
		const sy = (ih - sh) / 2;
		const glint = canvas.getContext('2d')?.createLinearGradient(0, 0, W, 0) ?? null;
		if (glint) {
			for (const [at, a] of [
				[0, 0],
				[0.08, 0.1],
				[0.2, 0.7],
				[0.32, 1],
				[0.68, 1],
				[0.8, 0.7],
				[0.92, 0.1],
				[1, 0],
			]) {
				glint.addColorStop(at, `rgba(255, 255, 255, ${a})`);
			}
		}
		s.glint = glint;
		s.levels = LEVELS.map((block) => {
			const b = block === 1 ? 1 : Math.max(2, Math.round(block * dpr));
			const full = document.createElement('canvas');
			full.width = W;
			full.height = H;
			const fc = full.getContext('2d');
			if (!fc) return full;
			if (b === 1) {
				fc.imageSmoothingEnabled = true;
				fc.imageSmoothingQuality = 'high';
				fc.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
				return full;
			}
			const small = document.createElement('canvas');
			small.width = Math.max(1, Math.round(W / b));
			small.height = Math.max(1, Math.round(H / b));
			const sc = small.getContext('2d');
			if (sc) {
				sc.imageSmoothingEnabled = true;
				sc.imageSmoothingQuality = 'high';
				sc.drawImage(img, sx, sy, sw, sh, 0, 0, small.width, small.height);
			}
			fc.imageSmoothingEnabled = false;
			fc.drawImage(small, 0, 0, W, H);
			return full;
		});
	};

	function css(value: CSSProperties | undefined): string {
		const unitless =
			/^(opacity|zIndex|fontWeight|lineHeight|flex|flexGrow|flexShrink|order|scale|aspectRatio|strokeWidth|strokeDashoffset|strokeDasharray|fillOpacity|strokeOpacity|stopOpacity|pathLength)$/;
		return Object.entries(value ?? {})
			.filter(([, v]) => v !== undefined && v !== null)
			.map(([key, value]) => {
				const name = key.startsWith('--')
					? key
					: key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase());
				return (
					name +
					':' +
					(typeof value === 'number' && value !== 0 && !key.startsWith('--') && !unitless.test(key)
						? value + 'px'
						: value)
				);
			})
			.join(';');
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	let {
		status = 'generating',
		children,
		aspectRatio = '4 / 3',
		width = 320,
		radius = 16,
		background = '#3A312A',
		color = '#F5EFE9',
		stageDuration = 400,
		sweep = true,
		showStatus = true,
		hideAfter = 1200,
		labels = DEFAULT_LABELS,
		retryLabel = 'Retry',
		onRetry,
		className = '',
	}: RefineFrameProps = $props();
	const stage = $derived(STAGES[status] ?? STAGES.generating);
	const active = $derived(ACTIVE.has(status));
	const text = $derived({ ...DEFAULT_LABELS, ...labels });
	const printRef = { current: untrack(() => null) as HTMLDivElement | null };
	const canvasRef = { current: untrack(() => null) as HTMLCanvasElement | null };
	const sim = {
		current: untrack(() => ({
			p: 0,
			raf: 0,
			last: 0,
			key: '',
			w: 0,
			h: 0,
			levels: [],
			glint: null,
			sent: false,
		})) as Sim,
	};
	const live = { current: untrack(() => ({}) as Live) as Live };
	$effect.pre(() => {
		live.current = { status, stageDuration, sweep, reduce: live.current.reduce ?? false };
	});
	let mosaic = $state(untrack(() => false));
	function setMosaic(value: typeof mosaic | ((previous: typeof mosaic) => typeof mosaic)) {
		mosaic = typeof value === 'function' ? value(mosaic) : value;
	}
	let resolved = $state(untrack(() => false));
	function setResolved(value: typeof resolved | ((previous: typeof resolved) => typeof resolved)) {
		resolved = typeof value === 'function' ? value(resolved) : value;
	}
	let chip = $state(untrack(() => showStatus));
	function setChip(value: typeof chip | ((previous: typeof chip) => typeof chip)) {
		chip = typeof value === 'function' ? value(chip) : value;
	}
	const timer = { current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined };
	$effect(() => {
		status;
		showStatus;
		hideAfter;
		return untrack(() => {
			clearTimeout(timer.current);
			if (!showStatus) {
				setChip(false);
				return undefined;
			}
			setChip(true);
			if (status === 'complete' && hideAfter > 0) {
				timer.current = setTimeout(() => setChip(false), hideAfter);
			}
			return () => clearTimeout(timer.current);
		});
	});
	const tick = (now: number) => {
		const s = sim.current;
		const c = live.current;
		const canvas = canvasRef.current;
		const img = printRef.current?.querySelector('img') as HTMLImageElement | null;
		if (!canvas || !img || !img.naturalWidth) {
			s.raf = 0;
			return;
		}
		const dt = Math.min(0.05, s.last ? (now - s.last) / 1000 : 0.016);
		s.last = now;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		build(s, canvas, img, dpr);
		const n = s.levels.length - 1;
		const target = TARGET[c.status] ?? s.p;
		const rate = c.reduce ? 1e9 : 1 / (n * (c.stageDuration / 1000));
		const step = rate * dt;
		if (target < s.p) s.p = target;
		else if (target - s.p <= step) s.p = target;
		else s.p += step;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			const L = s.p * n;
			const i = Math.min(n, Math.floor(L + 1e-6));
			const frac = L - i;
			ctx.globalAlpha = 1;
			ctx.drawImage(s.levels[i], 0, 0);
			if (i < n && frac > 0) {
				const edge = EDGE * dpr;
				const front = frac * (s.h + edge) - edge / 2;
				const top = Math.max(0, Math.floor(front - edge / 2));
				if (top > 0) ctx.drawImage(s.levels[i + 1], 0, 0, s.w, top, 0, 0, s.w, top);
				const sh = edge / STRIPS;
				for (let k = 0; k < STRIPS; k += 1) {
					const y = front - edge / 2 + k * sh;
					if (y + sh <= 0 || y >= s.h) continue;
					const t = 1 - (k + 0.5) / STRIPS;
					ctx.globalAlpha = t * t * (3 - 2 * t);
					const y0 = Math.max(0, y);
					const h0 = Math.min(s.h, y + sh) - y0;
					if (h0 > 0) ctx.drawImage(s.levels[i + 1], 0, y0, s.w, h0, 0, y0, s.w, h0);
				}
				ctx.globalAlpha = 1;
				if (c.sweep && !c.reduce && s.glint && front > 0 && front < s.h) {
					ctx.fillStyle = s.glint;
					ctx.globalAlpha = 0.12;
					ctx.fillRect(0, front - 2 * dpr, s.w, 4 * dpr);
					ctx.globalAlpha = 0.3;
					ctx.fillRect(0, front - dpr, s.w, 2 * dpr);
					ctx.globalAlpha = 1;
				}
			}
		}
		const done = s.p >= 1;
		if (done !== s.sent) {
			s.sent = done;
			setResolved(done);
		}
		const keep = (!c.reduce && ACTIVE.has(c.status)) || Math.abs(target - s.p) > 0.0005;
		s.raf = keep ? requestAnimationFrame(tick) : 0;
		if (!keep) s.last = 0;
	};
	const wake = () => {
		const s = sim.current;
		if (!s.raf) s.raf = requestAnimationFrame(tick);
	};
	$effect(() => {
		return untrack(() => {
			const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
			const sync = () => {
				live.current.reduce = mq.matches;
			};
			sync();
			mq.addEventListener('change', sync);
			return () => mq.removeEventListener('change', sync);
		});
	});
	$effect(() => {
		children;
		status;
		return untrack(() => {
			const img = printRef.current?.querySelector('img') as HTMLImageElement | null;
			if (!img) {
				setMosaic(false);
				return undefined;
			}
			let gone = false;
			const start = () => {
				if (gone) return;
				setMosaic(true);
				wake();
			};
			if (img.complete && img.naturalWidth) start();
			else img.addEventListener('load', start, { once: true });
			return () => {
				gone = true;
				img.removeEventListener('load', start);
			};
		});
	});
	$effect(() => {
		status;
		width;
		aspectRatio;
		return untrack(() => {
			wake();
		});
	});
	$effect(() => {
		return untrack(() => {
			const s = sim.current;
			return () => cancelAnimationFrame(s.raf);
		});
	});
</script>

{#snippet iconSvg(
	shapes: readonly (readonly [string, Record<string, string | number>])[],
	size: number | string,
	strokeWidth: number,
)}<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		>{#each shapes as [tag, attributes]}<svelte:element this={tag} {...attributes} />{/each}</svg
	>{/snippet}
<div
	class={`group relative isolate overflow-hidden text-[12px] leading-none font-medium [width:min(var(--rf-w),100%)] [aspect-ratio:var(--rf-aspect)] [border-radius:var(--rf-radius)] [background:var(--rf-bg)] [color:var(--rf-ink)] [font-family:inherit] ${className ? ` ${className}` : ''}`}
	role="img"
	aria-label={text[status] ?? status}
	aria-busy={active || undefined}
	data-status={status}
	data-active={active ? '' : undefined}
	data-sweep={sweep && active ? '' : undefined}
	data-mosaic={mosaic ? '' : undefined}
	data-resolved={mosaic && resolved ? '' : undefined}
	style={css({
		'--rf-w': `${width}px`,
		'--rf-aspect': aspectRatio,
		'--rf-radius': `${radius}px`,
		'--rf-bg': background,
		'--rf-ink': color,
		'--rf-stage': `${stageDuration}ms`,
		'--rf-blur': `${mosaic ? 0 : stage.blur}px`,
		'--rf-sat': stage.sat,
		'--rf-scale': mosaic ? 1 : stage.scale,
		'--rf-opacity': stage.opacity,
	} as CSSProperties)}
>
	<div
		class="absolute inset-0 [opacity:var(--rf-opacity)] [filter:blur(var(--rf-blur))_saturate(var(--rf-sat))] [transform:scale(var(--rf-scale))] [transition:opacity_var(--rf-stage)_cubic-bezier(0.23,1,0.32,1),filter_var(--rf-stage)_cubic-bezier(0.23,1,0.32,1),transform_var(--rf-stage)_cubic-bezier(0.23,1,0.32,1)] motion-reduce:[transition:opacity_var(--rf-stage)_ease] group-data-[status=queued]:[animation:refine-frame-wait_2.4s_ease-in-out_infinite] motion-reduce:[animation:none]!"
		aria-hidden="true"
	>
		<div
			bind:this={printRef.current}
			class="h-full w-full [transition:opacity_var(--rf-stage)_ease] group-data-[mosaic]:opacity-0 group-data-[resolved]:opacity-100! [&>*]:block [&>*]:h-full [&>*]:w-full [&>*]:object-cover"
		>
			{#if typeof children === 'function'}{@render children()}{:else}{children ?? ''}{/if}
		</div>
		<canvas
			bind:this={canvasRef.current}
			class="pointer-events-none absolute inset-0 h-full w-full opacity-0 [transition:opacity_var(--rf-stage)_ease] group-data-[mosaic]:opacity-100 group-data-[resolved]:opacity-0!"
		></canvas>
	</div>
	<div
		class="pointer-events-none absolute inset-0 opacity-0 [background:linear-gradient(115deg,transparent_38%,color-mix(in_srgb,var(--rf-ink)_14%,transparent)_50%,transparent_62%)] [background-size:260%_100%] [transition:opacity_var(--rf-stage)_ease] group-data-[sweep]:opacity-100 group-data-[sweep]:[animation:refine-frame-sweep_2.2s_linear_infinite] group-data-[mosaic]:opacity-0! group-data-[mosaic]:[animation:none]! motion-reduce:group-data-[sweep]:opacity-0! motion-reduce:group-data-[sweep]:[animation:none]"
		aria-hidden="true"
	></div>
	{#if chip}<div
			class="pointer-events-none absolute bottom-2.5 left-2.5 inline-flex h-[26px] translate-y-0 items-center gap-1.5 rounded-[13px] pr-2.5 pl-2 opacity-100 backdrop-blur-[8px] [background:color-mix(in_srgb,var(--rf-bg)_72%,transparent)] [transition:opacity_200ms_ease,transform_200ms_cubic-bezier(0.23,1,0.32,1)] starting:translate-y-1 starting:opacity-0 motion-reduce:[transition:opacity_200ms_ease]"
			aria-hidden="true"
		>
			<span
				class="inline-flex [color:color-mix(in_srgb,var(--rf-ink)_80%,transparent)] data-[kind=spin]:[animation:refine-frame-spin_1.1s_linear_infinite] data-[kind=error]:text-[#ef4444] motion-reduce:data-[kind=spin]:[animation:none]"
				data-kind={active ? 'spin' : status}
			>
				{#if status === 'complete'}{@render iconSvg(
						Tick02Icon,
						13,
						2.5,
					)}{:else}{#if status === 'error'}{@render iconSvg(
							Alert02Icon,
							13,
							2.2,
						)}{:else}{@render iconSvg(Loading03Icon, 13, 2.2)}{/if}{/if}
			</span>
			<span class="[animation:refine-frame-label_200ms_ease_both]"> {text[status] ?? status} </span>
		</div>{:else}{/if}
	{#if status === 'error' && onRetry}<button
			type="button"
			class="absolute top-1/2 left-1/2 inline-flex h-8 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-1.5 rounded-2xl border-0 pr-3.5 pl-3 text-[13px] font-medium opacity-100 outline-none [background:color-mix(in_srgb,var(--rf-ink)_14%,var(--rf-bg))] [color:var(--rf-ink)] [font-family:inherit] [-webkit-tap-highlight-color:transparent] [transition:opacity_200ms_ease,transform_160ms_cubic-bezier(0.23,1,0.32,1),background-color_150ms_ease] starting:scale-[0.96] starting:opacity-0 active:scale-[0.96] [@media(hover:hover)_and_(pointer:fine)]:hover:[background:color-mix(in_srgb,var(--rf-ink)_20%,var(--rf-bg))] motion-reduce:[transition:opacity_200ms_ease] motion-reduce:active:scale-100"
			onclick={onRetry}
		>
			{@render iconSvg(RefreshIcon, 14, 2.2)} <span>{retryLabel}</span>
		</button>{:else}{/if} <span class="sr-only" role="status"> {text[status] ?? status} </span>
</div>

<style>
	@keyframes -global-refine-frame-sweep {
		from {
			background-position: 130% 0;
		}
		to {
			background-position: -130% 0;
		}
	}
	@keyframes -global-refine-frame-spin {
		to {
			transform: rotate(360deg);
		}
	}
	@keyframes -global-refine-frame-label {
		from {
			opacity: 0;
			filter: blur(2px);
		}
	}
	@keyframes -global-refine-frame-wait {
		0%,
		100% {
			opacity: 0.45;
		}
		50% {
			opacity: 0.65;
		}
	}
</style>
