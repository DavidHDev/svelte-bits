<!-- @svelte-bits
{
  "title": "Scroll Stack",
  "description": "Scroll-driven card stack with pin/scale/blur/rotation, powered by Lenis smooth-scroll.",
  "dependencies": ["lenis"]
}
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import Lenis from 'lenis';

	type Props = {
		cards: Snippet[];
		itemClass?: string;
		class?: string;
		itemDistance?: number;
		itemScale?: number;
		itemStackDistance?: number;
		stackPosition?: string;
		scaleEndPosition?: string;
		baseScale?: number;
		scaleDuration?: number;
		rotationAmount?: number;
		blurAmount?: number;
		useWindowScroll?: boolean;
		onStackComplete?: () => void;
	};

	let {
		cards,
		itemClass = '',
		class: className = '',
		itemDistance = 100,
		itemScale = 0.03,
		itemStackDistance = 30,
		stackPosition = '20%',
		scaleEndPosition = '10%',
		baseScale = 0.85,
		scaleDuration = 0.5,
		rotationAmount = 0,
		blurAmount = 0,
		useWindowScroll = false,
		onStackComplete
	}: Props = $props();

	let scrollerRef: HTMLDivElement;

	onMount(() => {
		let stackCompleted = false;
		let raf: number | null = null;
		let lenis: Lenis | null = null;
		let cardEls: HTMLElement[] = [];
		const lastTransforms = new Map<number, { translateY: number; scale: number; rotation: number; blur: number }>();
		let isUpdating = false;

		const calcProgress = (top: number, s: number, e: number) => (top < s ? 0 : top > e ? 1 : (top - s) / (e - s));
		const parsePct = (v: string | number, h: number) => {
			if (typeof v === 'string' && v.includes('%')) return (parseFloat(v) / 100) * h;
			return parseFloat(v as string);
		};

		const getScrollData = () => {
			if (useWindowScroll) {
				return { scrollTop: window.scrollY, containerHeight: window.innerHeight };
			}
			return { scrollTop: scrollerRef?.scrollTop ?? 0, containerHeight: scrollerRef?.clientHeight ?? 0 };
		};
		const offsetOf = (el: HTMLElement) => (useWindowScroll ? el.getBoundingClientRect().top + window.scrollY : el.offsetTop);

		const update = () => {
			if (!cardEls.length || isUpdating) return;
			isUpdating = true;
			const { scrollTop, containerHeight } = getScrollData();
			const stackPositionPx = parsePct(stackPosition, containerHeight);
			const scaleEndPositionPx = parsePct(scaleEndPosition, containerHeight);
			const endEl = useWindowScroll
				? (document.querySelector('.scroll-stack-end') as HTMLElement | null)
				: (scrollerRef?.querySelector('.scroll-stack-end') as HTMLElement | null);
			const endTop = endEl ? offsetOf(endEl) : 0;

			cardEls.forEach((card, i) => {
				const cardTop = offsetOf(card);
				const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
				const triggerEnd = cardTop - scaleEndPositionPx;
				const pinStart = triggerStart;
				const pinEnd = endTop - containerHeight / 2;

				const sp = calcProgress(scrollTop, triggerStart, triggerEnd);
				const targetScale = baseScale + i * itemScale;
				const scale = 1 - sp * (1 - targetScale);
				const rotation = rotationAmount ? i * rotationAmount * sp : 0;

				let blur = 0;
				if (blurAmount) {
					let topIdx = 0;
					for (let j = 0; j < cardEls.length; j++) {
						const jTop = offsetOf(cardEls[j]);
						const jStart = jTop - stackPositionPx - itemStackDistance * j;
						if (scrollTop >= jStart) topIdx = j;
					}
					if (i < topIdx) blur = Math.max(0, (topIdx - i) * blurAmount);
				}

				let translateY = 0;
				const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
				if (isPinned) translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
				else if (scrollTop > pinEnd) translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;

				const nt = {
					translateY: Math.round(translateY * 100) / 100,
					scale: Math.round(scale * 1000) / 1000,
					rotation: Math.round(rotation * 100) / 100,
					blur: Math.round(blur * 100) / 100
				};
				const last = lastTransforms.get(i);
				const changed =
					!last ||
					Math.abs(last.translateY - nt.translateY) > 0.1 ||
					Math.abs(last.scale - nt.scale) > 0.001 ||
					Math.abs(last.rotation - nt.rotation) > 0.1 ||
					Math.abs(last.blur - nt.blur) > 0.1;
				if (changed) {
					card.style.transform = `translate3d(0, ${nt.translateY}px, 0) scale(${nt.scale}) rotate(${nt.rotation}deg)`;
					card.style.filter = nt.blur > 0 ? `blur(${nt.blur}px)` : '';
					lastTransforms.set(i, nt);
				}
				if (i === cardEls.length - 1) {
					const inView = scrollTop >= pinStart && scrollTop <= pinEnd;
					if (inView && !stackCompleted) {
						stackCompleted = true;
						onStackComplete?.();
					} else if (!inView && stackCompleted) {
						stackCompleted = false;
					}
				}
			});
			isUpdating = false;
		};

		const easing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));
		const setup = () => {
			if (useWindowScroll) {
				lenis = new Lenis({ duration: 1.2, easing, smoothWheel: true, touchMultiplier: 2, wheelMultiplier: 1, lerp: 0.1, syncTouch: true, syncTouchLerp: 0.075 });
			} else if (scrollerRef) {
				lenis = new Lenis({
					wrapper: scrollerRef,
					content: scrollerRef.querySelector('.scroll-stack-inner') as HTMLElement,
					duration: 1.2, easing, smoothWheel: true, touchMultiplier: 2, gestureOrientation: 'vertical',
					wheelMultiplier: 1, lerp: 0.1, syncTouch: true, syncTouchLerp: 0.075
				});
			}
			lenis?.on('scroll', update);
			const tick = (time: number) => {
				lenis?.raf(time);
				raf = requestAnimationFrame(tick);
			};
			raf = requestAnimationFrame(tick);
		};

		// Configure cards
		const root: ParentNode = useWindowScroll ? document : scrollerRef;
		cardEls = Array.from(root.querySelectorAll<HTMLElement>('.scroll-stack-card'));
		cardEls.forEach((card, i) => {
			if (i < cardEls.length - 1) card.style.marginBottom = `${itemDistance}px`;
			card.style.willChange = 'transform, filter';
			card.style.transformOrigin = 'top center';
			card.style.backfaceVisibility = 'hidden';
			card.style.transform = 'translateZ(0)';
			card.style.perspective = '1000px';
		});

		setup();
		update();

		return () => {
			if (raf) cancelAnimationFrame(raf);
			lenis?.destroy();
			lastTransforms.clear();
		};
	});
</script>

<div
	bind:this={scrollerRef}
	class={`relative w-full h-full overflow-y-auto overflow-x-visible ${className}`.trim()}
	style="overscroll-behavior:contain;-webkit-overflow-scrolling:touch;scroll-behavior:smooth;transform:translateZ(0);will-change:scroll-position;"
>
	<div class="scroll-stack-inner pt-[20vh] px-20 pb-[50rem] min-h-screen">
		{#each cards as card, i (i)}
			<div
				class={`scroll-stack-card relative w-full h-80 my-8 p-12 rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.1)] box-border origin-top will-change-transform ${itemClass}`.trim()}
				style="backface-visibility:hidden;transform-style:preserve-3d;"
			>
				{@render card()}
			</div>
		{/each}
		<div class="scroll-stack-end w-full h-px"></div>
	</div>
</div>
