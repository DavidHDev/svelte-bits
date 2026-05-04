<!-- @svelte-bits
{
  "title": "Flowing Menu",
  "description": "Vertical menu where rows reveal an animated marquee from the closest edge on hover (GSAP).",
  "dependencies": ["gsap"]
}
-->
<script module lang="ts">
	export type FlowingMenuItem = { link: string; text: string; image: string };
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		items?: FlowingMenuItem[];
		speed?: number;
		textColor?: string;
		bgColor?: string;
		marqueeBgColor?: string;
		marqueeTextColor?: string;
		borderColor?: string;
	};

	let {
		items = [],
		speed = 15,
		textColor = '#fff',
		bgColor = '#14110E',
		marqueeBgColor = '#fff',
		marqueeTextColor = '#14110E',
		borderColor = '#fff'
	}: Props = $props();

	const itemRefs: HTMLDivElement[] = [];
	const marqueeRefs: HTMLDivElement[] = [];
	const marqueeInnerRefs: HTMLDivElement[] = [];
	const animationRefs: (gsap.core.Tween | null)[] = [];
	let repetitions = $state<number[]>([]);

	const animationDefaults = { duration: 0.6, ease: 'expo' };

	function findClosestEdge(mx: number, my: number, w: number, h: number): 'top' | 'bottom' {
		const top = Math.pow(mx - w / 2, 2) + Math.pow(my, 2);
		const bot = Math.pow(mx - w / 2, 2) + Math.pow(my - h, 2);
		return top < bot ? 'top' : 'bottom';
	}

	onMount(() => {
		const calc = () => {
			repetitions = items.map((_, i) => {
				const inner = marqueeInnerRefs[i];
				if (!inner) return 4;
				const part = inner.querySelector('.marquee-part') as HTMLElement | null;
				if (!part) return 4;
				const cw = part.offsetWidth || 1;
				const needed = Math.ceil(window.innerWidth / cw) + 2;
				return Math.max(4, needed);
			});
		};
		calc();
		const onResize = () => calc();
		window.addEventListener('resize', onResize);

		const timer = setTimeout(() => {
			items.forEach((_, i) => {
				const inner = marqueeInnerRefs[i];
				if (!inner) return;
				const part = inner.querySelector('.marquee-part') as HTMLElement | null;
				if (!part) return;
				const cw = part.offsetWidth;
				if (!cw) return;
				animationRefs[i]?.kill();
				animationRefs[i] = gsap.to(inner, { x: -cw, duration: speed, ease: 'none', repeat: -1 });
			});
		}, 50);

		return () => {
			clearTimeout(timer);
			animationRefs.forEach((t) => t?.kill());
			window.removeEventListener('resize', onResize);
		};
	});

	function onEnter(ev: MouseEvent, i: number) {
		const root = itemRefs[i]; const m = marqueeRefs[i]; const mi = marqueeInnerRefs[i];
		if (!root || !m || !mi) return;
		const r = root.getBoundingClientRect();
		const edge = findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);
		gsap.timeline({ defaults: animationDefaults })
			.set(m, { y: edge === 'top' ? '-101%' : '101%' }, 0)
			.set(mi, { y: edge === 'top' ? '101%' : '-101%' }, 0)
			.to([m, mi], { y: '0%' }, 0);
	}
	function onLeave(ev: MouseEvent, i: number) {
		const root = itemRefs[i]; const m = marqueeRefs[i]; const mi = marqueeInnerRefs[i];
		if (!root || !m || !mi) return;
		const r = root.getBoundingClientRect();
		const edge = findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);
		gsap.timeline({ defaults: animationDefaults })
			.to(m, { y: edge === 'top' ? '-101%' : '101%' }, 0)
			.to(mi, { y: edge === 'top' ? '101%' : '-101%' }, 0);
	}
</script>

<div class="w-full h-full overflow-hidden" style="background-color:{bgColor};">
	<nav class="flex flex-col h-full m-0 p-0">
		{#each items as item, i (i)}
			<div
				bind:this={itemRefs[i]}
				class="flex-1 relative overflow-hidden text-center"
				style="border-top:{i === 0 ? 'none' : `1px solid ${borderColor}`};"
			>
				<a
					class="flex items-center justify-center h-full relative cursor-pointer uppercase no-underline font-semibold text-[4vh]"
					href={item.link}
					onmouseenter={(e) => onEnter(e, i)}
					onmouseleave={(e) => onLeave(e, i)}
					style="color:{textColor};"
				>
					{item.text}
				</a>
				<div
					bind:this={marqueeRefs[i]}
					class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none translate-y-[101%]"
					style="background-color:{marqueeBgColor};"
				>
					<div bind:this={marqueeInnerRefs[i]} class="h-full w-fit flex">
						{#each Array.from({ length: repetitions[i] ?? 4 }) as _, idx (idx)}
							<div class="marquee-part flex items-center flex-shrink-0" style="color:{marqueeTextColor};">
								<span class="whitespace-nowrap uppercase font-normal text-[4vh] leading-[1] px-[1vw]">{item.text}</span>
								<div class="w-[200px] h-[7vh] my-[2em] mx-[2vw] py-[1em] rounded-[50px] bg-cover bg-center" style="background-image:url({item.image});"></div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</nav>
</div>
