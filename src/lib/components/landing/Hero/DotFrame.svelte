<script lang="ts">
	import { DOT, gridLayout } from './hero';

	type Props = {
		color: string;
		live: boolean;
	};

	let { color, live }: Props = $props();

	let node = $state<HTMLDivElement | null>(null);

	$effect(() => {
		const host = node?.parentElement;
		if (!node || !host) return;
		const target = node;
		const layout = () => {
			const { cell, originX, originY } = gridLayout(host);
			target.style.backgroundSize = `${cell}px ${cell}px`;
			target.style.backgroundPosition = `${originX}px ${originY}px`;
		};
		const observer = new ResizeObserver(layout);
		observer.observe(host);
		layout();
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!node) return;
		const target = node;
		const clear = () => {
			target.style.removeProperty('--hole-x');
			target.style.removeProperty('--hole-y');
		};
		if (!live) {
			clear();
			return;
		}
		const move = (event: PointerEvent) => {
			const bounds = target.getBoundingClientRect();
			target.style.setProperty('--hole-x', `${(event.clientX - bounds.left).toFixed(1)}px`);
			target.style.setProperty('--hole-y', `${(event.clientY - bounds.top).toFixed(1)}px`);
		};
		window.addEventListener('pointermove', move, { passive: true });
		return () => {
			window.removeEventListener('pointermove', move);
			clear();
		};
	});
</script>

<div
	bind:this={node}
	class="lh-dotframe"
	aria-hidden="true"
	style:--frame-color={color}
	style:--frame-dot="{DOT.size / 2 + 0.15}px"
></div>
