<!-- @svelte-bits
{
  "title": "Gradual Blur",
  "description": "Progressive edge blur for headers, footers, captions and carousels, with an optional fade to color that hides at the ends of a scroll.",
  "dependencies": []
}
-->
<script module lang="ts">
	export type GradualBlurPosition = 'top' | 'bottom' | 'left' | 'right';
	export type GradualBlurCurve = 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';
	export type GradualBlurContainer = Element | string | { current: Element | null } | null;

	export interface GradualBlurProps {
		position?: GradualBlurPosition;
		target?: 'parent' | 'page';
		height?: string | number;
		width?: string | number;
		strength?: number;
		layers?: number;
		curve?: GradualBlurCurve;
		exponential?: boolean;
		opacity?: number;
		saturation?: number;
		tint?: string;
		autoHide?: boolean;
		container?: GradualBlurContainer;
		hoverIntensity?: number;
		duration?: number | string;
		easing?: string;
		zIndex?: number;
		className?: string;
		class?: string;
		style?: string;
	}

	const CURVES: Record<string, (t: number) => number> = {
		linear: (t) => t,
		bezier: (t) => t * t * (3 - 2 * t),
		'ease-in': (t) => t * t,
		'ease-out': (t) => 1 - (1 - t) * (1 - t),
		'ease-in-out': (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
	};

	const DIRECTIONS: Record<string, string> = { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' };

	const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

	const toLength = (value: string | number) => (typeof value === 'number' ? `${value}px` : value);

	const toTime = (value: string | number) => (typeof value === 'number' ? `${value}s` : value);

	const toStyle = (entries: Record<string, string | number | undefined | null>) =>
		Object.entries(entries)
			.filter(([, value]) => value !== undefined && value !== null && value !== '')
			.map(([key, value]) => `${key}: ${value}`)
			.join('; ');

	const findScroller = (
		container: GradualBlurContainer | undefined,
		root: HTMLElement,
		target: string,
		vertical: boolean
	): Element | Window | null => {
		if (container) {
			if (typeof container === 'string') return document.querySelector(container);
			return container instanceof Element ? container : container.current;
		}
		if (target === 'page') return window;
		const parent = root.parentElement;
		if (!parent) return null;
		const scrolls = (node: Element) => {
			const style = getComputedStyle(node);
			return /(auto|scroll|overlay)/.test(vertical ? style.overflowY : style.overflowX);
		};
		const sibling = Array.from(parent.children).find((child) => child !== root && scrolls(child));
		return sibling || (scrolls(parent) ? parent : null);
	};
</script>

<script lang="ts">
	let {
		position = 'bottom',
		target = 'parent',
		height = '6rem',
		width,
		strength = 2,
		layers = 8,
		curve = 'linear',
		exponential = true,
		opacity = 1,
		saturation = 1,
		tint = 'transparent',
		autoHide = false,
		container,
		hoverIntensity = 1,
		duration = 0.3,
		easing = 'ease-out',
		zIndex = 1000,
		className = '',
		class: klass = '',
		style = ''
	}: GradualBlurProps = $props();

	let root = $state<HTMLDivElement | null>(null);
	let reveal = $state<string | null>(null);
	let hover = $state<string | null>(null);

	const edge = $derived<GradualBlurPosition>(DIRECTIONS[position] ? position : 'bottom');
	const vertical = $derived(edge === 'top' || edge === 'bottom');

	const stack = $derived.by(() => {
		const count = Math.min(Math.max(Math.round(layers) || 1, 1), 16);
		const shape = CURVES[curve] || CURVES.linear;
		const maxBlur = Math.max(strength, 0) * 12;
		const level = (u: number) => {
			const t = shape(clamp01(u));
			return maxBlur * (exponential ? (Math.pow(2, 4 * t) - 1) / 15 : t);
		};
		const boost = Math.pow(Math.max(saturation, 0), 1 / count);
		const fade = `${toTime(duration)} ${easing}`;
		const direction = DIRECTIONS[edge];
		const steps: string[] = [];
		for (let i = 0; i < count; i++) {
			const from = level(i / count);
			const to = level((i + 1) / count);
			const radius = Math.sqrt(Math.max(to * to - from * from, 0));
			const filter = [
				`blur(calc(${radius.toFixed(3)}px * var(--gradual-blur-reveal, 1) * var(--gradual-blur-hover, 1)))`,
				boost !== 1 ? `saturate(calc(1 + ${(boost - 1).toFixed(4)} * var(--gradual-blur-reveal, 1)))` : ''
			]
				.filter(Boolean)
				.join(' ');
			const mask = `linear-gradient(${direction}, transparent ${((i / count) * 100).toFixed(2)}%, #000 ${(((i + 1) / count) * 100).toFixed(2)}%)`;
			steps.push(
				toStyle({
					position: 'absolute',
					inset: 0,
					'border-radius': 'inherit',
					'backdrop-filter': filter,
					'-webkit-backdrop-filter': filter,
					'mask-image': mask,
					'-webkit-mask-image': mask,
					opacity,
					transition: `backdrop-filter ${fade}, -webkit-backdrop-filter ${fade}`
				})
			);
		}
		const stops = Array.from({ length: 9 }, (_, k) => {
			const u = k / 8;
			const t = shape(u);
			const alpha = t * t * t * (t * (t * 6 - 15) + 10);
			return `rgba(0, 0, 0, ${alpha.toFixed(3)}) ${(u * 100).toFixed(1)}%`;
		}).join(', ');
		const tintMask = `linear-gradient(${direction}, ${stops})`;
		const wash =
			tint && tint !== 'transparent'
				? toStyle({
						position: 'absolute',
						inset: 0,
						'border-radius': 'inherit',
						background: tint,
						'mask-image': tintMask,
						'-webkit-mask-image': tintMask,
						opacity: 'calc(var(--gradual-blur-reveal, 1) * min(var(--gradual-blur-hover, 1), 1))',
						transition: `opacity ${fade}`
					})
				: null;
		return { steps, wash };
	});

	$effect(() => {
		const el = root;
		const hide = autoHide;
		const source0 = container;
		const mode = target;
		const side = edge;
		const isVertical = vertical;
		if (!el) return;
		if (!hide) {
			reveal = null;
			return;
		}
		const scroller = findScroller(source0, el, mode, isVertical);
		if (!scroller) return;
		const element = scroller instanceof Element ? scroller : null;
		const start = side === 'top' || side === 'left';

		const update = () => {
			const page = document.documentElement;
			const offset = element
				? isVertical
					? element.scrollTop
					: element.scrollLeft
				: isVertical
					? window.scrollY
					: window.scrollX;
			const limit = element
				? isVertical
					? element.scrollHeight - element.clientHeight
					: element.scrollWidth - element.clientWidth
				: isVertical
					? page.scrollHeight - window.innerHeight
					: page.scrollWidth - window.innerWidth;
			const box = el.getBoundingClientRect();
			const reach = Math.max(isVertical ? box.height : box.width, 1);
			const room = start ? offset : limit - offset;
			reveal = clamp01(room / reach).toFixed(3);
		};

		update();
		const source: Element | Window = element ?? window;
		source.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		const observer = element && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
		if (observer && element) {
			observer.observe(element);
			if (element.firstElementChild) observer.observe(element.firstElementChild);
		}
		return () => {
			source.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
			observer?.disconnect();
		};
	});

	$effect(() => {
		const el = root;
		const intensity = hoverIntensity;
		if (!el || intensity === 1) return;
		let frame = 0;
		let inside = false;
		let point: { x: number; y: number } | null = null;

		const check = () => {
			frame = 0;
			if (!point) return;
			const box = el.getBoundingClientRect();
			const now = point.x >= box.left && point.x <= box.right && point.y >= box.top && point.y <= box.bottom;
			if (now === inside) return;
			inside = now;
			hover = inside ? String(Math.max(intensity, 0)) : '1';
		};

		const onMove = (event: PointerEvent) => {
			point = { x: event.clientX, y: event.clientY };
			if (!frame) frame = requestAnimationFrame(check);
		};

		const onLeave = () => {
			point = null;
			inside = false;
			hover = '1';
		};

		window.addEventListener('pointermove', onMove, { passive: true });
		document.documentElement.addEventListener('pointerleave', onLeave);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('pointermove', onMove);
			document.documentElement.removeEventListener('pointerleave', onLeave);
			hover = null;
		};
	});

	const rootStyle = $derived.by(() => {
		const depth = toLength(vertical ? height : (width ?? height));
		const span = vertical && width != null ? toLength(width) : null;
		const rounded = target !== 'page' && !span;
		const corner = (a: string, b: string) => (rounded && (edge === a || edge === b) ? 'inherit' : undefined);
		return [
			toStyle({
				position: target === 'page' ? 'fixed' : 'absolute',
				'z-index': zIndex,
				'border-top-left-radius': corner('top', 'left'),
				'border-top-right-radius': corner('top', 'right'),
				'border-bottom-left-radius': corner('bottom', 'left'),
				'border-bottom-right-radius': corner('bottom', 'right'),
				top: edge === 'bottom' ? undefined : 0,
				bottom: edge === 'top' ? undefined : 0,
				left: edge === 'right' ? undefined : 0,
				right: edge === 'left' ? undefined : 0,
				height: vertical ? depth : undefined,
				width: vertical ? (span ?? undefined) : depth,
				'margin-inline': span ? 'auto' : undefined
			}),
			style
		]
			.filter(Boolean)
			.join('; ');
	});
</script>

<div
	bind:this={root}
	class={['pointer-events-none', className, klass].filter(Boolean).join(' ')}
	style={rootStyle}
	style:--gradual-blur-reveal={reveal}
	style:--gradual-blur-hover={hover}
	aria-hidden="true"
>
	{#each stack.steps as layer, index (index)}
		<div style={layer}></div>
	{/each}
	{#if stack.wash}
		<div style={stack.wash}></div>
	{/if}
</div>
