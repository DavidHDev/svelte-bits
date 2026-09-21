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
	const SparklesIcon: readonly (readonly [string, Record<string, string | number>])[] = [
		[
			'path',
			{
				d: 'M15 2L15.5387 4.39157C15.9957 6.42015 17.5798 8.00431 19.6084 8.46127L22 9L19.6084 9.53873C17.5798 9.99569 15.9957 11.5798 15.5387 13.6084L15 16L14.4613 13.6084C14.0043 11.5798 12.4202 9.99569 10.3916 9.53873L8 9L10.3916 8.46127C12.4201 8.00431 14.0043 6.42015 14.4613 4.39158L15 2Z',
				stroke: 'currentColor',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '0',
			},
		],
		[
			'path',
			{
				d: 'M7 12L7.38481 13.7083C7.71121 15.1572 8.84275 16.2888 10.2917 16.6152L12 17L10.2917 17.3848C8.84275 17.7112 7.71121 18.8427 7.38481 20.2917L7 22L6.61519 20.2917C6.28879 18.8427 5.15725 17.7112 3.70827 17.3848L2 17L3.70827 16.6152C5.15725 16.2888 6.28879 15.1573 6.61519 13.7083L7 12Z',
				stroke: 'currentColor',
				'stroke-linejoin': 'round',
				'stroke-width': '1.5',
				key: '1',
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
	export type ThoughtLineGlyph = 'sparkle' | 'dot' | 'none' | Snippet | string | number | null;
	export interface ThoughtLineProps {
		label?: string;
		doneLabel?: string;
		renderLabel?: Snippet<[text: string, working: boolean]>;
		glyph?: ThoughtLineGlyph;
		steps?: string[];
		collapsible?: boolean;
		collapseOnSettle?: boolean;
		color?: string;
		glyphColor?: string;
		fontSize?: number;
		breathPeriod?: number;
		breathDepth?: number;
		shimmer?: boolean;
		shimmerDuration?: number;
		settleDuration?: number;
		settleBlur?: number;
		working?: boolean;
		settleAfter?: number;
		elapsed?: number;
		showTimer?: boolean;
		onSettle?: (seconds: number) => void;
		className?: string;
		style?: CSSProperties;
	}
	const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];
	const EASE_IN_OUT: [number, number, number, number] = [0.77, 0, 0.175, 1];
	const GLYPH_DONE = 0.55;
	const EMPTY_STEPS: string[] = [];
	const fmt = (ds: number) =>
		ds < 600
			? `${(ds / 10).toFixed(1)}s`
			: `${Math.floor(ds / 600)}m ${((ds % 600) / 10).toFixed(1)}s`;
	const spoken = (ds: number) =>
		ds < 600
			? `${(ds / 10).toFixed(1)} seconds`
			: `${Math.floor(ds / 600)} minutes ${((ds % 600) / 10).toFixed(1)} seconds`;

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
	import { untrack, onMount } from 'svelte';
	import { animate } from 'motion';
	let {
		label = 'Thinking…',
		doneLabel = '',
		renderLabel,
		glyph = 'sparkle',
		steps = EMPTY_STEPS,
		collapsible = true,
		collapseOnSettle = true,
		color = 'currentColor',
		glyphColor = '',
		fontSize = 16,
		breathPeriod = 1.6,
		breathDepth = 0.45,
		shimmer = true,
		shimmerDuration = 1.8,
		settleDuration = 350,
		settleBlur = 2,
		working = true,
		settleAfter = 0,
		elapsed,
		showTimer = true,
		onSettle,
		className = '',
		style,
	}: ThoughtLineProps = $props();
	import type { AnimationPlaybackControls } from 'motion';
	let reduce = $state(false);
	onMount(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		reduce = media.matches;
		const change = () => {
			reduce = media.matches;
		};
		media.addEventListener('change', change);
		return () => media.removeEventListener('change', change);
	});
	let autoSettled = $state(untrack(() => false));
	function setAutoSettled(
		value: typeof autoSettled | ((previous: typeof autoSettled) => typeof autoSettled),
	) {
		autoSettled = typeof value === 'function' ? value(autoSettled) : value;
	}
	let open = $state(untrack(() => true));
	function setOpen(value: typeof open | ((previous: typeof open) => typeof open)) {
		open = typeof value === 'function' ? value(open) : value;
	}
	const isWorking = $derived(working && !autoSettled);
	const doneText = $derived(doneLabel || (showTimer ? 'Thought for' : 'Done thinking'));
	const hasTrace = $derived(steps.length > 0);
	const depth = $derived(reduce ? Math.min(breathDepth, 0.2) : breathDepth);
	const period = $derived(reduce ? breathPeriod * 1.5 : breathPeriod);
	const trough = $derived(1 - depth);
	const sheen = $derived(shimmer && !reduce);
	const glyphRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const breathRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const timerRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const stackRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const workRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const doneRef = { current: untrack(() => null) as HTMLSpanElement | null };
	const dsRef = { current: untrack(() => 0) };
	const prevWorking = { current: untrack(() => isWorking) };
	const latest = { current: untrack(() => ({})) as { onSettle?: (seconds: number) => void } };
	$effect.pre(() => {
		latest.current = { onSettle };
	});
	let announce = $state(untrack(() => label));
	function setAnnounce(value: typeof announce | ((previous: typeof announce) => typeof announce)) {
		announce = typeof value === 'function' ? value(announce) : value;
	}
	$effect(() => {
		working;
		return untrack(() => {
			if (working) setAutoSettled(false);
		});
	});
	$effect(() => {
		isWorking;
		collapseOnSettle;
		return untrack(() => {
			if (isWorking) setOpen(true);
			else if (collapseOnSettle) setOpen(false);
		});
	});
	$effect(() => {
		isWorking;
		period;
		depth;
		trough;
		settleDuration;
		glyph;
		sheen;
		return untrack(() => {
			const glyphEl = glyphRef.current;
			const breathEl = breathRef.current;
			if (!breathEl) return undefined;
			const s = settleDuration / 1000;
			const loop = (el: HTMLElement, delay: number) =>
				animate(
					el,
					{ opacity: [trough, 1, trough] },
					{ duration: period, ease: EASE_IN_OUT, repeat: Infinity, delay },
				);
			let cancelled = false;
			const running: AnimationPlaybackControls[] = [];
			if (isWorking) {
				if (depth > 0) {
					if (sheen)
						running.push(animate(breathEl, { opacity: 1 }, { duration: 0.2, ease: EASE_OUT }));
					if (glyphEl) {
						const lead = animate(glyphEl, { opacity: trough }, { duration: 0.2, ease: EASE_OUT });
						running.push(lead);
						lead.then(() => {
							if (cancelled) return;
							running.push(loop(glyphEl, 0));
							if (!sheen) running.push(loop(breathEl, 0.14));
						});
					} else if (!sheen) {
						running.push(loop(breathEl, 0.14));
					}
				} else {
					if (glyphEl)
						running.push(animate(glyphEl, { opacity: 1 }, { duration: 0.2, ease: EASE_OUT }));
					running.push(animate(breathEl, { opacity: 1 }, { duration: 0.2, ease: EASE_OUT }));
				}
			} else {
				if (glyphEl)
					running.push(animate(glyphEl, { opacity: GLYPH_DONE }, { duration: s, ease: EASE_OUT }));
				running.push(animate(breathEl, { opacity: 1 }, { duration: s, ease: EASE_OUT }));
			}
			return () => {
				cancelled = true;
				running.forEach((a) => a.stop());
			};
		});
	});
	const paint = (ds: number) => {
		dsRef.current = ds;
		if (timerRef.current) timerRef.current.textContent = fmt(ds);
	};
	$effect(() => {
		isWorking;
		elapsed;
		settleAfter;
		return untrack(() => {
			if (elapsed != null) {
				paint(Math.round(elapsed * 10));
				return undefined;
			}
			if (!isWorking) return undefined;
			const startedAt = performance.now();
			paint(0);
			const id = setInterval(() => {
				const ds = Math.floor((performance.now() - startedAt) / 100);
				paint(ds);
				if (settleAfter > 0 && ds >= Math.round(settleAfter * 10)) setAutoSettled(true);
			}, 100);
			return () => clearInterval(id);
		});
	});
	$effect(() => {
		isWorking;
		label;
		doneText;
		fontSize;
		showTimer;
		return untrack(() => {
			const t = timerRef.current;
			const stack = stackRef.current;
			if (!t || !stack) return undefined;
			const place = (glide: boolean) => {
				const active = isWorking ? workRef.current : doneRef.current;
				if (!active) return;
				const shift = active.offsetWidth - stack.offsetWidth;
				if (!glide) t.style.transition = 'none';
				t.style.transform = `translateX(${shift}px)`;
				if (!glide) {
					void t.offsetWidth;
					t.style.transition = '';
				}
			};
			place(prevWorking.current !== isWorking);
			prevWorking.current = isWorking;
			const ro = new ResizeObserver(() => place(false));
			if (workRef.current) ro.observe(workRef.current);
			if (doneRef.current) ro.observe(doneRef.current);
			return () => ro.disconnect();
		});
	});
	$effect(() => {
		isWorking;
		return untrack(() => {
			if (isWorking) {
				setAnnounce(label);
				return;
			}
			setAnnounce(showTimer ? `${doneText} ${spoken(dsRef.current)}` : doneText);
			latest.current.onSettle?.(dsRef.current / 10);
		});
	});
	const toggle = $derived(hasTrace && collapsible);
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
{#snippet head()}
	{#if glyph !== 'none'}<span
			bind:this={glyphRef.current}
			class="mr-[0.2em] inline-flex h-[1.1em] w-[1.1em] flex-none [color:var(--tl-glyph)] [&>svg]:block [&>svg]:h-full [&>svg]:w-full"
			aria-hidden="true"
		>
			{#if glyph === 'sparkle'}{@render iconSvg(
					SparklesIcon,
					'100%',
					2,
				)}{:else}{#if glyph === 'dot'}<span
						class="m-auto h-[0.5em] w-[0.5em] rounded-full bg-current"
					></span>{:else}{#if typeof glyph === 'function'}{@render glyph()}{:else}{glyph ??
							''}{/if}{/if}{/if}
		</span>{:else}{/if}
	<span bind:this={stackRef.current} class="inline-grid" aria-hidden="true">
		<span
			bind:this={workRef.current}
			class="w-max opacity-0 [grid-area:1/1] [filter:blur(var(--tl-blur))] [transition:opacity_var(--tl-settle)_cubic-bezier(0.23,1,0.32,1),filter_var(--tl-settle)_cubic-bezier(0.23,1,0.32,1)] data-[active]:opacity-100 data-[active]:[filter:blur(0)] motion-reduce:[filter:none]! motion-reduce:[transition:opacity_var(--tl-settle)_ease]"
			data-active={isWorking ? '' : undefined}
		>
			<span
				bind:this={breathRef.current}
				class="inline-block group-data-[working]:data-[shimmer]:bg-clip-text group-data-[working]:data-[shimmer]:text-transparent group-data-[working]:data-[shimmer]:[background-image:linear-gradient(100deg,color-mix(in_srgb,var(--tl-color)_50%,transparent)_30%,var(--tl-color)_50%,color-mix(in_srgb,var(--tl-color)_50%,transparent)_70%)] group-data-[working]:data-[shimmer]:[background-size:250%_100%] group-data-[working]:data-[shimmer]:[background-position:125%_0] group-data-[working]:data-[shimmer]:[-webkit-text-fill-color:transparent] group-data-[working]:data-[shimmer]:[animation:thought-line-shimmer_var(--tl-shimmer)_linear_infinite]"
				data-shimmer={sheen ? '' : undefined}
			>
				{#if renderLabel}{@render renderLabel(label, true)}{:else}{label}{/if}
			</span>
		</span>
		<span
			bind:this={doneRef.current}
			class="w-max opacity-0 [grid-area:1/1] [filter:blur(var(--tl-blur))] [transition:opacity_var(--tl-settle)_cubic-bezier(0.23,1,0.32,1),filter_var(--tl-settle)_cubic-bezier(0.23,1,0.32,1)] data-[active]:[opacity:var(--tl-done)] data-[active]:[filter:blur(0)] motion-reduce:[filter:none]! motion-reduce:[transition:opacity_var(--tl-settle)_ease]"
			data-active={isWorking ? undefined : ''}
		>
			{#if renderLabel}{@render renderLabel(doneText, false)}{:else}{doneText}{/if}
		</span>
	</span>
	{#if showTimer}<span
			bind:this={timerRef.current}
			class="tabular-nums [opacity:var(--tl-timer)] [transition:opacity_var(--tl-settle)_ease,transform_var(--tl-settle)_cubic-bezier(0.77,0,0.175,1)] data-[done]:[opacity:var(--tl-done)] motion-reduce:[transition:opacity_var(--tl-settle)_ease]"
			data-done={isWorking ? undefined : ''}
			aria-hidden="true"
		>
			0.0s
		</span>{:else}{/if}
	{#if collapsible}<span
			class="ml-[0.1em] inline-flex opacity-0 [transition:opacity_200ms_ease,transform_200ms_cubic-bezier(0.23,1,0.32,1)] data-[on]:opacity-55 group-data-[open]:rotate-180"
			data-on={hasTrace ? '' : undefined}
			aria-hidden="true"
		>
			{@render iconSvg(ArrowDown01Icon, '1em', 2.2)}
		</span>{:else}{/if} <span class="sr-only" role="status"> {announce} </span>
{/snippet}
<div
	class={`group inline-flex flex-col items-start leading-[1.2] font-medium [color:var(--tl-color)] [font-family:inherit] [font-size:var(--tl-font)] ${className ? ` ${className}` : ''}`}
	data-working={isWorking ? '' : undefined}
	data-open={open && hasTrace ? '' : undefined}
	style={css({
		'--tl-done': 0.75,
		'--tl-timer': 0.55,
		'--tl-font': `${fontSize}px`,
		'--tl-color': color,
		'--tl-glyph': glyphColor || color,
		'--tl-settle': `${settleDuration}ms`,
		'--tl-blur': `${settleBlur}px`,
		'--tl-shimmer': `${shimmerDuration}s`,
		...style,
	} as CSSProperties)}
>
	{#if collapsible}<button
			type="button"
			class="relative m-0 inline-flex cursor-default items-center gap-[0.3em] border-0 bg-transparent p-0 text-left whitespace-nowrap text-inherit outline-none [font:inherit] data-[toggle]:cursor-pointer data-[toggle]:[-webkit-tap-highlight-color:transparent]"
			data-toggle={toggle ? '' : undefined}
			aria-expanded={toggle ? open : undefined}
			tabindex={toggle ? 0 : -1}
			onclick={() => {
				if (toggle) setOpen((v) => !v);
			}}
		>
			{#if typeof head === 'function'}{@render head()}{:else}{head ?? ''}{/if}
		</button>{:else}<div
			class="relative m-0 inline-flex cursor-default items-center gap-[0.3em] border-0 bg-transparent p-0 text-left whitespace-nowrap text-inherit outline-none [font:inherit] data-[toggle]:cursor-pointer data-[toggle]:[-webkit-tap-highlight-color:transparent]"
		>
			{#if typeof head === 'function'}{@render head()}{:else}{head ?? ''}{/if}
		</div>{/if}
	{#if hasTrace}<div
			class="grid w-0 min-w-full [grid-template-rows:0fr] [transition:grid-template-rows_var(--tl-settle)_cubic-bezier(0.23,1,0.32,1)] data-[open]:[grid-template-rows:1fr]"
			data-open={open ? '' : undefined}
			aria-hidden={!open}
		>
			<div class="min-h-0 overflow-x-visible overflow-y-clip">
				<div
					class="flex w-max flex-col gap-[0.45em] pt-[0.6em] pb-[0.2em] pl-[1.6em] text-[0.875em] font-normal whitespace-nowrap"
				>
					{#each steps as text, i}{@const done = !isWorking || i < steps.length - 1}
						<div
							class="group/step flex translate-y-0 items-center gap-[0.5em] opacity-100 [transition:opacity_200ms_cubic-bezier(0.23,1,0.32,1),transform_200ms_cubic-bezier(0.23,1,0.32,1)] starting:-translate-y-1 starting:opacity-0 motion-reduce:[transform:none]! motion-reduce:[transition:opacity_200ms_ease]"
							data-done={done ? '' : undefined}
						>
							<span
								class="inline-grid h-[1em] w-[1em] flex-none place-items-center opacity-55"
								aria-hidden="true"
							>
								{#if done}{@render iconSvg(Tick02Icon, '1em', 2.5)}{:else}<i
										class="block h-[0.4em] w-[0.4em] rounded-full bg-current [animation:thought-line-pulse_1.6s_cubic-bezier(0.77,0,0.175,1)_infinite] motion-reduce:[animation-duration:2.4s]"
									></i>{/if}
							</span>
							<span
								class="[transition:opacity_var(--tl-settle)_ease] group-data-[done]/step:opacity-55"
							>
								{text}
							</span>
						</div>{/each}
				</div>
			</div>
		</div>{:else}{/if}
</div>

<style>
	@keyframes -global-thought-line-pulse {
		0%,
		100% {
			opacity: 0.55;
		}
		50% {
			opacity: 1;
		}
	}
	@keyframes -global-thought-line-shimmer {
		to {
			background-position: -125% 0;
		}
	}
</style>
