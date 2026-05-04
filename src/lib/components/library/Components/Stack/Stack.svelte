<!-- @svelte-bits
{
  "title": "Stack",
  "description": "Draggable card stack with spring rotation and send-to-back interaction.",
  "dependencies": ["motion"]
}
-->
<script module lang="ts">
	export type StackCard = { id: number; image?: string; alt?: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { motionValue, animate } from 'motion';

	type Props = {
		randomRotation?: boolean;
		sensitivity?: number;
		sendToBackOnClick?: boolean;
		cardsData?: StackCard[];
		cardDimensions?: { width: number; height: number };
		animationConfig?: { stiffness: number; damping: number };
		autoplay?: boolean;
		autoplayDelay?: number;
		pauseOnHover?: boolean;
		mobileClickOnly?: boolean;
		mobileBreakpoint?: number;
	};

	let {
		randomRotation = false,
		sensitivity = 200,
		sendToBackOnClick = false,
		cardsData,
		cardDimensions = { width: 208, height: 208 },
		animationConfig = { stiffness: 260, damping: 20 },
		autoplay = false,
		autoplayDelay = 3000,
		pauseOnHover = false,
		mobileClickOnly = false,
		mobileBreakpoint = 768
	}: Props = $props();

	const DEFAULT_CARDS: StackCard[] = [
		{ id: 1, image: 'https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format', alt: 'card-1' },
		{ id: 2, image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format', alt: 'card-2' },
		{ id: 3, image: 'https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format', alt: 'card-3' },
		{ id: 4, image: 'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format', alt: 'card-4' }
	];

	let stack = $state<StackCard[]>(cardsData?.length ? cardsData.slice() : DEFAULT_CARDS.slice());
	let isMobile = $state(false);
	let isPaused = $state(false);

	$effect(() => {
		if (cardsData?.length) stack = cardsData.slice();
	});

	const shouldDisableDrag = $derived(mobileClickOnly && isMobile);
	const shouldEnableClick = $derived(sendToBackOnClick || shouldDisableDrag);

	// Per-card motion values (indexed by card id)
	const mvMap = new Map<number, { x: ReturnType<typeof motionValue<number>>; y: ReturnType<typeof motionValue<number>>; xv: number; yv: number }>();
	let positions = $state<Record<number, { x: number; y: number }>>({});

	function getMV(id: number) {
		let m = mvMap.get(id);
		if (!m) {
			const x = motionValue(0);
			const y = motionValue(0);
			m = { x, y, xv: 0, yv: 0 };
			x.on('change', (v) => {
				m!.xv = v;
				positions = { ...positions, [id]: { x: v, y: m!.yv } };
			});
			y.on('change', (v) => {
				m!.yv = v;
				positions = { ...positions, [id]: { x: m!.xv, y: v } };
			});
			mvMap.set(id, m);
			positions[id] = { x: 0, y: 0 };
		}
		return m;
	}

	const randomRot = new Map<number, number>();
	function rotFor(id: number) {
		if (!randomRotation) return 0;
		if (!randomRot.has(id)) randomRot.set(id, Math.random() * 10 - 5);
		return randomRot.get(id)!;
	}

	function sendToBack(id: number) {
		const idx = stack.findIndex((c) => c.id === id);
		if (idx < 0) return;
		const next = [...stack];
		const [card] = next.splice(idx, 1);
		next.unshift(card);
		stack = next;
		const m = getMV(id);
		animate(m.x, 0, { type: 'spring', stiffness: animationConfig.stiffness, damping: animationConfig.damping });
		animate(m.y, 0, { type: 'spring', stiffness: animationConfig.stiffness, damping: animationConfig.damping });
	}

	// Drag
	let dragId: number | null = null;
	let dragStartX = 0;
	let dragStartY = 0;

	function endDrag(commit: boolean) {
		if (dragId == null) return;
		const id = dragId;
		const m = getMV(id);
		const dx = m.xv;
		const dy = m.yv;
		dragId = null;
		window.removeEventListener('pointermove', onWindowPointerMove);
		window.removeEventListener('pointerup', onWindowPointerUp);
		window.removeEventListener('pointercancel', onWindowPointerUp);
		if (commit && (Math.abs(dx) > sensitivity || Math.abs(dy) > sensitivity)) {
			sendToBack(id);
		} else {
			animate(m.x, 0, { type: 'spring', stiffness: 400, damping: 30 });
			animate(m.y, 0, { type: 'spring', stiffness: 400, damping: 30 });
		}
	}

	function onWindowPointerMove(e: PointerEvent) {
		if (dragId == null) return;
		const m = getMV(dragId);
		// dragElastic 0.6
		m.x.set((e.clientX - dragStartX) * 0.6);
		m.y.set((e.clientY - dragStartY) * 0.6);
	}

	function onWindowPointerUp() {
		endDrag(true);
	}

	function onPointerDown(e: PointerEvent, id: number) {
		if (shouldDisableDrag) return;
		// If a previous drag never cleaned up, end it first.
		if (dragId != null) endDrag(false);
		dragId = id;
		dragStartX = e.clientX;
		dragStartY = e.clientY;
		window.addEventListener('pointermove', onWindowPointerMove);
		window.addEventListener('pointerup', onWindowPointerUp);
		window.addEventListener('pointercancel', onWindowPointerUp);
	}

	function transformFor(id: number) {
		const p = positions[id] ?? { x: 0, y: 0 };
		// useTransform(y,[-100,100],[60,-60]) -> linear, clamped at endpoints
		const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
		const rotateX = clamp(-p.y * 0.6, -60, 60);
		const rotateY = clamp(p.x * 0.6, -60, 60);
		return { rotateX, rotateY, ...p };
	}

	onMount(() => {
		const check = () => (isMobile = window.innerWidth < mobileBreakpoint);
		check();
		window.addEventListener('resize', check);

		let interval: ReturnType<typeof setInterval> | null = null;
		const tick = () => {
			if (autoplay && stack.length > 1 && !isPaused) {
				const top = stack[stack.length - 1];
				if (top) sendToBack(top.id);
			}
		};
		if (autoplay) interval = setInterval(tick, autoplayDelay);
		return () => {
			window.removeEventListener('resize', check);
			if (interval) clearInterval(interval);
		};
	});
</script>

<div
	class="relative"
	style="perspective:600px;width:{cardDimensions.width}px;height:{cardDimensions.height}px;"
	role="presentation"
	onmouseenter={() => pauseOnHover && (isPaused = true)}
	onmouseleave={() => pauseOnHover && (isPaused = false)}
>
	{#each stack as card, index (card.id)}
		{@const t = transformFor(card.id)}
		{@const rotZ = (stack.length - index - 1) * 4 + rotFor(card.id)}
		{@const sc = 1 + index * 0.06 - stack.length * 0.06}
		<div
			class="absolute inset-0 {shouldDisableDrag ? 'cursor-pointer' : 'cursor-grab'}"
			style="transform: translate({t.x}px, {t.y}px) rotateX({t.rotateX}deg) rotateY({t.rotateY}deg);"
			onpointerdown={(e) => onPointerDown(e, card.id)}
			onpointermove={onPointerMove}
			onpointerup={(e) => onPointerUp(e, card.id)}
			onpointercancel={(e) => onPointerUp(e, card.id)}
		>
			<div
				class="rounded-2xl overflow-hidden w-full h-full transition-transform"
				style="transform: rotate({rotZ}deg) scale({sc}); transform-origin:90% 90%; transition: transform {1000 / animationConfig.stiffness * 10}ms cubic-bezier(0.25, 0.1, 0.25, 1);"
				role="presentation"
				onclick={() => shouldEnableClick && sendToBack(card.id)}
			>
				{#if card.image}
					<img src={card.image} alt={card.alt ?? ''} class="w-full h-full object-cover pointer-events-none" />
				{/if}
			</div>
		</div>
	{/each}
</div>
