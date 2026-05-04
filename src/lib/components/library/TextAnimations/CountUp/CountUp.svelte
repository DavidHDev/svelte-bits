<!-- @svelte-bits
{
  "title": "Count Up",
  "description": "Spring-animated number counter that counts up (or down) when scrolled into view, with configurable spring physics, delay, and number formatting.",
  "dependencies": ["motion"]
}
-->
<script lang="ts">
	import { animate } from 'motion';

	type Props = {
		to: number;
		from?: number;
		direction?: 'up' | 'down';
		delay?: number;
		duration?: number;
		class?: string;
		startWhen?: boolean;
		separator?: string;
		onStart?: () => void;
		onEnd?: () => void;
	};

	let {
		to,
		from = 0,
		direction = 'up',
		delay = 0,
		duration = 2,
		class: className = '',
		startWhen = true,
		separator = '',
		onStart,
		onEnd
	}: Props = $props();

	let spanEl: HTMLSpanElement | undefined = $state();
	let inView = $state(false);

	function getDecimalPlaces(num: number): number {
		const str = num.toString();
		if (str.includes('.')) {
			const decimals = str.split('.')[1];
			if (parseInt(decimals) !== 0) return decimals.length;
		}
		return 0;
	}

	const maxDecimals = $derived(Math.max(getDecimalPlaces(from), getDecimalPlaces(to)));

	function formatValue(latest: number, decimals: number, sep: string): string {
		const hasDecimals = decimals > 0;
		const options: Intl.NumberFormatOptions = {
			useGrouping: !!sep,
			minimumFractionDigits: hasDecimals ? decimals : 0,
			maximumFractionDigits: hasDecimals ? decimals : 0
		};
		const formatted = Intl.NumberFormat('en-US', options).format(latest);
		return sep ? formatted.replace(/,/g, sep) : formatted;
	}

	$effect(() => {
		if (spanEl) {
			spanEl.textContent = formatValue(direction === 'down' ? to : from, maxDecimals, separator);
		}
	});

	$effect(() => {
		if (!spanEl) return;
		const el = spanEl;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					inView = true;
					observer.unobserve(el);
				}
			},
			{ threshold: 0 }
		);
		observer.observe(el);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!inView || !startWhen || !spanEl) return;

		const el = spanEl;
		const decimals = maxDecimals;
		const sep = separator;
		const damping = 20 + 40 * (1 / duration);
		const stiffness = 100 * (1 / duration);
		const startValue = direction === 'down' ? to : from;
		const endValue = direction === 'down' ? from : to;

		onStart?.();

		let stopFn: (() => void) | undefined;

		const startTimeout = setTimeout(() => {
			const controls = animate(startValue, endValue, {
				type: 'spring',
				damping,
				stiffness,
				onUpdate: (latest: number) => {
					if (el) el.textContent = formatValue(latest, decimals, sep);
				}
			});
			stopFn = () => controls.stop();
		}, delay * 1000);

		const endTimeout = setTimeout(() => {
			onEnd?.();
		}, (delay + duration) * 1000);

		return () => {
			clearTimeout(startTimeout);
			clearTimeout(endTimeout);
			stopFn?.();
		};
	});
</script>

<span bind:this={spanEl} class={className}></span>
