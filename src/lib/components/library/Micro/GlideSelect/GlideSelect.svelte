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
	const ArrowDown01Icon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M18 9.00005C18 9.00005 13.5811 15 12 15C10.4188 15 6 9 6 9',
				stroke: 'currentColor',
				'stroke-linecap': 'round',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
	];
	export interface GlideSelectOption {
		value: string;
		label: Snippet | string | number | null;
		tag?: string;
	}
	export interface GlideSelectProps {
		options?: (string | GlideSelectOption)[];
		value?: string;
		defaultValue?: string;
		onChange?: (value: string, option: GlideSelectOption) => void;
		placeholder?: string;
		showTags?: boolean;
		accentColor?: string;
		surfaceColor?: string;
		highlightColor?: string;
		textColor?: string;
		size?: 'sm' | 'md' | 'lg';
		radius?: number;
		menuWidth?: number;
		placement?: 'top' | 'bottom';
		align?: 'left' | 'right';
		popDuration?: number;
		glideDuration?: number;
		rememberPosition?: boolean;
		disabled?: boolean;
		ariaLabel?: string;
		className?: string;
	}
	type Phase = 'closed' | 'open' | 'closing';
	const SIZES: Record<string, { chip: number; row: number; font: number }> = {
		sm: { chip: 28, row: 26, font: 12 },
		md: { chip: 32, row: 30, font: 13 },
		lg: { chip: 44, row: 40, font: 14 },
	};
	const PAD = 4;
	const GAP = 1;
	const MENU_GAP = 6;
	const DEFAULT_OPTIONS: (string | GlideSelectOption)[] = ['One', 'Two', 'Three'];

	const norm = (o: string | GlideSelectOption): GlideSelectOption =>
		typeof o === 'string' ? { value: o, label: o } : o;
	const textOf = (it: GlideSelectOption) => (typeof it.label === 'string' ? it.label : it.value);
	const typeaheadIndex = (items: GlideSelectOption[], from: number, ch: string) => {
		const c = ch.toLowerCase();
		const n = items.length;
		for (let k = 1; k <= n; k++) {
			const i = (from + k) % n;
			if (textOf(items[i]).toLowerCase().startsWith(c)) return i;
		}
		return from;
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
		options = DEFAULT_OPTIONS,
		value,
		defaultValue,
		onChange,
		placeholder = 'Select…',
		showTags = true,
		accentColor = '#F5EFE9',
		surfaceColor = '#3A312A',
		highlightColor = '#4D4036',
		textColor = '#F5EFE9',
		size = 'md',
		radius = 10,
		menuWidth = 176,
		placement = 'bottom',
		align = 'left',
		popDuration = 180,
		glideDuration = 220,
		rememberPosition = true,
		disabled = false,
		ariaLabel = 'Select',
		className = '',
	}: GlideSelectProps = $props();
	const items = $derived(options.map(norm));
	let inner = $state(untrack(() => defaultValue ?? ''));
	function setInner(nextState: typeof inner | ((previous: typeof inner) => typeof inner)) {
		inner = typeof nextState === 'function' ? nextState(inner) : nextState;
	}
	const current = $derived(value ?? inner);
	const selected = $derived(items.findIndex((it) => it.value === current));
	let phase = $state<Phase>(untrack(() => 'closed'));
	function setPhase(nextState: typeof phase | ((previous: typeof phase) => typeof phase)) {
		phase = typeof nextState === 'function' ? nextState(phase) : nextState;
	}
	let active = $state<number | null>(untrack(() => null));
	function setActive(nextState: typeof active | ((previous: typeof active) => typeof active)) {
		active = typeof nextState === 'function' ? nextState(active) : nextState;
	}
	let side = $state<'top' | 'bottom'>(untrack(() => placement));
	function setSide(nextState: typeof side | ((previous: typeof side) => typeof side)) {
		side = typeof nextState === 'function' ? nextState(side) : nextState;
	}
	const rootRef = { current: untrack(() => null) as HTMLDivElement | null };
	const triggerRef = { current: untrack(() => null) as HTMLButtonElement | null };
	const menuRef = { current: untrack(() => null) as HTMLDivElement | null };
	const pillRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const instant = { current: untrack(() => false) };
	const closeTimer = {
		current: untrack(() => undefined) as ReturnType<typeof setTimeout> | undefined,
	};
	const scrub = { current: untrack(() => null) as { id: number; top: number } | null };
	const id = $props.id();
	const S = $derived(SIZES[size] ?? SIZES.md);
	const step = $derived(S.row + GAP);
	const popOut = $derived(Math.round((popDuration * 2) / 3));
	$effect(() => {
		phase;
		return untrack(() => {
			if (phase !== 'open') return;
			const el = menuRef.current;
			const root = rootRef.current;
			if (!el || !root) return;
			const r = root.getBoundingClientRect();
			const need = el.offsetHeight + MENU_GAP;
			setSide(
				placement === 'bottom' && r.bottom + need > window.innerHeight
					? 'top'
					: placement === 'top' && r.top - need < 0
						? 'bottom'
						: placement,
			);
			el.style.transitionDuration = instant.current ? '0ms' : '';
			el.dataset.state = 'closed';
			void el.offsetHeight;
			el.dataset.state = 'open';
			const p = pillRef.current;
			if (p) {
				p.style.transition = 'none';
				p.style.transform = `translateY(${Math.max(0, selected) * step}px)`;
				p.style.opacity = '0';
				void p.offsetHeight;
				p.style.transition = '';
			}
		});
	});
	$effect(() => {
		active;
		phase;
		step;
		return untrack(() => {
			const p = pillRef.current;
			if (!p || phase !== 'open') return;
			if (active === null) {
				p.style.opacity = '0';
				return;
			}
			const jump = instant.current || p.style.opacity !== '1';
			p.style.transitionDuration = jump ? '0ms, 150ms' : '';
			p.style.transform = `translateY(${active * step}px)`;
			p.style.opacity = '1';
			instant.current = false;
		});
	});
	const open = (viaKey: boolean) => {
		if (disabled) return;
		clearTimeout(closeTimer.current);
		instant.current = true;
		setActive(selected >= 0 ? selected : viaKey ? 0 : null);
		setPhase('open');
	};
	const close = (mode: 'instant' | 'pop') => {
		setActive(null);
		clearTimeout(closeTimer.current);
		const el = menuRef.current;
		if (mode === 'instant' || !el) {
			setPhase('closed');
			return;
		}
		el.style.transitionDuration = '';
		el.dataset.state = 'closed';
		setPhase('closing');
		closeTimer.current = setTimeout(() => setPhase('closed'), popOut + 20);
	};
	const pick = (i: number, viaKey: boolean) => {
		const it = items[i];
		if (!it) {
			close('instant');
			return;
		}
		if (it.value !== current) {
			if (value === undefined) setInner(it.value);
			onChange?.(it.value, it);
			if (!viaKey && rootRef.current) rootRef.current.dataset.swap = '';
		}
		close('instant');
		triggerRef.current?.focus({ preventScroll: true });
	};
	const onTriggerKey = (e: KeyboardEvent & { currentTarget: HTMLButtonElement }) => {
		const k = e.key;
		const n = items.length;
		const cur = active ?? Math.max(0, selected);
		if (phase !== 'open') {
			if (k === 'Enter' || k === ' ' || k === 'ArrowDown' || k === 'ArrowUp') {
				e.preventDefault();
				open(true);
			}
			return;
		}
		const go = (i: number) => {
			e.preventDefault();
			instant.current = true;
			setActive(Math.min(n - 1, Math.max(0, i)));
		};
		if (k === 'ArrowDown' || k === 'ArrowUp')
			go(active === null ? cur : cur + (k === 'ArrowDown' ? 1 : -1));
		else if (k === 'Home' || k === 'End') go(k === 'Home' ? 0 : n - 1);
		else if (k === 'Enter' || k === ' ') {
			e.preventDefault();
			pick(cur, true);
		} else if (k === 'Escape' || k === 'Tab') {
			if (k === 'Escape') e.preventDefault();
			close('instant');
		} else if (k.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey)
			go(typeaheadIndex(items, cur, k));
	};
	$effect(() => {
		phase;
		return untrack(() => {
			if (phase === 'closed') return undefined;
			const onDown = (e: PointerEvent) => {
				if (rootRef.current && !rootRef.current.contains(e.target as Node)) close('pop');
			};
			document.addEventListener('pointerdown', onDown, true);
			return () => document.removeEventListener('pointerdown', onDown, true);
		});
	});
	$effect(() => {
		disabled;
		return untrack(() => {
			if (disabled && phase !== 'closed') close('instant');
		});
	});
	$effect(() => {
		return untrack(() => () => clearTimeout(closeTimer.current));
	});
	const rowAt = (y: number) => {
		const s = scrub.current;
		if (!s) return null;
		const i = Math.floor((y - s.top - PAD) / step);
		return i >= 0 && i < items.length ? i : null;
	};
	const onListDown = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (scrub.current) return;
		try {
			e.currentTarget.setPointerCapture(e.pointerId);
		} catch {}
		scrub.current = { id: e.pointerId, top: e.currentTarget.getBoundingClientRect().top };
		instant.current = true;
		setActive(rowAt(e.clientY));
	};
	const onListMove = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (!scrub.current || scrub.current.id !== e.pointerId) return;
		const i = rowAt(e.clientY);
		if (i !== active) setActive(i);
	};
	const onListUp = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (!scrub.current || scrub.current.id !== e.pointerId) return;
		const i = e.type === 'pointerup' ? rowAt(e.clientY) : null;
		scrub.current = null;
		if (i !== null) pick(i, false);
		else if (!rememberPosition) setActive(null);
	};
	const onListOver = (e: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (e.pointerType === 'touch' || scrub.current) return;
		const row = (e.target as HTMLElement).closest<HTMLElement>('[data-index]');
		if (!row) return;
		const i = Number(row.dataset.index);
		if (i !== active) setActive(i);
	};
	const origin = $derived(`${side === 'bottom' ? 'top' : 'bottom'} ${align}`);
</script>

{#snippet iconSvg(
	shapes: readonly (readonly [string, Record<string, string | number>])[],
	size: number | string,
	strokeWidth: number,
	fill: string = 'none',
)}<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		{fill}
		stroke="currentColor"
		stroke-width={strokeWidth}
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
		>{#each shapes as [tag, attributes]}<svelte:element this={tag} {...attributes} />{/each}</svg
	>{/snippet}
<div
	bind:this={rootRef.current}
	class={`group relative inline-block data-[disabled]:opacity-50 ${className ? ` ${className}` : ''}`}
	data-size={size}
	data-disabled={disabled ? '' : undefined}
	style={css({
		'--gs-accent': accentColor,
		'--gs-surface': surfaceColor,
		'--gs-highlight': highlightColor,
		'--gs-text': textColor,
		'--gs-radius': `${radius}px`,
		'--gs-inner-radius': `${Math.max(3, radius - 4)}px`,
		'--gs-chip': `${S.chip}px`,
		'--gs-row': `${S.row}px`,
		'--gs-font': `${S.font}px`,
		'--gs-menu-w': `${menuWidth}px`,
		'--gs-pop': `${popDuration}ms`,
		'--gs-pop-out': `${popOut}ms`,
		'--gs-glide': `${glideDuration}ms`,
		'--gs-origin': origin,
	} as CSSProperties)}
	onanimationend={(e) => {
		if (e.animationName === 'gs-swap' && rootRef.current) delete rootRef.current.dataset.swap;
	}}
>
	<button
		bind:this={triggerRef.current}
		type="button"
		role="combobox"
		aria-haspopup="listbox"
		aria-expanded={phase === 'open'}
		aria-controls={`${id}-list`}
		aria-activedescendant={active !== null ? `${id}-${active}` : undefined}
		aria-label={ariaLabel}
		{disabled}
		class="group/trigger relative m-0 inline-flex cursor-pointer touch-manipulation items-center gap-1.5 border-0 pr-2 pl-2.5 leading-none font-medium outline-none select-none [-webkit-tap-highlight-color:transparent] [font-family:inherit] [height:var(--gs-chip)] [border-radius:var(--gs-inner-radius)] [background:var(--gs-surface)] [color:var(--gs-text)] [font-size:var(--gs-font)] [transition:background-color_100ms_ease,transform_160ms_cubic-bezier(0.23,1,0.32,1)] disabled:cursor-default enabled:active:scale-[0.97] motion-reduce:enabled:active:scale-100 motion-reduce:[transition:background-color_100ms_ease] aria-expanded:[background:color-mix(in_srgb,var(--gs-highlight)_60%,var(--gs-surface))] [@media(hover:hover)_and_(pointer:fine)]:enabled:hover:[background:color-mix(in_srgb,var(--gs-highlight)_60%,var(--gs-surface))]"
		onpointerdown={(e) => {
			if (e.button !== 0 || disabled) return;
			e.currentTarget.focus({ preventScroll: true });
			if (phase === 'open') close('pop');
			else open(false);
		}}
		onkeydown={onTriggerKey}
	>
		<span
			class="data-[empty]:opacity-60 group-data-[swap]:animate-[gs-swap_160ms_ease] motion-reduce:group-data-[swap]:animate-none"
			data-empty={selected < 0 ? '' : undefined}
		>
			{#if selected >= 0}{@const selectedLabel =
					items[selected]
						.label}{#if typeof selectedLabel === 'function'}{@render selectedLabel()}{:else}{selectedLabel}{/if}{:else}{placeholder}{/if}
		</span>
		<span
			class="inline-flex [color:color-mix(in_srgb,var(--gs-text)_55%,transparent)] [transition:transform_200ms_cubic-bezier(0.23,1,0.32,1)] group-aria-expanded/trigger:rotate-180 motion-reduce:transition-none"
			aria-hidden="true"
		>
			{@render iconSvg(ArrowDown01Icon, 12, 2.5, 'none')}
		</span>
	</button>
	{#if phase !== 'closed'}<div
			bind:this={menuRef.current}
			class="absolute z-20 min-w-full scale-95 p-1 opacity-0 [width:var(--gs-menu-w)] [border-radius:var(--gs-radius)] [background:var(--gs-surface)] [box-shadow:0_4px_16px_color-mix(in_srgb,#000_22%,transparent)] [transform-origin:var(--gs-origin)] [transition:opacity_var(--gs-pop)_cubic-bezier(0.23,1,0.32,1),transform_var(--gs-pop)_cubic-bezier(0.23,1,0.32,1)] data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[state=closed]:pointer-events-none data-[state=closed]:[transition-duration:var(--gs-pop-out)] data-[side=bottom]:top-[calc(100%+6px)] data-[side=top]:bottom-[calc(100%+6px)] data-[align=left]:left-0 data-[align=right]:right-0 motion-reduce:[transform:none]! motion-reduce:[transition:opacity_var(--gs-pop)_ease] motion-reduce:data-[state=closed]:[transition-duration:var(--gs-pop-out)]"
			data-state="open"
			data-side={side}
			data-align={align}
		>
			<div
				id={`${id}-list`}
				role="listbox"
				aria-label={ariaLabel}
				class="group/list relative grid touch-none gap-px"
				data-live={active !== null ? '' : undefined}
				onpointerover={onListOver}
				onpointerleave={() => {
					if (!scrub.current && !rememberPosition) setActive(null);
				}}
				onpointerdown={onListDown}
				onpointermove={onListMove}
				onpointerup={onListUp}
				onpointercancel={onListUp}
				onlostpointercapture={onListUp}
			>
				<span
					bind:this={pillRef.current}
					class="pointer-events-none absolute top-0 right-0 left-0 opacity-0 [height:var(--gs-row)] [border-radius:var(--gs-inner-radius)] [background:var(--gs-highlight)] [transition:transform_var(--gs-glide)_cubic-bezier(0.23,1,0.32,1),opacity_150ms_ease] motion-reduce:[transition:opacity_150ms_ease]"
					aria-hidden="true"
				></span>
				{#each items as it, i}<div
						id={`${id}-${i}`}
						role="option"
						aria-selected={i === selected}
						data-index={i}
						class="relative z-[1] flex cursor-pointer items-center gap-2 pr-2 pl-2.5 select-none [-webkit-tap-highlight-color:transparent] [height:var(--gs-row)] [border-radius:var(--gs-inner-radius)] [color:var(--gs-text)] [font-size:var(--gs-font)] [transition:background-color_150ms_ease] aria-selected:[background:color-mix(in_srgb,var(--gs-highlight)_60%,transparent)] group-data-[live]/list:aria-selected:bg-transparent"
					>
						<span class="min-w-0 flex-1 truncate font-medium"
							>{#if typeof it.label === 'function'}{@render it.label()}{:else}{it.label}{/if}</span
						>
						{#if showTags && it.tag}<span
								class="shrink-0 [color:color-mix(in_srgb,var(--gs-text)_55%,transparent)] [font-size:calc(var(--gs-font)_-_2px)]"
							>
								{it.tag}
							</span>{:else}{/if}
						<span
							class="inline-flex shrink-0 invisible [color:var(--gs-accent)] data-[on]:visible"
							data-on={i === selected ? '' : undefined}
							aria-hidden="true"
						>
							{@render iconSvg(Tick02Icon, 13, 2.5, 'none')}
						</span>
					</div>{/each}
			</div>
		</div>{:else}{/if}
</div>

<style>
	@keyframes -global-gs-swap {
		from {
			opacity: 0.6;
			filter: blur(2px);
		}
	}
</style>
