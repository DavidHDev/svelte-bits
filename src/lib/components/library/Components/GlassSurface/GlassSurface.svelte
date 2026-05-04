<!-- @svelte-bits
{
  "title": "Glass Surface",
  "description": "Liquid-glass surface using SVG displacement filters and chromatic offset.",
  "dependencies": []
}
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	type MixBlend =
		| 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten'
		| 'color-dodge' | 'color-burn' | 'hard-light' | 'soft-light' | 'difference'
		| 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity'
		| 'plus-darker' | 'plus-lighter';

	type Props = {
		children?: Snippet;
		width?: number | string;
		height?: number | string;
		borderRadius?: number;
		borderWidth?: number;
		brightness?: number;
		opacity?: number;
		blur?: number;
		displace?: number;
		backgroundOpacity?: number;
		saturation?: number;
		distortionScale?: number;
		redOffset?: number;
		greenOffset?: number;
		blueOffset?: number;
		xChannel?: 'R' | 'G' | 'B';
		yChannel?: 'R' | 'G' | 'B';
		mixBlendMode?: MixBlend;
		class?: string;
		style?: string;
	};

	let {
		children,
		width = 200,
		height = 80,
		borderRadius = 20,
		borderWidth = 0.07,
		brightness = 50,
		opacity = 0.93,
		blur = 11,
		displace = 0,
		backgroundOpacity = 0,
		saturation = 1,
		distortionScale = -180,
		redOffset = 0,
		greenOffset = 10,
		blueOffset = 20,
		xChannel = 'R',
		yChannel = 'G',
		mixBlendMode = 'difference',
		class: className = '',
		style: extraStyle = ''
	}: Props = $props();

	const rawUid = $props.id();
	const uid = rawUid.replace(/[^a-zA-Z0-9_-]/g, '-');
	const filterId = `glass-filter-${uid}`;
	const redGradId = `red-grad-${uid}`;
	const blueGradId = `blue-grad-${uid}`;

	let containerRef: HTMLDivElement;
	let feImageRef: SVGFEImageElement;
	let redChannelRef: SVGFEDisplacementMapElement;
	let greenChannelRef: SVGFEDisplacementMapElement;
	let blueChannelRef: SVGFEDisplacementMapElement;
	let gaussianBlurRef: SVGFEGaussianBlurElement;

	let isDark = $state(false);
	let svgSupported = $state(false);

	function generateMap() {
		const rect = containerRef?.getBoundingClientRect();
		const w = rect?.width || (typeof width === 'number' ? width : 400);
		const h = rect?.height || (typeof height === 'number' ? height : 200);
		const edge = Math.min(w, h) * (borderWidth * 0.5);
		const svg = `
			<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="${redGradId}" x1="100%" y1="0%" x2="0%" y2="0%">
						<stop offset="0%" stop-color="#0000"/>
						<stop offset="100%" stop-color="red"/>
					</linearGradient>
					<linearGradient id="${blueGradId}" x1="0%" y1="0%" x2="0%" y2="100%">
						<stop offset="0%" stop-color="#0000"/>
						<stop offset="100%" stop-color="blue"/>
					</linearGradient>
				</defs>
				<rect x="0" y="0" width="${w}" height="${h}" fill="black"></rect>
				<rect x="0" y="0" width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${redGradId})" />
				<rect x="0" y="0" width="${w}" height="${h}" rx="${borderRadius}" fill="url(#${blueGradId})" style="mix-blend-mode: ${mixBlendMode}" />
				<rect x="${edge}" y="${edge}" width="${w - edge * 2}" height="${h - edge * 2}" rx="${borderRadius}" fill="hsl(0 0% ${brightness}% / ${opacity})" style="filter:blur(${blur}px)" />
			</svg>`;
		return `data:image/svg+xml,${encodeURIComponent(svg)}`;
	}

	function updateMap() {
		feImageRef?.setAttribute('href', generateMap());
		const list = [
			{ ref: redChannelRef, offset: redOffset },
			{ ref: greenChannelRef, offset: greenOffset },
			{ ref: blueChannelRef, offset: blueOffset }
		];
		for (const { ref, offset } of list) {
			if (!ref) continue;
			ref.setAttribute('scale', String(distortionScale + offset));
			ref.setAttribute('xChannelSelector', xChannel);
			ref.setAttribute('yChannelSelector', yChannel);
		}
		gaussianBlurRef?.setAttribute('stdDeviation', String(displace));
	}

	function supportsSVGFilters() {
		if (typeof window === 'undefined') return false;
		const ua = navigator.userAgent;
		const isWebkit = /Safari/.test(ua) && !/Chrome/.test(ua);
		const isFirefox = /Firefox/.test(ua);
		if (isWebkit || isFirefox) return false;
		const div = document.createElement('div');
		div.style.backdropFilter = `url(#${filterId})`;
		return div.style.backdropFilter !== '';
	}
	function supportsBackdropFilter() {
		return typeof window !== 'undefined' && CSS.supports('backdrop-filter', 'blur(10px)');
	}

	$effect(() => {
		// react to all visual props
		void [width, height, borderRadius, borderWidth, brightness, opacity, blur,
			displace, distortionScale, redOffset, greenOffset, blueOffset,
			xChannel, yChannel, mixBlendMode];
		queueMicrotask(updateMap);
	});

	onMount(() => {
		svgSupported = supportsSVGFilters();
		const mq = window.matchMedia('(prefers-color-scheme: dark)');
		isDark = mq.matches;
		const onChange = (e: MediaQueryListEvent) => (isDark = e.matches);
		mq.addEventListener('change', onChange);
		const ro = new ResizeObserver(() => setTimeout(updateMap, 0));
		if (containerRef) ro.observe(containerRef);
		setTimeout(updateMap, 0);
		return () => {
			mq.removeEventListener('change', onChange);
			ro.disconnect();
		};
	});

	const containerStyle = $derived.by(() => {
		const w = typeof width === 'number' ? `${width}px` : width;
		const h = typeof height === 'number' ? `${height}px` : height;
		const base = `width:${w};height:${h};border-radius:${borderRadius}px;--glass-frost:${backgroundOpacity};--glass-saturation:${saturation};`;
		if (svgSupported) {
			const bg = isDark ? `hsl(0 0% 0% / ${backgroundOpacity})` : `hsl(0 0% 100% / ${backgroundOpacity})`;
			const shadow = isDark
				? `0 0 2px 1px color-mix(in oklch, white, transparent 65%) inset, 0 0 10px 4px color-mix(in oklch, white, transparent 85%) inset, 0px 4px 16px rgba(17,17,26,0.05), 0px 8px 24px rgba(17,17,26,0.05), 0px 16px 56px rgba(17,17,26,0.05), 0px 4px 16px rgba(17,17,26,0.05) inset, 0px 8px 24px rgba(17,17,26,0.05) inset, 0px 16px 56px rgba(17,17,26,0.05) inset`
				: `0 0 2px 1px color-mix(in oklch, black, transparent 85%) inset, 0 0 10px 4px color-mix(in oklch, black, transparent 90%) inset, 0px 4px 16px rgba(17,17,26,0.05), 0px 8px 24px rgba(17,17,26,0.05), 0px 16px 56px rgba(17,17,26,0.05), 0px 4px 16px rgba(17,17,26,0.05) inset, 0px 8px 24px rgba(17,17,26,0.05) inset, 0px 16px 56px rgba(17,17,26,0.05) inset`;
			return `${base}background:${bg};backdrop-filter:url(#${filterId}) saturate(${saturation});-webkit-backdrop-filter:url(#${filterId}) saturate(${saturation});box-shadow:${shadow};${extraStyle}`;
		}
		const bdf = supportsBackdropFilter();
		if (isDark) {
			if (!bdf) return `${base}background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.2);box-shadow:inset 0 1px 0 0 rgba(255,255,255,0.2), inset 0 -1px 0 0 rgba(255,255,255,0.1);${extraStyle}`;
			return `${base}background:rgba(255,255,255,0.1);backdrop-filter:blur(12px) saturate(1.8) brightness(1.2);-webkit-backdrop-filter:blur(12px) saturate(1.8) brightness(1.2);border:1px solid rgba(255,255,255,0.2);box-shadow:inset 0 1px 0 0 rgba(255,255,255,0.2), inset 0 -1px 0 0 rgba(255,255,255,0.1);${extraStyle}`;
		}
		if (!bdf) return `${base}background:rgba(255,255,255,0.4);border:1px solid rgba(255,255,255,0.3);box-shadow:inset 0 1px 0 0 rgba(255,255,255,0.5), inset 0 -1px 0 0 rgba(255,255,255,0.3);${extraStyle}`;
		return `${base}background:rgba(255,255,255,0.25);backdrop-filter:blur(12px) saturate(1.8) brightness(1.1);-webkit-backdrop-filter:blur(12px) saturate(1.8) brightness(1.1);border:1px solid rgba(255,255,255,0.3);box-shadow:0 8px 32px 0 rgba(31,38,135,0.2), 0 2px 16px 0 rgba(31,38,135,0.1), inset 0 1px 0 0 rgba(255,255,255,0.4), inset 0 -1px 0 0 rgba(255,255,255,0.2);${extraStyle}`;
	});

	const focusCls = $derived(isDark
		? 'focus-visible:outline-2 focus-visible:outline-[#0A84FF] focus-visible:outline-offset-2'
		: 'focus-visible:outline-2 focus-visible:outline-[#007AFF] focus-visible:outline-offset-2');
</script>

<div
	bind:this={containerRef}
	class={`relative flex items-center justify-center overflow-hidden transition-opacity duration-[260ms] ease-out ${focusCls} ${className}`}
	style={containerStyle}
>
	<svg class="w-full h-full pointer-events-none absolute inset-0 opacity-0 -z-10" xmlns="http://www.w3.org/2000/svg">
		<defs>
			<filter id={filterId} color-interpolation-filters="sRGB" x="0%" y="0%" width="100%" height="100%">
				<feImage bind:this={feImageRef} x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="map" />
				<feDisplacementMap bind:this={redChannelRef} in="SourceGraphic" in2="map" result="dispRed" />
				<feColorMatrix in="dispRed" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="red" />
				<feDisplacementMap bind:this={greenChannelRef} in="SourceGraphic" in2="map" result="dispGreen" />
				<feColorMatrix in="dispGreen" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="green" />
				<feDisplacementMap bind:this={blueChannelRef} in="SourceGraphic" in2="map" result="dispBlue" />
				<feColorMatrix in="dispBlue" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="blue" />
				<feBlend in="red" in2="green" mode="screen" result="rg" />
				<feBlend in="rg" in2="blue" mode="screen" result="output" />
				<feGaussianBlur bind:this={gaussianBlurRef} in="output" stdDeviation="0.7" />
			</filter>
		</defs>
	</svg>
	<div class="w-full h-full flex items-center justify-center p-2 relative z-10" style="border-radius:inherit;">
		{@render children?.()}
	</div>
</div>
