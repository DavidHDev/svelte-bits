<script lang="ts">
	import { DOT, gridLayout, smootherstep } from './hero';

	type Props = {
		active: boolean;
		start: () => { x: number; y: number } | null;
		color: string;
	};

	let { active, start, color }: Props = $props();

	let node = $state<HTMLDivElement | null>(null);
	let spot = $state<HTMLDivElement | null>(null);
	let dots = $state<HTMLDivElement | null>(null);
	let grid = { width: 0, originX: 0, originY: 0 };

	$effect(() => {
		const host = node?.parentElement;
		if (!host) return;
		const layout = () => {
			const { width, originX, originY } = gridLayout(host);
			grid = { width, originX, originY };
		};
		const observer = new ResizeObserver(layout);
		observer.observe(host);
		layout();
		return () => observer.disconnect();
	});

	$effect(() => {
		const host = node?.parentElement;
		const spotEl = spot;
		const dotsEl = dots;
		if (!node || !host || !spotEl || !dotsEl || !active) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const cell = DOT.size + DOT.gap;
		const wrap = (value: number) => ((value % cell) + cell) % cell;
		const bounds = host.getBoundingClientRect();
		const stage = host.querySelector('.lh-stage')?.getBoundingClientRect();
		const band = Math.max(240, (stage ? stage.top : bounds.top + 400) - bounds.top);
		const pointer = start();
		const from =
			pointer && pointer.y - bounds.top < band + DOT.radius * 0.5
				? { x: pointer.x - bounds.left, y: pointer.y - bounds.top }
				: null;
		const began = performance.now();
		let frame = 0;
		const tick = (now: number) => {
			const t = (now - began) / 1000;
			const { width, originX, originY } = grid;
			const x = width * 0.58 + width * 0.36 * (0.62 * Math.sin(t * 0.16 + 0.4) + 0.38 * Math.sin(t * 0.07 + 2.2));
			const y = band * 0.52 + band * 0.3 * (0.6 * Math.sin(t * 0.12 + 1.1) + 0.4 * Math.sin(t * 0.05 + 0.3));
			const blend = from ? smootherstep(t / 3.2) : 1;
			const left = (from ? from.x + (x - from.x) * blend : x) - DOT.radius;
			const top = (from ? from.y + (y - from.y) * blend : y) - DOT.radius;
			spotEl.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0)`;
			dotsEl.style.transform = `translate3d(${(wrap(originX - left) - cell).toFixed(1)}px, ${(wrap(originY - top) - cell).toFixed(1)}px, 0)`;
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});
</script>

<div
	bind:this={node}
	class="lh-ghost"
	data-on={active ? '' : undefined}
	aria-hidden="true"
	style:--ghost-color={color}
	style:--ghost-dot="{DOT.size / 2 + 0.15}px"
	style:--ghost-radius="{DOT.radius}px"
	style:--ghost-cell="{DOT.size + DOT.gap}px"
	style:--ghost-strength={DOT.strength}
>
	<div bind:this={spot} class="lh-ghost-spot">
		<div bind:this={dots} class="lh-ghost-dots"></div>
	</div>
</div>
