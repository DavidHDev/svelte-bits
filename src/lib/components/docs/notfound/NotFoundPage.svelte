<script lang="ts">
	import type { Component } from 'svelte';
	import { page } from '$app/state';
	import { HugeiconsIcon } from '@hugeicons/svelte';
	import { ArrowRight01Icon } from '@hugeicons/core-free-icons';
	import Navbar from '$lib/components/landing/Navbar/Navbar.svelte';
	import FloatingShards from './FloatingShards.svelte';
	import CategoryGallery from './CategoryGallery.svelte';
	import { createPreviewSpring } from './previewSpring';
	import { theme as colorTheme } from '$lib/theme.svelte';
	import { suggestComponents } from '$lib/utils/routeMatch';
	import markup from './404.svg?raw';
	import './not-found.css';

	const electricModules = import.meta.glob<{ default: Component<Record<string, unknown>> }>(
		'/src/lib/components/library/Animations/ElectricLogo/ElectricLogo.svelte'
	);

	const MARK_SRC = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
	const MARK_VIEWBOX = markup.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 1897 742';
	const MARK_PATH = markup.match(/ d="([^"]+)"/)?.[1] ?? '';
	const STAGE_SCALE = 0.56;

	const PALETTES = {
		dark: { color: '#ffe0cc', glowColor: '#ff8a4c', bend: 0.5, glow: 0.2 },
		light: { color: '#ff5a1f', glowColor: '#ffb089', bend: 0.45, glow: 0.42 }
	};

	const CATEGORY_LINKS = [
		{ label: 'Text Animations', to: '/c/text-animations' },
		{ label: 'Animations', to: '/c/animations' },
		{ label: 'Components', to: '/c/components' },
		{ label: 'Backgrounds', to: '/c/backgrounds' },
		{ label: 'Micro', to: '/c/micro' }
	];

	const BOOT: [number, number][] = [
		[420, 0.55],
		[500, 0.04],
		[760, 0.38],
		[820, 0],
		[1080, 1]
	];
	const BROWNOUT: [number, number][] = [
		[0, 0.62],
		[80, 1],
		[170, 0.8],
		[240, 1]
	];

	const prefersReducedMotion = () =>
		typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

	const mode = $derived<'dark' | 'light'>(colorTheme.isLight ? 'light' : 'dark');
	const palette = $derived(PALETTES[mode]);
	let reducedMotion = $state(prefersReducedMotion());
	let entering = $state(!prefersReducedMotion());
	let power = $state(0);
	let hoveredCategory = $state<string | null>(null);
	let focusedCategory = $state<string | null>(null);
	let galleryCategory = $state<string | null>(null);
	let ElectricLogo = $state<Component<Record<string, unknown>> | null>(null);
	let pageEl = $state<HTMLDivElement | null>(null);
	let stageEl = $state<HTMLDivElement | null>(null);
	let galleryEl = $state<HTMLDivElement | null>(null);
	let titleEl = $state<HTMLHeadingElement | null>(null);
	const reflection: { current: ((canvas: HTMLCanvasElement) => void) | null } = { current: null };
	const galleryReflection: { current: ((canvas: HTMLCanvasElement) => void) | null } = { current: null };
	const reflectElectricity = (canvas: HTMLCanvasElement) => reflection.current?.(canvas);
	const reflectGallery = (canvas: HTMLCanvasElement) => galleryReflection.current?.(canvas);
	let timers: ReturnType<typeof setTimeout>[] = [];
	let hoverExit: ReturnType<typeof setTimeout> | undefined;

	const previewProgress = createPreviewSpring(0);
	const previewCategory = $derived(hoveredCategory || focusedCategory);
	const displayedCategory = $derived(previewCategory || galleryCategory);
	const previewActive = $derived(Boolean(previewCategory));
	const lit = $derived(power === 1);

	const segments = $derived(page.url.pathname.split('/').filter(Boolean));
	const lastSegment = $derived(segments[segments.length - 1] || '');
	const suggestions = $derived(suggestComponents(lastSegment));

	$effect(() => {
		const load = Object.values(electricModules)[0];
		if (!load) return;
		load().then((module) => (ElectricLogo = module.default));
	});

	$effect(() => {
		const stop = previewProgress.on('change', (value) => {
			pageEl?.style.setProperty('--nf-preview', String(Math.max(0, Math.min(1, value))));
		});
		return () => {
			stop();
			previewProgress.stop();
		};
	});

	$effect(() => {
		if (previewCategory) {
			galleryCategory = previewCategory;
			entering = false;
		}
		if (reducedMotion) previewProgress.jump(previewActive ? 1 : 0);
		else previewProgress.set(previewActive ? 1 : 0);
	});

	$effect(() => {
		const clearPreview = () => {
			clearTimeout(hoverExit);
			hoveredCategory = null;
			focusedCategory = null;
		};
		window.addEventListener('blur', clearPreview);
		return () => {
			clearTimeout(hoverExit);
			window.removeEventListener('blur', clearPreview);
		};
	});

	function previewOnHover(event: PointerEvent, category: string) {
		if (event.pointerType === 'touch') return;
		clearTimeout(hoverExit);
		hoveredCategory = category;
	}

	function finishHover() {
		clearTimeout(hoverExit);
		hoverExit = setTimeout(() => (hoveredCategory = null), 100);
	}

	function play(sequence: [number, number][]) {
		timers.forEach(clearTimeout);
		timers = [];
		if (prefersReducedMotion()) {
			power = sequence[sequence.length - 1][1];
			return;
		}
		sequence.forEach(([at, level]) => {
			timers.push(setTimeout(() => (power = level), at));
		});
	}

	$effect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => {
			reducedMotion = query.matches;
			if (query.matches) entering = false;
			timers.forEach(clearTimeout);
			timers = [];
			power = 1;
		};
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	});

	$effect(() => {
		const timeout = setTimeout(() => (entering = false), 1900);
		return () => clearTimeout(timeout);
	});

	$effect(() => {
		const stage = stageEl;
		const title = titleEl;
		if (!stage || !title) return;
		const sync = () => stage.style.setProperty('--nf-glyph-w', `${title.offsetWidth}px`);
		sync();
		const observer = new ResizeObserver(sync);
		observer.observe(title);
		return () => observer.disconnect();
	});

	$effect(() => {
		play(BOOT);
		return () => timers.forEach(clearTimeout);
	});

	$effect(() => {
		if (!lit || reducedMotion) return;
		let timeout: ReturnType<typeof setTimeout>;
		const schedule = () => {
			timeout = setTimeout(
				() => {
					play(BROWNOUT);
					schedule();
				},
				10000 + Math.random() * 9000
			);
		};
		schedule();
		return () => clearTimeout(timeout);
	});
</script>

<svelte:head>
	<title>Page not found - Svelte Bits</title>
	<meta
		name="description"
		content="This page does not exist. Browse free animated Svelte components, backgrounds and micro-interactions."
	/>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div
	bind:this={pageEl}
	class="nf"
	data-entering={entering ? '' : undefined}
	data-preview={previewActive ? '' : undefined}
	style:--nf-power={power}
>
	<Navbar showDocs />

	<main class="nf-main">
		<FloatingShards
			{reducedMotion}
			theme={mode}
			{stageEl}
			{galleryEl}
			{reflection}
			{galleryReflection}
			{previewProgress}
			layoutKey={`${page.url.pathname}:${suggestions.length}`}
		/>
		<div class="nf-default" inert={previewActive} aria-hidden={previewActive || undefined}>
			<div bind:this={stageEl} class="nf-stage" style:--nf-scale={STAGE_SCALE} aria-hidden="true">
				<div class="nf-sign">
					<svg class="nf-tubes" viewBox={MARK_VIEWBOX} preserveAspectRatio="xMidYMid meet">
						<path d={MARK_PATH} />
					</svg>
					{#if ElectricLogo}
						<ElectricLogo
							onRender={reflectElectricity}
							src={MARK_SRC}
							theme={mode}
							color={palette.color}
							glowColor={palette.glowColor}
							bend={palette.bend}
							glow={palette.glow}
							intensity={power}
							interactive={!reducedMotion}
							speed={reducedMotion ? 0 : 1.8}
							arcs={reducedMotion ? 0 : 0.55}
							flicker={reducedMotion ? 0 : 0.3}
							scale={STAGE_SCALE}
							thickness={1.6}
							cursorRadius={90}
						/>
					{/if}
				</div>
			</div>

			<h1 bind:this={titleEl} class="nf-title">
				<span class="nf-sr-only">404. </span>
				This page doesn’t exist
			</h1>
			<p class="nf-lede">The link may be broken, or the page may have moved.</p>

			{#if suggestions.length > 0}
				<nav class="nf-suggest" aria-label="Suggested components">
					<span class="nf-suggest-label">Did you mean</span>
					{#each suggestions as item (item.path)}
						<a href={item.path} class="nf-suggest-link">
							<span class="nf-suggest-name">{item.name}</span>
							<span class="nf-suggest-category">{item.category}</span>
							<HugeiconsIcon
								icon={ArrowRight01Icon}
								size={14}
								strokeWidth={1.8}
								class="nf-suggest-arrow"
								aria-hidden="true"
							/>
						</a>
					{/each}
				</nav>
			{/if}

			<a href="/get-started/index" class="nf-btn">Browse components</a>
		</div>

		<section
			class="nf-gallery"
			aria-label={`${displayedCategory || 'Category'} previews`}
			aria-hidden={!previewActive}
		>
			<div bind:this={galleryEl} class="nf-gallery-surface">
				<CategoryGallery
					category={displayedCategory}
					active={previewActive}
					{reducedMotion}
					theme={mode}
					onFrame={reflectGallery}
				/>
			</div>
		</section>
	</main>

	<nav class="nf-categories" aria-label="Categories">
		{#each CATEGORY_LINKS as link, index (link.to)}
			<a
				href={link.to}
				style:--nf-order={index}
				data-previewing={previewCategory === link.label ? '' : undefined}
				onpointerenter={(event) => previewOnHover(event, link.label)}
				onpointerleave={finishHover}
				onfocus={(event) => {
					if (!(event.currentTarget as HTMLElement).matches(':focus-visible')) return;
					clearTimeout(hoverExit);
					hoveredCategory = null;
					focusedCategory = link.label;
				}}
				onblur={() => (focusedCategory = null)}
				onkeydown={(event) => {
					if (event.key !== 'Escape') return;
					clearTimeout(hoverExit);
					hoveredCategory = null;
					focusedCategory = null;
				}}
			>
				{link.label}
			</a>
		{/each}
	</nav>
</div>
