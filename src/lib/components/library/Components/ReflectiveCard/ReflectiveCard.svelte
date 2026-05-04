<!-- @svelte-bits
{
  "title": "Reflective Card",
  "description": "Webcam-fed metallic glass card using SVG turbulence and specular lighting filters.",
  "dependencies": []
}
-->
<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		blurStrength?: number;
		color?: string;
		metalness?: number;
		roughness?: number;
		overlayColor?: string;
		displacementStrength?: number;
		noiseScale?: number;
		specularConstant?: number;
		grayscale?: number;
		glassDistortion?: number;
		class?: string;
	};

	let {
		blurStrength = 12,
		color = 'white',
		metalness = 1,
		roughness = 0.4,
		overlayColor = 'rgba(255, 255, 255, 0.1)',
		displacementStrength = 20,
		noiseScale = 1,
		specularConstant = 1.2,
		grayscale = 1,
		glassDistortion = 0,
		class: className = ''
	}: Props = $props();

	let videoRef: HTMLVideoElement;

	const baseFrequency = $derived(0.03 / Math.max(0.1, noiseScale));
	const saturation = $derived(1 - Math.max(0, Math.min(1, grayscale)));

	onMount(() => {
		let stream: MediaStream | null = null;
		(async () => {
			try {
				stream = await navigator.mediaDevices.getUserMedia({
					video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
				});
				if (videoRef) videoRef.srcObject = stream;
			} catch (err) {
				console.error('Error accessing webcam:', err);
			}
		})();
		return () => {
			stream?.getTracks().forEach((t) => t.stop());
		};
	});
</script>

<div
	class={`relative w-[320px] h-[500px] rounded-[20px] overflow-hidden bg-[#1a1a1a] shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)_inset] isolate font-sans ${className}`}
	style="--blur-strength:{blurStrength}px;--metalness:{metalness};--roughness:{roughness};--overlay-color:{overlayColor};--text-color:{color};--saturation:{saturation};"
>
	<svg class="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
		<defs>
			<filter id="metallic-displacement" x="-20%" y="-20%" width="140%" height="140%">
				<feTurbulence type="turbulence" baseFrequency={baseFrequency} numOctaves="2" result="noise" />
				<feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
				<feDisplacementMap in="SourceGraphic" in2="noise" scale={displacementStrength} xChannelSelector="R" yChannelSelector="G" result="rippled" />
				<feSpecularLighting in="noiseAlpha" surfaceScale={displacementStrength} specularConstant={specularConstant} specularExponent="20" lighting-color="#ffffff" result="light">
					<fePointLight x="0" y="0" z="300" />
				</feSpecularLighting>
				<feComposite in="light" in2="rippled" operator="in" result="light-effect" />
				<feBlend in="light-effect" in2="rippled" mode="screen" result="metallic-result" />
				<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="solidAlpha" />
				<feMorphology in="solidAlpha" operator="erode" radius="45" result="erodedAlpha" />
				<feGaussianBlur in="erodedAlpha" stdDeviation="10" result="blurredMap" />
				<feComponentTransfer in="blurredMap" result="glassMap">
					<feFuncA type="linear" slope="0.5" intercept="0" />
				</feComponentTransfer>
				<feDisplacementMap in="metallic-result" in2="glassMap" scale={glassDistortion} xChannelSelector="A" yChannelSelector="A" result="final" />
			</filter>
		</defs>
	</svg>

	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		bind:this={videoRef}
		autoplay
		playsinline
		muted
		class="absolute top-0 left-0 w-full h-full object-cover scale-[1.2] -scale-x-100 z-0 opacity-90 transition-[filter] duration-300"
		style="filter: saturate(var(--saturation, 0)) contrast(120%) brightness(110%) blur(var(--blur-strength, 12px)) url(#metallic-displacement);"
	></video>

	<div class="absolute inset-0 z-10 opacity-[var(--roughness,0.4)] pointer-events-none bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20200%20200%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27noiseFilter%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.8%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url(%23noiseFilter)%27%2F%3E%3C%2Fsvg%3E')] mix-blend-overlay"></div>

	<div class="absolute inset-0 z-20 bg-[linear-gradient(135deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0)_50%,rgba(255,255,255,0.1)_60%,rgba(255,255,255,0.3)_100%)] pointer-events-none mix-blend-overlay opacity-[var(--metalness,1)]"></div>

	<div class="absolute inset-0 rounded-[20px] p-[1px] bg-[linear-gradient(135deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.6)_100%)] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude] z-20 pointer-events-none"></div>

	<div class="relative z-10 h-full flex flex-col justify-between p-8 text-[var(--text-color,white)] bg-[var(--overlay-color,rgba(255,255,255,0.05))]">
		<div class="flex justify-between items-center border-b border-white/20 pb-4">
			<div class="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.1em] px-2 py-1 bg-white/10 rounded border border-white/20">
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-80"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
				<span>SECURE ACCESS</span>
			</div>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-80"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.5.5 0 0 1-.96 0L9.24 2.18a.5.5 0 0 0-.96 0l-2.35 8.36A2 2 0 0 1 4 12H2"/></svg>
		</div>
		<div class="flex-1 flex flex-col justify-end items-center text-center gap-6 mb-8">
			<div class="text-center">
				<h2 class="text-2xl font-bold tracking-[0.05em] m-0 mb-2 drop-shadow-md">ALEXANDER DOE</h2>
				<p class="text-xs tracking-[0.2em] opacity-70 m-0 uppercase">SENIOR DEVELOPER</p>
			</div>
		</div>
		<div class="flex justify-between items-end border-t border-white/20 pt-6">
			<div class="flex flex-col gap-1">
				<span class="text-[9px] tracking-[0.1em] opacity-60">ID NUMBER</span>
				<span class="font-mono text-sm tracking-[0.05em]">8901-2345-6789</span>
			</div>
			<div class="opacity-40">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/></svg>
			</div>
		</div>
	</div>
</div>
