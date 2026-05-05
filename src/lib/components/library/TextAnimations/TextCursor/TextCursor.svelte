<!-- @svelte-bits
{
  "title": "Text Cursor",
  "description": "Trail of repeating text glyphs that follows the cursor, optionally rotating to match direction and floating with random keyframes.",
  "dependencies": ["motion"]
}
-->
<script lang="ts">
	import { animate } from 'motion';

	type Props = {
		text?: string;
		spacing?: number;
		followMouseDirection?: boolean;
		randomFloat?: boolean;
		exitDuration?: number;
		removalInterval?: number;
		maxPoints?: number;
	};

	let {
		text = '⚛️',
		spacing = 100,
		followMouseDirection = true,
		randomFloat = true,
		exitDuration = 0.5,
		removalInterval = 30,
		maxPoints = 5
	}: Props = $props();

	type TrailItem = {
		id: number;
		x: number;
		y: number;
		angle: number;
		rx: number;
		ry: number;
		rr: number;
		exiting: boolean;
	};

	let trail = $state<TrailItem[]>([]);
	let containerEl: HTMLDivElement | undefined = $state();
	let lastMoveTime = Date.now();
	let idCounter = 0;
	let elsById: Record<number, HTMLDivElement | undefined> = $state({});

	function makeRandom() {
		return randomFloat
			? {
					rx: Math.random() * 10 - 5,
					ry: Math.random() * 10 - 5,
					rr: Math.random() * 10 - 5
				}
			: { rx: 0, ry: 0, rr: 0 };
	}

	function startEntryAnimations(node: HTMLElement, item: TrailItem) {
		node.style.opacity = '0';
		node.style.transform = `rotate(${item.angle}deg)`;

		animate(node, { opacity: 1 }, { duration: exitDuration, ease: 'easeOut' });

		if (randomFloat) {
			animate(
				node,
				{
					x: [0, item.rx, 0],
					y: [0, item.ry, 0],
					rotate: [item.angle, item.angle + item.rr, item.angle]
				} as never,
				{
					duration: 2,
					ease: 'easeInOut',
					repeat: Infinity,
					repeatType: 'mirror'
				} as never
			);
		}
	}

	function startExitAnimation(item: TrailItem) {
		const finalize = () => {
			const i = trail.findIndex((t) => t.id === item.id);
			if (i !== -1) trail.splice(i, 1);
			delete elsById[item.id];
		};
		const node = elsById[item.id];
		if (!node) {
			finalize();
			return;
		}
		const controls = animate(
			node,
			{ opacity: 0, scale: 0 } as never,
			{ duration: exitDuration, ease: 'easeOut' } as never
		);
		const finished = (controls as unknown as { finished?: Promise<unknown> }).finished;
		if (finished && typeof finished.then === 'function') finished.then(finalize, finalize);
		else finalize();
	}

	function markExiting(item: TrailItem) {
		if (item.exiting) return;
		item.exiting = true;
		startExitAnimation(item);
	}

	function trimToMaxPoints() {
		const actives = trail.filter((t) => !t.exiting);
		const overflow = actives.length - maxPoints;
		if (overflow <= 0) return;
		for (let i = 0; i < overflow; i++) markExiting(actives[i]);
	}

	function handleMouseMove(e: MouseEvent) {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		const actives = trail.filter((t) => !t.exiting);

		if (actives.length === 0) {
			trail.push({
				id: idCounter++,
				x: mouseX,
				y: mouseY,
				angle: 0,
				...makeRandom(),
				exiting: false
			});
		} else {
			const last = actives[actives.length - 1];
			const dx = mouseX - last.x;
			const dy = mouseY - last.y;
			const distance = Math.hypot(dx, dy);

			if (distance >= spacing) {
				const rawAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
				const computedAngle = followMouseDirection ? rawAngle : 0;
				const steps = Math.floor(distance / spacing);

				for (let i = 1; i <= steps; i++) {
					const t = (spacing * i) / distance;
					trail.push({
						id: idCounter++,
						x: last.x + dx * t,
						y: last.y + dy * t,
						angle: computedAngle,
						...makeRandom(),
						exiting: false
					});
				}
			}
		}

		trimToMaxPoints();
		lastMoveTime = Date.now();
	}

	$effect(() => {
		const container = containerEl;
		if (!container) return;
		container.addEventListener('mousemove', handleMouseMove);
		return () => container.removeEventListener('mousemove', handleMouseMove);
	});

	$effect(() => {
		const interval = setInterval(() => {
			if (Date.now() - lastMoveTime > 100) {
				const oldestActive = trail.find((t) => !t.exiting);
				if (oldestActive) markExiting(oldestActive);
			}
		}, removalInterval);
		return () => clearInterval(interval);
	});

	function nodeEntry(node: HTMLDivElement, item: TrailItem) {
		startEntryAnimations(node, item);
		return {
			destroy() {}
		};
	}
</script>

<div bind:this={containerEl} class="relative w-full h-full">
	<div class="absolute inset-0 pointer-events-none">
		{#each trail as item (item.id)}
			<div
				bind:this={elsById[item.id]}
				use:nodeEntry={item}
				class="absolute select-none whitespace-nowrap text-3xl"
				style:left={`${item.x}px`}
				style:top={`${item.y}px`}
				style:will-change="transform, opacity"
			>
				{text}
			</div>
		{/each}
	</div>
</div>
