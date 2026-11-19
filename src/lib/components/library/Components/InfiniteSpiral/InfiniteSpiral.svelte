<!-- @svelte-bits
{
  "title": "Infinite Spiral",
  "description": "An endlessly looping 3D helix of images with adjustable motion, depth and spacing.",
  "dependencies": []
}
-->
<script module lang="ts">
	export interface InfiniteSpiralItem {
		id?: string | number;
		src: string;
		alt?: string;
		href?: string;
		target?: '_blank' | '_self' | '_parent' | '_top';
		label?: string;
	}

	export interface InfiniteSpiralProps {
		items?: Array<string | InfiniteSpiralItem>;
		speed?: number;
		direction?: 'up' | 'down';
		animationMode?: 'auto' | 'drag' | 'scroll' | 'all';
		radius?: number;
		cardWidth?: number;
		cardHeight?: number;
		verticalSpacing?: number;
		perspective?: number;
		cardsPerTurn?: number;
		rotation?: number;
		cardTilt?: number;
		cardRadius?: number;
		centerScale?: number;
		edgeFade?: number;
		edgeBlur?: number;
		pauseOnHover?: boolean;
		imageFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
		grayscale?: number;
		class?: string;
	}

	type NormalizedItem = InfiniteSpiralItem & { alt: string };

	const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
	const modulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;
	const smoothstep = (min: number, max: number, value: number) => {
		const x = clamp((value - min) / (max - min || 1), 0, 1);
		return x * x * (3 - 2 * x);
	};
</script>

<script lang="ts">
	let {
		items = [],
		speed = 0.55,
		direction = 'up',
		animationMode = 'auto',
		radius = 170,
		cardWidth = 100,
		cardHeight = 100,
		verticalSpacing = 60,
		perspective = 1000,
		cardsPerTurn = 7,
		rotation = 0,
		cardTilt = 0,
		cardRadius = 10,
		centerScale = 1.2,
		edgeFade = 0.3,
		edgeBlur = 6,
		pauseOnHover = true,
		imageFit = 'cover',
		grayscale = 0,
		class: className = ''
	}: InfiniteSpiralProps = $props();

	let rootEl = $state<HTMLDivElement | null>(null);
	let cardEls = $state<Array<HTMLElement | null>>([]);
	let progress = 0;
	let targetProgress = 0;
	let autoSpeed = 0;
	let hovered = false;
	let visible = true;
	let dragging = false;
	let lastPointerY = 0;
	let dragMoved = false;

	const normalizedItems = $derived<NormalizedItem[]>(
		items.map((item, index) =>
			typeof item === 'string'
				? { src: item, alt: `Spiral image ${index + 1}` }
				: { alt: `Spiral image ${index + 1}`, ...item }
		)
	);

	const dragEnabled = $derived(animationMode === 'drag' || animationMode === 'all');

	$effect(() => {
		const root = rootEl;
		const list = normalizedItems;
		const cfg = {
			speed,
			direction,
			animationMode,
			radius,
			perspective,
			cardWidth,
			cardHeight,
			verticalSpacing,
			cardsPerTurn,
			rotation,
			cardTilt,
			centerScale,
			edgeFade,
			edgeBlur,
			pauseOnHover
		};
		if (!root || list.length === 0) return;

		let frameId = 0;
		let previousTime = performance.now();
		let bounds = root.getBoundingClientRect();
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const scrollEnabled = cfg.animationMode === 'scroll' || cfg.animationMode === 'all';
		const scrollSpeedMultiplier = Math.max(cfg.speed, 0) / 0.55;
		let lastScrollY = window.scrollY;
		const resizeObserver = new ResizeObserver(() => {
			bounds = root.getBoundingClientRect();
		});
		resizeObserver.observe(root);
		const intersectionObserver = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
		});
		intersectionObserver.observe(root);

		const handleScroll = () => {
			const nextScrollY = window.scrollY;
			const scrollDelta = nextScrollY - lastScrollY;
			lastScrollY = nextScrollY;
			if (!scrollEnabled || !visible || scrollDelta === 0) return;
			targetProgress += clamp(
				(scrollDelta * scrollSpeedMultiplier) / Math.max(cfg.verticalSpacing * 2, 1),
				-1.5,
				1.5
			);
		};
		window.addEventListener('scroll', handleScroll, { passive: true });

		const render = (time: number) => {
			const delta = Math.min((time - previousTime) / 1000, 0.05);
			previousTime = time;
			const autoEnabled = cfg.animationMode === 'auto' || cfg.animationMode === 'all';
			const motionPaused = dragging || (cfg.pauseOnHover && hovered);
			const directionMultiplier = cfg.direction === 'down' ? -1 : 1;
			const desiredAutoSpeed =
				autoEnabled && visible && !reducedMotion.matches && !motionPaused ? cfg.speed * directionMultiplier : 0;
			const speedBlend = 1 - Math.exp(-delta * 7);
			autoSpeed += (desiredAutoSpeed - autoSpeed) * speedBlend;
			targetProgress += autoSpeed * delta;

			const followBlend = 1 - Math.exp(-delta * (dragging ? 22 : 11));
			progress += (targetProgress - progress) * followBlend;

			const count = list.length;
			const half = count / 2;
			const width = Math.max(bounds.width, 1);
			const height = Math.max(bounds.height, 1);
			const fit = Math.min(1, width / (cfg.cardWidth * 2.8), height / (cfg.cardHeight * 2.35));
			const responsiveRadius = Math.min(cfg.radius, Math.max(72, width * 0.36)) * fit;
			const fadeStart = clamp(1 - cfg.edgeFade, 0, 0.98);
			const turnSize = Math.max(cfg.cardsPerTurn, 1);

			cardEls.forEach((card, index) => {
				if (!card || index >= count) return;
				const offset = modulo(index - progress + half, count) - half;
				const edge = Math.min(Math.abs(offset) / Math.max(half, 1), 1);
				const opacity = 1 - smoothstep(fadeStart, 1, edge);
				const focus = 1 - Math.min(Math.abs(offset) / Math.max(turnSize * 0.65, 1), 1);
				const scale = (1 + (cfg.centerScale - 1) * focus) * fit;
				const angle = offset * (360 / turnSize) + cfg.rotation;
				const angleRadians = (angle * Math.PI) / 180;
				const x = Math.sin(angleRadians) * responsiveRadius;
				const z = Math.cos(angleRadians) * responsiveRadius;
				const depthScale = clamp(cfg.perspective / Math.max(cfg.perspective - z, 1), 0.72, 1.45);
				const visualScale = scale * depthScale;
				const depth = (z / Math.max(responsiveRadius, 1) + 1) / 2;
				const blur = cfg.edgeBlur * smoothstep(0.35, 1, edge);
				card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${offset * cfg.verticalSpacing * fit}px, 0) rotateZ(${cfg.cardTilt}deg) scale(${visualScale})`;
				card.style.opacity = opacity.toFixed(3);
				card.style.filter = blur > 0.01 ? `blur(${blur.toFixed(2)}px)` : 'none';
				card.style.zIndex = String(Math.round(depth * 100000) + index);
				card.style.pointerEvents = opacity > 0.25 ? 'auto' : 'none';
			});
			frameId = requestAnimationFrame(render);
		};

		frameId = requestAnimationFrame(render);
		return () => {
			cancelAnimationFrame(frameId);
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			window.removeEventListener('scroll', handleScroll);
		};
	});

	const stopDragging = (event: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (!dragging) return;
		dragging = false;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) {
			event.currentTarget.releasePointerCapture(event.pointerId);
		}
		event.currentTarget.style.cursor = dragEnabled ? 'grab' : 'default';
	};

	const handlePointerDown = (event: PointerEvent & { currentTarget: HTMLDivElement }) => {
		if (!dragEnabled || event.button !== 0) return;
		dragging = true;
		dragMoved = false;
		lastPointerY = event.clientY;
		targetProgress = progress;
		event.currentTarget.setPointerCapture(event.pointerId);
		event.currentTarget.style.cursor = 'grabbing';
	};

	const handlePointerMove = (event: PointerEvent) => {
		if (!dragging) return;
		const pointerDelta = event.clientY - lastPointerY;
		lastPointerY = event.clientY;
		if (Math.abs(pointerDelta) > 0.5) dragMoved = true;
		targetProgress -= pointerDelta / Math.max(verticalSpacing, 1);
	};

	const handleClickCapture = (event: MouseEvent) => {
		if (!dragMoved) return;
		event.preventDefault();
		event.stopPropagation();
		dragMoved = false;
	};

	const itemClassName =
		'absolute left-1/2 top-1/2 block h-[var(--spiral-height)] w-[var(--spiral-width)] overflow-hidden rounded-[var(--spiral-radius)] border border-white/25 bg-white/10 shadow-[0_14px_38px_rgba(20,17,14,0.2)] [backface-visibility:hidden] [transform-style:preserve-3d] [will-change:transform,opacity,filter] motion-reduce:transition-none';
</script>

<div
	bind:this={rootEl}
	class="relative isolate h-full min-h-80 w-full overflow-hidden {className}"
	style:perspective="{perspective}px"
	style:--spiral-width="{cardWidth}px"
	style:--spiral-height="{cardHeight}px"
	style:--spiral-radius="{cardRadius}px"
	style:cursor={dragEnabled ? 'grab' : 'default'}
	style:touch-action={dragEnabled ? 'pan-x' : 'auto'}
	style:user-select={dragEnabled ? 'none' : 'auto'}
	role="presentation"
	onmouseenter={() => {
		hovered = true;
	}}
	onmouseleave={() => {
		hovered = false;
	}}
	onpointerdown={handlePointerDown}
	onpointermove={handlePointerMove}
	onpointerup={stopDragging}
	onpointercancel={stopDragging}
	onclickcapture={handleClickCapture}
>
	<div class="absolute inset-0 [transform-style:preserve-3d]" role="list" aria-label="Infinite spiral gallery">
		{#each normalizedItems as item, index (item.id ?? `${item.src}-${index}`)}
			<svelte:element
				this={item.href ? 'a' : 'div'}
				bind:this={cardEls[index]}
				class={itemClassName}
				style:width="{cardWidth}px"
				style:height="{cardHeight}px"
				style:border-radius="{cardRadius}px"
				href={item.href}
				target={item.href ? item.target : undefined}
				rel={item.href && item.target === '_blank' ? 'noreferrer' : undefined}
				role="listitem"
				aria-label={item.label ?? item.alt}
			>
				<img
					class="absolute inset-0 block h-full w-full select-none object-center"
					src={item.src}
					alt={item.alt}
					loading={index < 6 ? 'eager' : 'lazy'}
					draggable={false}
					style:width="{cardWidth}px"
					style:height="{cardHeight}px"
					style:max-width="none"
					style:max-height="none"
					style:object-fit={imageFit}
					style:filter="grayscale({Math.min(1, Math.max(0, grayscale))})"
				/>
			</svelte:element>
		{/each}
	</div>
</div>
