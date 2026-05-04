<!-- @svelte-bits
{
  "title": "Card Swap",
  "description": "Three-card stack that auto-cycles with skewed perspective transforms (GSAP).",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';
	export type CardSwapItem = { content: Snippet; class?: string; style?: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		cards: CardSwapItem[];
		width?: number | string;
		height?: number | string;
		cardDistance?: number;
		verticalDistance?: number;
		delay?: number;
		pauseOnHover?: boolean;
		onCardClick?: (idx: number) => void;
		skewAmount?: number;
		easing?: 'linear' | 'elastic';
	};

	let {
		cards,
		width = 500,
		height = 400,
		cardDistance = 60,
		verticalDistance = 70,
		delay = 5000,
		pauseOnHover = false,
		onCardClick,
		skewAmount = 6,
		easing = 'elastic'
	}: Props = $props();

	const config = $derived(
		easing === 'elastic'
			? { ease: 'elastic.out(0.6,0.9)', durDrop: 2, durMove: 2, durReturn: 2, promoteOverlap: 0.9, returnDelay: 0.05 }
			: { ease: 'power1.inOut', durDrop: 0.8, durMove: 0.8, durReturn: 0.8, promoteOverlap: 0.45, returnDelay: 0.2 }
	);

	const cardEls: HTMLDivElement[] = [];
	let containerRef: HTMLDivElement;

	type Slot = { x: number; y: number; z: number; zIndex: number };
	function makeSlot(i: number, distX: number, distY: number, total: number): Slot {
		return { x: i * distX, y: -i * distY, z: -i * distX * 1.5, zIndex: total - i };
	}
	function placeNow(el: HTMLElement, slot: Slot, skew: number) {
		gsap.set(el, {
			x: slot.x, y: slot.y, z: slot.z,
			xPercent: -50, yPercent: -50,
			skewY: skew, transformOrigin: 'center center',
			zIndex: slot.zIndex, force3D: true
		});
	}

	const wStyle = $derived(typeof width === 'number' ? `${width}px` : width);
	const hStyle = $derived(typeof height === 'number' ? `${height}px` : height);

	onMount(() => {
		const total = cards.length;
		const order: number[] = Array.from({ length: total }, (_, i) => i);
		let tlRef: gsap.core.Timeline | null = null;
		let intervalId = 0;

		cardEls.forEach((el, i) => placeNow(el, makeSlot(i, cardDistance, verticalDistance, total), skewAmount));

		function swap() {
			if (order.length < 2) return;
			const front = order[0];
			const rest = order.slice(1);
			const elFront = cardEls[front];
			const tl = gsap.timeline();
			tlRef = tl;

			tl.to(elFront, { y: '+=500', duration: config.durDrop, ease: config.ease });
			tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
			rest.forEach((idx, i) => {
				const el = cardEls[idx];
				const slot = makeSlot(i, cardDistance, verticalDistance, total);
				tl.set(el, { zIndex: slot.zIndex }, 'promote');
				tl.to(el, { x: slot.x, y: slot.y, z: slot.z, duration: config.durMove, ease: config.ease }, `promote+=${i * 0.15}`);
			});
			const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);
			tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
			tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, 'return');
			tl.to(elFront, { x: backSlot.x, y: backSlot.y, z: backSlot.z, duration: config.durReturn, ease: config.ease }, 'return');
			tl.call(() => {
				order.splice(0, order.length, ...rest, front);
			});
		}

		swap();
		intervalId = window.setInterval(swap, delay);

		const node = containerRef;
		const pause = () => { tlRef?.pause(); clearInterval(intervalId); };
		const resume = () => { tlRef?.play(); intervalId = window.setInterval(swap, delay); };
		if (pauseOnHover && node) {
			node.addEventListener('mouseenter', pause);
			node.addEventListener('mouseleave', resume);
		}
		return () => {
			clearInterval(intervalId);
			if (pauseOnHover && node) {
				node.removeEventListener('mouseenter', pause);
				node.removeEventListener('mouseleave', resume);
			}
		};
	});
</script>

<div
	bind:this={containerRef}
	class="absolute bottom-0 right-0 origin-bottom-right overflow-visible"
	style="width:{wStyle};height:{hStyle};transform:translate(5%,20%);perspective:900px;"
>
	{#each cards as card, i (i)}
		<div
			bind:this={cardEls[i]}
			class="absolute top-1/2 left-1/2 rounded-xl border border-white bg-black [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] {card.class ?? ''}"
			style="width:{wStyle};height:{hStyle};{card.style ?? ''}"
			onclick={() => onCardClick?.(i)}
			role="button"
			tabindex="0"
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCardClick?.(i); } }}
		>
			{@render card.content()}
		</div>
	{/each}
</div>
