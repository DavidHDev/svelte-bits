import type { Component } from 'svelte';

type DemoModule = { default: Component };
export type DemoLoader = () => Promise<DemoModule>;

export const DOC_PAGE_REGISTRY: Record<string, DemoLoader> = {
	'introduction': () => import('./Introduction.svelte'),
	'installation': () => import('./Installation.svelte'),
	'mcp-server': () => import('./McpServer.svelte'),
	'index': () => import('./IndexPage.svelte'),
	'animated-content': () => import('./AnimatedContentDemo.svelte'),
	'aurora': () => import('./AuroraDemo.svelte'),
	'blur-text': () => import('./BlurTextDemo.svelte'),
	'color-bends': () => import('./ColorBendsDemo.svelte'),
	'dock': () => import('./DockDemo.svelte'),
	'dot-field': () => import('./DotFieldDemo.svelte'),
	'fade-content': () => import('./FadeContentDemo.svelte'),
	'faulty-terminal': () => import('./FaultyTerminalDemo.svelte'),
	'flying-posters': () => import('./FlyingPostersDemo.svelte'),
	'glitch-text': () => import('./GlitchTextDemo.svelte'),
	'gradient-text': () => import('./GradientTextDemo.svelte'),
	'hyperspeed': () => import('./HyperspeedDemo.svelte'),
	'liquid-ether': () => import('./LiquidEtherDemo.svelte'),
	'magic-rings': () => import('./MagicRingsDemo.svelte'),
	'noise': () => import('./NoiseDemo.svelte'),
	'shape-grid': () => import('./ShapeGridDemo.svelte'),
	'shiny-text': () => import('./ShinyTextDemo.svelte'),
	'splash-cursor': () => import('./SplashCursorDemo.svelte'),
	'split-text': () => import('./SplitTextDemo.svelte'),
	'star-border': () => import('./StarBorderDemo.svelte'),
	'true-focus': () => import('./TrueFocusDemo.svelte')
};
