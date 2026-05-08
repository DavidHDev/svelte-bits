<!-- @svelte-bits
{
  "title": "Scroll Velocity",
  "description": "Multi-row marquee that scrolls horizontally at a base velocity and accelerates with spring-smoothed page-scroll movement.",
  "dependencies": []
}
-->
<script lang="ts">
	type VelocityMapping = { input: [number, number]; output: [number, number] };

	type Props = {
		scrollContainer?: HTMLElement | null;
		texts?: string[];
		velocity?: number;
		class?: string;
		damping?: number;
		stiffness?: number;
		numCopies?: number;
		velocityMapping?: VelocityMapping;
		parallaxClass?: string;
		scrollerClass?: string;
		parallaxStyle?: string;
		scrollerStyle?: string;
	};

	let {
		scrollContainer = null,
		texts = [],
		velocity = 100,
		class: className = '',
		damping = 50,
		stiffness = 400,
		numCopies = 6,
		velocityMapping = { input: [0, 1000], output: [0, 5] },
		parallaxClass = 'parallax',
		scrollerClass = 'scroller',
		parallaxStyle = '',
		scrollerStyle = ''
	}: Props = $props();

	let copyEls: (HTMLSpanElement | undefined)[] = $state([]);
	let scrollerEls: (HTMLDivElement | undefined)[] = $state([]);

	function wrap(min: number, max: number, v: number): number {
		const range = max - min;
		const mod = (((v - min) % range) + range) % range;
		return mod + min;
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		const target: HTMLElement | Window = scrollContainer ?? window;
		const getScrollY = () =>
			target === window
				? window.scrollY || window.pageYOffset || 0
				: (target as HTMLElement).scrollTop;

		const count = texts.length;
		const baseX = new Array(count).fill(0);
		const directionFactors = new Array(count).fill(1);

		let prevScrollY = getScrollY();
		let smoothVelocity = 0;
		let springVel = 0;
		let lastTime = performance.now();

		const [iMin, iMax] = velocityMapping?.input ?? [0, 1000];
		const [oMin, oMax] = velocityMapping?.output ?? [0, 5];
		const inputSpan = iMax - iMin || 1;

		let raf = 0;
		const tick = (t: number) => {
			const dtRaw = (t - lastTime) / 1000;
			const dt = Math.min(dtRaw, 0.05);
			lastTime = t;

			const sy = getScrollY();
			const scrollVelocity = dtRaw > 0 ? (sy - prevScrollY) / dtRaw : 0;
			prevScrollY = sy;

			const accel = stiffness * (scrollVelocity - smoothVelocity) - damping * springVel;
			springVel += accel * dt;
			smoothVelocity += springVel * dt;

			const velocityFactor = ((smoothVelocity - iMin) / inputSpan) * (oMax - oMin) + oMin;

			for (let i = 0; i < count; i++) {
				const baseVelocity = i % 2 !== 0 ? -velocity : velocity;
				let moveBy = directionFactors[i] * baseVelocity * dt;

				if (velocityFactor < 0) directionFactors[i] = -1;
				else if (velocityFactor > 0) directionFactors[i] = 1;

				moveBy += directionFactors[i] * moveBy * velocityFactor;
				baseX[i] += moveBy;

				const copy = copyEls[i];
				const scroller = scrollerEls[i];
				if (!copy || !scroller) continue;

				const copyWidth = copy.offsetWidth;
				if (copyWidth > 0) {
					const x = wrap(-copyWidth, 0, baseX[i]);
					scroller.style.transform = `translate3d(${x}px, 0, 0)`;
				}
			}

			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		return () => cancelAnimationFrame(raf);
	});
</script>

<section>
	{#each texts as text, i (i)}
		<div class={parallaxClass} style={parallaxStyle}>
			<div bind:this={scrollerEls[i]} class={scrollerClass} style={scrollerStyle}>
				{#each Array.from({ length: Math.max(numCopies, 1) }, (_, j) => j) as j (j)}
					{#if j === 0}
						<span bind:this={copyEls[i]} class={className}>{text}&nbsp;</span>
					{:else}
						<span class={className}>{text}&nbsp;</span>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</section>

<style>
	section :global(.parallax) {
		position: relative;
		overflow: hidden;
	}
	section :global(.scroller) {
		display: flex;
		white-space: nowrap;
		text-align: center;
		font-family: sans-serif;
		font-size: 2.25rem;
		font-weight: bold;
		letter-spacing: -0.02em;
		filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
	}
	section :global(.scroller span) {
		flex-shrink: 0;
	}
	@media (min-width: 768px) {
		section :global(.scroller) {
			font-size: 5rem;
			line-height: 5rem;
		}
	}
</style>
