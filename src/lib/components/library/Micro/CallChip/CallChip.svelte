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
	const Search01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M17 17L21 21',
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
				d: 'M19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19C15.4183 19 19 15.4183 19 11Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
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
	const PencilEdit01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M15.2141 5.98239L16.6158 4.58063C17.39 3.80646 18.6452 3.80646 19.4194 4.58063C20.1935 5.3548 20.1935 6.60998 19.4194 7.38415L18.0176 8.78591M15.2141 5.98239L6.98023 14.2163C5.93493 15.2616 5.41226 15.7842 5.05637 16.4211C4.70047 17.058 4.3424 18.5619 4 20C5.43809 19.6576 6.94199 19.2995 7.57889 18.9436C8.21579 18.5877 8.73844 18.0651 9.78375 17.0198L18.0176 8.78591M15.2141 5.98239L18.0176 8.78591',
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
				d: 'M11 20H17',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const File02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M8 17H16',
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
				d: 'M8 13H12',
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
				d: 'M13 2.5V3C13 5.82843 13 7.24264 13.8787 8.12132C14.7574 9 16.1716 9 19 9H19.5M20 10.6569V14C20 17.7712 20 19.6569 18.8284 20.8284C17.6569 22 15.7712 22 12 22C8.22876 22 6.34315 22 5.17157 20.8284C4 19.6569 4 17.7712 4 14V9.45584C4 6.21082 4 4.58831 4.88607 3.48933C5.06508 3.26731 5.26731 3.06508 5.48933 2.88607C6.58831 2 8.21082 2 11.4558 2C12.1614 2 12.5141 2 12.8372 2.11401C12.9044 2.13772 12.9702 2.165 13.0345 2.19575C13.3436 2.34355 13.593 2.593 14.0919 3.09188L18.8284 7.82843C19.4065 8.40649 19.6955 8.69552 19.8478 9.06306C20 9.4306 20 9.83935 20 10.6569Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
	];
	const CommandLineIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M14 4H10C6.22876 4 4.34315 4 3.17157 5.17157C2 6.34315 2 8.22876 2 12C2 15.7712 2 17.6569 3.17157 18.8284C4.34315 20 6.22876 20 10 20H14C17.7712 20 19.6569 20 20.8284 18.8284C22 17.6569 22 15.7712 22 12C22 8.22876 22 6.34315 20.8284 5.17157C19.6569 4 17.7712 4 14 4Z',
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
				d: 'M7 9L8.83981 10.5858C9.61327 11.2525 10 11.5858 10 12C10 12.4142 9.61327 12.7475 8.83981 13.4142L7 15',
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
				d: 'M13 16H17',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
	];
	export type CallChipStatus = 'idle' | 'running' | 'done' | 'error';
	export type CallChipIcon = 'terminal' | 'file' | 'search' | 'edit';
	export interface CallChipProps {
		icon?: CallChipIcon | Snippet | string | number | null;
		name?: string;
		argument?: string;
		status?: CallChipStatus;
		expectedMs?: number;
		size?: number;
		radius?: number;
		color?: string;
		surfaceColor?: string;
		progressColor?: string;
		progressOpacity?: number;
		doneColor?: string;
		errorColor?: string;
		washOpacity?: number;
		shake?: number;
		showTimer?: boolean;
		onRetry?: () => void;
		className?: string;
		style?: CSSProperties;
	}
	type Glyph = 'tool' | 'check' | 'retry';
	const HOLD_AT = 0.9;
	const SHAKE = [0, -1, 1, -0.66, 0.66, -0.33, 0];
	const ICONS: Record<CallChipIcon, typeof CommandLineIcon> = {
		terminal: CommandLineIcon,
		file: File02Icon,
		search: Search01Icon,
		edit: PencilEdit01Icon,
	};
	const WORDS: Record<CallChipStatus, string> = {
		running: 'running',
		done: 'done',
		error: 'failed',
		idle: 'queued',
	};
	const fmt = (ms: number) => (ms < 10000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(1)} s`);
	const reduceMotion = () =>
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
	const glyphOf = (s: CallChipStatus): Glyph =>
		s === 'done' ? 'check' : s === 'error' ? 'retry' : 'tool';
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
		icon = 'terminal',
		name = 'bash',
		argument = 'npm test',
		status = 'running',
		expectedMs = 2500,
		size = 34,
		radius = 10,
		color = 'currentColor',
		surfaceColor = '#3A312A',
		progressColor = 'currentColor',
		progressOpacity = 0.08,
		doneColor = '#22c55e',
		errorColor = '#ef4444',
		washOpacity = 0.14,
		shake = 6,
		showTimer = true,
		onRetry,
		className = '',
		style,
	}: CallChipProps = $props();
	const rootRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const fillRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const timerRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const mountedRef = { current: untrack(() => false) };
	const fraction = { current: untrack(() => 0) };
	const clock = { current: untrack(() => ({ ms: 0 })) };
	const shakeAnim = { current: untrack(() => null) as Animation | null };
	const statusRef = { current: untrack(() => status) };
	$effect.pre(() => {
		statusRef.current = status;
	});
	let mounted = $state(untrack(() => false));
	function setMounted(value: typeof mounted | ((previous: typeof mounted) => typeof mounted)) {
		mounted = typeof value === 'function' ? value(mounted) : value;
	}
	let pressed = $state(untrack(() => false));
	function setPressed(value: typeof pressed | ((previous: typeof pressed) => typeof pressed)) {
		pressed = typeof value === 'function' ? value(pressed) : value;
	}
	let announce = $state(untrack(() => ''));
	function setAnnounce(value: typeof announce | ((previous: typeof announce) => typeof announce)) {
		announce = typeof value === 'function' ? value(announce) : value;
	}
	const roll = $state({
		current: untrack(() => ({ cur: glyphOf(status), prev: null })) as {
			cur: Glyph;
			prev: Glyph | null;
		},
	});
	$effect.pre(() => {
		if (glyphOf(status) !== roll.current.cur)
			roll.current = { cur: glyphOf(status), prev: roll.current.cur };
	});
	const setFraction = (f: number, instant: boolean) => {
		const fill = fillRef.current;
		if (!fill) return;
		fraction.current = f;
		if (instant) fill.style.transition = 'none';
		fill.style.transform = `scaleX(${f})`;
		if (instant) {
			void fill.getBoundingClientRect();
			fill.style.transition = '';
		}
	};
	const apply = (s: CallChipStatus, animate: boolean) => {
		if (s === 'running') {
			shakeAnim.current?.cancel();
			setFraction(0, true);
			if (animate) setFraction(HOLD_AT, false);
		} else if (s === 'done') {
			setFraction(1, !animate);
		} else if (s === 'error') {
			const fill = fillRef.current;
			const live = fill ? new DOMMatrix(getComputedStyle(fill).transform).a : fraction.current;
			setFraction(Math.min(1, Math.max(0, live)), true);
			if (animate && shake > 0 && !reduceMotion() && rootRef.current) {
				shakeAnim.current = rootRef.current.animate(
					SHAKE.map((k) => ({
						transform: `translateX(${k * shake}px)`,
						easing: 'cubic-bezier(0.77, 0, 0.175, 1)',
					})),
					{ duration: 450, composite: 'add' },
				);
			}
		} else setFraction(0, true);
	};
	$effect(() => {
		return untrack(() => {
			mountedRef.current = true;
			setMounted(true);
			apply(statusRef.current, statusRef.current === 'running');
			return () => {
				mountedRef.current = false;
				shakeAnim.current?.cancel();
			};
		});
	});
	$effect(() => {
		status;
		return untrack(() => {
			if (mountedRef.current) apply(status, true);
		});
	});
	$effect(() => {
		status;
		return untrack(() => {
			const write = (ms: number) => {
				clock.current.ms = ms;
				if (timerRef.current) timerRef.current.textContent = fmt(ms);
			};
			if (status !== 'running') {
				if ((status === 'idle' || !clock.current.ms) && timerRef.current)
					timerRef.current.textContent = '—';
				return undefined;
			}
			const startedAt = performance.now();
			write(0);
			if (reduceMotion()) {
				const id = setInterval(() => write(performance.now() - startedAt), 100);
				return () => {
					clearInterval(id);
					write(performance.now() - startedAt);
				};
			}
			let raf = 0;
			const tick = () => {
				write(performance.now() - startedAt);
				raf = requestAnimationFrame(tick);
			};
			tick();
			return () => {
				cancelAnimationFrame(raf);
				write(performance.now() - startedAt);
			};
		});
	});
	$effect(() => {
		status;
		return untrack(() => {
			const ms = showTimer && clock.current.ms ? Math.round(clock.current.ms) : 0;
			const when =
				status === 'done' && ms
					? ` in ${ms} ms`
					: status === 'error' && ms
						? ` after ${ms} ms`
						: '';
			setAnnounce(`${name} ${argument}, ${WORDS[status] ?? status}${when}`);
		});
	});
	const font = $derived(Math.max(11, Math.round(size * 0.38)));
	const glyphState = (g: Glyph) =>
		g === roll.current.cur ? 'in' : g === roll.current.prev ? 'out' : undefined;
	const toolIcon = $derived(
		typeof icon === 'string' ? (ICONS[icon as CallChipIcon] ?? ICONS.terminal) : null,
	);
	const iconSize = $derived(font + 2);
</script>

{#snippet iconSvg(
	shapes: readonly (readonly [string, Record<string, string | number>])[],
	size: number,
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
<span
	bind:this={rootRef.current}
	role="status"
	aria-busy={status === 'running' || undefined}
	data-status={status}
	data-mounted={mounted ? '' : undefined}
	data-pressed={pressed ? '' : undefined}
	class={`group relative box-border inline-flex items-center overflow-hidden leading-none whitespace-nowrap select-none [-webkit-touch-callout:none] [height:var(--cc-size)] [padding:0_var(--cc-pad)] [gap:var(--cc-gap)] [border-radius:var(--cc-radius)] [background:var(--cc-surface)] [color:var(--cc-color)] [font-size:var(--cc-font)] [transition:transform_160ms_cubic-bezier(0.23,1,0.32,1)] data-[status=error]:cursor-pointer data-[pressed]:scale-[0.97] motion-reduce:data-[pressed]:scale-100 ${className ? ` ${className}` : ''}`}
	style={css({
		'--cc-size': `${size}px`,
		'--cc-font': `${font}px`,
		'--cc-pad': `${Math.round(size * 0.35)}px`,
		'--cc-gap': `${Math.round(font * 0.55)}px`,
		'--cc-radius': `${radius}px`,
		'--cc-color': color,
		'--cc-surface': surfaceColor,
		'--cc-progress': progressColor,
		'--cc-progress-pct': `${progressOpacity * 100}%`,
		'--cc-done': doneColor,
		'--cc-error': errorColor,
		'--cc-wash-pct': `${washOpacity * 100}%`,
		'--cc-expected': `${expectedMs}ms`,
		...style,
	} as CSSProperties)}
>
	<span
		bind:this={fillRef.current}
		class="pointer-events-none absolute inset-0 origin-left scale-x-0 [clip-path:inset(0_0_0_0)] [background:color-mix(in_srgb,var(--cc-progress)_var(--cc-progress-pct),transparent)] group-data-[status=running]:[transition:transform_var(--cc-expected)_linear] group-data-[status=done]:[clip-path:inset(100%_0_0_0)] group-data-[status=done]:[background:color-mix(in_srgb,var(--cc-done)_var(--cc-wash-pct),transparent)] group-data-[status=done]:[transition:transform_200ms_cubic-bezier(0.23,1,0.32,1),background-color_120ms_ease,clip-path_400ms_cubic-bezier(0.23,1,0.32,1)_200ms] group-data-[status=error]:[background:color-mix(in_srgb,var(--cc-error)_var(--cc-wash-pct),transparent)] group-data-[status=error]:[transition:background-color_200ms_ease] motion-reduce:group-data-[status=done]:[clip-path:inset(0_0_0_0)] motion-reduce:group-data-[status=done]:[transition:background-color_120ms_ease] group-not-data-[mounted]:transition-none!"
		aria-hidden="true"
	></span>
	<span
		class="relative flex-none overflow-hidden [width:calc(var(--cc-font)+2px)] [height:calc(var(--cc-font)+2px)]"
		aria-hidden="true"
	>
		<span
			class="absolute inset-0 grid place-items-center opacity-0 blur-[3px] [transform:translateY(70%)] data-[state=in]:opacity-100 data-[state=in]:blur-none data-[state=in]:[transform:none] data-[state=in]:[transition:opacity_240ms_cubic-bezier(0.23,1,0.32,1),transform_240ms_cubic-bezier(0.23,1,0.32,1),filter_240ms_cubic-bezier(0.23,1,0.32,1)] data-[state=out]:[transform:translateY(-70%)] data-[state=out]:[transition:opacity_160ms_cubic-bezier(0.23,1,0.32,1),transform_160ms_cubic-bezier(0.23,1,0.32,1),filter_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[status=done]:data-[state=in]:[color:var(--cc-done)] group-data-[status=error]:data-[state=in]:[color:var(--cc-error)] motion-reduce:[transform:none]! motion-reduce:[filter:none]! group-not-data-[mounted]:transition-none!"
			data-state={glyphState('tool')}
		>
			{#if toolIcon}{@render iconSvg(
					toolIcon,
					iconSize,
					1.8,
				)}{:else}{#if typeof icon === 'function'}{@render icon()}{:else}{icon ?? ''}{/if}{/if}
		</span>
		<span
			class="absolute inset-0 grid place-items-center opacity-0 blur-[3px] [transform:translateY(70%)] data-[state=in]:opacity-100 data-[state=in]:blur-none data-[state=in]:[transform:none] data-[state=in]:[transition:opacity_240ms_cubic-bezier(0.23,1,0.32,1),transform_240ms_cubic-bezier(0.23,1,0.32,1),filter_240ms_cubic-bezier(0.23,1,0.32,1)] data-[state=out]:[transform:translateY(-70%)] data-[state=out]:[transition:opacity_160ms_cubic-bezier(0.23,1,0.32,1),transform_160ms_cubic-bezier(0.23,1,0.32,1),filter_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[status=done]:data-[state=in]:[color:var(--cc-done)] group-data-[status=error]:data-[state=in]:[color:var(--cc-error)] motion-reduce:[transform:none]! motion-reduce:[filter:none]! group-not-data-[mounted]:transition-none!"
			data-state={glyphState('check')}
		>
			{@render iconSvg(Tick02Icon, iconSize, 2.2)}
		</span>
		<span
			class="absolute inset-0 grid place-items-center opacity-0 blur-[3px] [transform:translateY(70%)] data-[state=in]:opacity-100 data-[state=in]:blur-none data-[state=in]:[transform:none] data-[state=in]:[transition:opacity_240ms_cubic-bezier(0.23,1,0.32,1),transform_240ms_cubic-bezier(0.23,1,0.32,1),filter_240ms_cubic-bezier(0.23,1,0.32,1)] data-[state=out]:[transform:translateY(-70%)] data-[state=out]:[transition:opacity_160ms_cubic-bezier(0.23,1,0.32,1),transform_160ms_cubic-bezier(0.23,1,0.32,1),filter_160ms_cubic-bezier(0.23,1,0.32,1)] group-data-[status=done]:data-[state=in]:[color:var(--cc-done)] group-data-[status=error]:data-[state=in]:[color:var(--cc-error)] motion-reduce:[transform:none]! motion-reduce:[filter:none]! group-not-data-[mounted]:transition-none!"
			data-state={glyphState('retry')}
		>
			{@render iconSvg(RefreshIcon, iconSize, 2)}
		</span>
	</span> <span class="relative font-medium" aria-hidden="true"> {name} </span>
	<span class="relative opacity-[0.72]" aria-hidden="true"> {argument} </span>
	{#if showTimer}<span
			bind:this={timerRef.current}
			class="relative min-w-[6ch] text-right tabular-nums opacity-50"
			aria-hidden="true"
		>
			0 ms
		</span>{:else}{/if}
	{#if status === 'error' && onRetry}<button
			type="button"
			class="absolute -inset-[5px] m-0 cursor-pointer touch-manipulation appearance-none border-0 bg-transparent p-0 outline-none [border-radius:var(--cc-radius)] [-webkit-tap-highlight-color:transparent]"
			aria-label={`Retry ${name} ${argument}`}
			onclick={() => onRetry()}
			onpointerdown={() => setPressed(true)}
			onpointerup={() => setPressed(false)}
			onpointercancel={() => setPressed(false)}
		></button>{:else}{/if} <span class="sr-only">{announce}</span>
</span>
