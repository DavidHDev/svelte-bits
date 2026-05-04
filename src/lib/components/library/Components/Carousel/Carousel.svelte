<!-- @svelte-bits
{
  "title": "Carousel",
  "description": "Draggable carousel with spring snap, autoplay, optional loop, and 3D rotateY parallax.",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	import type { Snippet } from 'svelte';
	export type CarouselItem = {
		title: string;
		description: string;
		id: number;
		icon?: Snippet;
	};
</script>

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { motionValue, animate, transform } from 'motion';

	type Props = {
		items?: CarouselItem[];
		baseWidth?: number;
		autoplay?: boolean;
		autoplayDelay?: number;
		pauseOnHover?: boolean;
		loop?: boolean;
		round?: boolean;
	};

	const DEFAULT_ITEMS: CarouselItem[] = [
		{ title: 'Text Animations', description: 'Cool text animations for your projects.', id: 1 },
		{ title: 'Animations', description: 'Smooth animations for your projects.', id: 2 },
		{ title: 'Components', description: 'Reusable components for your projects.', id: 3 },
		{ title: 'Backgrounds', description: 'Beautiful backgrounds and patterns.', id: 4 },
		{ title: 'Common UI', description: 'Common UI components are coming soon!', id: 5 }
	];

	let {
		items = DEFAULT_ITEMS,
		baseWidth = 300,
		autoplay = false,
		autoplayDelay = 3000,
		pauseOnHover = false,
		loop = false,
		round = false
	}: Props = $props();

	const containerPadding = 16;
	const GAP = 16;
	const SPRING_OPTIONS = { type: 'spring' as const, stiffness: 300, damping: 30 };
	const DRAG_BUFFER = 0;
	const VELOCITY_THRESHOLD = 500;

	const itemWidth = $derived(baseWidth - containerPadding * 2);
	const trackItemOffset = $derived(itemWidth + GAP);
	const itemsForRender = $derived(
		!loop ? items : items.length === 0 ? [] : [items[items.length - 1], ...items, items[0]]
	);

	let position = $state(loop ? 1 : 0);
	let isHovered = $state(false);
	let isJumping = $state(false);
	let isAnimating = $state(false);

	const x = motionValue(0);
	let xValue = $state(0);
	x.on('change', (v) => (xValue = v));

	let containerRef: HTMLDivElement;
	let trackRef: HTMLDivElement;
	let currentAnim: ReturnType<typeof animate> | null = null;

	function animateTo(target: number, duration?: number) {
		currentAnim?.stop?.();
		if (duration === 0) {
			x.set(target);
			handleAnimationComplete();
			return;
		}
		isAnimating = true;
		currentAnim = animate(x, target, {
			...SPRING_OPTIONS,
			onComplete: () => handleAnimationComplete()
		});
	}

	function handleAnimationComplete() {
		if (!loop || itemsForRender.length <= 1) { isAnimating = false; return; }
		const lastCloneIndex = itemsForRender.length - 1;
		if (position === lastCloneIndex) {
			isJumping = true;
			const target = 1;
			position = target;
			x.set(-target * trackItemOffset);
			requestAnimationFrame(() => { isJumping = false; isAnimating = false; });
			return;
		}
		if (position === 0) {
			isJumping = true;
			const target = items.length;
			position = target;
			x.set(-target * trackItemOffset);
			requestAnimationFrame(() => { isJumping = false; isAnimating = false; });
			return;
		}
		isAnimating = false;
	}

	$effect(() => {
		const target = -position * trackItemOffset;
		if (isJumping) { x.set(target); return; }
		untrack(() => animateTo(target));
	});

	$effect(() => {
		void items.length; void loop; void trackItemOffset;
		const startingPosition = loop ? 1 : 0;
		untrack(() => {
			position = startingPosition;
			x.set(-startingPosition * trackItemOffset);
		});
	});

	onMount(() => {
		if (pauseOnHover && containerRef) {
			const enter = () => (isHovered = true);
			const leave = () => (isHovered = false);
			containerRef.addEventListener('mouseenter', enter);
			containerRef.addEventListener('mouseleave', leave);
			return () => {
				containerRef.removeEventListener('mouseenter', enter);
				containerRef.removeEventListener('mouseleave', leave);
			};
		}
	});

	$effect(() => {
		if (!autoplay || itemsForRender.length <= 1) return;
		if (pauseOnHover && isHovered) return;
		const id = setInterval(() => {
			position = Math.min(position + 1, itemsForRender.length - 1);
		}, autoplayDelay);
		return () => clearInterval(id);
	});

	// Custom drag
	let dragStartX = 0;
	let dragStartT = 0;
	let dragging = $state(false);
	let dragOffset = 0;

	function onPointerDown(e: PointerEvent) {
		if (isAnimating) return;
		dragging = true;
		dragStartX = e.clientX;
		dragStartT = performance.now();
		dragOffset = 0;
		currentAnim?.stop?.();
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	}
	function onPointerMove(e: PointerEvent) {
		if (!dragging) return;
		dragOffset = e.clientX - dragStartX;
		x.set(-position * trackItemOffset + dragOffset);
	}
	function onPointerUp(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		const dt = Math.max(1, performance.now() - dragStartT);
		const velocity = (dragOffset / dt) * 1000;
		const direction = dragOffset < -DRAG_BUFFER || velocity < -VELOCITY_THRESHOLD ? 1
			: dragOffset > DRAG_BUFFER || velocity > VELOCITY_THRESHOLD ? -1 : 0;
		(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
		if (direction === 0) {
			animateTo(-position * trackItemOffset);
			return;
		}
		const next = position + direction;
		const max = itemsForRender.length - 1;
		position = Math.max(0, Math.min(next, max));
	}

	const activeIndex = $derived(
		items.length === 0 ? 0 : loop ? (position - 1 + items.length) % items.length : Math.min(position, items.length - 1)
	);

	function rotateForIndex(index: number): number {
		const range = [-(index + 1) * trackItemOffset, -index * trackItemOffset, -(index - 1) * trackItemOffset];
		return transform(range, [90, 0, -90], { clamp: false })(xValue);
	}
</script>

<div
	bind:this={containerRef}
	class="relative overflow-hidden p-4 {round ? 'rounded-full border border-white' : 'rounded-[24px] border border-[#222]'}"
	style="width:{baseWidth}px; {round ? `height:${baseWidth}px;` : ''}"
>
	<div
		bind:this={trackRef}
		class="flex"
		style="width:{itemWidth}px; gap:{GAP}px; perspective:1000px; perspective-origin:{position * trackItemOffset + itemWidth / 2}px 50%; transform:translate3d({xValue}px, 0, 0); cursor:{dragging ? 'grabbing' : 'grab'};"
		onpointerdown={onPointerDown}
		onpointermove={onPointerMove}
		onpointerup={onPointerUp}
		onpointercancel={onPointerUp}
	>
		{#each itemsForRender as item, index (`${item?.id ?? index}-${index}`)}
			<div
				class="relative shrink-0 flex flex-col {round ? 'items-center justify-center text-center bg-[#120F17] border-0' : 'items-start justify-between bg-[#222] border border-[#222] rounded-[12px]'} overflow-hidden"
				style="width:{itemWidth}px; height:{round ? `${itemWidth}px` : '100%'}; transform: rotateY({rotateForIndex(index).toFixed(3)}deg); {round ? 'border-radius:50%;' : ''}"
			>
				<div class={round ? 'p-0 m-0' : 'mb-4 p-5'}>
					<span class="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#120F17]">
						{#if item.icon}{@render item.icon()}{:else}<span class="block h-2 w-2 rounded-full bg-white"></span>{/if}
					</span>
				</div>
				<div class="p-5">
					<div class="mb-1 font-black text-lg text-white">{item.title}</div>
					<p class="text-sm text-white">{item.description}</p>
				</div>
			</div>
		{/each}
	</div>
	<div class="flex w-full justify-center {round ? 'absolute z-20 bottom-12 left-1/2 -translate-x-1/2' : ''}">
		<div class="mt-4 flex w-[150px] justify-between px-8">
			{#each items as _, index (index)}
				<button
					type="button"
					class="h-2 w-2 rounded-full cursor-pointer transition-colors duration-150 {activeIndex === index ? (round ? 'bg-white' : 'bg-[#333333]') : (round ? 'bg-[#555]' : 'bg-[rgba(51,51,51,0.4)]')}"
					style="transform:scale({activeIndex === index ? 1.2 : 1}); transition: transform 0.15s, background-color 0.15s; border:0;"
					onclick={() => (position = loop ? index + 1 : index)}
					aria-label="Go to slide {index + 1}"
				></button>
			{/each}
		</div>
	</div>
</div>
