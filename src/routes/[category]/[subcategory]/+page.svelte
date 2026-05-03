<script lang="ts">
	import { page } from '$app/state';
	import { decodeLabel } from '$lib/constants/categories';

	import AnimatedContentDemo from '$lib/components/docs/pages/AnimatedContentDemo.svelte';
	import AuroraDemo from '$lib/components/docs/pages/AuroraDemo.svelte';
	import BlurTextDemo from '$lib/components/docs/pages/BlurTextDemo.svelte';
	import ColorBendsDemo from '$lib/components/docs/pages/ColorBendsDemo.svelte';
	import ComingSoon from '$lib/components/docs/pages/ComingSoon.svelte';
	import DockDemo from '$lib/components/docs/pages/DockDemo.svelte';
	import DotFieldDemo from '$lib/components/docs/pages/DotFieldDemo.svelte';
	import FadeContentDemo from '$lib/components/docs/pages/FadeContentDemo.svelte';
	import FaultyTerminalDemo from '$lib/components/docs/pages/FaultyTerminalDemo.svelte';
	import FlyingPostersDemo from '$lib/components/docs/pages/FlyingPostersDemo.svelte';
	import GlitchTextDemo from '$lib/components/docs/pages/GlitchTextDemo.svelte';
	import GradientTextDemo from '$lib/components/docs/pages/GradientTextDemo.svelte';
	import HyperspeedDemo from '$lib/components/docs/pages/HyperspeedDemo.svelte';
	import IndexPage from '$lib/components/docs/pages/IndexPage.svelte';
	import Installation from '$lib/components/docs/pages/Installation.svelte';
	import Introduction from '$lib/components/docs/pages/Introduction.svelte';
	import LiquidEtherDemo from '$lib/components/docs/pages/LiquidEtherDemo.svelte';
	import MagicRingsDemo from '$lib/components/docs/pages/MagicRingsDemo.svelte';
	import McpServer from '$lib/components/docs/pages/McpServer.svelte';
	import NoiseDemo from '$lib/components/docs/pages/NoiseDemo.svelte';
	import ShapeGridDemo from '$lib/components/docs/pages/ShapeGridDemo.svelte';
	import ShinyTextDemo from '$lib/components/docs/pages/ShinyTextDemo.svelte';
	import SplashCursorDemo from '$lib/components/docs/pages/SplashCursorDemo.svelte';
	import SplitTextDemo from '$lib/components/docs/pages/SplitTextDemo.svelte';
	import StarBorderDemo from '$lib/components/docs/pages/StarBorderDemo.svelte';
	import TrueFocusDemo from '$lib/components/docs/pages/TrueFocusDemo.svelte';

	const sub = $derived(page.params.subcategory ?? '');
	const niceName = $derived(decodeLabel(sub));
</script>

<svelte:head>
	<title>{niceName} - svelte-bits</title>
</svelte:head>

<div class="category-page">
	{#if sub === 'introduction'}
		<Introduction />
	{:else if sub === 'installation'}
		<Installation />
	{:else if sub === 'mcp-server'}
		<McpServer />
	{:else if sub === 'index'}
		<IndexPage />
	{:else if sub === 'split-text'}
		<SplitTextDemo />
	{:else if sub === 'shiny-text'}
		<ShinyTextDemo />
	{:else if sub === 'animated-content'}
		<AnimatedContentDemo />
	{:else if sub === 'dock'}
		<DockDemo />
	{:else if sub === 'aurora'}
		<AuroraDemo />
	{:else if sub === 'shape-grid'}
		<ShapeGridDemo />
	{:else if sub === 'magic-rings'}
		<MagicRingsDemo />
	{:else if sub === 'gradient-text'}
		<GradientTextDemo />
	{:else if sub === 'glitch-text'}
		<GlitchTextDemo />
	{:else if sub === 'star-border'}
		<StarBorderDemo />
	{:else if sub === 'splash-cursor'}
		<SplashCursorDemo />
	{:else if sub === 'noise'}
		<NoiseDemo />
	{:else if sub === 'blur-text'}
		<BlurTextDemo />
	{:else if sub === 'fade-content'}
		<FadeContentDemo />
	{:else if sub === 'dot-field'}
		<DotFieldDemo />
	{:else if sub === 'color-bends'}
		<ColorBendsDemo />
	{:else if sub === 'liquid-ether'}
		<LiquidEtherDemo />
	{:else if sub === 'faulty-terminal'}
		<FaultyTerminalDemo />
	{:else if sub === 'hyperspeed'}
		<HyperspeedDemo />
	{:else if sub === 'flying-posters'}
		<FlyingPostersDemo />
	{:else if sub === 'true-focus'}
		<TrueFocusDemo />
	{:else}
		<h1 class="sub-category">{niceName}</h1>
		<ComingSoon name={niceName} />
	{/if}
</div>
