<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	type Variant = 'shapegrid' | 'magicrings' | 'shinytext' | 'dock';
	type ShapeGridProps = {
		shape: string;
		direction: string;
		speed: number;
		borderColor: string;
		hoverFillColor: string;
		squareSize: number;
		hoverTrailAmount: number;
	};
	type MagicRingsProps = {
		color: string;
		colorTwo: string;
		ringCount: number;
		lineThickness: number;
		baseRadius: number;
		radiusStep: number;
		noiseAmount: number;
		followMouse: boolean;
		hoverScale: number;
		parallax: number;
	};
	type ShinyTextProps = {
		text: string;
		speed: number;
		color: string;
		shineColor: string;
		class: string;
	};
	type DockProps = {
		items: { icon: Snippet; label: string; onClick: () => void }[];
		panelHeight: number;
		baseItemSize: number;
		magnification: number;
		distance: number;
	};
	type PreviewComponent = Component<ShapeGridProps | MagicRingsProps | ShinyTextProps | DockProps>;
	type ComponentModule = { default: PreviewComponent };

	interface Props {
		variant: Variant;
		active?: boolean;
	}

	const { variant, active = false }: Props = $props();

	const loaders = {
		shapegrid: () =>
			import('$lib/components/library/Backgrounds/ShapeGrid/ShapeGrid.svelte') as Promise<ComponentModule>,
		magicrings: () =>
			import('$lib/components/library/Animations/MagicRings/MagicRings.svelte') as Promise<ComponentModule>,
		shinytext: () =>
			import('$lib/components/library/TextAnimations/ShinyText/ShinyText.svelte') as Promise<ComponentModule>,
		dock: () =>
			import('$lib/components/library/Components/Dock/Dock.svelte') as Promise<ComponentModule>
	};

	let loadedVariant = $state<Variant | null>(null);
	let LoadedComponent = $state<PreviewComponent | null>(null);

	$effect(() => {
		if (!active || loadedVariant === variant) return;

		const loadingVariant = variant;
		loaders[loadingVariant]().then((module) => {
			if (variant !== loadingVariant) return;
			LoadedComponent = module.default;
			loadedVariant = loadingVariant;
		});
	});

	const dockItems: { icon: Snippet; label: string; onClick: () => void }[] = [
		{ label: 'Home', icon: home, onClick: () => {} },
		{ label: 'Archive', icon: archive, onClick: () => {} },
		{ label: 'Search', icon: search, onClick: () => {} },
		{ label: 'Profile', icon: profile, onClick: () => {} },
		{ label: 'Settings', icon: settings, onClick: () => {} }
	];
</script>

{#snippet home()}
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
		stroke-linecap="round" stroke-linejoin="round">
		<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
		<polyline points="9 22 9 12 15 12 15 22" />
	</svg>
{/snippet}
{#snippet archive()}
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
		stroke-linecap="round" stroke-linejoin="round">
		<polyline points="21 8 21 21 3 21 3 8" />
		<rect x="1" y="3" width="22" height="5" />
		<line x1="10" y1="12" x2="14" y2="12" />
	</svg>
{/snippet}
{#snippet profile()}
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
		stroke-linecap="round" stroke-linejoin="round">
		<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
		<circle cx="12" cy="7" r="4" />
	</svg>
{/snippet}
{#snippet search()}
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
		stroke-linecap="round" stroke-linejoin="round">
		<circle cx="11" cy="11" r="7" />
		<line x1="21" y1="21" x2="16.65" y2="16.65" />
	</svg>
{/snippet}
{#snippet settings()}
	<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
		stroke-linecap="round" stroke-linejoin="round">
		<circle cx="12" cy="12" r="3" />
		<path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
	</svg>
{/snippet}

{#if !LoadedComponent}
	<div class="demo-fill" aria-hidden="true"></div>
{:else if variant === 'shapegrid'}
	<div class="demo-fill" aria-hidden="true">
		<LoadedComponent
			shape="hexagon"
			direction="diagonal"
			speed={0.6}
			borderColor="rgba(255, 138, 76, 0.18)"
			hoverFillColor="rgba(255, 62, 0, 0.6)"
			squareSize={26}
			hoverTrailAmount={4}
		/>
	</div>
{:else if variant === 'magicrings'}
	<div class="demo-fill" aria-hidden="true">
		<LoadedComponent
			color="#FF3E00"
			colorTwo="#FF8A4C"
			ringCount={6}
			lineThickness={1.6}
			baseRadius={0.32}
			radiusStep={0.09}
			noiseAmount={0.08}
			followMouse
			hoverScale={1.15}
			parallax={0.04}
		/>
	</div>
{:else if variant === 'shinytext'}
	<div class="demo-fill demo-shiny-wrap">
		<LoadedComponent
			text="Shiny Text"
			speed={3}
			color="#666"
			shineColor="#fff"
			class="demo-shiny-text"
		/>
	</div>
{:else if variant === 'dock'}
	<div class="demo-fill demo-dock-wrap">
		<div class="demo-dock-stage">
			<LoadedComponent
				items={dockItems}
				panelHeight={64}
				baseItemSize={42}
				magnification={64}
				distance={140}
			/>
		</div>
	</div>
{/if}

<style>
	.demo-fill {
		position: absolute;
		inset: 0;
		overflow: hidden;
	}
	.demo-shiny-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.demo-shiny-wrap :global(.demo-shiny-text) {
		font-family: 'Geist', sans-serif;
		font-size: clamp(28px, 3.5vw, 44px);
		font-weight: 700;
		letter-spacing: -0.03em;
	}
	/* Dock's panel is `position: absolute; bottom: 2px; left: 50%`.
	   It pins to the bottom of its closest positioned ancestor. We give it
	   a stage that is exactly the dock's own height + a couple of px for
	   the bottom offset, then center that stage in the card with flex. */
	.demo-dock-wrap {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.demo-dock-stage {
		position: relative;
		width: 100%;
		/* Matches Dock's internal outerHeight for these props:
		   max(panelHeight=64, baseItemSize=42 + magnification/2=32 + 4) = 78 */
		height: 78px;
	}
</style>
