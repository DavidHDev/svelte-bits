<!-- @svelte-bits
{
  "title": "Scroll Stack",
  "description": "Cards pin and stack as you scroll, settling back into a dimmed deck with smooth, jitter-free motion.",
  "dependencies": []
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';

	export type ScrollStackItem = {
		content: Snippet;
		itemClassName?: string;
		style?: string;
	};

	export type ScrollStackCard = Snippet | ScrollStackItem;

	export interface ScrollStackProps {
		cards: ScrollStackCard[];
		class?: string;
		itemDistance?: number;
		itemStackDistance?: number;
		stackPosition?: number | string;
		itemScale?: number;
		baseScale?: number;
		dimAmount?: number;
		blurAmount?: number;
		tiltAmount?: number;
		rotationAmount?: number;
		holdDistance?: number;
		smoothScroll?: boolean;
		snap?: boolean;
		useWindowScroll?: boolean;
		onStackComplete?: () => void;
	}

	const resolveOffset = (value: number | string, size: number) => {
		if (typeof value === 'number') return value;
		const text = String(value).trim();
		if (text.endsWith('%')) return (parseFloat(text) / 100) * size;
		return parseFloat(text) || 0;
	};

	const toLength = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

	const scrollsInside = (node: Element | null, stop: Element, delta: number) => {
		for (let element: Element | null = node; element && element !== stop; element = element.parentElement) {
			if (element.scrollHeight <= element.clientHeight + 1) continue;
			const overflow = getComputedStyle(element).overflowY;
			if (overflow !== 'auto' && overflow !== 'scroll') continue;
			if (delta > 0 ? element.scrollTop + element.clientHeight < element.scrollHeight - 1 : element.scrollTop > 0) {
				return true;
			}
		}
		return false;
	};

	const CARD_SHADOW = [
		'0 0 0 1px light-dark(rgb(0 0 0 / 0.06), rgb(255 255 255 / 0.08))',
		'0 -12px 40px -16px rgb(0 0 0 / 0.35)',
		'0 24px 48px -24px rgb(0 0 0 / 0.4)'
	].join(', ');

	const toItem = (card: ScrollStackCard): ScrollStackItem =>
		typeof card === 'function' ? { content: card } : card;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	let {
		cards,
		class: className = '',
		itemDistance = 100,
		itemStackDistance = 24,
		stackPosition = '15%',
		itemScale = 0.05,
		baseScale = 0.8,
		dimAmount = 0.2,
		blurAmount = 0,
		tiltAmount = 0,
		rotationAmount = 0,
		holdDistance = 200,
		smoothScroll = true,
		snap = false,
		useWindowScroll = false,
		onStackComplete
	}: ScrollStackProps = $props();

	let rootEl = $state<HTMLDivElement | null>(null);
	let innerEl = $state<HTMLDivElement | null>(null);
	let endEl = $state<HTMLDivElement | null>(null);
	let scheduleUpdate: (() => void) | null = null;

	const items = $derived(cards.map(toItem));

	$effect(() => {
		void [
			items,
			itemDistance,
			itemStackDistance,
			stackPosition,
			itemScale,
			baseScale,
			dimAmount,
			blurAmount,
			tiltAmount,
			rotationAmount,
			holdDistance,
			smoothScroll,
			snap,
			onStackComplete
		];
		untrack(() => scheduleUpdate?.());
	});

	$effect(() => {
		const root = rootEl;
		const inner = innerEl;
		const end = endEl;
		const windowed = useWindowScroll;
		if (!root || !inner || !end) return;

		return untrack(() => {
			const target: Window | HTMLElement = windowed ? window : root;
			const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
			const cache = new Map<string, string | number>();
			let frame = 0;
			let glide = 0;
			let rest = 0;
			let complete = false;
			let gliding = false;
			let pressed = false;
			let current = 0;
			let goal = 0;
			let written = 0;
			let last = 0;
			let points: number[] = [];
			let reach = 0;

			const readScroll = () => (windowed ? window.scrollY : root.scrollTop);
			const maxScroll = () =>
				windowed ? document.documentElement.scrollHeight - window.innerHeight : root.scrollHeight - root.clientHeight;
			const writeScroll = (value: number) => {
				written = value;
				target.scrollTo({ top: value, behavior: 'instant' });
			};

			const write = <T extends string | number>(key: string, value: T, apply: (value: T) => void) => {
				if (cache.get(key) === value) return false;
				cache.set(key, value);
				apply(value);
				return true;
			};

			const update = () => {
				frame = 0;
				const slots = (Array.from(inner.children) as HTMLElement[]).filter((child) =>
					child.hasAttribute('data-stack-slot')
				);
				if (!slots.length) return;

				const viewHeight = windowed ? window.innerHeight : root.clientHeight;
				const viewTop = windowed ? 0 : root.getBoundingClientRect().top + root.clientTop;
				const stackTop = resolveOffset(stackPosition, viewHeight);
				const offset = itemStackDistance;
				const heights = slots.map((slot) => slot.offsetHeight);
				const tops = slots.map((slot) => slot.getBoundingClientRect().top);
				const lastPin = stackTop + (slots.length - 1) * offset;
				const padTop = windowed ? 0 : stackTop;
				const endHeight =
					holdDistance + (windowed ? 0 : Math.max(0, viewHeight - lastPin - heights[heights.length - 1]));

				let moved = write('padTop', padTop, (value) => {
					inner.style.paddingTop = `${value}px`;
				});
				moved =
					write('endHeight', endHeight, (value) => {
						end.style.height = `${value}px`;
					}) || moved;

				let flow = inner.getBoundingClientRect().top - viewTop + readScroll() + padTop;
				points = heights.map((height, i) => {
					const point = flow - stackTop - i * offset;
					flow += height + itemDistance;
					return point;
				});
				reach = Math.max(40, (heights[0] + itemDistance - offset) / 2);

				const depths = slots.map(() => 0);
				let lastCover = 0;
				for (let j = 1; j < slots.length; j++) {
					const pinBefore = viewTop + stackTop + (j - 1) * offset;
					const start = pinBefore + heights[j - 1];
					const span = Math.max(1, start - pinBefore - offset);
					const cover = Math.min(1, Math.max(0, (start - tops[j]) / span));
					for (let i = 0; i < j; i++) depths[i] += cover;
					lastCover = cover;
				}

				const dimStep = Math.min(Math.max(dimAmount, 0), 1);
				slots.forEach((slot, i) => {
					const card = slot.firstElementChild as HTMLElement | null;
					if (!card) return;
					const depth = depths[i];
					const lean = Math.min(depth, 1);
					const scale = Math.max(Math.min(baseScale, 1), 1 - depth * itemScale);
					const tilt = -lean * tiltAmount;
					const turn = lean * rotationAmount * (i % 2 ? -1 : 1);
					const blur = depth * blurAmount;
					const dim = 1 - Math.pow(1 - dimStep, depth);
					const transform =
						depth < 0.0005
							? ''
							: `perspective(1200px) rotateX(${tilt.toFixed(2)}deg) rotate(${turn.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
					write(`transform${i}`, transform, (value) => {
						card.style.transform = value;
					});
					write(`filter${i}`, blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : '', (value) => {
						card.style.filter = value;
					});
					write(`dim${i}`, dim.toFixed(3), (value) => {
						card.style.setProperty('--scroll-stack-dim', value);
					});
				});

				const done = slots.length > 1 && lastCover >= 0.999;
				if (done !== complete) {
					complete = done;
					if (done) onStackComplete?.();
				}

				if (moved) schedule();
			};

			const schedule = () => {
				if (!frame) frame = requestAnimationFrame(update);
			};

			const step = (now: number) => {
				const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
				last = now;
				if (Math.abs(readScroll() - written) > 2) {
					gliding = false;
					glide = 0;
					settleSoon();
					return;
				}
				current += (goal - current) * (1 - Math.pow(0.9, dt * 60));
				if (Math.abs(goal - current) < 0.5) current = goal;
				writeScroll(current);
				if (current === goal) {
					gliding = false;
					glide = 0;
					settleSoon();
					return;
				}
				glide = requestAnimationFrame(step);
			};

			const glideTo = (value: number) => {
				goal = Math.min(Math.max(value, 0), maxScroll());
				if (motion.matches) {
					writeScroll(goal);
					return;
				}
				if (gliding) return;
				gliding = true;
				current = readScroll();
				written = current;
				last = performance.now();
				glide = requestAnimationFrame(step);
			};

			const settle = () => {
				rest = 0;
				if (!snap || gliding || pressed || !points.length) return;
				const now = readScroll();
				const nearest = points.reduce((best, point) => (Math.abs(point - now) < Math.abs(best - now) ? point : best));
				const gap = Math.abs(nearest - now);
				if (gap > 1 && gap < reach) glideTo(nearest);
			};

			const settleSoon = () => {
				window.clearTimeout(rest);
				rest = window.setTimeout(settle, 140);
			};

			const onScroll = () => {
				schedule();
				if (!gliding) settleSoon();
			};

			const onWheel = (input: Event) => {
				const event = input as WheelEvent;
				if (!smoothScroll || motion.matches || event.defaultPrevented || event.ctrlKey) return;
				if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
				const page = windowed ? window.innerHeight : root.clientHeight;
				const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page : 1);
				if (!delta || scrollsInside(event.target as Element | null, windowed ? document.body : root, delta)) return;
				const base = gliding ? goal : readScroll();
				if ((delta < 0 && base <= 0) || (delta > 0 && base >= maxScroll() - 0.5)) return;
				event.preventDefault();
				window.clearTimeout(rest);
				glideTo(base + delta);
			};

			const onPress = () => {
				pressed = true;
				window.clearTimeout(rest);
			};

			const onRelease = () => {
				if (!pressed) return;
				pressed = false;
				settleSoon();
			};

			const observer = new ResizeObserver(schedule);
			observer.observe(root);
			observer.observe(inner);
			target.addEventListener('scroll', onScroll, { passive: true });
			target.addEventListener('wheel', onWheel, { passive: false });
			target.addEventListener('pointerdown', onPress, { passive: true });
			window.addEventListener('pointerup', onRelease, { passive: true });
			window.addEventListener('pointercancel', onRelease, { passive: true });
			window.addEventListener('resize', schedule);
			scheduleUpdate = schedule;
			update();

			return () => {
				cancelAnimationFrame(frame);
				cancelAnimationFrame(glide);
				window.clearTimeout(rest);
				observer.disconnect();
				target.removeEventListener('scroll', onScroll);
				target.removeEventListener('wheel', onWheel);
				target.removeEventListener('pointerdown', onPress);
				window.removeEventListener('pointerup', onRelease);
				window.removeEventListener('pointercancel', onRelease);
				window.removeEventListener('resize', schedule);
				scheduleUpdate = null;
			};
		});
	});
</script>

<div
	bind:this={rootEl}
	class={`relative w-full ${useWindowScroll ? '' : 'h-full overflow-x-hidden overflow-y-auto'} ${className}`.trim()}
>
	<div bind:this={innerEl} class="relative px-[clamp(1rem,6%,5rem)]">
		{#each items as item, index (index)}
			{@const gap = itemDistance - (items.length - index) * itemStackDistance}
			{#if index > 0}
				<div aria-hidden="true" style="height: {Math.max(0, gap)}px; margin-top: {Math.min(0, gap)}px;"></div>
			{/if}
			<div
				data-stack-slot=""
				class="sticky"
				style="top: calc({toLength(stackPosition)} + {index * itemStackDistance}px); margin-bottom: {(items.length -
					1 -
					index) *
					itemStackDistance}px; z-index: {index + 1};"
			>
				<div
					class={`relative box-border h-80 w-full origin-top rounded-[28px] p-10 [background:light-dark(#ffffff,#18181b)] [color:light-dark(#18181b,#fafafa)] will-change-transform ${item.itemClassName ?? ''}`.trim()}
					style="box-shadow: {CARD_SHADOW};{item.style ? ` ${item.style}` : ''}"
				>
					{@render item.content()}
					<span
						aria-hidden="true"
						class="pointer-events-none absolute inset-0 rounded-[inherit] bg-black opacity-[var(--scroll-stack-dim,0)]"
					></span>
				</div>
			</div>
		{/each}
		<div bind:this={endEl} aria-hidden="true"></div>
	</div>
</div>
