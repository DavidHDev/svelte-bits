<!-- @svelte-bits
{
  "title": "Border Glow",
  "description": "Card with directional, edge-sensitive mesh-gradient border glow that follows the pointer.",
  "dependencies": []
}
-->
<script module lang="ts">
	function parseHSL(hslStr: string): { h: number; s: number; l: number } {
		const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
		if (!match) return { h: 40, s: 80, l: 80 };
		return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
	}
	export function buildBoxShadow(glowColor: string, intensity: number): string {
		const { h, s, l } = parseHSL(glowColor);
		const base = `${h}deg ${s}% ${l}%`;
		const layers: [number, number, number, number, number, boolean][] = [
			[0, 0, 0, 1, 100, true], [0, 0, 1, 0, 60, true], [0, 0, 3, 0, 50, true],
			[0, 0, 6, 0, 40, true], [0, 0, 15, 0, 30, true], [0, 0, 25, 2, 20, true],
			[0, 0, 50, 2, 10, true],
			[0, 0, 1, 0, 60, false], [0, 0, 3, 0, 50, false], [0, 0, 6, 0, 40, false],
			[0, 0, 15, 0, 30, false], [0, 0, 25, 2, 20, false], [0, 0, 50, 2, 10, false]
		];
		return layers
			.map(([x, y, blur, spread, alpha, inset]) => {
				const a = Math.min(alpha * intensity, 100);
				return `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px hsl(${base} / ${a}%)`;
			})
			.join(', ');
	}
	export function easeOutCubic(x: number) { return 1 - Math.pow(1 - x, 3); }
	export function easeInCubic(x: number) { return x * x * x; }

	const GRADIENT_POSITIONS = ['80% 55%', '69% 34%', '8% 6%', '41% 38%', '86% 85%', '82% 18%', '51% 4%'];
	const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];
	export function buildMeshGradients(colors: string[]): string[] {
		const out: string[] = [];
		for (let i = 0; i < 7; i++) {
			const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
			out.push(`radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`);
		}
		out.push(`linear-gradient(${colors[0]} 0 100%)`);
		return out;
	}
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';

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
		colors = ['#FF8A4C', '#FFC18A', '#FF6B2C'],
		fillOpacity = 0.5
	}: Props = $props();

	let cardRef: HTMLDivElement;
	let isHovered = $state(false);
	let cursorAngle = $state(45);
	let edgeProximity = $state(0);
	let sweepActive = $state(false);

	function getCenterOf(el: HTMLElement) {
		const { width, height } = el.getBoundingClientRect();
		return [width / 2, height / 2];
	}
	function getEdgeProximity(el: HTMLElement, x: number, y: number) {
		const [cx, cy] = getCenterOf(el);
		const dx = x - cx;
		const dy = y - cy;
		let kx = Infinity, ky = Infinity;
		if (dx !== 0) kx = cx / Math.abs(dx);
		if (dy !== 0) ky = cy / Math.abs(dy);
		return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
	}
	function getCursorAngle(el: HTMLElement, x: number, y: number) {
		const [cx, cy] = getCenterOf(el);
		const dx = x - cx;
		const dy = y - cy;
		if (dx === 0 && dy === 0) return 0;
		const radians = Math.atan2(dy, dx);
		let degrees = radians * (180 / Math.PI) + 90;
		if (degrees < 0) degrees += 360;
		return degrees;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!cardRef) return;
		const rect = cardRef.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		edgeProximity = getEdgeProximity(cardRef, x, y);
		cursorAngle = getCursorAngle(cardRef, x, y);
	}

	type AnimateOpts = {
		start?: number; end?: number; duration?: number; delay?: number;
		ease?: (t: number) => number; onUpdate: (v: number) => void; onEnd?: () => void;
	};
	function animateValue({ start = 0, end = 100, duration = 1000, delay = 0, ease = easeOutCubic, onUpdate, onEnd }: AnimateOpts) {
		const t0 = performance.now() + delay;
		function tick() {
			const elapsed = performance.now() - t0;
			const t = Math.min(Math.max(elapsed / duration, 0), 1);
			onUpdate(start + (end - start) * ease(t));
			if (t < 1) requestAnimationFrame(tick);
			else onEnd?.();
		}
		setTimeout(() => requestAnimationFrame(tick), delay);
	}

	onMount(() => {
		if (!animated) return;
		const angleStart = 110;
		const angleEnd = 465;
		sweepActive = true;
		cursorAngle = angleStart;
		animateValue({ duration: 500, onUpdate: (v) => (edgeProximity = v / 100) });
		animateValue({
			ease: easeInCubic, duration: 1500, end: 50,
			onUpdate: (v) => (cursorAngle = (angleEnd - angleStart) * (v / 100) + angleStart)
		});
		animateValue({
			ease: easeOutCubic, delay: 1500, duration: 2250, start: 50, end: 100,
			onUpdate: (v) => (cursorAngle = (angleEnd - angleStart) * (v / 100) + angleStart)
		});
		animateValue({
			ease: easeInCubic, delay: 2500, duration: 1500, start: 100, end: 0,
			onUpdate: (v) => (edgeProximity = v / 100),
			onEnd: () => (sweepActive = false)
		});
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
	const transitionStr = $derived(isVisible ? 'opacity 0.25s ease-out' : 'opacity 0.75s ease-in-out');

	const borderMask = $derived(
		`conic-gradient(from ${angleDeg} at center, black ${coneSpread}%, transparent ${coneSpread + 15}%, transparent ${100 - coneSpread - 15}%, black ${100 - coneSpread}%)`
	);
	const fillMask = $derived(
		[
			'linear-gradient(to bottom, black, black)',
			'radial-gradient(ellipse at 50% 50%, black 40%, transparent 65%)',
			'radial-gradient(ellipse at 66% 66%, black 5%, transparent 40%)',
			'radial-gradient(ellipse at 33% 33%, black 5%, transparent 40%)',
			'radial-gradient(ellipse at 66% 33%, black 5%, transparent 40%)',
			'radial-gradient(ellipse at 33% 66%, black 5%, transparent 40%)',
			`conic-gradient(from ${angleDeg} at center, transparent 5%, black 15%, black 85%, transparent 95%)`
		].join(', ')
	);
	const outerMask = $derived(
		`conic-gradient(from ${angleDeg} at center, black 2.5%, transparent 10%, transparent 90%, black 97.5%)`
	);
	const borderBgFull = $derived(
		[
			`linear-gradient(${backgroundColor} 0 100%) padding-box`,
			'linear-gradient(rgb(255 255 255 / 0%) 0% 100%) border-box',
			...borderBg
		].join(', ')
	);
</script>

<div
	bind:this={cardRef}
	onpointermove={handlePointerMove}
	onpointerenter={() => (isHovered = true)}
	onpointerleave={() => (isHovered = false)}
	class="relative grid isolate border border-white/15 {className}"
	role="presentation"
	style="background:{backgroundColor}; border-radius:{borderRadius}px; transform:translate3d(0,0,0.01px); box-shadow: rgba(0,0,0,0.1) 0 1px 2px, rgba(0,0,0,0.1) 0 2px 4px, rgba(0,0,0,0.1) 0 4px 8px, rgba(0,0,0,0.1) 0 8px 16px, rgba(0,0,0,0.1) 0 16px 32px, rgba(0,0,0,0.1) 0 32px 64px;"
>
	<div
		class="absolute inset-0 -z-[1]"
		style="border-radius:inherit; border:1px solid transparent; background:{borderBgFull}; opacity:{borderOpacity}; -webkit-mask-image:{borderMask}; mask-image:{borderMask}; transition:{transitionStr};"
	></div>
	<div
		class="absolute inset-0 -z-[1]"
		style="border-radius:inherit; border:1px solid transparent; background:{fillBg.join(', ')}; -webkit-mask-image:{fillMask}; mask-image:{fillMask}; -webkit-mask-composite: source-out, source-over, source-over, source-over, source-over, source-over; mask-composite: subtract, add, add, add, add, add; opacity:{borderOpacity * fillOpacity}; mix-blend-mode: soft-light; transition:{transitionStr};"
	></div>

	<span
		class="absolute pointer-events-none z-[1]"
		style="border-radius:inherit; inset:{-glowRadius}px; -webkit-mask-image:{outerMask}; mask-image:{outerMask}; opacity:{glowOpacity}; mix-blend-mode: plus-lighter; transition:{transitionStr};"
	>
		<span
			class="absolute"
			style="border-radius:inherit; inset:{glowRadius}px; box-shadow:{buildBoxShadow(glowColor, glowIntensity)};"
		></span>
	</span>

	<div class="flex flex-col relative overflow-auto z-[1]">
		{@render children?.()}
	</div>
</div>
