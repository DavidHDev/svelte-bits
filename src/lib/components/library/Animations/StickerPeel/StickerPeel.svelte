<!-- @svelte-bits
{
  "title": "Sticker Peel",
  "description": "Draggable sticker that peels off on hover, with SVG specular lighting and drop shadow filters.",
  "dependencies": ["gsap"]
}
-->
<script lang="ts">
	import { gsap } from 'gsap';
	import { Draggable } from 'gsap/Draggable';

	gsap.registerPlugin(Draggable);

	type Props = {
		imageSrc: string;
		rotate?: number;
		peelBackHoverPct?: number;
		peelBackActivePct?: number;
		peelEasing?: string;
		peelHoverEasing?: string;
		width?: number;
		shadowIntensity?: number;
		lightingIntensity?: number;
		initialPosition?: 'center' | 'random' | { x: number; y: number };
		peelDirection?: number;
		class?: string;
	};

	let {
		imageSrc,
		rotate = 30,
		peelBackHoverPct = 30,
		peelBackActivePct = 40,
		peelEasing = 'power3.out',
		peelHoverEasing = 'power2.out',
		width = 200,
		shadowIntensity = 0.6,
		lightingIntensity = 0.1,
		initialPosition = 'center',
		peelDirection = 0,
		class: className = ''
	}: Props = $props();

	const padding = 12;

	let dragTarget: HTMLDivElement;
	let container: HTMLDivElement;
	let pointLight: SVGFEPointLightElement;
	let pointLightFlipped: SVGFEPointLightElement;

	$effect(() => {
		if (!dragTarget) return;
		if (typeof initialPosition === 'object') {
			gsap.set(dragTarget, { x: initialPosition.x, y: initialPosition.y });
		}
	});

	$effect(() => {
		if (!dragTarget) return;
		const boundsEl = dragTarget.parentNode as HTMLElement;
		const draggable = Draggable.create(dragTarget, {
			type: 'x,y',
			bounds: boundsEl,
			inertia: true,
			onDrag(this: Draggable) {
				const rot = gsap.utils.clamp(-24, 24, this.deltaX * 0.4);
				gsap.to(dragTarget, { rotation: rot, duration: 0.15, ease: 'power1.out' });
			},
			onDragEnd() {
				gsap.to(dragTarget, { rotation: 0, duration: 0.8, ease: 'power2.out' });
			}
		})[0];

		const onResize = () => {
			draggable.update();
			const cx = gsap.getProperty(dragTarget, 'x') as number;
			const cy = gsap.getProperty(dragTarget, 'y') as number;
			const br = boundsEl.getBoundingClientRect();
			const tr = dragTarget.getBoundingClientRect();
			const nx = Math.max(0, Math.min(cx, br.width - tr.width));
			const ny = Math.max(0, Math.min(cy, br.height - tr.height));
			if (nx !== cx || ny !== cy)
				gsap.to(dragTarget, { x: nx, y: ny, duration: 0.3, ease: 'power2.out' });
		};
		window.addEventListener('resize', onResize);
		window.addEventListener('orientationchange', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			window.removeEventListener('orientationchange', onResize);
			draggable.kill();
		};
	});

	$effect(() => {
		if (!container) return;
		const updateLight = (e: MouseEvent) => {
			const rect = container.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			if (pointLight) gsap.set(pointLight, { attr: { x, y } });
			const norm = Math.abs(peelDirection % 360);
			if (pointLightFlipped) {
				if (norm !== 180) gsap.set(pointLightFlipped, { attr: { x, y: rect.height - y } });
				else gsap.set(pointLightFlipped, { attr: { x: -1000, y: -1000 } });
			}
		};
		container.addEventListener('mousemove', updateLight);
		const ts = () => container.classList.add('touch-active');
		const te = () => container.classList.remove('touch-active');
		container.addEventListener('touchstart', ts);
		container.addEventListener('touchend', te);
		container.addEventListener('touchcancel', te);
		return () => {
			container.removeEventListener('mousemove', updateLight);
			container.removeEventListener('touchstart', ts);
			container.removeEventListener('touchend', te);
			container.removeEventListener('touchcancel', te);
		};
	});

	const cssVars = $derived(
		`--sticker-rotate:${rotate}deg;--sticker-p:${padding}px;--sticker-peelback-hover:${peelBackHoverPct}%;--sticker-peelback-active:${peelBackActivePct}%;--sticker-peel-easing:${peelEasing};--sticker-peel-hover-easing:${peelHoverEasing};--sticker-width:${width}px;--sticker-shadow-opacity:${shadowIntensity};--sticker-lighting-constant:${lightingIntensity};--peel-direction:${peelDirection}deg;--sticker-start:calc(-1 * ${padding}px);--sticker-end:calc(100% + ${padding}px);`
	);

	const stickerMainStyle =
		'clip-path:polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-end), var(--sticker-start) var(--sticker-end));transition:clip-path 0.6s ease-out;filter:url(#dropShadow);will-change:clip-path,transform;';
	const flapStyle =
		'clip-path:polygon(var(--sticker-start) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-end) var(--sticker-start), var(--sticker-start) var(--sticker-start));top:calc(-100% - var(--sticker-p) - var(--sticker-p));transform:scaleY(-1);transition:all 0.6s ease-out;will-change:clip-path,transform;';
	const imageStyle = $derived(
		`transform:rotate(calc(${rotate}deg - ${peelDirection}deg));width:${width}px;`
	);
	const shadowImageStyle = $derived(`${imageStyle}filter:url(#expandAndFill);`);
</script>

<div class="absolute cursor-grab active:cursor-grabbing transform-gpu {className}" bind:this={dragTarget} style={cssVars}>
	<svg width="0" height="0">
		<defs>
			<filter id="pointLight">
				<feGaussianBlur stdDeviation="1" result="blur" />
				<feSpecularLighting
					result="spec"
					in="blur"
					specularExponent="100"
					specularConstant={lightingIntensity}
					lighting-color="white"
				>
					<fePointLight bind:this={pointLight} x="100" y="100" z="300" />
				</feSpecularLighting>
				<feComposite in="spec" in2="SourceGraphic" result="lit" />
				<feComposite in="lit" in2="SourceAlpha" operator="in" />
			</filter>
			<filter id="pointLightFlipped">
				<feGaussianBlur stdDeviation="10" result="blur" />
				<feSpecularLighting
					result="spec"
					in="blur"
					specularExponent="100"
					specularConstant={lightingIntensity * 7}
					lighting-color="white"
				>
					<fePointLight bind:this={pointLightFlipped} x="100" y="100" z="300" />
				</feSpecularLighting>
				<feComposite in="spec" in2="SourceGraphic" result="lit" />
				<feComposite in="lit" in2="SourceAlpha" operator="in" />
			</filter>
			<filter id="dropShadow">
				<feDropShadow
					dx="2"
					dy="4"
					stdDeviation={3 * shadowIntensity}
					flood-color="black"
					flood-opacity={shadowIntensity}
				/>
			</filter>
			<filter id="expandAndFill">
				<feOffset dx="0" dy="0" in="SourceAlpha" result="shape" />
				<feFlood flood-color="rgb(179,179,179)" result="flood" />
				<feComposite operator="in" in="flood" in2="shape" />
			</filter>
		</defs>
	</svg>

	<div
		class="sticker-container relative select-none touch-none sm:touch-auto"
		bind:this={container}
		style="-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;-webkit-tap-highlight-color:transparent;transform:rotate({peelDirection}deg);transform-origin:center;"
	>
		<div class="sticker-main" style={stickerMainStyle}>
			<div style="filter:url(#pointLight);">
				<img src={imageSrc} alt="" class="block" style={imageStyle} draggable="false" oncontextmenu={(e) => e.preventDefault()} />
			</div>
		</div>

		<div class="absolute top-4 left-2 w-full h-full opacity-40" style="filter:brightness(0) blur(8px);">
			<div class="sticker-flap" style={flapStyle}>
				<img src={imageSrc} alt="" class="block" style={shadowImageStyle} draggable="false" oncontextmenu={(e) => e.preventDefault()} />
			</div>
		</div>

		<div class="sticker-flap absolute w-full h-full left-0" style={flapStyle}>
			<div style="filter:url(#pointLightFlipped);">
				<img src={imageSrc} alt="" class="block" style={shadowImageStyle} draggable="false" oncontextmenu={(e) => e.preventDefault()} />
			</div>
		</div>
	</div>
</div>

<style>
	:global(.sticker-container:hover .sticker-main),
	:global(.sticker-container.touch-active .sticker-main) {
		clip-path: polygon(
			var(--sticker-start) var(--sticker-peelback-hover),
			var(--sticker-end) var(--sticker-peelback-hover),
			var(--sticker-end) var(--sticker-end),
			var(--sticker-start) var(--sticker-end)
		) !important;
	}
	:global(.sticker-container:hover .sticker-flap),
	:global(.sticker-container.touch-active .sticker-flap) {
		clip-path: polygon(
			var(--sticker-start) var(--sticker-start),
			var(--sticker-end) var(--sticker-start),
			var(--sticker-end) var(--sticker-peelback-hover),
			var(--sticker-start) var(--sticker-peelback-hover)
		) !important;
		top: calc(-100% + 2 * var(--sticker-peelback-hover) - 1px) !important;
	}
	:global(.sticker-container:active .sticker-main) {
		clip-path: polygon(
			var(--sticker-start) var(--sticker-peelback-active),
			var(--sticker-end) var(--sticker-peelback-active),
			var(--sticker-end) var(--sticker-end),
			var(--sticker-start) var(--sticker-end)
		) !important;
	}
	:global(.sticker-container:active .sticker-flap) {
		clip-path: polygon(
			var(--sticker-start) var(--sticker-start),
			var(--sticker-end) var(--sticker-start),
			var(--sticker-end) var(--sticker-peelback-active),
			var(--sticker-start) var(--sticker-peelback-active)
		) !important;
		top: calc(-100% + 2 * var(--sticker-peelback-active) - 1px) !important;
	}
</style>
