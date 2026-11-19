<!-- @svelte-bits
{
  "title": "Border Glow",
  "description": "Glowing mesh-gradient border that follows cursor direction and intensifies near edges.",
  "dependencies": []
}
-->
<script module lang="ts">
	function parseHSL(hslStr: string): { h: number; s: number; l: number } {
		const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
		if (!match) return { h: 40, s: 80, l: 80 };
		return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
	}

	function buildBoxShadow(glowColor: string, intensity: number): string {
		const { h, s, l } = parseHSL(glowColor);
		const base = `${h}deg ${s}% ${l}%`;
		const layers: [number, number, number, number, number, boolean][] = [
			[0, 0, 0, 1, 100, true],
			[0, 0, 1, 0, 60, true],
			[0, 0, 3, 0, 50, true],
			[0, 0, 6, 0, 40, true],
			[0, 0, 15, 0, 30, true],
			[0, 0, 25, 2, 20, true],
			[0, 0, 50, 2, 10, true],
			[0, 0, 1, 0, 60, false],
			[0, 0, 3, 0, 50, false],
			[0, 0, 6, 0, 40, false],
			[0, 0, 15, 0, 30, false],
			[0, 0, 25, 2, 20, false],
			[0, 0, 50, 2, 10, false]
		];
		return layers
			.map(([x, y, blur, spread, alpha, inset]) => {
				const a = Math.min(alpha * intensity, 100);
				return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
			})
			.join(', ');
	}

	function easeOutCubic(x: number) {
		return 1 - Math.pow(1 - x, 3);
	}

	function easeInCubic(x: number) {
		return x * x * x;
	}

	type AnimateOpts = {
		start?: number;
		end?: number;
		duration?: number;
		delay?: number;
		ease?: (t: number) => number;
		onUpdate: (v: number) => void;
		onEnd?: () => void;
	};

	function animateValue({
		start = 0,
		end = 100,
		duration = 1000,
		delay = 0,
		ease = easeOutCubic,
		onUpdate,
		onEnd
	}: AnimateOpts) {
		const t0 = performance.now() + delay;
		let frame = 0;
		function tick() {
			const elapsed = performance.now() - t0;
			const t = Math.min(elapsed / duration, 1);
			onUpdate(start + (end - start) * ease(t));
			if (t < 1) frame = requestAnimationFrame(tick);
			else if (onEnd) onEnd();
		}
		const timer = setTimeout(() => {
			frame = requestAnimationFrame(tick);
		}, delay);
		return () => {
			clearTimeout(timer);
			cancelAnimationFrame(frame);
		};
	}

	const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
	const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

	function buildMeshGradients(colors: string[]): string[] {
		const gradients: string[] = [];
		for (let i = 0; i < 7; i++) {
			const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
			gradients.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
		}
		gradients.push(`linear-gradient(${colors[0]} 0 100%)`);
		return gradients;
	}

	function isLightColor(color: string): boolean {
		const value = color.trim().replace('#', '');
		if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(value)) return false;
		const hex =
			value.length === 3
				? value
						.split('')
						.map((char) => char + char)
						.join('')
				: value;
		const red = parseInt(hex.slice(0, 2), 16);
		const green = parseInt(hex.slice(2, 4), 16);
		const blue = parseInt(hex.slice(4, 6), 16);
		return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 180;
	}

	const FILL_MASK_LAYERS = [
		'linear-gradient(to bottom, black, black)',
		'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
		'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
		'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
		'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
		'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)'
	];
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		children?: Snippet;
		class?: string;
		edgeSensitivity?: number;
		glowColor?: string;
		backgroundColor?: string;
		borderRadius?: number;
		glowRadius?: number;
		glowIntensity?: number;
		coneSpread?: number;
		animated?: boolean;
		colors?: string[];
		fillOpacity?: number;
	};

	let {
		children,
		class: className = '',
		edgeSensitivity = 30,
		glowColor = '40 80 80',
		backgroundColor = '#14110E',
		borderRadius = 28,
		glowRadius = 40,
		glowIntensity = 1.0,
		coneSpread = 25,
		animated = false,
		colors = ['#FF8A4C', '#fbbf24', '#38bdf8'],
		fillOpacity = 0.5
	}: Props = $props();

	let cardRef = $state<HTMLDivElement | null>(null);
	let isHovered = $state(false);
	let cursorAngle = $state(45);
	let edgeProximity = $state(0);
	let sweepActive = $state(false);

	function getCenterOfElement(el: HTMLElement) {
		const { width, height } = el.getBoundingClientRect();
		return [width / 2, height / 2];
	}

	function getEdgeProximity(el: HTMLElement, x: number, y: number) {
		const [cx, cy] = getCenterOfElement(el);
		const dx = x - cx;
		const dy = y - cy;
		let kx = Infinity;
		let ky = Infinity;
		if (dx !== 0) kx = cx / Math.abs(dx);
		if (dy !== 0) ky = cy / Math.abs(dy);
		return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
	}

	function getCursorAngle(el: HTMLElement, x: number, y: number) {
		const [cx, cy] = getCenterOfElement(el);
		const dx = x - cx;
		const dy = y - cy;
		if (dx === 0 && dy === 0) return 0;
		const radians = Math.atan2(dy, dx);
		let degrees = radians * (180 / Math.PI) + 90;
		if (degrees < 0) degrees += 360;
		return degrees;
	}

	function handlePointerMove(e: PointerEvent) {
		const card = cardRef;
		if (!card) return;
		const rect = card.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		edgeProximity = getEdgeProximity(card, x, y);
		cursorAngle = getCursorAngle(card, x, y);
	}

	$effect(() => {
		if (!animated) return;
		const angleStart = 110;
		const angleEnd = 465;
		sweepActive = true;
		cursorAngle = angleStart;

		const animations = [
			animateValue({ duration: 500, onUpdate: (v) => (edgeProximity = v / 100) }),
			animateValue({
				ease: easeInCubic,
				duration: 1500,
				end: 50,
				onUpdate: (v) => {
					cursorAngle = (angleEnd - angleStart) * (v / 100) + angleStart;
				}
			}),
			animateValue({
				ease: easeOutCubic,
				delay: 1500,
				duration: 2250,
				start: 50,
				end: 100,
				onUpdate: (v) => {
					cursorAngle = (angleEnd - angleStart) * (v / 100) + angleStart;
				}
			}),
			animateValue({
				ease: easeInCubic,
				delay: 2500,
				duration: 1500,
				start: 100,
				end: 0,
				onUpdate: (v) => (edgeProximity = v / 100),
				onEnd: () => (sweepActive = false)
			})
		];

		return () => {
			animations.forEach((cancel) => cancel());
			sweepActive = false;
		};
	});

	const colorSensitivity = $derived(edgeSensitivity + 20);
	const isVisible = $derived(isHovered || sweepActive);
	const borderOpacity = $derived(
		isVisible ? Math.max(0, (edgeProximity * 100 - colorSensitivity) / (100 - colorSensitivity)) : 0
	);
	const glowOpacity = $derived(
		isVisible ? Math.max(0, (edgeProximity * 100 - edgeSensitivity) / (100 - edgeSensitivity)) : 0
	);

	const meshGradients = $derived(buildMeshGradients(colors));
	const borderBg = $derived(meshGradients.map((g) => `${g} border-box`));
	const fillBg = $derived(meshGradients.map((g) => `${g} padding-box`));
	const angleDeg = $derived(`${cursorAngle.toFixed(3)}deg`);
	const lightSurface = $derived(isLightColor(backgroundColor));
	const transition = $derived(isVisible ? 'opacity 0.25s ease-out' : 'opacity 0.75s ease-in-out');

	const borderMask = $derived(
		`conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`
	);
	const fillMask = $derived(
		[
			...FILL_MASK_LAYERS,
			`conic-gradient(from ${angleDeg} at center, transparent 5%, black 15%, black 85%, transparent 95%)`
		].join(', ')
	);
	const glowMask = $derived(
		`conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`
	);
	const borderBackground = $derived(
		[
			`linear-gradient(${backgroundColor} 0 100%) padding-box`,
			'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box',
			...borderBg
		].join(', ')
	);
	const cardBorderColor = $derived(lightSurface ? 'rgb(28 25 23 / 12%)' : 'rgb(255 255 255 / 15%)');
	const cardShadow = $derived(
		lightSurface
			? 'rgb(28 25 23 / 4%) 0 1px 2px, rgb(28 25 23 / 5%) 0 8px 24px'
			: 'rgba(0,0,0,0.1) 0 1px 2px, rgba(0,0,0,0.1) 0 2px 4px, rgba(0,0,0,0.1) 0 4px 8px, rgba(0,0,0,0.1) 0 8px 16px, rgba(0,0,0,0.1) 0 16px 32px, rgba(0,0,0,0.1) 0 32px 64px'
	);
</script>

<div
	bind:this={cardRef}
	onpointermove={handlePointerMove}
	onpointerenter={() => (isHovered = true)}
	onpointerleave={() => (isHovered = false)}
	class="relative grid isolate border {className}"
	role="presentation"
	style:background={backgroundColor}
	style:border-color={cardBorderColor}
	style:border-radius="{borderRadius}px"
	style:transform="translate3d(0, 0, 0.01px)"
	style:box-shadow={cardShadow}
>
	<div
		class="absolute inset-0 rounded-[inherit] -z-[1]"
		style:border="1px solid transparent"
		style:background={borderBackground}
		style:opacity={borderOpacity}
		style:mask-image={borderMask}
		style:-webkit-mask-image={borderMask}
		style:transition
	></div>

	<div
		class="absolute inset-0 rounded-[inherit] -z-[1]"
		style:border="1px solid transparent"
		style:background={fillBg.join(', ')}
		style:mask-image={fillMask}
		style:-webkit-mask-image={fillMask}
		style:mask-composite="subtract, add, add, add, add, add"
		style:-webkit-mask-composite="source-out, source-over, source-over, source-over, source-over, source-over"
		style:opacity={borderOpacity * fillOpacity}
		style:mix-blend-mode={lightSurface ? 'normal' : 'soft-light'}
		style:transition
	></div>

	<span
		class="absolute pointer-events-none z-[1] rounded-[inherit]"
		style:inset="{-glowRadius}px"
		style:mask-image={glowMask}
		style:-webkit-mask-image={glowMask}
		style:opacity={glowOpacity}
		style:mix-blend-mode={lightSurface ? 'normal' : 'plus-lighter'}
		style:transition
	>
		<span
			class="absolute rounded-[inherit]"
			style:inset="{glowRadius}px"
			style:box-shadow={buildBoxShadow(glowColor, glowIntensity)}
		></span>
	</span>

	<div class="flex flex-col relative overflow-auto z-[1]">
		{@render children?.()}
	</div>
</div>
