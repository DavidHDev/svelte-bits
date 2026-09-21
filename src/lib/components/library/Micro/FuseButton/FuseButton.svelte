<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	const Undo02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C8.66873 3 5.76018 4.80989 4.20404 7.5',
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
				d: 'M3 3V4.27816C3 6.47004 3 7.56599 3.70725 8.16512C4.4145 8.76425 5.49553 8.58408 7.6576 8.22373L9 8',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
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
	const Archive02Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M7 21H16.9999C19.3569 21 20.5354 21 21.2677 20.2678C21.9999 19.5355 21.9999 18.357 21.9999 16C21.9999 13.643 21.9999 12.4645 21.2677 11.7322C20.5354 11 19.3569 11 16.9999 11H7C4.64302 11 3.46453 11 2.7323 11.7322C2.00007 12.4644 2.00005 13.6429 2 15.9999C1.99995 18.357 1.99993 19.5355 2.73217 20.2677C3.4644 21 4.64294 21 7 21Z',
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
				d: 'M4 11C4.00005 9.59977 4.00008 8.89966 4.27263 8.36485C4.5123 7.89455 4.89469 7.51218 5.365 7.27253C5.89981 7 6.59993 7 8.00015 7H16C17.4001 7 18.1002 7 18.635 7.27248C19.1054 7.51217 19.4878 7.89462 19.7275 8.36502C20 8.8998 20 9.59987 20 11',
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
				d: 'M6 7C6.00004 5.5998 6.00006 4.89969 6.27259 4.3649C6.51227 3.89457 6.89467 3.51218 7.36501 3.27252C7.89981 3 8.59991 3 10.0001 3H14C15.4001 3 16.1002 3 16.635 3.27248C17.1054 3.51217 17.4878 3.89462 17.7275 4.36502C18 4.8998 18 5.59987 18 7',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '2',
			},
		],
		[
			'path',
			{
				d: 'M16 15L15.7 15.4C15.1111 16.1851 14.8167 16.5777 14.3944 16.7889C13.9721 17 13.4814 17 12.5 17H11.5C10.5186 17 10.0279 17 9.60557 16.7889C9.18328 16.5777 8.88885 16.1851 8.3 15.4L8 15',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '3',
			},
		],
	];
	export type FusePosition = 'outline' | 'bottom' | 'top';
	export type FuseCommitOn = 'press' | 'fuseEnd';
	export type FuseSettle = 'reset' | 'stay';
	export type FusePhase = 'idle' | 'armed' | 'settled';
	export type FuseSize = 'sm' | 'md' | 'lg';
	export interface FuseButtonProps {
		label?: string;
		undoLabel?: string;
		doneLabel?: string;
		icon?: Snippet | string | number | null;
		color?: string;
		background?: string;
		fuseColor?: string;
		size?: FuseSize;
		radius?: number;
		undoWindow?: number;
		fuse?: FusePosition;
		fuseThickness?: number;
		crossfadeMs?: number;
		commitOn?: FuseCommitOn;
		pauseOnHover?: boolean;
		settle?: FuseSettle;
		disabled?: boolean;
		onCommit?: (reason: FuseCommitOn) => void;
		onUndo?: () => void;
		onFuseEnd?: () => void;
		onPhaseChange?: (phase: FusePhase) => void;
		className?: string;
		type?: 'button' | 'submit' | 'reset';
	}
	interface Latest {
		onCommit?: (reason: FuseCommitOn) => void;
		onUndo?: () => void;
		onFuseEnd?: () => void;
		onPhaseChange?: (phase: FusePhase) => void;
		commitOn: FuseCommitOn;
		settle: FuseSettle;
	}
	const LINE: Keyframe[] = [{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }];
	const OUTLINE: Keyframe[] = [{ strokeDashoffset: 0 }, { strokeDashoffset: -1 }];
	const SIZES: Record<FuseSize, { height: number; font: number; icon: number; px: number }> = {
		sm: { height: 36, font: 13, icon: 14, px: 16 },
		md: { height: 44, font: 14, icon: 15, px: 20 },
		lg: { height: 52, font: 15, icon: 17, px: 24 },
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
		label = 'Archive',
		undoLabel = 'Undo',
		doneLabel = 'Archived',
		icon,
		color = '#F5EFE9',
		background = '#3A312A',
		fuseColor = '#D6A46B',
		size = 'md',
		radius = 22,
		undoWindow = 4000,
		fuse = 'outline',
		fuseThickness = 1.5,
		crossfadeMs = 200,
		commitOn = 'press',
		pauseOnHover = true,
		settle = 'reset',
		disabled = false,
		onCommit,
		onUndo,
		onFuseEnd,
		onPhaseChange,
		className = '',
		type = 'button',
	}: FuseButtonProps = $props();
	let phase = $state<FusePhase>(untrack(() => 'idle'));
	function setPhase(value: typeof phase | ((previous: typeof phase) => typeof phase)) {
		phase = typeof value === 'function' ? value(phase) : value;
	}
	let instant = $state(untrack(() => false));
	function setInstant(value: typeof instant | ((previous: typeof instant) => typeof instant)) {
		instant = typeof value === 'function' ? value(instant) : value;
	}
	const rootRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const idleRef = { current: untrack(() => null) as HTMLButtonElement | null };
	const undoRef = { current: untrack(() => null) as HTMLButtonElement | null };
	const lineRef = { current: untrack(() => null) as HTMLElement | null };
	const rimRef = { current: untrack(() => null) as SVGRectElement | null };
	const anim = { current: untrack(() => null) as Animation | null };
	const pause = { current: untrack(() => ({ hover: false, hidden: false, canHoverPause: false })) };
	const lastInput = { current: untrack(() => 'pointer') as 'pointer' | 'keyboard' };
	const windowRef = { current: untrack(() => undoWindow) };
	const latest = { current: untrack(() => ({ commitOn, settle })) as Latest };
	$effect.pre(() => {
		latest.current = { onCommit, onUndo, onFuseEnd, onPhaseChange, commitOn, settle };
	});
	const statusId = $props.id();
	const preset = $derived(SIZES[size] || SIZES.md);
	const go = (next: FusePhase) => {
		setInstant(lastInput.current === 'keyboard');
		setPhase(next);
		latest.current.onPhaseChange?.(next);
	};
	const syncPlayState = () => {
		const a = anim.current;
		if (!a) return;
		const { hover, hidden } = pause.current;
		if (hover || hidden) {
			if (a.playState === 'running') a.pause();
		} else if (a.playState === 'paused') {
			a.play();
		}
	};
	const light = (from = 0) => {
		const el = fuse === 'outline' ? rimRef.current : lineRef.current;
		if (!el) return;
		anim.current?.cancel();
		const a = el.animate(fuse === 'outline' ? OUTLINE : LINE, {
			duration: windowRef.current,
			easing: 'linear',
			fill: 'forwards',
		});
		if (from) a.currentTime = from;
		a.onfinish = () => {
			const l = latest.current;
			l.onFuseEnd?.();
			if (l.commitOn === 'fuseEnd') l.onCommit?.('fuseEnd');
			lastInput.current = 'pointer';
			go(l.settle === 'stay' ? 'settled' : 'idle');
		};
		anim.current = a;
		syncPlayState();
	};
	const arm = () => {
		if (disabled || phase !== 'idle') return;
		windowRef.current = undoWindow;
		light();
		pause.current.canHoverPause = false;
		pause.current.hover = false;
		if (commitOn === 'press') onCommit?.('press');
		go('armed');
	};
	const undo = () => {
		if (phase !== 'armed') return;
		const a = anim.current;
		if (a) {
			a.onfinish = null;
			a.pause();
		}
		onUndo?.();
		go('idle');
	};
	$effect(() => {
		phase;
		return untrack(() => {
			const inside = rootRef.current?.contains(document.activeElement);
			if (phase === 'armed') undoRef.current?.focus({ preventScroll: true });
			else if (inside)
				(phase === 'idle' ? idleRef.current : rootRef.current)?.focus({ preventScroll: true });
		});
	});
	$effect(() => {
		return untrack(() => {
			const onVisibility = () => {
				pause.current.hidden = document.hidden;
				syncPlayState();
			};
			document.addEventListener('visibilitychange', onVisibility);
			return () => {
				document.removeEventListener('visibilitychange', onVisibility);
				anim.current?.cancel();
			};
		});
	});
	$effect(() => {
		fuse;
		return untrack(() => {
			const a = anim.current;
			if (!a || phase !== 'armed') return;
			light(Number(a.currentTime) || 0);
		});
	});
	$effect(() => {
		pauseOnHover;
		return untrack(() => {
			if (pauseOnHover) return;
			pause.current.hover = false;
			syncPlayState();
		});
	});
	const handlePointerDown = (e: PointerEvent & { currentTarget: HTMLSpanElement }) => {
		lastInput.current = 'pointer';
		const pressable = phase === 'armed' || (phase === 'idle' && !disabled);
		if (e.button === 0 && pressable && rootRef.current) rootRef.current.dataset.pressed = '';
	};
	const release = () => {
		if (rootRef.current) delete rootRef.current.dataset.pressed;
	};
	const handlePointerEnter = (e: PointerEvent & { currentTarget: HTMLSpanElement }) => {
		if (pauseOnHover && e.pointerType === 'mouse' && pause.current.canHoverPause) {
			pause.current.hover = true;
			syncPlayState();
		}
	};
	const handlePointerLeave = (e: PointerEvent & { currentTarget: HTMLSpanElement }) => {
		release();
		if (e.pointerType !== 'mouse') return;
		pause.current.canHoverPause = true;
		pause.current.hover = false;
		syncPlayState();
	};
	const handleKeyDown = (e: KeyboardEvent & { currentTarget: HTMLSpanElement }) => {
		if (e.key === 'Enter' || e.key === ' ') lastInput.current = 'keyboard';
		if (e.key === 'Escape' && phase === 'armed') {
			e.preventDefault();
			lastInput.current = 'keyboard';
			undo();
		}
	};
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
{#snippet actionIcon()}{#if icon != null}{#if typeof icon === 'function'}{@render icon()}{:else}{icon ??
				''}{/if}{:else}{@render iconSvg(Archive02Icon, preset.icon, 1.8)}{/if}{/snippet}
{#snippet line()}<i
		bind:this={lineRef.current}
		class="pointer-events-none absolute inset-x-0 bottom-0 h-[var(--fb-fuse-h)] origin-left [background:var(--fb-fuse)] [box-shadow:0_0_6px_color-mix(in_srgb,var(--fb-fuse)_55%,transparent)] group-data-[fuse=top]:top-0 group-data-[fuse=top]:bottom-auto forced-colors:[background:Highlight]"
		aria-hidden="true"
	></i>{/snippet}
<span
	bind:this={rootRef.current}
	tabindex={-1}
	class={`group relative inline-grid h-[var(--fb-h)] grid-cols-[minmax(0,1fr)] isolate touch-manipulation select-none overflow-hidden rounded-[var(--fb-radius)] font-medium leading-none tracking-[0.01em] outline-none [font-family:inherit] [font-size:var(--fb-fs)] [background:var(--fb-bg)] [color:var(--fb-ink)] [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent] [transition:transform_160ms_var(--fb-ease-out)] data-[pressed]:[transform:scale(var(--fb-press))] motion-reduce:data-[pressed]:[transform:none] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-solid has-[:focus-visible]:outline-offset-[3px] has-[:focus-visible]:[outline-color:color-mix(in_srgb,var(--fb-ink)_60%,transparent)] data-[phase=idle]:has-[.fb-idle:disabled]:opacity-[0.55] contrast-more:[box-shadow:inset_0_0_0_1px_color-mix(in_srgb,var(--fb-ink)_40%,transparent)] ${className ? ` ${className}` : ''}`}
	data-phase={phase}
	data-fuse={fuse}
	data-instant={instant ? '' : undefined}
	aria-disabled={phase === 'settled' || undefined}
	style={css({
		'--fb-ink': color,
		'--fb-bg': background,
		'--fb-fuse': fuseColor,
		'--fb-fuse-h': `${fuseThickness}px`,
		'--fb-radius': `${radius}px`,
		'--fb-fade': `${crossfadeMs}ms`,
		'--fb-h': `${preset.height}px`,
		'--fb-fs': `${preset.font}px`,
		'--fb-icon': `${preset.icon}px`,
		'--fb-px': `${preset.px}px`,
		'--fb-press': 0.97,
		'--fb-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
	} as CSSProperties)}
	onpointerdown={handlePointerDown}
	onpointerup={release}
	onpointercancel={release}
	onpointerenter={handlePointerEnter}
	onpointerleave={handlePointerLeave}
	onkeydown={handleKeyDown}
>
	<button
		bind:this={idleRef.current}
		{type}
		class="fb-idle relative [grid-area:1/1] inline-flex h-full w-full min-w-0 items-center justify-center gap-2 m-0 border-0 bg-transparent px-[var(--fb-px)] whitespace-nowrap cursor-pointer invisible opacity-0 [filter:blur(2px)] [color:inherit] [font:inherit] [letter-spacing:inherit] [transition:opacity_var(--fb-fade)_ease,filter_var(--fb-fade)_ease,visibility_0s_linear_var(--fb-fade),background-color_160ms_ease] motion-reduce:[filter:none] motion-reduce:[transition:opacity_var(--fb-fade)_ease,visibility_0s_linear_var(--fb-fade)] group-data-[instant]:[transition-duration:0s] group-data-[phase=idle]:visible group-data-[phase=idle]:opacity-100 group-data-[phase=idle]:[filter:blur(0)] group-data-[phase=idle]:[transition-delay:0s] disabled:cursor-default focus-visible:outline-none [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[background:color-mix(in_srgb,var(--fb-ink)_7%,transparent)]"
		{disabled}
		inert={phase !== 'idle'}
		onclick={arm}
	>
		<span
			class="inline-flex h-[var(--fb-icon)] w-[var(--fb-icon)] [&>svg]:h-full [&>svg]:w-full"
			aria-hidden="true"
		>
			{#if typeof actionIcon === 'function'}{@render actionIcon()}{:else}{actionIcon ?? ''}{/if}
		</span>
		{label}
	</button>
	<button
		bind:this={undoRef.current}
		type="button"
		class="relative [grid-area:1/1] inline-flex h-full w-full min-w-0 items-center justify-center gap-2 m-0 border-0 bg-transparent px-[var(--fb-px)] whitespace-nowrap cursor-pointer invisible opacity-0 [filter:blur(2px)] [color:inherit] [font:inherit] [letter-spacing:inherit] [transition:opacity_var(--fb-fade)_ease,filter_var(--fb-fade)_ease,visibility_0s_linear_var(--fb-fade),background-color_160ms_ease] motion-reduce:[filter:none] motion-reduce:[transition:opacity_var(--fb-fade)_ease,visibility_0s_linear_var(--fb-fade)] group-data-[instant]:[transition-duration:0s] group-data-[phase=armed]:visible group-data-[phase=armed]:opacity-100 group-data-[phase=armed]:[filter:blur(0)] group-data-[phase=armed]:[transition-delay:0s] focus-visible:outline-none [@media(hover:hover)_and_(pointer:fine)]:hover:[background:color-mix(in_srgb,var(--fb-ink)_7%,transparent)]"
		aria-describedby={statusId}
		aria-keyshortcuts="Escape"
		inert={phase !== 'armed'}
		onclick={undo}
	>
		<span
			class="inline-flex h-[var(--fb-icon)] w-[var(--fb-icon)] [&>svg]:h-full [&>svg]:w-full [transform:rotate(-70deg)] [transition:transform_var(--fb-fade)_var(--fb-ease-out)] group-data-[phase=armed]:[transform:rotate(0deg)] motion-reduce:transition-none motion-reduce:[transform:none]"
			aria-hidden="true"
		>
			{@render iconSvg(Undo02Icon, preset.icon, 2)}
		</span>
		{undoLabel}
		{#if fuse !== 'outline'}{#if typeof line === 'function'}{@render line()}{:else}{line ??
					''}{/if}{:else}{/if}
	</button>
	<span
		class="relative [grid-area:1/1] inline-flex h-full w-full min-w-0 items-center justify-center gap-2 m-0 border-0 bg-transparent px-[var(--fb-px)] whitespace-nowrap cursor-pointer invisible opacity-0 [filter:blur(2px)] [color:inherit] [font:inherit] [letter-spacing:inherit] [transition:opacity_var(--fb-fade)_ease,filter_var(--fb-fade)_ease,visibility_0s_linear_var(--fb-fade),background-color_160ms_ease] motion-reduce:[filter:none] motion-reduce:[transition:opacity_var(--fb-fade)_ease,visibility_0s_linear_var(--fb-fade)] group-data-[instant]:[transition-duration:0s] group-data-[phase=settled]:visible group-data-[phase=settled]:opacity-100 group-data-[phase=settled]:[filter:blur(0)] group-data-[phase=settled]:[transition-delay:0s] cursor-default"
		inert={phase !== 'settled'}
	>
		<span
			class="inline-flex h-[var(--fb-icon)] w-[var(--fb-icon)] [&>svg]:h-full [&>svg]:w-full"
			aria-hidden="true"
		>
			{@render iconSvg(Tick02Icon, preset.icon, 2.2)}
		</span>
		{doneLabel}
	</span>
	{#if fuse === 'outline'}<svg
			class="pointer-events-none absolute inset-0 h-full w-full overflow-visible opacity-0 [filter:drop-shadow(0_0_3px_color-mix(in_srgb,var(--fb-fuse)_60%,transparent))] [transition:opacity_var(--fb-fade)_ease] group-data-[phase=armed]:opacity-100 group-data-[instant]:[transition-duration:0s]"
			aria-hidden="true"
		>
			<rect
				bind:this={rimRef.current}
				pathLength="1"
				class="fill-none [x:calc(var(--fb-fuse-h)/2)] [y:calc(var(--fb-fuse-h)/2)] [width:calc(100%-var(--fb-fuse-h))] [height:calc(100%-var(--fb-fuse-h))] [rx:max(0px,calc(var(--fb-radius)-var(--fb-fuse-h)/2))] [stroke:var(--fb-fuse)] [stroke-width:var(--fb-fuse-h)] [stroke-linecap:round] [stroke-dasharray:1] forced-colors:[stroke:Highlight]"
			></rect>
		</svg>{:else}{/if}
	<span class="sr-only" id={statusId} role="status" aria-live="polite">
		{phase === 'idle' ? '' : doneLabel}
	</span>
</span>
