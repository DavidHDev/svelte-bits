<!-- @svelte-bits
{
  "title": "Bounce Cards",
  "description": "GSAP-powered card stack with elastic intro animation and optional hover-to-spread.",
  "dependencies": ["gsap"]
}
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';

	type Props = {
		class?: string;
		images?: string[];
		containerWidth?: number;
		containerHeight?: number;
		animationDelay?: number;
		animationStagger?: number;
		easeType?: string;
		transformStyles?: string[];
		enableHover?: boolean;
	};

	let {
		class: className = '',
		images = [],
		containerWidth = 400,
		containerHeight = 400,
		animationDelay = 0.5,
		animationStagger = 0.06,
		easeType = 'elastic.out(1, 0.8)',
		transformStyles = [
			'rotate(10deg) translate(-170px)',
			'rotate(5deg) translate(-85px)',
			'rotate(-3deg)',
			'rotate(-10deg) translate(85px)',
			'rotate(2deg) translate(170px)'
		],
		enableHover = false
	}: Props = $props();

	let containerRef: HTMLDivElement;

	onMount(() => {
		const ctx = gsap.context(() => {
			gsap.fromTo(
				'.bc-card',
				{ scale: 0 },
				{ scale: 1, stagger: animationStagger, ease: easeType, delay: animationDelay }
			);
		}, containerRef);
		return () => ctx.revert();
	});

	function getNoRotationTransform(t: string): string {
		const hasRotate = /rotate\([\s\S]*?\)/.test(t);
		if (hasRotate) return t.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
		if (t === 'none') return 'rotate(0deg)';
		return `${t} rotate(0deg)`;
	}
	function getPushedTransform(base: string, offsetX: number): string {
		const re = /translate\(([-0-9.]+)px\)/;
		const m = base.match(re);
		if (m) {
			const newX = parseFloat(m[1]) + offsetX;
			return base.replace(re, `translate(${newX}px)`);
		}
		return base === 'none' ? `translate(${offsetX}px)` : `${base} translate(${offsetX}px)`;
	}

	function pushSiblings(hoveredIdx: number) {
		if (!enableHover || !containerRef) return;
		const q = gsap.utils.selector(containerRef);
		images.forEach((_, i) => {
			const selector = q(`.bc-card-${i}`);
			gsap.killTweensOf(selector);
			const base = transformStyles[i] || 'none';
			if (i === hoveredIdx) {
				gsap.to(selector, { transform: getNoRotationTransform(base), duration: 0.4, ease: 'back.out(1.4)', overwrite: 'auto' });
			} else {
				const offsetX = i < hoveredIdx ? -160 : 160;
				gsap.to(selector, {
					transform: getPushedTransform(base, offsetX),
					duration: 0.4, ease: 'back.out(1.4)',
					delay: Math.abs(hoveredIdx - i) * 0.05,
					overwrite: 'auto'
				});
			}
		});
	}
	function resetSiblings() {
		if (!enableHover || !containerRef) return;
		const q = gsap.utils.selector(containerRef);
		images.forEach((_, i) => {
			const selector = q(`.bc-card-${i}`);
			gsap.killTweensOf(selector);
			gsap.to(selector, { transform: transformStyles[i] || 'none', duration: 0.4, ease: 'back.out(1.4)', overwrite: 'auto' });
		});
	}
</script>

<div
	bind:this={containerRef}
	class="relative flex items-center justify-center {className}"
	style="width:{containerWidth}px;height:{containerHeight}px;"
>
	{#each images as src, idx (idx)}
		<div
			class="bc-card bc-card-{idx} absolute w-[200px] aspect-square border-8 border-white rounded-[30px] overflow-hidden"
			style="box-shadow:0 4px 10px rgba(0,0,0,0.2); transform:{transformStyles[idx] || 'none'};"
			onmouseenter={() => pushSiblings(idx)}
			onmouseleave={resetSiblings}
			role="presentation"
		>
			<img class="w-full h-full object-cover" {src} alt="card-{idx}" />
		</div>
	{/each}
</div>
