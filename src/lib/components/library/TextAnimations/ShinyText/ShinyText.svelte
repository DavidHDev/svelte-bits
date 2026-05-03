<!-- @svelte-bits
{
  "title": "Shiny Text",
  "description": "Animated shiny gradient sweep across text, with yoyo + direction controls."
}
-->
<script lang="ts">
	type Props = {
		text: string;
		disabled?: boolean;
		speed?: number;
		class?: string;
		color?: string;
		shineColor?: string;
		spread?: number;
		yoyo?: boolean;
		pauseOnHover?: boolean;
		direction?: 'left' | 'right';
		delay?: number;
	};

	let {
		text,
		disabled = false,
		speed = 2,
		class: className = '',
		color = '#b5b5b5',
		shineColor = '#ffffff',
		spread = 120,
		yoyo = false,
		pauseOnHover = false,
		direction = 'left',
		delay = 0
	}: Props = $props();

	let progress = $state(direction === 'left' ? 0 : 100);
	let isPaused = $state(false);

	$effect(() => {
		// reset on direction change
		void direction;
		progress = direction === 'left' ? 0 : 100;
	});

	$effect(() => {
		if (disabled) return;
		const dir = direction === 'left' ? 1 : -1;
		const animationDuration = speed * 1000;
		const delayDuration = delay * 1000;
		let elapsed = 0;
		let last: number | null = null;
		let raf = 0;

		const tick = (time: number) => {
			if (isPaused) {
				last = null;
				raf = requestAnimationFrame(tick);
				return;
			}
			if (last === null) {
				last = time;
				raf = requestAnimationFrame(tick);
				return;
			}
			elapsed += time - last;
			last = time;

			if (yoyo) {
				const cycleDuration = animationDuration + delayDuration;
				const fullCycle = cycleDuration * 2;
				const ct = elapsed % fullCycle;
				if (ct < animationDuration) {
					const p = (ct / animationDuration) * 100;
					progress = dir === 1 ? p : 100 - p;
				} else if (ct < cycleDuration) {
					progress = dir === 1 ? 100 : 0;
				} else if (ct < cycleDuration + animationDuration) {
					const rt = ct - cycleDuration;
					const p = 100 - (rt / animationDuration) * 100;
					progress = dir === 1 ? p : 100 - p;
				} else {
					progress = dir === 1 ? 0 : 100;
				}
			} else {
				const cycleDuration = animationDuration + delayDuration;
				const ct = elapsed % cycleDuration;
				if (ct < animationDuration) {
					const p = (ct / animationDuration) * 100;
					progress = dir === 1 ? p : 100 - p;
				} else {
					progress = dir === 1 ? 100 : 0;
				}
			}
			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const backgroundImage = $derived(
		`linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`
	);
	const backgroundPosition = $derived(`${150 - progress * 2}% center`);
</script>

<span
	class="inline-block {className}"
	style:background-image={backgroundImage}
	style:background-size="200% auto"
	style:background-position={backgroundPosition}
	style:-webkit-background-clip="text"
	style:background-clip="text"
	style:-webkit-text-fill-color="transparent"
	onmouseenter={() => pauseOnHover && (isPaused = true)}
	onmouseleave={() => pauseOnHover && (isPaused = false)}
	role="presentation"
>
	{text}
</span>
