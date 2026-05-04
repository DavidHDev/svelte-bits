<!-- @svelte-bits
{
  "title": "Gradual Blur",
  "description": "Multi-layer gradient-masked backdrop blur for soft fade-out edges (top/bottom/left/right).",
  "dependencies": []
}
-->
<script module lang="ts">
	type Position = 'top' | 'bottom' | 'left' | 'right';
	type Curve = 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';
	type PresetName =
		| 'top'
		| 'bottom'
		| 'left'
		| 'right'
		| 'subtle'
		| 'intense'
		| 'smooth'
		| 'sharp'
		| 'header'
		| 'footer'
		| 'sidebar'
		| 'page-header'
		| 'page-footer';

	const PRESETS: Record<PresetName, Record<string, unknown>> = {
		top: { position: 'top', height: '6rem' },
		bottom: { position: 'bottom', height: '6rem' },
		left: { position: 'left', height: '6rem' },
		right: { position: 'right', height: '6rem' },
		subtle: { height: '4rem', strength: 1, opacity: 0.8, divCount: 3 },
		intense: { height: '10rem', strength: 4, divCount: 8, exponential: true },
		smooth: { height: '8rem', curve: 'bezier', divCount: 10 },
		sharp: { height: '5rem', curve: 'linear', divCount: 4 },
		header: { position: 'top', height: '8rem', curve: 'ease-out' },
		footer: { position: 'bottom', height: '8rem', curve: 'ease-out' },
		sidebar: { position: 'left', height: '6rem', strength: 2.5 },
		'page-header': { position: 'top', height: '10rem', target: 'page', strength: 3 },
		'page-footer': { position: 'bottom', height: '10rem', target: 'page', strength: 3 }
	};

	const CURVE_FUNCTIONS: Record<Curve, (p: number) => number> = {
		linear: (p) => p,
		bezier: (p) => p * p * (3 - 2 * p),
		'ease-in': (p) => p * p,
		'ease-out': (p) => 1 - Math.pow(1 - p, 2),
		'ease-in-out': (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2)
	};

	function gradientDir(pos: Position): string {
		return { top: 'to top', bottom: 'to bottom', left: 'to left', right: 'to right' }[pos];
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		position?: Position;
		strength?: number;
		height?: string;
		width?: string;
		divCount?: number;
		exponential?: boolean;
		zIndex?: number;
		animated?: boolean | 'scroll';
		duration?: string;
		easing?: string;
		opacity?: number;
		curve?: Curve;
		preset?: PresetName;
		hoverIntensity?: number;
		target?: 'parent' | 'page';
		class?: string;
		style?: string;
	};

	let props: Props = $props();

	const cfg = $derived.by(() => {
		const presetCfg = props.preset ? PRESETS[props.preset] : {};
		return {
			position: 'bottom' as Position,
			strength: 2,
			height: '6rem',
			width: undefined as string | undefined,
			divCount: 5,
			exponential: false,
			zIndex: 1000,
			animated: false as boolean | 'scroll',
			duration: '0.3s',
			easing: 'ease-out',
			opacity: 1,
			curve: 'linear' as Curve,
			hoverIntensity: undefined as number | undefined,
			target: 'parent' as 'parent' | 'page',
			...presetCfg,
			...Object.fromEntries(Object.entries(props).filter(([, v]) => v !== undefined))
		} as Required<Omit<Props, 'children' | 'class' | 'style' | 'preset' | 'width' | 'hoverIntensity'>> & {
			width?: string;
			hoverIntensity?: number;
		};
	});

	let isHovered = $state(false);
	let isVisible = $state(true);
	let containerEl: HTMLDivElement;

	$effect(() => {
		if (cfg.animated !== 'scroll' || !containerEl) return;
		isVisible = false;
		const obs = new IntersectionObserver(([entry]) => (isVisible = entry.isIntersecting), {
			threshold: 0.1
		});
		obs.observe(containerEl);
		return () => obs.disconnect();
	});

	const divs = $derived.by(() => {
		const out: { style: string }[] = [];
		const inc = 100 / cfg.divCount;
		const currentStrength =
			isHovered && cfg.hoverIntensity ? cfg.strength * cfg.hoverIntensity : cfg.strength;
		const curveFn = CURVE_FUNCTIONS[cfg.curve] || CURVE_FUNCTIONS.linear;
		for (let i = 1; i <= cfg.divCount; i++) {
			let progress = i / cfg.divCount;
			progress = curveFn(progress);
			const blur = cfg.exponential
				? Math.pow(2, progress * 4) * 0.0625 * currentStrength
				: 0.0625 * (progress * cfg.divCount + 1) * currentStrength;
			const p1 = Math.round((inc * i - inc) * 10) / 10;
			const p2 = Math.round(inc * i * 10) / 10;
			const p3 = Math.round((inc * i + inc) * 10) / 10;
			const p4 = Math.round((inc * i + inc * 2) * 10) / 10;
			let grad = `transparent ${p1}%, black ${p2}%`;
			if (p3 <= 100) grad += `, black ${p3}%`;
			if (p4 <= 100) grad += `, transparent ${p4}%`;
			const dir = gradientDir(cfg.position);
			const transition =
				cfg.animated && cfg.animated !== 'scroll'
					? `backdrop-filter ${cfg.duration} ${cfg.easing}`
					: '';
			out.push({
				style: `mask-image:linear-gradient(${dir}, ${grad});-webkit-mask-image:linear-gradient(${dir}, ${grad});backdrop-filter:blur(${blur.toFixed(3)}rem);-webkit-backdrop-filter:blur(${blur.toFixed(3)}rem);opacity:${cfg.opacity};${transition ? `transition:${transition};` : ''}`
			});
		}
		return out;
	});

	const containerStyle = $derived.by(() => {
		const isVertical = cfg.position === 'top' || cfg.position === 'bottom';
		const isPage = cfg.target === 'page';
		const parts: string[] = [
			`position:${isPage ? 'fixed' : 'absolute'}`,
			`pointer-events:${cfg.hoverIntensity ? 'auto' : 'none'}`,
			`opacity:${isVisible ? 1 : 0}`,
			`z-index:${isPage ? cfg.zIndex + 100 : cfg.zIndex}`
		];
		if (cfg.animated) parts.push(`transition:opacity ${cfg.duration} ${cfg.easing}`);
		if (isVertical) {
			parts.push(`height:${cfg.height}`);
			parts.push(`width:${cfg.width || '100%'}`);
			parts.push(`${cfg.position}:0`, 'left:0', 'right:0');
		} else {
			parts.push(`width:${cfg.width || cfg.height}`);
			parts.push('height:100%');
			parts.push(`${cfg.position}:0`, 'top:0', 'bottom:0');
		}
		return parts.join(';') + ';' + (props.style ?? '');
	});
</script>

<div
	bind:this={containerEl}
	class="gradual-blur relative isolate {cfg.target === 'page' ? 'gradual-blur-page' : 'gradual-blur-parent'} {props.class ?? ''}"
	style={containerStyle}
	onmouseenter={cfg.hoverIntensity ? () => (isHovered = true) : undefined}
	onmouseleave={cfg.hoverIntensity ? () => (isHovered = false) : undefined}
	role="presentation"
>
	<div class="relative w-full h-full">
		{#each divs as d, i (i)}
			<div class="absolute inset-0" style={d.style}></div>
		{/each}
	</div>
	{#if props.children}<div class="relative">{@render props.children()}</div>{/if}
</div>
