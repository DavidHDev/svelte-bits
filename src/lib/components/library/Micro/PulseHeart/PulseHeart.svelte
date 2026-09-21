<script module lang="ts">
	type CSSProperties = Record<string, string | number | undefined | null>;
	import type { Snippet } from 'svelte';
	const ThumbsUpIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M2 12.5C2 11.3954 2.89543 10.5 4 10.5C5.65685 10.5 7 11.8431 7 13.5V17.5C7 19.1569 5.65685 20.5 4 20.5C2.89543 20.5 2 19.6046 2 18.5V12.5Z',
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
				d: 'M15.4787 7.80626L15.2124 8.66634C14.9942 9.37111 14.8851 9.72349 14.969 10.0018C15.0369 10.2269 15.1859 10.421 15.389 10.5487C15.64 10.7065 16.0197 10.7065 16.7791 10.7065H17.1831C19.7532 10.7065 21.0382 10.7065 21.6452 11.4673C21.7145 11.5542 21.7762 11.6467 21.8296 11.7437C22.2965 12.5921 21.7657 13.7351 20.704 16.0211C19.7297 18.1189 19.2425 19.1678 18.338 19.7852C18.2505 19.8449 18.1605 19.9013 18.0683 19.9541C17.116 20.5 15.9362 20.5 13.5764 20.5H13.0646C10.2057 20.5 8.77628 20.5 7.88814 19.6395C7 18.7789 7 17.3939 7 14.6239V13.6503C7 12.1946 7 11.4668 7.25834 10.8006C7.51668 10.1344 8.01135 9.58664 9.00069 8.49112L13.0921 3.96056C13.1947 3.84694 13.246 3.79012 13.2913 3.75075C13.7135 3.38328 14.3652 3.42464 14.7344 3.84235C14.774 3.8871 14.8172 3.94991 14.9036 4.07554C15.0388 4.27205 15.1064 4.37031 15.1654 4.46765C15.6928 5.33913 15.8524 6.37436 15.6108 7.35715C15.5838 7.46692 15.5488 7.5801 15.4787 7.80626Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
			},
		],
	];
	const StarIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	const FavouriteIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M10.4107 19.9677C7.58942 17.858 2 13.0348 2 8.69444C2 5.82563 4.10526 3.5 7 3.5C8.5 3.5 10 4 12 6C14 4 15.5 3.5 17 3.5C19.8947 3.5 22 5.82563 22 8.69444C22 13.0348 16.4106 17.858 13.5893 19.9677C12.6399 20.6776 11.3601 20.6776 10.4107 19.9677Z',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	export type PulseHeartIcon = 'heart' | 'star' | 'thumb';
	export interface PulseHeartProps {
		liked?: boolean;
		defaultLiked?: boolean;
		count?: number;
		onChange?: (liked: boolean, count: number) => void;
		showCount?: boolean;
		icon?: PulseHeartIcon | Snippet | string | number | null;
		idleOutline?: boolean;
		size?: number;
		corner?: number;
		likedColor?: string;
		idleColor?: string;
		pillColor?: string;
		textColor?: string;
		duration?: number;
		dotSize?: number;
		overshoot?: number;
		beat?: number;
		rollDuration?: number;
		disabled?: boolean;
		label?: string;
		className?: string;
	}
	type IconData = readonly (readonly [string, { readonly [key: string]: string | number }])[];
	type Roll = { a: string; b: string; at: number; up: boolean };
	type Cell = { ch: string } | { top: string; bottom: string };
	const OUT = 0.4;
	const ICONS: Record<PulseHeartIcon, IconData> = {
		heart: FavouriteIcon,
		star: StarIcon,
		thumb: ThumbsUpIcon,
	};
	const back = (k: number, c: number) => {
		const u = k - 1;
		return 1 + (c + 1) * u ** 3 + c * u ** 2;
	};
	const swellOf = (t: number, c: number) =>
		t <= 0 ? 0 : t < OUT ? 1 - (1 - t / OUT) ** 3 : 1 - back((t - OUT) / (1 - OUT), c);
	const format = (n: number) => new Intl.NumberFormat().format(n);
	const reducedMotion = () =>
		typeof window !== 'undefined' &&
		!!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
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
		liked: likedProp,
		defaultLiked = false,
		count = 0,
		onChange,
		showCount = true,
		icon = 'heart',
		idleOutline = true,
		size = 40,
		corner = 32,
		likedColor = '#D9896A',
		idleColor = '#9F8C7B',
		pillColor = '#332B24',
		textColor = '#F5EFE9',
		duration = 560,
		dotSize = 0.3,
		overshoot = 1.7,
		beat = 3,
		rollDuration = 350,
		disabled = false,
		label = 'Like',
		className = '',
	}: PulseHeartProps = $props();
	const controlled = $derived(likedProp !== undefined);
	let inner = $state(untrack(() => defaultLiked));
	function setInner(value: typeof inner | ((previous: typeof inner) => typeof inner)) {
		inner = typeof value === 'function' ? value(inner) : value;
	}
	let total = $state(untrack(() => count));
	function setTotal(value: typeof total | ((previous: typeof total) => typeof total)) {
		total = typeof value === 'function' ? value(total) : value;
	}
	const liked = $derived(likedProp ?? inner);
	let shown = $state(untrack(() => ({ liked, count })));
	function setShown(value: typeof shown | ((previous: typeof shown) => typeof shown)) {
		shown = typeof value === 'function' ? value(shown) : value;
	}
	let roll = $state<Roll | null>(untrack(() => null));
	function setRoll(value: typeof roll | ((previous: typeof roll) => typeof roll)) {
		roll = typeof value === 'function' ? value(roll) : value;
	}
	const rootRef = { current: untrack(() => null) as HTMLButtonElement | null };
	const pillRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const heartRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const glyphRef = { current: untrack(() => null) as SVGGElement | null };
	const rollRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const raf = { current: untrack(() => 0) };
	const rollTimer = {
		current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined,
	};
	const viaPointer = { current: untrack(() => false) };
	const shownRef = { current: untrack(() => shown) };
	const logical = { current: untrack(() => ({ liked, count: total })) };
	$effect.pre(() => {
		logical.current = { liked, count: total };
	});
	const cfg = { current: untrack(() => ({ duration, dotSize, overshoot, beat, rollDuration })) };
	$effect.pre(() => {
		cfg.current = { duration, dotSize, overshoot, beat, rollDuration };
	});
	$effect(() => {
		count;
		return untrack(() => {
			setTotal(count);
		});
	});
	$effect(() => {
		liked;
		total;
		return untrack(() => {
			if (raf.current) return;
			if (shownRef.current.liked === liked && shownRef.current.count === total) return;
			shownRef.current = { liked, count: total };
			setShown(shownRef.current);
		});
	});
	$effect(() => {
		shown;
		return untrack(() => {
			const root = rootRef.current;
			if (!root || root.dataset.instant === undefined) return;
			root.getBoundingClientRect();
			delete root.dataset.instant;
		});
	});
	$effect(() => {
		roll;
		return untrack(() => {
			const el = rollRef.current;
			if (!el || !roll) return;
			el.style.transition = 'none';
			el.style.transform = `translateY(${roll.up ? '0' : '-1em'})`;
			el.getBoundingClientRect();
			el.style.transition = '';
			el.style.transform = `translateY(${roll.up ? '-1em' : '0'})`;
		});
	});
	$effect(() => {
		return untrack(() => () => {
			cancelAnimationFrame(raf.current);
			clearTimeout(rollTimer.current);
		});
	});
	const startRoll = (from: number, to: number) => {
		if (from === to) return;
		const a = format(from);
		const b = format(to);
		const changed =
			a.length === b.length ? [...b].flatMap((ch, i) => (ch !== a[i] ? [i] : [])) : [];
		setRoll({ a, b, at: changed.length === 1 ? changed[0] : -1, up: to > from });
		clearTimeout(rollTimer.current);
		rollTimer.current = setTimeout(() => setRoll(null), cfg.current.rollDuration);
	};
	const run = (nextLiked: boolean, nextCount: number) => {
		const root = rootRef.current;
		const heart = heartRef.current;
		const pill = pillRef.current;
		if (!root || !heart || !pill) return;
		const glyph = glyphRef.current;
		root.dataset.running = '';
		let swapped = false;
		let prev = 0;
		const t0 = performance.now();
		const tick = (now: number) => {
			const { duration: D, dotSize: dot, overshoot: c, beat: B } = cfg.current;
			const t = Math.min(1, (now - t0) / D);
			const step = prev ? now - prev : 1000 / 60;
			prev = now;
			const s = swellOf(t, c);
			const k = 1 - (1 - dot) * s;
			if (glyph) glyph.setAttribute('transform', `translate(12 12) scale(${k}) translate(-12 -12)`);
			else heart.style.transform = `scale(${k})`;
			pill.style.transform = `scale(${1 - (B / 100) * s})`;
			if (!swapped && t + step / 2 / D >= OUT) {
				swapped = true;
				root.dataset.liked = String(nextLiked);
				startRoll(shownRef.current.count, nextCount);
				shownRef.current = { liked: nextLiked, count: nextCount };
				setShown(shownRef.current);
			}
			if (t < 1) {
				raf.current = requestAnimationFrame(tick);
				return;
			}
			raf.current = 0;
			if (glyph) glyph.removeAttribute('transform');
			heart.style.transform = '';
			pill.style.transform = '';
			delete root.dataset.running;
			const l = logical.current;
			if (l.liked !== shownRef.current.liked || l.count !== shownRef.current.count) {
				shownRef.current = { liked: l.liked, count: l.count };
				setShown(shownRef.current);
			}
		};
		raf.current = requestAnimationFrame(tick);
	};
	const handlePointerDown = (e: PointerEvent & { currentTarget: HTMLButtonElement }) => {
		if (e.button !== 0 || disabled) return;
		viaPointer.current = true;
		if (!reducedMotion() && rootRef.current) rootRef.current.dataset.pressed = '';
	};
	const handlePointerUp = () => {
		if (rootRef.current) delete rootRef.current.dataset.pressed;
	};
	const handlePointerCancel = () => {
		viaPointer.current = false;
		handlePointerUp();
	};
	const handleKeyDown = () => {
		viaPointer.current = false;
	};
	const handleClick = (e: MouseEvent & { currentTarget: HTMLButtonElement }) => {
		if (disabled || raf.current) return;
		const pointer = viaPointer.current && e.detail !== 0;
		viaPointer.current = false;
		const nextLiked = !liked;
		const nextCount = total + (nextLiked ? 1 : -1);
		if (!controlled) setInner(nextLiked);
		setTotal(nextCount);
		onChange?.(nextLiked, nextCount);
		if (pointer && !reducedMotion()) run(nextLiked, nextCount);
		else if (rootRef.current) rootRef.current.dataset.instant = '';
	};
	const paths = $derived(
		typeof icon === 'string' ? ICONS[icon as PulseHeartIcon] || ICONS.heart : null,
	);
	const text = $derived(format(shown.count));
	const cells: Cell[] = $derived.by(() => {
		const currentRoll = roll;
		return currentRoll
			? currentRoll.at === -1
				? [
						{
							top: currentRoll.up ? currentRoll.a : currentRoll.b,
							bottom: currentRoll.up ? currentRoll.b : currentRoll.a,
						},
					]
				: [...currentRoll.b].map((ch, i) =>
						i === currentRoll.at
							? {
									top: currentRoll.up ? currentRoll.a[i] : ch,
									bottom: currentRoll.up ? ch : currentRoll.a[i],
								}
							: { ch },
					)
			: [...text].map((ch) => ({ ch }));
	});
</script>

<button
	bind:this={rootRef.current}
	type="button"
	aria-pressed={liked}
	{disabled}
	data-liked={String(shown.liked)}
	data-solid={idleOutline ? undefined : ''}
	data-no-count={showCount ? undefined : ''}
	class={`group relative m-0 inline-flex cursor-pointer touch-manipulation select-none items-center justify-center border-0 bg-transparent p-0 outline-none [font-family:inherit] [color:var(--ph-text)] rounded-[var(--ph-corner)] [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] [transition:transform_160ms_var(--ph-ease-out)] data-[pressed]:[transform:scale(0.97)] focus-visible:outline-offset-[3px] focus-visible:[outline:2px_solid_color-mix(in_srgb,var(--ph-liked)_60%,transparent)] disabled:cursor-default disabled:opacity-[0.55] motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11 ${className ? ` ${className}` : ''}`}
	style={css({
		'--ph-size': `${size}px`,
		'--ph-corner': `${corner}px`,
		'--ph-pill': pillColor,
		'--ph-idle': idleColor,
		'--ph-liked': likedColor,
		'--ph-text': textColor,
		'--ph-roll': `${rollDuration}ms`,
		'--ph-stroke': `${(1.5 * size) / 24}px`,
		'--ph-ease-out': 'cubic-bezier(0.23, 1, 0.32, 1)',
	} as CSSProperties)}
	onpointerdown={handlePointerDown}
	onpointerup={handlePointerUp}
	onpointerleave={handlePointerUp}
	onpointercancel={handlePointerCancel}
	onkeydown={handleKeyDown}
	onclick={handleClick}
>
	<span
		bind:this={pillRef.current}
		class="inline-flex origin-center items-center [gap:calc(var(--ph-size)*0.25)] [padding:calc(var(--ph-size)*0.3)] [padding-inline-end:calc(var(--ph-size)*0.4)] group-data-[no-count]:[padding-inline-end:calc(var(--ph-size)*0.3)] rounded-[var(--ph-corner)] [background:var(--ph-pill)] [@media(prefers-contrast:more)]:[box-shadow:inset_0_0_0_1px_color-mix(in_srgb,var(--ph-text)_25%,transparent)]"
	>
		<span
			bind:this={heartRef.current}
			class="block h-[var(--ph-size)] w-[var(--ph-size)] origin-center [color:var(--ph-idle)] [transition:color_160ms_ease] group-data-[liked=true]:[color:var(--ph-liked)] group-data-[running]:transition-none group-data-[instant]:transition-none motion-reduce:[transition:color_200ms_ease] [&_svg]:block [&_svg]:h-full [&_svg]:w-full [&_svg]:overflow-visible [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:[stroke-width:var(--ph-stroke)] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round] group-data-[liked=true]:[&_svg]:fill-current group-data-[solid]:[&_svg]:fill-current [@media(hover:hover)_and_(pointer:fine)]:group-enabled:group-hover:group-data-[liked=false]:[color:color-mix(in_srgb,var(--ph-idle)_45%,var(--ph-liked))]"
			aria-hidden="true"
		>
			{#if paths}<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
					<g bind:this={glyphRef.current}>
						{#each paths as [, attrs]}<path d={String(attrs.d)} vector-effect="non-scaling-stroke"
							></path>{/each}
					</g>
				</svg>{:else}{#if typeof icon === 'function'}{@render icon()}{:else}{icon ?? ''}{/if}{/if}
		</span>
		{#if showCount}<span
				class="inline-flex font-semibold leading-none tracking-[-0.1px] tabular-nums [font-size:calc(var(--ph-size)*0.5)] [color:var(--ph-text)] [&>span]:block [&>span]:h-[1em]"
				aria-hidden="true"
			>
				{#each cells as cell, i}{#if 'ch' in cell}<span>{cell.ch}</span>{:else}<span
							class="relative overflow-hidden"
						>
							<span
								bind:this={rollRef.current}
								class="flex flex-col [transition:transform_var(--ph-roll)_var(--ph-ease-out)] motion-reduce:transition-none [&>span]:block [&>span]:h-[1em] [&>span]:leading-none"
							>
								<span>{cell.top}</span> <span>{cell.bottom}</span>
							</span>
						</span>{/if}{/each}
			</span>{:else}{/if}
		<span class="sr-only">{showCount ? `${label}, ${format(total)}` : label}</span>
	</span>
</button>
