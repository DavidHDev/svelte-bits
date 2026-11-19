<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme.svelte';
	import { loadLibrary, type LibraryComponent } from '../shared/library';

	const FONT = 'Geist, "Geist Sans", system-ui, sans-serif';
	const WORD = 'Svelte Bits';
	const SHOWN = 0.6;
	const CAP = 0.9;
	const FADE = 0.4;

	const propsId = $props.id();
	const uid = `fw${propsId}`;

	const measureWord = () => {
		const context = document.createElement('canvas').getContext('2d')!;
		context.font = `600 100px ${FONT}`;
		const metrics = context.measureText(WORD);
		return {
			advance: metrics.width / 100,
			left: metrics.actualBoundingBoxLeft / 100,
			right: metrics.actualBoundingBoxRight / 100,
			ascent: metrics.actualBoundingBoxAscent / 100,
			descent: metrics.actualBoundingBoxDescent / 100
		};
	};

	type Layout = {
		font: number;
		above: number;
		fade: number;
		boxWidth: number;
		boxHeight: number;
		left: number;
		height: number;
		x: number;
		y: number;
	};

	let root = $state<HTMLDivElement | null>(null);
	let mounted = $state(false);
	let layout = $state<Layout | null>(null);
	let near = $state(false);
	let visible = $state(false);
	let pageVisible = $state(true);
	let LiveWaves = $state<LibraryComponent | null>(null);
	let failed = $state(false);
	let cellSize = $state(9);
	let capabilities = $state({ gpu: false, fine: false, reduced: true });

	const light = $derived(mounted && theme.isLight);
	const color = $derived(light ? '#8b8783' : '#615e5b');
	const hoverColor = $derived(light ? '#c2410c' : '#ffb089');
	const backgroundColor = $derived(light ? '#f6f5f3' : '#181511');
	const eligible = $derived(capabilities.gpu && !capabilities.reduced && !failed);
	const handleError = () => (failed = true);

	onMount(() => {
		mounted = true;
	});

	$effect(() => {
		if (!root) return;
		const el = root;
		let cancelled = false;
		const update = () => {
			const width = el.clientWidth;
			if (cancelled || !width) return;
			const top = el.parentElement?.querySelector('.ln-footer-top');
			const inset = top ? parseFloat(getComputedStyle(top).paddingLeft) || 0 : 0;
			const word = measureWord();
			const font = Math.max(24, (width - inset * 2) / (word.left + word.right));
			const glyph = font * (word.ascent + word.descent);
			const above = Math.max(36, glyph * 0.46);
			const boxWidth = (font * word.advance) / CAP;
			const boxHeight = above * 2 + glyph;
			cellSize = Math.min(9, Math.max(3, Math.round(width / 135)));
			layout = {
				font,
				above,
				fade: above + glyph * FADE,
				boxWidth,
				boxHeight,
				left: (width - boxWidth) / 2,
				height: above + glyph * SHOWN,
				x: boxWidth / 2 + ((word.left - word.right) * font) / 2,
				y: boxHeight / 2 + ((word.ascent - word.descent) * font) / 2
			};
		};
		const observer = new ResizeObserver(update);
		observer.observe(el);
		document.fonts.ready.then(update);
		return () => {
			cancelled = true;
			observer.disconnect();
		};
	});

	$effect(() => {
		const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () =>
			(capabilities = {
				gpu: Boolean(window.isSecureContext && (navigator as Navigator & { gpu?: unknown }).gpu),
				fine: pointer.matches,
				reduced: motion.matches
			});
		const updateVisibility = () => (pageVisible = !document.hidden);
		update();
		updateVisibility();
		pointer.addEventListener('change', update);
		motion.addEventListener('change', update);
		document.addEventListener('visibilitychange', updateVisibility);
		return () => {
			pointer.removeEventListener('change', update);
			motion.removeEventListener('change', update);
			document.removeEventListener('visibilitychange', updateVisibility);
		};
	});

	$effect(() => {
		if (!root || typeof IntersectionObserver === 'undefined') return;
		const preload = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				near = true;
				preload.disconnect();
			},
			{ rootMargin: '120px' }
		);
		const visibility = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
		preload.observe(root);
		visibility.observe(root);
		return () => {
			preload.disconnect();
			visibility.disconnect();
		};
	});

	$effect(() => {
		if (!near || !eligible || LiveWaves) return;
		let cancelled = false;
		loadLibrary('Backgrounds/ShapeWaves').then((component) => {
			if (cancelled) return;
			if (component) LiveWaves = component;
			else failed = true;
		});
		return () => {
			cancelled = true;
		};
	});

	const box = $derived(
		layout
			? `left: ${layout.left}px; top: 0; right: auto; bottom: auto; width: ${layout.boxWidth}px; height: ${layout.boxHeight}px;`
			: undefined
	);

	const shapes = Array.from({ length: 16 }, (_, index) => {
		const x = (index % 4) * 9 + 4.5;
		const y = Math.floor(index / 4) * 9 + 4.5;
		const shape = (index + Math.floor(index / 4)) % 3;
		const opacity = 0.48 + ((index * 7) % 5) * 0.11;
		return { x, y, shape, opacity };
	});
</script>

<div
	bind:this={root}
	class="ln-footer-art"
	aria-hidden="true"
	style={layout ? `height: ${layout.height}px; --art-fade: ${layout.fade}px;` : undefined}
>
	<svg class="ln-footer-art-fallback" width="100%" height="100%" focusable="false" style={box}>
		<defs>
			<pattern
				id="{uid}-shapes"
				width="36"
				height="36"
				patternUnits="userSpaceOnUse"
				patternTransform="scale({cellSize / 9})"
			>
				<g fill="currentColor">
					{#each shapes as item, index (index)}
						{#if item.shape === 0}
							<circle cx={item.x} cy={item.y} r="2.8" opacity={item.opacity} />
						{:else if item.shape === 1}
							<rect x={item.x - 2.5} y={item.y - 2.5} width="5" height="5" opacity={item.opacity} />
						{:else}
							<path d="M{item.x} {item.y - 3}l3 5.5h-6z" opacity={item.opacity} />
						{/if}
					{/each}
				</g>
			</pattern>
			<mask id="{uid}-mask">
				<rect width="100%" height="100%" fill="white" />
				{#if layout}
					<text
						x={layout.x}
						y={layout.y}
						text-anchor="middle"
						fill="black"
						font-family={FONT}
						font-weight="600"
						font-size={layout.font}>{WORD}</text
					>
				{/if}
			</mask>
		</defs>
		<g fill="currentColor">
			<rect width="100%" height="100%" fill="url(#{uid}-shapes)" mask="url(#{uid}-mask)" />
		</g>
	</svg>
	{#if eligible && visible && LiveWaves && layout}
		<div class="ln-footer-art-live" style={box}>
			<LiveWaves
				text={WORD}
				fontFamily={FONT}
				fontWeight={600}
				textSize={2}
				shapes="mixed"
				{cellSize}
				dotSize={0.72}
				scale={1.2}
				fade={0}
				{color}
				{hoverColor}
				{backgroundColor}
				speed={0}
				flow={0}
				glow={0}
				intro={false}
				paused={!visible || !pageVisible}
				interactive={visible && pageVisible && capabilities.fine && !capabilities.reduced}
				onError={handleError}
			/>
		</div>
	{/if}
</div>
